import { randomUUID } from "node:crypto";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import {
  PortfolioItem,
  PortfolioProject,
  PortfolioSection,
  and,
  asc,
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
import {
  PORTFOLIO_LIMITS,
  PORTFOLIO_MAX,
  PORTFOLIO_YEAR_MIN,
  getPortfolioYearMax,
} from "../modules/portfolio-creator/constraints";

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

const updateProfilePhotoSchema = z.object({
  projectId: z.string().min(1),
  profilePhotoKey: z.string().trim().min(1).nullable(),
  profilePhotoUrl: z.string().trim().url().nullable(),
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
  data: z.unknown(),
});

const updateItemSchema = z.object({
  itemId: z.string().min(1),
  data: z.unknown(),
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

const cleanText = (value: unknown, max: number, label: string, required = false) => {
  const cleaned = normalizeText(typeof value === "string" ? value : String(value ?? ""));
  if (required && !cleaned) {
    throw new ActionError({ code: "BAD_REQUEST", message: `${label} is required.` });
  }
  if (cleaned.length > max) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: `${label} must be ${max} characters or fewer.`,
    });
  }
  return cleaned;
};

const cleanEmail = (value: unknown, label: string) => {
  const email = cleanText(value, PORTFOLIO_MAX.profileEmail, label);
  if (!email) return "";
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    throw new ActionError({ code: "BAD_REQUEST", message: `${label} must be valid.` });
  }
  return email.toLowerCase();
};

const normalizeUrl = (value: unknown, label: string, max = PORTFOLIO_MAX.linkUrl) => {
  const raw = cleanText(value, max, label);
  if (!raw) return "";
  const compact = raw.replace(/\s+/g, "");
  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(compact) ? compact : `https://${compact}`;
  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new ActionError({ code: "BAD_REQUEST", message: `${label} must be a valid URL.` });
  }
  parsed.hostname = parsed.hostname.toLowerCase();
  return parsed.toString();
};

const cleanLines = (
  value: unknown,
  maxLine: number,
  maxItems: number,
  label: string,
) => {
  const values = Array.isArray(value)
    ? value.map((entry) => cleanText(entry, maxLine, label)).filter(Boolean)
    : String(value ?? "")
        .split("\n")
        .map((entry) => cleanText(entry, maxLine, label))
        .filter(Boolean);
  return values.slice(0, maxItems);
};

const cleanTags = (value: unknown) => {
  const tags = Array.isArray(value)
    ? value.map((entry) => cleanText(entry, PORTFOLIO_MAX.tag, "Tag")).filter(Boolean)
    : String(value ?? "")
        .split(",")
        .map((entry) => cleanText(entry, PORTFOLIO_MAX.tag, "Tag"))
        .filter(Boolean);
  const unique: string[] = [];
  for (const tag of tags) {
    if (!unique.includes(tag.toLowerCase())) {
      unique.push(tag.toLowerCase());
    }
  }
  return unique.slice(0, PORTFOLIO_LIMITS.projectTagsMax);
};

const parseYear = (value: unknown, label: string, required = false) => {
  if (value === "" || value === null || value === undefined) {
    if (required) {
      throw new ActionError({ code: "BAD_REQUEST", message: `${label} is required.` });
    }
    return undefined;
  }
  const year = Number(value);
  const max = getPortfolioYearMax();
  if (!Number.isInteger(year) || year < PORTFOLIO_YEAR_MIN || year > max) {
    throw new ActionError({
      code: "BAD_REQUEST",
      message: `${label} must be between ${PORTFOLIO_YEAR_MIN} and ${max}.`,
    });
  }
  return year;
};

const parseMonth = (value: unknown, label: string) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const month = Number(value);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ActionError({ code: "BAD_REQUEST", message: `${label} must be a valid month.` });
  }
  return month;
};

const validateChronology = (values: {
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  isPresent?: boolean;
}) => {
  const { startYear, startMonth, endYear, endMonth, isPresent } = values;
  if (isPresent && !startYear) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Start year is required when Present is enabled." });
  }
  if (isPresent && (endYear || endMonth)) {
    throw new ActionError({ code: "BAD_REQUEST", message: "End date must be empty when Present is enabled." });
  }
  if (startMonth && !startYear) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Start year is required when start month is set." });
  }
  if (endMonth && !endYear) {
    throw new ActionError({ code: "BAD_REQUEST", message: "End year is required when end month is set." });
  }
  if ((endYear || endMonth) && !startYear) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Start year is required when end date is set." });
  }
  if (startYear && endYear) {
    const startValue = startYear * 100 + (startMonth ?? 1);
    const endValue = endYear * 100 + (endMonth ?? 12);
    if (endValue < startValue) {
      throw new ActionError({ code: "BAD_REQUEST", message: "End date must be after start date." });
    }
  }
};

const sanitizeSectionData = (key: PortfolioSectionKey, data: unknown) => {
  const source = (data ?? {}) as Record<string, any>;

  if (key === "profile") {
    return {
      fullName: cleanText(source.fullName, PORTFOLIO_MAX.profileFullName, "Full name", true),
      headline: cleanText(source.headline, PORTFOLIO_MAX.profileHeadline, "Headline"),
      location: cleanText(source.location, PORTFOLIO_MAX.profileLocation, "Location"),
      email: cleanEmail(source.email, "Email"),
      phone: cleanText(source.phone, PORTFOLIO_MAX.profilePhone, "Phone"),
      website: normalizeUrl(source.website, "Website", PORTFOLIO_MAX.profileWebsite),
      github: normalizeUrl(source.github, "GitHub", PORTFOLIO_MAX.profileGithub),
      linkedin: normalizeUrl(source.linkedin, "LinkedIn", PORTFOLIO_MAX.profileLinkedin),
    };
  }

  if (key === "about") {
    return {
      text: cleanText(source.text, PORTFOLIO_MAX.aboutText, "About"),
    };
  }

  if (key === "featuredProjects") {
    return {
      name: cleanText(source.name, PORTFOLIO_MAX.projectName, "Project name", true),
      description: cleanText(source.description, PORTFOLIO_MAX.projectDescription, "Project description"),
      link: normalizeUrl(source.link, "Project link", PORTFOLIO_MAX.projectLink),
      bullets: cleanLines(source.bullets, PORTFOLIO_MAX.bulletLine, PORTFOLIO_LIMITS.projectBulletsMax, "Bullet"),
      tags: cleanTags(source.tags),
    };
  }

  if (key === "experience") {
    const startYear = parseYear(source.startYear, "Start year");
    const startMonth = parseMonth(source.startMonth, "Start month");
    const endYear = parseYear(source.endYear, "End year");
    const endMonth = parseMonth(source.endMonth, "End month");
    const isPresent = Boolean(source.isPresent ?? source.present);
    validateChronology({ startYear, startMonth, endYear, endMonth, isPresent });
    return {
      role: cleanText(source.role, PORTFOLIO_MAX.experienceRole, "Role", true),
      company: cleanText(source.company, PORTFOLIO_MAX.experienceCompany, "Company", true),
      location: cleanText(source.location, PORTFOLIO_MAX.experienceLocation, "Location"),
      startYear,
      startMonth,
      endYear: isPresent ? undefined : endYear,
      endMonth: isPresent ? undefined : endMonth,
      isPresent,
      present: isPresent,
      bullets: cleanLines(source.bullets, PORTFOLIO_MAX.bulletLine, PORTFOLIO_LIMITS.experienceBulletsMax, "Bullet"),
    };
  }

  if (key === "education") {
    const startYear = parseYear(source.startYear, "Start year");
    const startMonth = parseMonth(source.startMonth, "Start month");
    const endYear = parseYear(source.endYear, "End year");
    const endMonth = parseMonth(source.endMonth, "End month");
    validateChronology({ startYear, startMonth, endYear, endMonth, isPresent: false });
    return {
      degree: cleanText(source.degree, PORTFOLIO_MAX.educationDegree, "Degree", true),
      field: cleanText(source.field, PORTFOLIO_MAX.educationField, "Field"),
      institution: cleanText(source.institution, PORTFOLIO_MAX.educationInstitution, "Institution", true),
      startYear,
      startMonth,
      endYear,
      endMonth,
      grade: cleanText(source.grade, PORTFOLIO_MAX.educationGrade, "Grade"),
    };
  }

  if (key === "certifications" || key === "achievements") {
    return {
      title: cleanText(source.title, PORTFOLIO_MAX.certificationTitle, "Title", true),
      issuer: cleanText(source.issuer, PORTFOLIO_MAX.certificationIssuer, "Issuer"),
      year: parseYear(source.year, "Year"),
      note: cleanText(source.note, PORTFOLIO_MAX.note, "Note"),
    };
  }

  if (key === "contact") {
    const links = Array.isArray(source.links)
      ? source.links
          .map((entry: any) => ({
            label: cleanText(entry?.label, PORTFOLIO_MAX.linkLabel, "Link label"),
            url: normalizeUrl(entry?.url, "Link URL", PORTFOLIO_MAX.linkUrl),
          }))
          .filter((entry) => entry.label && entry.url)
      : [];
    const deduped: Array<{ label: string; url: string }> = [];
    for (const entry of links) {
      if (!deduped.some((candidate) => candidate.url === entry.url && candidate.label === entry.label)) {
        deduped.push(entry);
      }
    }

    return {
      callToActionTitle: cleanText(source.callToActionTitle, PORTFOLIO_MAX.ctaTitle, "CTA title"),
      callToActionText: cleanText(source.callToActionText, PORTFOLIO_MAX.ctaText, "CTA text"),
      email: cleanEmail(source.email, "Email"),
      website: normalizeUrl(source.website, "Website", PORTFOLIO_MAX.profileWebsite),
      links: deduped,
    };
  }

  if (key === "skills") {
    const groups = Array.isArray(source.groups) ? source.groups : [];
    return {
      groups: groups.map((group: any) => ({
        name: cleanText(group?.name, PORTFOLIO_MAX.skillsGroupName, "Group name"),
        items: cleanLines(group?.items, PORTFOLIO_MAX.skillItem, 12, "Skill"),
      })),
    };
  }

  return source;
};

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
    const title = cleanText(input.title, PORTFOLIO_MAX.projectTitle, "Title", true);
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
      const normalizedSlug = cleanText(slug, PORTFOLIO_MAX.slug, "Slug", true);
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

export const updateProfilePhoto = defineAction({
  input: updateProfilePhotoSchema,
  async handler({ projectId, profilePhotoKey, profilePhotoUrl }, context: ActionAPIContext) {
    const user = requireUser(context);
    await getOwnedProjectWithTemplateAccess(projectId, user.id, user.isPaid);

    const now = new Date();
    const [project] = await db
      .update(PortfolioProject)
      .set({
        profilePhotoKey: profilePhotoKey ?? null,
        profilePhotoUrl: profilePhotoUrl ?? null,
        profilePhotoUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(PortfolioProject.id, projectId))
      .returning();

    await pushDashboardActivity(user.id, { event: "portfolio.profile-photo.updated", entityId: projectId });

    return {
      project: normalizePortfolioProject(project),
    };
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
    const sanitized = sanitizeSectionData(section.key as PortfolioSectionKey, data);

    const now = new Date();
    const items = await db
      .select({ order: PortfolioItem.order })
      .from(PortfolioItem)
      .where(eq(PortfolioItem.sectionId, sectionId));
    const order = items.reduce((maxOrder, item) => Math.max(maxOrder, Number(item.order) || 0), 0) + 1;

    const [created] = await db
      .insert(PortfolioItem)
      .values({
        id: randomUUID(),
        sectionId,
        order,
        data: JSON.stringify(sanitized),
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
    const sanitized = sanitizeSectionData(section.key as PortfolioSectionKey, data);

    const [updated] = await db
      .update(PortfolioItem)
      .set({ data: JSON.stringify(sanitized), updatedAt: new Date() })
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
