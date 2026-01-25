import {
  createItem,
  createProject,
  deleteItem,
  deleteProject,
  getProject,
  listProjects,
  reorderItems,
  reorderSections,
  setPublish,
  toggleSection,
  updateItem,
  updateProject,
} from "./portfolioCreator";

export const portfolioCreator = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  setPublish,
  toggleSection,
  reorderSections,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
};

export const server = {
  portfolioCreator,
};
