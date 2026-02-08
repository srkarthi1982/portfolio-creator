import type { PortfolioItemDTO, PortfolioProjectDTO, PortfolioSectionDTO } from "./types";
import type { PortfolioSectionKey } from "./types";

export const TEMPLATE_KEYS = ["classic", "gallery", "minimal", "story"] as const;

export const TEMPLATE_OPTIONS = [
  { key: "classic", label: "Case Study", tier: "free" },
  { key: "gallery", label: "Gallery", tier: "free" },
  { key: "minimal", label: "Minimal", tier: "pro" },
  { key: "story", label: "Story", tier: "pro" },
] as const;

const TEMPLATE_TIER_MAP = {
  classic: "free",
  gallery: "free",
  minimal: "pro",
  story: "pro",
} as const;

export const isProTemplate = (templateKey: string) =>
  TEMPLATE_TIER_MAP[templateKey as keyof typeof TEMPLATE_TIER_MAP] === "pro";

export type PortfolioProjectRow = {
  id: string;
  userId: string;
  title: string;
  slug: string;
  visibility: string;
  isPublished?: boolean | null;
  publishedAt?: Date | null;
  themeKey: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type PortfolioSectionRow = {
  id: string;
  projectId: string;
  key: string;
  label: string;
  order: number;
  isEnabled?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type PortfolioItemRow = {
  id: string;
  sectionId: string;
  order: number;
  data: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export const sectionLabels: Record<PortfolioSectionKey, string> = {
  profile: "Profile",
  about: "About",
  featuredProjects: "Featured Projects",
  experience: "Experience",
  skills: "Skills",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  contact: "Contact",
};

export const normalizeText = (value?: string | null) => {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : "";
};

const safeParseJson = (value?: string | null) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const normalizePortfolioProject = (row: PortfolioProjectRow): PortfolioProjectDTO => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  slug: row.slug,
  visibility: row.visibility as PortfolioProjectDTO["visibility"],
  isPublished: Boolean(row.isPublished),
  publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
  themeKey: row.themeKey,
  createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
});

export const normalizePortfolioSection = (row: PortfolioSectionRow): Omit<PortfolioSectionDTO, "items"> => ({
  id: row.id,
  projectId: row.projectId,
  key: row.key as PortfolioSectionDTO["key"],
  label: row.label,
  order: Number(row.order ?? 0),
  isEnabled: row.isEnabled ?? true,
  createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
});

export const normalizePortfolioItem = (row: PortfolioItemRow): PortfolioItemDTO => ({
  id: row.id,
  sectionId: row.sectionId,
  order: Number(row.order ?? 0),
  data: safeParseJson(row.data) ?? {},
  createdAt: row.createdAt ? row.createdAt.toISOString() : null,
  updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
});

export type PortfolioData = {
  profile: {
    fullName: string;
    headline: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    github: string;
    linkedin: string;
  };
  about: {
    text: string;
  };
  skills: {
    groups: Array<{ name: string; items: string[] }>;
  };
  featuredProjects: Array<{
    name: string;
    description: string;
    link: string;
    bullets: string[];
    tags: string[];
  }>;
  experience: Array<{
    role: string;
    company: string;
    start: string;
    end: string;
    location: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    start: string;
    end: string;
    grade?: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
    year: string;
    note?: string;
  }>;
  achievements: Array<{
    title: string;
    issuer: string;
    year: string;
    note?: string;
  }>;
  contact: {
    callToActionTitle: string;
    callToActionText: string;
    email: string;
    website: string;
    links: Array<{ label: string; url: string }>;
  };
};

export const createEmptyPortfolioData = (): PortfolioData => ({
  profile: {
    fullName: "",
    headline: "",
    location: "",
    email: "",
    phone: "",
    website: "",
    github: "",
    linkedin: "",
  },
  about: {
    text: "",
  },
  skills: {
    groups: [
      { name: "Backend", items: [] },
      { name: "Frontend", items: [] },
      { name: "Tools", items: [] },
    ],
  },
  featuredProjects: [],
  experience: [],
  education: [],
  certifications: [],
  achievements: [],
  contact: {
    callToActionTitle: "",
    callToActionText: "",
    email: "",
    website: "",
    links: [],
  },
});

const getSectionItems = (sections: PortfolioSectionDTO[], key: PortfolioSectionKey): PortfolioItemDTO[] => {
  return sections.find((section) => section.key === key)?.items ?? [];
};

const normalizeArray = (value: any) => (Array.isArray(value) ? value.filter(Boolean).map(String) : []);

const monthLabel = (value?: number) => {
  if (!value || value < 1 || value > 12) return "";
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][value - 1];
};

const formatRange = (
  startYear?: number,
  startMonth?: number,
  endYear?: number,
  endMonth?: number,
  isPresent?: boolean,
) => {
  const start = startYear
    ? [monthLabel(startMonth), String(startYear)].filter(Boolean).join(" ")
    : "";
  const end = isPresent
    ? "Present"
    : endYear
      ? [monthLabel(endMonth), String(endYear)].filter(Boolean).join(" ")
      : "";
  return { start, end };
};

export const buildPortfolioDataFromSections = (sections: PortfolioSectionDTO[]): PortfolioData => {
  const base = createEmptyPortfolioData();
  const enabledSections = sections.filter((section) => section.isEnabled);

  const profileItem = getSectionItems(enabledSections, "profile")[0]?.data ?? {};
  base.profile = {
    ...base.profile,
    ...profileItem,
  };

  const aboutItem = getSectionItems(enabledSections, "about")[0]?.data ?? {};
  base.about = {
    ...base.about,
    text: normalizeText(aboutItem.text ?? base.about.text),
  };

  const skillsItem = getSectionItems(enabledSections, "skills")[0]?.data ?? {};
  const groups = Array.isArray(skillsItem.groups) ? skillsItem.groups : base.skills.groups;
  base.skills = {
    groups: groups.map((group: any) => ({
      name: normalizeText(group?.name ?? ""),
      items: normalizeArray(group?.items ?? []),
    })),
  };

  base.featuredProjects = getSectionItems(enabledSections, "featuredProjects").map((item) => ({
    name: normalizeText(item.data?.name ?? ""),
    description: normalizeText(item.data?.description ?? ""),
    link: normalizeText(item.data?.link ?? ""),
    bullets: normalizeArray(item.data?.bullets ?? []),
    tags: normalizeArray(item.data?.tags ?? []),
  }));

  base.experience = getSectionItems(enabledSections, "experience").map((item) => ({
    ...(() => {
      const startYear = Number(item.data?.startYear);
      const startMonth = Number(item.data?.startMonth);
      const endYear = Number(item.data?.endYear);
      const endMonth = Number(item.data?.endMonth);
      const isPresent = Boolean(item.data?.isPresent ?? item.data?.present);
      const range = formatRange(
        Number.isFinite(startYear) ? startYear : undefined,
        Number.isFinite(startMonth) ? startMonth : undefined,
        Number.isFinite(endYear) ? endYear : undefined,
        Number.isFinite(endMonth) ? endMonth : undefined,
        isPresent,
      );
      return {
        role: normalizeText(item.data?.role ?? ""),
        company: normalizeText(item.data?.company ?? ""),
        start: range.start || normalizeText(item.data?.start ?? ""),
        end: range.end || normalizeText(item.data?.end ?? ""),
        location: normalizeText(item.data?.location ?? ""),
        bullets: normalizeArray(item.data?.bullets ?? []),
      };
    })(),
  }));

  base.education = getSectionItems(enabledSections, "education").map((item) => ({
    ...(() => {
      const startYear = Number(item.data?.startYear);
      const startMonth = Number(item.data?.startMonth);
      const endYear = Number(item.data?.endYear);
      const endMonth = Number(item.data?.endMonth);
      const range = formatRange(
        Number.isFinite(startYear) ? startYear : undefined,
        Number.isFinite(startMonth) ? startMonth : undefined,
        Number.isFinite(endYear) ? endYear : undefined,
        Number.isFinite(endMonth) ? endMonth : undefined,
        false,
      );
      return {
        degree: normalizeText(item.data?.degree ?? ""),
        field: normalizeText(item.data?.field ?? ""),
        institution: normalizeText(item.data?.institution ?? ""),
        start: range.start || normalizeText(item.data?.start ?? ""),
        end: range.end || normalizeText(item.data?.end ?? ""),
        grade: normalizeText(item.data?.grade ?? ""),
      };
    })(),
  }));

  base.certifications = getSectionItems(enabledSections, "certifications").map((item) => ({
    title: normalizeText(item.data?.title ?? ""),
    issuer: normalizeText(item.data?.issuer ?? ""),
    year: String(item.data?.year ?? "").trim(),
    note: normalizeText(item.data?.note ?? ""),
  }));

  base.achievements = getSectionItems(enabledSections, "achievements").map((item) => ({
    title: normalizeText(item.data?.title ?? ""),
    issuer: normalizeText(item.data?.issuer ?? ""),
    year: String(item.data?.year ?? "").trim(),
    note: normalizeText(item.data?.note ?? ""),
  }));

  const contactItem = getSectionItems(enabledSections, "contact")[0]?.data ?? {};
  base.contact = {
    ...base.contact,
    callToActionTitle: normalizeText(contactItem.callToActionTitle ?? ""),
    callToActionText: normalizeText(contactItem.callToActionText ?? ""),
    email: normalizeText(contactItem.email ?? ""),
    website: normalizeText(contactItem.website ?? ""),
    links: Array.isArray(contactItem.links)
      ? contactItem.links
          .map((link: any) => ({
            label: normalizeText(link?.label ?? ""),
            url: normalizeText(link?.url ?? ""),
          }))
          .filter((link: { label: string; url: string }) => link.label || link.url)
      : [],
  };

  return base;
};
