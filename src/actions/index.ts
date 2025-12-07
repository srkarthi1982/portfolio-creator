import type { ActionAPIContext } from "astro:actions";
import { defineAction, ActionError } from "astro:actions";
import { z } from "astro:schema";
import { db, eq, and, Portfolios, PortfolioProjects } from "astro:db";

function requireUser(context: ActionAPIContext) {
  const locals = context.locals as App.Locals | undefined;
  const user = locals?.user;

  if (!user) {
    throw new ActionError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }

  return user;
}

export const server = {
  createPortfolio: defineAction({
    input: z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Title is required"),
      summary: z.string().optional(),
      isDefault: z.boolean().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      if (input.isDefault) {
        await db
          .update(Portfolios)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(eq(Portfolios.userId, user.id));
      }

      const [portfolio] = await db
        .insert(Portfolios)
        .values({
          id: input.id ?? crypto.randomUUID(),
          userId: user.id,
          title: input.title,
          summary: input.summary,
          isDefault: input.isDefault ?? false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return { portfolio };
    },
  }),

  updatePortfolio: defineAction({
    input: z.object({
      id: z.string(),
      title: z.string().min(1).optional(),
      summary: z.string().optional(),
      isDefault: z.boolean().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);
      const { id, ...rest } = input;

      const [existing] = await db
        .select()
        .from(Portfolios)
        .where(and(eq(Portfolios.id, id), eq(Portfolios.userId, user.id)))
        .limit(1);

      if (!existing) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Portfolio not found.",
        });
      }

      if (rest.isDefault) {
        await db
          .update(Portfolios)
          .set({ isDefault: false, updatedAt: new Date() })
          .where(and(eq(Portfolios.userId, user.id), eq(Portfolios.isDefault, true)));
      }

      const updateData: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (typeof value !== "undefined") {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        return { portfolio: existing };
      }

      const [portfolio] = await db
        .update(Portfolios)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(eq(Portfolios.id, id), eq(Portfolios.userId, user.id)))
        .returning();

      return { portfolio };
    },
  }),

  listPortfolios: defineAction({
    input: z.object({}).optional(),
    handler: async (_, context) => {
      const user = requireUser(context);

      const portfolios = await db.select().from(Portfolios).where(eq(Portfolios.userId, user.id));

      return { portfolios };
    },
  }),

  deletePortfolio: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [deleted] = await db
        .delete(Portfolios)
        .where(and(eq(Portfolios.id, input.id), eq(Portfolios.userId, user.id)))
        .returning();

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Portfolio not found.",
        });
      }

      return { portfolio: deleted };
    },
  }),

  saveProject: defineAction({
    input: z.object({
      id: z.string().optional(),
      portfolioId: z.string(),
      title: z.string().min(1, "Project title is required"),
      role: z.string().optional(),
      companyName: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      isCurrent: z.boolean().optional(),
      description: z.string().optional(),
      skills: z.string().optional(),
      orderIndex: z.number().int().nonnegative().optional(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [portfolio] = await db
        .select()
        .from(Portfolios)
        .where(and(eq(Portfolios.id, input.portfolioId), eq(Portfolios.userId, user.id)))
        .limit(1);

      if (!portfolio) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Portfolio not found.",
        });
      }

      const baseValues = {
        portfolioId: input.portfolioId,
        title: input.title,
        role: input.role,
        companyName: input.companyName,
        startDate: input.startDate,
        endDate: input.endDate,
        isCurrent: input.isCurrent ?? false,
        description: input.description,
        skills: input.skills,
        orderIndex: input.orderIndex,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (input.id) {
        const [existing] = await db
          .select()
          .from(PortfolioProjects)
          .where(eq(PortfolioProjects.id, input.id))
          .limit(1);

        if (!existing || existing.portfolioId !== input.portfolioId) {
          throw new ActionError({
            code: "NOT_FOUND",
            message: "Project not found.",
          });
        }

        const [project] = await db
          .update(PortfolioProjects)
          .set(baseValues)
          .where(eq(PortfolioProjects.id, input.id))
          .returning();

        return { project };
      }

      const [project] = await db.insert(PortfolioProjects).values(baseValues).returning();
      return { project };
    },
  }),

  deleteProject: defineAction({
    input: z.object({
      id: z.string(),
      portfolioId: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [portfolio] = await db
        .select()
        .from(Portfolios)
        .where(and(eq(Portfolios.id, input.portfolioId), eq(Portfolios.userId, user.id)))
        .limit(1);

      if (!portfolio) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Portfolio not found.",
        });
      }

      const [deleted] = await db
        .delete(PortfolioProjects)
        .where(
          and(
            eq(PortfolioProjects.id, input.id),
            eq(PortfolioProjects.portfolioId, input.portfolioId)
          )
        )
        .returning();

      if (!deleted) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Project not found.",
        });
      }

      return { project: deleted };
    },
  }),

  getPortfolioWithProjects: defineAction({
    input: z.object({
      id: z.string(),
    }),
    handler: async (input, context) => {
      const user = requireUser(context);

      const [portfolio] = await db
        .select()
        .from(Portfolios)
        .where(and(eq(Portfolios.id, input.id), eq(Portfolios.userId, user.id)))
        .limit(1);

      if (!portfolio) {
        throw new ActionError({
          code: "NOT_FOUND",
          message: "Portfolio not found.",
        });
      }

      const projects = await db
        .select()
        .from(PortfolioProjects)
        .where(eq(PortfolioProjects.portfolioId, input.id));

      return { portfolio, projects };
    },
  }),
};
