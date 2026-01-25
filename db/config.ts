import { defineDb } from "astro:db";
import { PortfolioItem, PortfolioProject, PortfolioSection } from "./tables";

export default defineDb({
  tables: {
    PortfolioProject,
    PortfolioSection,
    PortfolioItem,
  },
});
