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
import { listBookmarks, toggleBookmark } from "./bookmarks";

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
  listBookmarks,
  toggleBookmark,
};

export const server = {
  portfolioCreator,
};
