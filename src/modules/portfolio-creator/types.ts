export type PortfolioSectionKey =
  | "profile"
  | "about"
  | "featuredProjects"
  | "experience"
  | "skills"
  | "education"
  | "certifications"
  | "achievements"
  | "contact";

export type PortfolioVisibility = "public" | "unlisted" | "private";

export type PortfolioProjectDTO = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  visibility: PortfolioVisibility;
  isPublished: boolean;
  publishedAt: string | null;
  themeKey: string;
  profilePhotoKey: string | null;
  profilePhotoUrl: string | null;
  profilePhotoUpdatedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PortfolioSectionDTO = {
  id: string;
  projectId: string;
  key: PortfolioSectionKey;
  label: string;
  order: number;
  isEnabled: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  items: PortfolioItemDTO[];
};

export type PortfolioItemDTO = {
  id: string;
  sectionId: string;
  order: number;
  data: any;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PortfolioProjectDetail = {
  project: PortfolioProjectDTO;
  sections: PortfolioSectionDTO[];
};
