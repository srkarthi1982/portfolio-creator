import { defineDb } from "astro:db";
import { Bookmark, Faq, PortfolioItem, PortfolioProject, PortfolioSection } from "./tables";

export default defineDb({
  tables: {
    PortfolioProject,
    PortfolioSection,
    PortfolioItem,
    Faq,
    Bookmark,
  },
});
