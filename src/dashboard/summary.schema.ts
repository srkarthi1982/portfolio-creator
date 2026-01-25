import { PortfolioProject, db, eq } from "astro:db";

export type PortfolioDashboardSummaryV1 = {
  appId: "portfolio-creator";
  version: 1;
  totalPortfolios: number;
  publishedCount: number;
  lastUpdatedAt: string;
  visibilityBreakdown: {
    public: number;
    unlisted: number;
    private: number;
  };
  completionHint?: number;
};

const toIsoString = (value?: Date | string | null) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

export const buildPortfolioDashboardSummary = async (
  userId: string,
): Promise<PortfolioDashboardSummaryV1> => {
  const projects = await db
    .select({
      visibility: PortfolioProject.visibility,
      isPublished: PortfolioProject.isPublished,
      updatedAt: PortfolioProject.updatedAt,
      createdAt: PortfolioProject.createdAt,
    })
    .from(PortfolioProject)
    .where(eq(PortfolioProject.userId, userId));

  const totalPortfolios = projects.length;
  const publishedCount = projects.filter((project) => project.isPublished).length;

  const visibilityBreakdown = {
    public: 0,
    unlisted: 0,
    private: 0,
  };

  let latest: string | null = null;
  projects.forEach((project) => {
    const visibility = String(project.visibility ?? "private") as keyof typeof visibilityBreakdown;
    if (visibility in visibilityBreakdown) {
      visibilityBreakdown[visibility] += 1;
    }

    const candidate = toIsoString(project.updatedAt) ?? toIsoString(project.createdAt);
    if (!candidate) return;
    if (!latest || new Date(candidate).getTime() > new Date(latest).getTime()) {
      latest = candidate;
    }
  });

  const lastUpdatedAt = latest ?? new Date().toISOString();
  const completionHint = totalPortfolios > 0 ? Math.round((publishedCount / totalPortfolios) * 100) : 0;

  return {
    appId: "portfolio-creator",
    version: 1,
    totalPortfolios,
    publishedCount,
    lastUpdatedAt,
    visibilityBreakdown,
    completionHint,
  };
};
