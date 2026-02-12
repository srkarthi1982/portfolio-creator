import { column, defineTable, NOW } from "astro:db";

export const PortfolioProject = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text(),
    title: column.text(),
    slug: column.text({ unique: true }),
    visibility: column.text(),
    isPublished: column.boolean({ default: false }),
    publishedAt: column.date({ optional: true }),
    themeKey: column.text(),
    profilePhotoKey: column.text({ optional: true }),
    profilePhotoUrl: column.text({ optional: true }),
    profilePhotoUpdatedAt: column.date({ optional: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const PortfolioSection = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    projectId: column.text(),
    key: column.text(),
    label: column.text(),
    order: column.number(),
    isEnabled: column.boolean({ default: true }),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const PortfolioItem = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    sectionId: column.text(),
    order: column.number(),
    data: column.text(),
    createdAt: column.date({ default: NOW }),
    updatedAt: column.date({ default: NOW }),
  },
});

export const portfolioTables = {
  PortfolioProject,
  PortfolioSection,
  PortfolioItem,
} as const;
