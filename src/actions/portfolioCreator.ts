import { randomUUID } from "node:crypto";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import {
  PortfolioItem,
  PortfolioProject,
  PortfolioSection,
  and,
  asc,
  count,
  db,
  desc,
  eq,
  inArray,
} from "astro:db";
import { requireUser } from "./_guards";
import {
  normalizePortfolioItem,
  normalizePortfolioProject,
  normalizePortfolioSection,
  normalizeText,
  sectionLabels,
  TEMPLATE_KEYS,
  isProTemplate,
} from "../modules/portfolio-creator/helpers";
import { buildPortfolioDashboardSummary } from "../dashboard/summary.schema";
import { pushPortfolioCreatorActivity } from "../lib/pushActivity";
import { notifyParent } from "../lib/notifyParent";
import type { PortfolioSectionKey, PortfolioVisibility } from "../modules/portfolio-creator/types";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  themeKey: z.enum(TEMPLATE_KEYS),
});

const projectIdSchema = z.object({
  projectId: z.string().min(1),
});

const updateProjectSchema = z
  .object({
    projectId: z.string().min(1),
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    visibility: z.enum(["public", "unlisted", "private"]).optional(),
    themeKey: z.enum(TEMPLATE_KEYS).optional(),
  })
  .refine((input) => Object.keys(input).some((key) => key !== "projectId"), {
    message: "Provide at least one field to update.",
  });

const publishSchema = z.object({
  projectId: z.string().min(1),
  isPublished: z.boolean(),
});

const sectionToggleSchema = z.object({
  sectionId: z.string().min(1),
  isEnabled: z.boolean(),
});

const reorderSectionsSchema = z.object({
  projectId: z.string().min(1),
  orderedSectionIds: z.array(z.string().min(1)).min(1),
});

const createItemSchema = z.object({
  sectionId: z.string().min(1),
  data: z.any(),
});

const updateItemSchema = z.object({
  itemId: z.string().min(1),
  data: z.any(),
});

const deleteItemSchema = z.object({
  itemId: z.string().min(1),
});

const reorderItemsSchema = z.object({
  sectionId: z.string().min(1),
  orderedItemIds: z.array(z.string().min(1)).min(1),
});

const DEFAULT_SECTIONS: Array<{ key: PortfolioSectionKey; order: number }> = [
  { key: "profile", order: 1 },
  { key: "about", order: 2 },
  { key: "featuredProjects", order: 3 },
  { key: "experience", order: 4 },
  { key: "skills", order: 5 },
  { key: "education", order: 6 },
  { key: "certifications", order: 7 },
  { key: "achievements", order: 8 },
  { key: "contact", order: 9 },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const ensureUniqueSlug = async (baseSlug: string, projectId?: string) => {
  const raw = baseSlug || "portfolio";
  let slug = raw;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: PortfolioProject.id })
      .from(PortfolioProject)
      .where(eq(PortfolioProject.slug, slug));

    if (!existing || (projectId && existing.id === projectId)) {
      return slug;
    }

    slug = `${raw}-${suffix}`;
    suffix += 1;
  }
};

const ensureTemplateAccess = (templateKey: string, isPaid: boolean) => {
  if (isProTemplate(templateKey) && !isPaid) {
    throw new ActionError({
      code: "PAYMENT_REQUIRED",
      message: "Upgrade to Pro to use this template.",
    });
  }
};

const getOwnedProject = async (projectId: string, userId: string) => {
  const [project] = await db
    .select()
    .from(PortfolioProject)
    .where(and(eq(PortfolioProject.id, projectId), eq(PortfolioProject.userId, userId)));

  if (!project) {
    throw new ActionError({ code: "NOT_FOUND", message: "Portfolio not found." });
  }

  return project;
};

const getOwnedProjectWithTemplateAccess = async (
  projectId: string,
  userId: string,
  isPaid: boolean,
) => {
  const project = await getOwnedProject(projectId, userId);
  ensureTemplateAccess(project.themeKey, isPaid);
  return project;
};

const getOwnedSection = async (sectionId: string, userId: string, isPaid: boolean) => {
  const [section] = await db
    .select()
    .from(PortfolioSection)
    .where(eq(PortfolioSection.id, sectionId));

  if (!section) {
    throw new ActionError({ code: "NOT_FOUND", message: "Portfolio section not found." });
  }

  await getOwnedProjectWithTemplateAccess(section.projectId, userId, isPaid);
  return section;
};

const getOwnedItem = async (itemId: string, userId: string, isPaid: boolean) => {
  const [item] = await db
    .select()
    .from(PortfolioItem)
    .where(eq(PortfolioItem.id, itemId));

  if (!item) {
    throw new ActionError({ code: "NOT_FOUND", message: "Portfolio item not found." });
  }

  const [section] = await db
    .select()
    .from(PortfolioSection)
    .where(eq(PortfolioSection.id, item.sectionId));

  if (!section) {
    throw new ActionError({ code: "NOT_FOUND", message: "Portfolio item not found." });
  }

  await getOwnedProjectWithTemplateAccess(section.projectId, userId, isPaid);
  return { item, section };
};

const touchProject = async (projectId: string) => {
  await db
    .update(PortfolioProject)
    .set({ updatedAt: new Date() })
    .where(eq(PortfolioProject.id, projectId));
};

const pushDashboardActivity = async (userId: string, activity: { event: string; entityId?: string }) => {
  try {
    const summary = await buildPortfolioDashboardSummary(userId);
    pushPortfolioCreatorActivity({
      userId,
      activity: {
        event: activity.event,
        entityId: activity.entityId,
        occurredAt: new Date().toISOString(),
      },
      summary,
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("pushPortfolioCreatorActivity failed", error);
    }
  }
};

const defaultProfile = () => ({
  fullName: "",
  headline: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
});

const defaultAbout = () => ({ text: "" });

const defaultSkills = () => ({
  groups: [
    { name: "Backend", items: [] },
    { name: "Frontend", items: [] },
    { name: "Tools", items: [] },
  ],
});

const defaultContact = () => ({
  callToActionTitle: "",
  callToActionText: "",
  email: "",
  website: "",
  links: [],
});

export const listProjects = defineAction({
  input: z.object({}).optional(),
  async handler(_input, context: ActionAPIContext) {
    const user = requireUser(context);
    const projects = await db
      .select()
      .from(PortfolioProject)
      .where(eq(PortfolioProject.userId, user.id))
      .orderBy(desc(PortfolioProject.updatedAt), desc(PortfolioProject.createdAt));

    return {
      items: projects.map(normalizePortfolioProject),
    };
  },
});

export const createProject = defineAction({
  input: projectSchema,
  async handler(input, context: ActionAPIContext) {
    const user = requireUser(context);
    ensureTemplateAccess(input.themeKey, user.isPaid);
    const title = normalizeText(input.title);
    if (!title) {
      throw new ActionError({ code: "BAD_REQUEST", message: "Title is required." });
    }

    const baseSlug = slugify(title);
    const slug = await ensureUniqueSlug(baseSlug);

    const now = new Date();
    const [project] = await db
      .insert(PortfolioProject)
      .values({
        id: randomUUID(),
        userId: user.id,
        title,
        slug,
        visibility: "private" satisfies PortfolioVisibility,
        isPublished: false,
        publishedAt: null,
        themeKey: input.themeKey,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    const sections = DEFAULT_SECTIONS.map((section) => ({
      id: randomUUID(),
      projectId: project.id,
      key: section.key,
      label: sectionLabels[section.key],
      order: section.order,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    }));

    await db.insert(PortfolioSection).values(sections);

    const defaultItems: Array<{ sectionId: string; data: any; order: number }> = [];
    const profileSection = sections.find((section) => section.key === "profile");
    const aboutSection = sections.find((section) => section.key === "about");
    const skillsSection = sections.find((section) => section.key === "skills");
    const contactSection = sections.find((section) => section.key === "contact");

    if (profileSection) {
      defaultItems.push({ sectionId: profileSection.id, data: defaultProfile(), order: 1 });
    }
    if (aboutSection) {
      defaultItems.push({ sectionId: aboutSection.id, data: defaultAbout(), order: 1 });
    }
    if (skillsSection) {
      defaultItems.push({ sectionId: skillsSection.id, data: defaultSkills(), order: 1 });
    }
    if (contactSection) {
      defaultItems.push({ sectionId: contactSection.id, data: defaultContact(), order: 1 });
    }

    const defaultItemRows = defaultItems.map((item) => ({
      id: randomUUID(),
      sectionId: item.sectionId,
      order: item.order,
      data: JSON.stringify(item.data),
      createdAt: now,
      updatedAt: now,
    }));

    if (defaultItemRows.length > 0) {
      await db.insert(PortfolioItem).values(defaultItemRows);
    }

    const itemsBySection = new Map<string, ReturnType<typeof normalizePortfolioItem>[]>();
    defaultItemRows.forEach((item) => {
      const list = itemsBySection.get(item.sectionId) ?? [];
      list.push(normalizePortfolioItem(item));
      itemsBySection.set(item.sectionId, list);
    });

    await pushDashboardActivity(user.id, { event: "portfolio.created", entityId: project.id });

    void notifyParent({
      appKey: "portfolio-creator",
      userId: user.id,
      title: "Portfolio created",
      message: `Portfolio “${project.title}” is ready.`,
      level: "success",
      meta: { projectId: project.id },
    });

    return {
      project: normalizePortfolioProject(project),
      sections: sections.map((section) => ({
        ...normalizePortfolioSection(section),
        items: itemsBySection.get(section.id) ?? [],
      })),
    };
  },
});

export const getProject = defineAction({
  input: projectIdSchema,
  async handler({ projectId }, context: ActionAPIContext) {
    const user = requireUser(context);
    const project = await getOwnedProjectWithTemplateAccess(projectId, user.id, user.isPaid);

    const sections = await db
      .select()
      .from(PortfolioSection)
      .where(eq(PortfolioSection.projectId, projectId))
      .orderBy(asc(PortfolioSection.order));

    const sectionIds = sections.map((section) => section.id);
    const items =
      sectionIds.length === 0
        ? []
        : await db
            .select()
            .from(PortfolioItem)
            .where(inArray(PortfolioItem.sectionId, sectionIds))
            .orderBy(asc(PortfolioItem.order));

    const itemsBySection = new Map<string, ReturnType<typeof normalizePortfolioItem>[]>();
    items.forEach((row) => {
      const normalized = normalizePortfolioItem(row);
      const bucket = itemsBySection.get(normalized.sectionId) ?? [];
      bucket.push(normalized);
      itemsBySection.set(normalized.sectionId, bucket);
    });

    const normalizedSections = sections.map((section) => ({
      ...normalizePortfolioSection(section),
      items: itemsBySection.get(section.id) ?? [],
    }));

    return {
      project: normalizePortfolioProject(project),
      sections: normalizedSections,
    };
  },
});

export const updateProject = defineAction({
  input: updateProjectSchema,
  async handler({ projectId, title, slug, visibility, themeKey }, context: ActionAPIContext) {
    const user = requireUser(context);
    const project = await getOwnedProjectWithTemplateAccess(projectId, user.id, user.isPaid);

    const updates: Record<string, any> = { updatedAt: new Date() };
    let visibilityChanged = false;

    if (title !== undefined) {
      const normalized = normalizeText(title);
      if (!normalized) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Title is required." });
      }
      updates.title = normalized;
    }

    if (slug !== undefined) {
      const normalizedSlug = normalizeText(slug);
      if (!normalizedSlug) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Slug is required." });
      }
      updates.slug = await ensureUniqueSlug(slugify(normalizedSlug), projectId);
    }

    if (visibility !== undefined) {
      updates.visibility = visibility;
      visibilityChanged = visibility !== project.visibility;
    }

    if (themeKey !== undefined) {
      ensureTemplateAccess(themeKey, user.isPaid);
      updates.themeKey = themeKey;
    }

    const [updated] = await db
      .update(PortfolioProject)
      .set(updates)
      .where(eq(PortfolioProject.id, projectId))
      .returning();

    await pushDashboardActivity(user.id, {
      event: visibilityChanged ? "visibility.changed" : "portfolio.updated",
      entityId: projectId,
    });

    if (updated?.title) {
      void notifyParent({
        appKey: "portfolio-creator",
        userId: user.id,
        title: "Portfolio updated",
        message: `Portfolio “${updated.title}” was updated.`,
        level: "info",
        meta: { projectId },
      });
    }

    return { project: normalizePortfolioProject(updated) };
  },
});

export const deleteProject = defineAction({
  input: projectIdSchema,
  async handler({ projectId }, context: ActionAPIContext) {
    const user = requireUser(context);
    await getOwnedProject(projectId, user.id);

    const sections = await db
      .select({ id: PortfolioSection.id })
      .from(PortfolioSection)
      .where(eq(PortfolioSection.projectId, projectId));
    const sectionIds = sections.map((section) => section.id);

    if (sectionIds.length > 0) {
      await db.delete(PortfolioItem).where(inArray(PortfolioItem.sectionId, sectionIds));
      await db.delete(PortfolioSection).where(inArray(PortfolioSection.id, sectionIds));
    }

    await db.delete(PortfolioProject).where(eq(PortfolioProject.id, projectId));

    await pushDashboardActivity(user.id, { event: "portfolio.deleted", entityId: projectId });

    return { success: true };
  },
});

export const setPublish = defineAction({
  input: publishSchema,
  async handler({ projectId, isPublished }, context: ActionAPIContext) {
    const user = requireUser(context);
    await getOwnedProjectWithTemplateAccess(projectId, user.id, user.isPaid);

    const now = new Date();
    const [project] = await db
      .update(PortfolioProject)
      .set({
        isPublished,
        publishedAt: isPublished ? now : null,
        updatedAt: now,
      })
      .where(eq(PortfolioProject.id, projectId))
      .returning();

    await pushDashboardActivity(user.id, {
      event: isPublished ? "portfolio.published" : "portfolio.unpublished",
      entityId: projectId,
    });

    void notifyParent({
      appKey: "portfolio-creator",
      userId: user.id,
      title: isPublished ? "Portfolio published" : "Portfolio unpublished",
      message: isPublished
        ? `Portfolio “${project.title}” is now live.`
        : `Portfolio “${project.title}” was unpublished.`,
      level: isPublished ? "success" : "warning",
      meta: { projectId, isPublished },
    });

    return { project: normalizePortfolioProject(project) };
  },
});

export const toggleSection = defineAction({
  input: sectionToggleSchema,
  async handler({ sectionId, isEnabled }, context: ActionAPIContext) {
    const user = requireUser(context);
    const section = await getOwnedSection(sectionId, user.id, user.isPaid);

    const [updated] = await db
      .update(PortfolioSection)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(PortfolioSection.id, sectionId))
      .returning();

    await touchProject(section.projectId);
    await pushDashboardActivity(user.id, { event: "section.toggled", entityId: sectionId });

    return { section: { ...normalizePortfolioSection(updated), items: [] } };
  },
});

export const reorderSections = defineAction({
  input: reorderSectionsSchema,
  async handler({ projectId, orderedSectionIds }, context: ActionAPIContext) {
    const user = requireUser(context);
    await getOwnedProjectWithTemplateAccess(projectId, user.id, user.isPaid);

    const existing = await db
      .select({ id: PortfolioSection.id })
      .from(PortfolioSection)
      .where(eq(PortfolioSection.projectId, projectId));
    const existingIds = new Set(existing.map((row) => row.id));

    orderedSectionIds.forEach((id) => {
      if (!existingIds.has(id)) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Invalid section order." });
      }
    });

    for (const [index, sectionId] of orderedSectionIds.entries()) {
      await db
        .update(PortfolioSection)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(eq(PortfolioSection.id, sectionId));
    }

    await touchProject(projectId);

    return { success: true };
  },
});

export const createItem = defineAction({
  input: createItemSchema,
  async handler({ sectionId, data }, context: ActionAPIContext) {
    const user = requireUser(context);
    const section = await getOwnedSection(sectionId, user.id, user.isPaid);

    const now = new Date();
    const [{ value: itemCountRaw } = { value: 0 }] = await db
      .select({ value: count() })
      .from(PortfolioItem)
      .where(eq(PortfolioItem.sectionId, sectionId));
    const order = Number(itemCountRaw ?? 0) + 1;

    const [created] = await db
      .insert(PortfolioItem)
      .values({
        id: randomUUID(),
        sectionId,
        order,
        data: JSON.stringify(data ?? {}),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await touchProject(section.projectId);
    await pushDashboardActivity(user.id, { event: "item.created", entityId: created.id });

    return { item: normalizePortfolioItem(created) };
  },
});

export const updateItem = defineAction({
  input: updateItemSchema,
  async handler({ itemId, data }, context: ActionAPIContext) {
    const user = requireUser(context);
    const { section } = await getOwnedItem(itemId, user.id, user.isPaid);

    const [updated] = await db
      .update(PortfolioItem)
      .set({ data: JSON.stringify(data ?? {}), updatedAt: new Date() })
      .where(eq(PortfolioItem.id, itemId))
      .returning();

    await touchProject(section.projectId);
    await pushDashboardActivity(user.id, { event: "item.updated", entityId: itemId });

    return { item: normalizePortfolioItem(updated) };
  },
});

export const deleteItem = defineAction({
  input: deleteItemSchema,
  async handler({ itemId }, context: ActionAPIContext) {
    const user = requireUser(context);
    const { section } = await getOwnedItem(itemId, user.id, user.isPaid);

    await db.delete(PortfolioItem).where(eq(PortfolioItem.id, itemId));
    await touchProject(section.projectId);
    await pushDashboardActivity(user.id, { event: "item.deleted", entityId: itemId });

    return { success: true };
  },
});

export const reorderItems = defineAction({
  input: reorderItemsSchema,
  async handler({ sectionId, orderedItemIds }, context: ActionAPIContext) {
    const user = requireUser(context);
    const section = await getOwnedSection(sectionId, user.id, user.isPaid);

    const existing = await db
      .select({ id: PortfolioItem.id })
      .from(PortfolioItem)
      .where(eq(PortfolioItem.sectionId, sectionId));
    const existingIds = new Set(existing.map((row) => row.id));

    orderedItemIds.forEach((id) => {
      if (!existingIds.has(id)) {
        throw new ActionError({ code: "BAD_REQUEST", message: "Invalid item order." });
      }
    });

    for (const [index, itemId] of orderedItemIds.entries()) {
      await db
        .update(PortfolioItem)
        .set({ order: index + 1, updatedAt: new Date() })
        .where(eq(PortfolioItem.id, itemId));
    }

    await touchProject(section.projectId);
    await pushDashboardActivity(user.id, { event: "item.updated" });

    return { success: true };
  },
});
