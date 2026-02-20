import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { Bookmark, PortfolioProject, and, db, desc, eq } from "astro:db";
import { z } from "astro:schema";
import { requireUser } from "./_guards";

const bookmarkEntityTypeSchema = z.enum(["portfolio"]);

const normalizeEntityId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Entity id is required" });
  }
  return trimmed;
};

const normalizeLabel = (value?: string) => {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new ActionError({ code: "BAD_REQUEST", message: "Label is required" });
  }
  return trimmed;
};

export const listBookmarks = defineAction({
  input: z.object({}).optional(),
  async handler(_input, context: ActionAPIContext) {
    const user = requireUser(context);

    const rows = await db
      .select({
        entityId: Bookmark.entityId,
        label: Bookmark.label,
        createdAt: Bookmark.createdAt,
        projectId: PortfolioProject.id,
        projectTitle: PortfolioProject.title,
        projectSlug: PortfolioProject.slug,
        projectUpdatedAt: PortfolioProject.updatedAt,
      })
      .from(Bookmark)
      .leftJoin(
        PortfolioProject,
        and(eq(Bookmark.entityId, PortfolioProject.id), eq(PortfolioProject.userId, user.id)),
      )
      .where(and(eq(Bookmark.userId, user.id), eq(Bookmark.entityType, "portfolio")))
      .orderBy(desc(Bookmark.createdAt), desc(Bookmark.id));

    return {
      items: rows.map((row) => ({
        entityId: row.entityId,
        label: row.label,
        createdAt: row.createdAt,
        projectId: row.projectId ?? row.entityId,
        projectTitle: row.projectTitle ?? row.label ?? "Untitled portfolio",
        projectSlug: row.projectSlug ?? "",
        projectUpdatedAt: row.projectUpdatedAt,
      })),
    };
  },
});

export const toggleBookmark = defineAction({
  input: z.object({
    entityType: bookmarkEntityTypeSchema,
    entityId: z.string().min(1, "Entity id is required"),
    label: z.string().min(1, "Label is required"),
  }),
  async handler(input, context: ActionAPIContext) {
    const user = requireUser(context);
    const entityId = normalizeEntityId(input.entityId);
    const label = normalizeLabel(input.label);

    const existing = await db
      .select({ id: Bookmark.id })
      .from(Bookmark)
      .where(
        and(
          eq(Bookmark.userId, user.id),
          eq(Bookmark.entityType, input.entityType),
          eq(Bookmark.entityId, entityId),
        ),
      )
      .get();

    if (existing?.id) {
      await db.delete(Bookmark).where(eq(Bookmark.id, existing.id));
      return { saved: false };
    }

    try {
      await db.insert(Bookmark).values({
        userId: user.id,
        entityType: input.entityType,
        entityId,
        label,
      });
      return { saved: true };
    } catch {
      const stillExists = await db
        .select({ id: Bookmark.id })
        .from(Bookmark)
        .where(
          and(
            eq(Bookmark.userId, user.id),
            eq(Bookmark.entityType, input.entityType),
            eq(Bookmark.entityId, entityId),
          ),
        )
        .get();

      if (stillExists?.id) {
        return { saved: true };
      }

      throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to toggle bookmark" });
    }
  },
});
