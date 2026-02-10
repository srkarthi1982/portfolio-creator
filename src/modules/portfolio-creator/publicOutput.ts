import type {
  PortfolioPublicData,
  PortfolioPublicSectionKey,
  PortfolioPublicTemplateKey,
} from "@ansiversa/components";
import { buildPortfolioDataFromSections } from "./helpers";
import type { PortfolioProjectDTO, PortfolioSectionDTO } from "./types";

const TEMPLATE_KEYS: PortfolioPublicTemplateKey[] = ["classic", "gallery", "minimal", "story"];
const SECTION_KEYS: PortfolioPublicSectionKey[] = [
  "about",
  "featuredProjects",
  "experience",
  "skills",
  "education",
  "certifications",
  "achievements",
  "contact",
];

const clean = (value?: string | null) => (value ?? "").trim();

const toTemplateKey = (value?: string | null): PortfolioPublicTemplateKey => {
  const candidate = clean(value) as PortfolioPublicTemplateKey;
  return TEMPLATE_KEYS.includes(candidate) ? candidate : "classic";
};

const toSectionKey = (value?: string | null) => {
  const candidate = clean(value) as PortfolioPublicSectionKey;
  return SECTION_KEYS.includes(candidate) ? candidate : null;
};

const normalizeHref = (value?: string | null) => {
  const raw = clean(value);
  if (!raw) return "";
  if (/^(mailto:|tel:|https?:\/\/)/i.test(raw)) return raw;
  return `https://${raw.replace(/^\/+/, "")}`;
};

const formatDateLabel = (value?: string | null) => {
  const raw = clean(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const buildPortfolioPublicData = (
  project: Pick<PortfolioProjectDTO, "title" | "slug" | "visibility" | "themeKey" | "publishedAt" | "updatedAt">,
  sections: PortfolioSectionDTO[],
): PortfolioPublicData => {
  const templateKey = toTemplateKey(project.themeKey);
  const data = buildPortfolioDataFromSections(sections);

  const visibleSections = sections
    .filter((section) => section.isEnabled)
    .map((section) => toSectionKey(section.key))
    .filter((sectionKey): sectionKey is PortfolioPublicSectionKey => Boolean(sectionKey));

  const links = data.contact.links
    .map((link) => {
      const href = normalizeHref(link.url);
      return {
        label: clean(link.label) || clean(link.url),
        href,
      };
    })
    .filter((link) => link.href);

  return {
    version: "1.0",
    templateKey,
    owner: {
      fullName: clean(data.profile.fullName),
      headline: clean(data.profile.headline),
      summary: clean(data.about.text),
      location: clean(data.profile.location),
    },
    contact: {
      email: clean(data.profile.email) || clean(data.contact.email),
      phone: clean(data.profile.phone),
      website: clean(data.profile.website) || clean(data.contact.website),
      github: clean(data.profile.github),
      linkedin: clean(data.profile.linkedin),
      callToActionTitle: clean(data.contact.callToActionTitle),
      callToActionText: clean(data.contact.callToActionText),
      links,
    },
    sections: {
      about: clean(data.about.text),
      featuredProjects: data.featuredProjects.map((item) => ({
        name: clean(item.name),
        description: clean(item.description),
        link: normalizeHref(item.link),
        bullets: item.bullets.map((bullet) => clean(bullet)).filter(Boolean),
        tags: item.tags.map((tag) => clean(tag)).filter(Boolean),
      })),
      experience: data.experience.map((item) => ({
        role: clean(item.role),
        company: clean(item.company),
        location: clean(item.location),
        start: clean(item.start),
        end: clean(item.end),
        bullets: item.bullets.map((bullet) => clean(bullet)).filter(Boolean),
      })),
      skills: data.skills.groups
        .map((group) => ({
          name: clean(group.name),
          items: group.items.map((item) => clean(item)).filter(Boolean),
        }))
        .filter((group) => group.name || group.items.length > 0),
      education: data.education.map((item) => ({
        degree: clean(item.degree),
        field: clean(item.field),
        institution: clean(item.institution),
        start: clean(item.start),
        end: clean(item.end),
        grade: clean(item.grade),
      })),
      certifications: data.certifications.map((item) => ({
        title: clean(item.title),
        issuer: clean(item.issuer),
        year: clean(item.year),
        note: clean(item.note),
      })),
      achievements: data.achievements.map((item) => ({
        title: clean(item.title),
        issuer: clean(item.issuer),
        year: clean(item.year),
        note: clean(item.note),
      })),
    },
    visibleSections,
    meta: {
      title: clean(project.title),
      slug: clean(project.slug),
      visibility: project.visibility,
      publishedAt: project.publishedAt,
      updatedAt: project.updatedAt,
      lastUpdatedLabel: formatDateLabel(project.updatedAt ?? project.publishedAt),
    },
  };
};
