import type { Alpine } from "alpinejs";
import { registerPortfolioCreatorStore } from "./modules/portfolio-creator/store";

export default function initAlpine(Alpine: Alpine) {
  registerPortfolioCreatorStore(Alpine);

  if (typeof window !== "undefined") {
    window.Alpine = Alpine;
  }
}
