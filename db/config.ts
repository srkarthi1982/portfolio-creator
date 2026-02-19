import { defineDb } from "astro:db";
import { Faq, PortfolioItem, PortfolioProject, PortfolioSection } from "./tables";

export default defineDb({
  tables: {
    PortfolioProject,
    PortfolioSection,
    PortfolioItem,
    Faq,
  },
});
