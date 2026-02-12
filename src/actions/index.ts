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
  updateProfilePhoto,
  updateProject,
} from "./portfolioCreator";

export const portfolioCreator = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  updateProfilePhoto,
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
