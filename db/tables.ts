import { defineTable, column, NOW } from "astro:db";

export const Portfolios = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),                // e.g. "Frontend Developer Portfolio"
    summary: column.text({ optional: true }),
    isDefault: column.boolean({ default: false }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const PortfolioProjects = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    portfolioId: column.text({
      references: () => Portfolios.columns.id,
    }),
    title: column.text(),            // project title
    role: column.text({ optional: true }),       // e.g. "Lead Developer"
    companyName: column.text({ optional: true }),
    startDate: column.date({ optional: true }),
    endDate: column.date({ optional: true }),
    isCurrent: column.boolean({ default: false }),
    description: column.text({ optional: true }),
    skills: column.text({ optional: true }),     // comma-separated or JSON tags
    orderIndex: column.number({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const tables = {
  Portfolios,
  PortfolioProjects,
} as const;
