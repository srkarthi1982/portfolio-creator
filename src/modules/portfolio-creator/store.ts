import type { Alpine } from "alpinejs";
import { AvBaseStore } from "@ansiversa/components/alpine";
import { actions } from "astro:actions";
import type {
  PortfolioItemDTO,
  PortfolioProjectDTO,
  PortfolioProjectDetail,
  PortfolioSectionKey,
  PortfolioVisibility,
} from "./types";
import { TEMPLATE_KEYS, TEMPLATE_OPTIONS, isProTemplate, sectionLabels } from "./helpers";

const SINGLE_SECTIONS: PortfolioSectionKey[] = ["profile", "about", "skills", "contact"];
const PAYWALL_MESSAGE = "This template is available in Pro.";

const defaultState = () => ({
  projects: [] as PortfolioProjectDTO[],
  activeProject: null as PortfolioProjectDetail | null,
  activeProjectId: null as string | null,
  loading: false,
  error: null as string | null,
  success: null as string | null,
  drawerOpen: false,
  activeSectionKey: null as PortfolioSectionKey | null,
  editingItemId: null as string | null,
  formData: {} as Record<string, any>,
  previewBuster: Date.now(),
  isPaid: false,
  paywallMessage: null as string | null,
  templateOptions: TEMPLATE_OPTIONS,
  newProject: {
    title: "",
    themeKey: TEMPLATE_OPTIONS[0].key,
  },
  projectMeta: {
    title: "",
    slug: "",
    visibility: "private" as PortfolioVisibility,
    isPublished: false,
    themeKey: TEMPLATE_OPTIONS[0].key,
  },
  pendingDeleteId: null as string | null,
});

const normalizeText = (value?: string | null) => {
  const trimmed = (value ?? "").toString().trim();
  return trimmed ? trimmed : "";
};

const toLines = (value: any) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const toTags = (value: any) => {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const fromLines = (value?: string[] | null) => (value && value.length ? value.join("\n") : "");
const fromTags = (value?: string[] | null) => (value && value.length ? value.join(", ") : "");

const parseLinks = (value: string) => {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [label, url] = entry.split("|").map((part) => part.trim());
      return { label: label ?? "", url: url ?? "" };
    })
    .filter((link) => link.label || link.url);
};

const formatLinks = (value: Array<{ label: string; url: string }>) => {
  if (!Array.isArray(value) || value.length === 0) return "";
  return value
    .map((link) => `${link.label ?? ""} | ${link.url ?? ""}`.trim())
    .join("\n")
    .trim();
};

const emptyProfile = () => ({
  fullName: "",
  headline: "",
  location: "",
  email: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
});

const emptyAbout = () => ({ text: "" });

const emptySkills = () => ({
  groups: [
    { name: "Backend", items: "" },
    { name: "Frontend", items: "" },
    { name: "Tools", items: "" },
  ],
});

const emptyContact = () => ({
  callToActionTitle: "",
  callToActionText: "",
  email: "",
  website: "",
  links: "",
});

const emptyFeaturedProject = () => ({
  name: "",
  description: "",
  link: "",
  bullets: "",
  tags: "",
});

const emptyExperience = () => ({
  role: "",
  company: "",
  start: "",
  end: "",
  location: "",
  bullets: "",
});

const emptyEducation = () => ({
  degree: "",
  field: "",
  institution: "",
  start: "",
  end: "",
  grade: "",
});

const emptyCertification = () => ({
  title: "",
  issuer: "",
  year: "",
  note: "",
});

const emptyAchievement = () => ({
  title: "",
  issuer: "",
  year: "",
  note: "",
});

const toFormData = (key: PortfolioSectionKey, data: any) => {
  if (key === "profile") return { ...emptyProfile(), ...(data ?? {}) };
  if (key === "about") return { ...emptyAbout(), ...(data ?? {}) };
  if (key === "skills") {
    const groups = Array.isArray(data?.groups)
      ? data.groups.map((group: any) => ({
          name: normalizeText(group?.name ?? ""),
          items: fromLines(Array.isArray(group?.items) ? group.items : []),
        }))
      : emptySkills().groups;
    return { groups };
  }
  if (key === "contact") {
    return {
      ...emptyContact(),
      ...(data ?? {}),
      links: formatLinks(Array.isArray(data?.links) ? data.links : []),
    };
  }
  if (key === "featuredProjects") {
    return {
      ...emptyFeaturedProject(),
      ...(data ?? {}),
      bullets: fromLines(data?.bullets ?? []),
      tags: fromTags(data?.tags ?? []),
    };
  }
  if (key === "experience") {
    return {
      ...emptyExperience(),
      ...(data ?? {}),
      bullets: fromLines(data?.bullets ?? []),
    };
  }
  if (key === "education") {
    return { ...emptyEducation(), ...(data ?? {}) };
  }
  if (key === "certifications") {
    return { ...emptyCertification(), ...(data ?? {}) };
  }
  if (key === "achievements") {
    return { ...emptyAchievement(), ...(data ?? {}) };
  }
  return data ?? {};
};

const toPayload = (key: PortfolioSectionKey, data: Record<string, any>) => {
  if (key === "profile") {
    return {
      fullName: normalizeText(data.fullName),
      headline: normalizeText(data.headline),
      location: normalizeText(data.location),
      email: normalizeText(data.email),
      phone: normalizeText(data.phone),
      website: normalizeText(data.website),
      github: normalizeText(data.github),
      linkedin: normalizeText(data.linkedin),
    };
  }
  if (key === "about") {
    return { text: normalizeText(data.text) };
  }
  if (key === "skills") {
    const groups = Array.isArray(data.groups) ? data.groups : emptySkills().groups;
    return {
      groups: groups.map((group: any) => ({
        name: normalizeText(group?.name ?? ""),
        items: toLines(group?.items ?? ""),
      })),
    };
  }
  if (key === "contact") {
    return {
      callToActionTitle: normalizeText(data.callToActionTitle),
      callToActionText: normalizeText(data.callToActionText),
      email: normalizeText(data.email),
      website: normalizeText(data.website),
      links: parseLinks(data.links ?? ""),
    };
  }
  if (key === "featuredProjects") {
    return {
      name: normalizeText(data.name),
      description: normalizeText(data.description),
      link: normalizeText(data.link),
      bullets: toLines(data.bullets ?? ""),
      tags: toTags(data.tags ?? ""),
    };
  }
  if (key === "experience") {
    return {
      role: normalizeText(data.role),
      company: normalizeText(data.company),
      start: normalizeText(data.start),
      end: normalizeText(data.end),
      location: normalizeText(data.location),
      bullets: toLines(data.bullets ?? ""),
    };
  }
  if (key === "education") {
    return {
      degree: normalizeText(data.degree),
      field: normalizeText(data.field),
      institution: normalizeText(data.institution),
      start: normalizeText(data.start),
      end: normalizeText(data.end),
      grade: normalizeText(data.grade),
    };
  }
  if (key === "certifications") {
    return {
      title: normalizeText(data.title),
      issuer: normalizeText(data.issuer),
      year: normalizeText(data.year),
      note: normalizeText(data.note),
    };
  }
  if (key === "achievements") {
    return {
      title: normalizeText(data.title),
      issuer: normalizeText(data.issuer),
      year: normalizeText(data.year),
      note: normalizeText(data.note),
    };
  }
  return data ?? {};
};

const isSingleSection = (key: PortfolioSectionKey) => SINGLE_SECTIONS.includes(key);

export class PortfolioCreatorStore extends AvBaseStore implements ReturnType<typeof defaultState> {
  projects: PortfolioProjectDTO[] = [];
  activeProject: PortfolioProjectDetail | null = null;
  activeProjectId: string | null = null;
  loading = false;
  error: string | null = null;
  success: string | null = null;
  drawerOpen = false;
  activeSectionKey: PortfolioSectionKey | null = null;
  editingItemId: string | null = null;
  formData: Record<string, any> = {};
  previewBuster = Date.now();
  isPaid = false;
  paywallMessage: string | null = null;
  templateOptions = TEMPLATE_OPTIONS;
  newProject = { title: "", themeKey: TEMPLATE_OPTIONS[0].key };
  projectMeta = {
    title: "",
    slug: "",
    visibility: "private" as PortfolioVisibility,
    isPublished: false,
    themeKey: TEMPLATE_OPTIONS[0].key,
  };
  pendingDeleteId: string | null = null;

  init(initial?: Partial<ReturnType<typeof defaultState>>) {
    if (!initial) return;
    this.projects = (initial.projects ?? []) as PortfolioProjectDTO[];
    this.activeProject = (initial.activeProject ?? null) as PortfolioProjectDetail | null;
    this.activeProjectId = initial.activeProjectId ?? this.activeProject?.project?.id ?? null;
    this.newProject = {
      title: initial.newProject?.title ?? "",
      themeKey: (initial.newProject?.themeKey ?? TEMPLATE_OPTIONS[0].key) as string,
    };
    this.isPaid = Boolean(initial.isPaid);

    if (this.activeProject?.project) {
      this.projectMeta = {
        title: this.activeProject.project.title,
        slug: this.activeProject.project.slug,
        visibility: this.activeProject.project.visibility,
        isPublished: this.activeProject.project.isPublished,
        themeKey: this.activeProject.project.themeKey ?? TEMPLATE_OPTIONS[0].key,
      };
    }
  }

  get sectionKeys() {
    return Object.keys(sectionLabels) as PortfolioSectionKey[];
  }

  get activeSection() {
    return this.activeProject?.sections.find((section) => section.key === this.activeSectionKey) ?? null;
  }

  get activeSectionItems() {
    return this.activeSection?.items ?? [];
  }

  getSectionLabel(key: PortfolioSectionKey | null) {
    return key ? sectionLabels[key] : "Section";
  }

  itemLabel(item: PortfolioItemDTO) {
    const data = item?.data ?? {};
    if (this.activeSectionKey === "featuredProjects") return data?.name ?? "Project";
    if (this.activeSectionKey === "experience") return data?.role ?? "Experience";
    if (this.activeSectionKey === "education") return data?.degree ?? "Education";
    if (this.activeSectionKey === "certifications") return data?.title ?? "Certification";
    if (this.activeSectionKey === "achievements") return data?.title ?? "Achievement";
    return "Item";
  }

  isTemplateLocked(templateKey: string) {
    return isProTemplate(templateKey) && !this.isPaid;
  }

  selectNewTemplate(templateKey: string) {
    if (this.isTemplateLocked(templateKey)) {
      this.paywallMessage = PAYWALL_MESSAGE;
      return;
    }
    this.paywallMessage = null;
    this.newProject.themeKey = templateKey;
  }

  selectProjectTemplate(templateKey: string) {
    if (this.isTemplateLocked(templateKey)) {
      this.paywallMessage = PAYWALL_MESSAGE;
      return;
    }
    this.paywallMessage = null;
    this.projectMeta.themeKey = templateKey;
  }

  private bumpPreview() {
    const now = Date.now();
    this.previewBuster = now === this.previewBuster ? now + 1 : now;
  }

  private unwrapResult<T = any>(result: any): T {
    if (!result) return {} as T;
    if (result.error) {
      throw new Error(result.error?.message ?? "Unexpected error.");
    }
    return (result.data ?? result) as T;
  }

  get previewSrc() {
    if (!this.activeProjectId) return "";
    return `/app/portfolios/${this.activeProjectId}/preview?preview=1&t=${this.previewBuster}`;
  }

  private updateProjectInList(project: PortfolioProjectDTO) {
    this.projects = this.projects.map((item) => (item.id === project.id ? project : item));
  }

  async loadProjects() {
    this.loading = true;
    this.error = null;

    try {
      const res = await actions.portfolioCreator.listProjects({});
      const data = this.unwrapResult(res) as { items: PortfolioProjectDTO[] };
      this.projects = data.items ?? [];
    } catch (err: any) {
      this.error = err?.message || "Failed to load portfolios.";
    } finally {
      this.loading = false;
    }
  }

  async createProject() {
    const title = normalizeText(this.newProject.title);
    const themeKey = (this.newProject.themeKey || TEMPLATE_OPTIONS[0].key) as string;
    if (!title) {
      this.error = "Title is required.";
      return;
    }
    if (!TEMPLATE_KEYS.includes(themeKey as any)) {
      this.error = "Select a valid template.";
      return;
    }

    this.loading = true;
    this.error = null;
    this.success = null;
    this.paywallMessage = null;

    try {
      const res = await actions.portfolioCreator.createProject({ title, themeKey: themeKey as any });
      if (res?.error?.code === "PAYMENT_REQUIRED") {
        this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
        return;
      }
      const data = this.unwrapResult(res) as PortfolioProjectDetail;
      if (data?.project) {
        this.projects = [data.project, ...this.projects];
        this.activeProject = data;
        this.activeProjectId = data.project.id;
        this.projectMeta = {
          title: data.project.title,
          slug: data.project.slug,
          visibility: data.project.visibility,
          isPublished: data.project.isPublished,
          themeKey: data.project.themeKey ?? themeKey,
        };
        this.newProject = { title: "", themeKey };
      }
      this.success = "Portfolio created.";
      this.bumpPreview();
    } catch (err: any) {
      this.error = err?.message || "Unable to create portfolio.";
    } finally {
      this.loading = false;
    }
  }

  async loadProject(id: string) {
    this.loading = true;
    this.error = null;
    this.paywallMessage = null;

    try {
      const res = await actions.portfolioCreator.getProject({ projectId: id });
      if (res?.error?.code === "PAYMENT_REQUIRED") {
        this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
        return;
      }
      const data = this.unwrapResult(res) as PortfolioProjectDetail;
      this.activeProject = data;
      this.activeProjectId = data.project?.id ?? id;
      if (data.project) {
        this.projectMeta = {
          title: data.project.title,
          slug: data.project.slug,
          visibility: data.project.visibility,
          isPublished: data.project.isPublished,
          themeKey: data.project.themeKey ?? TEMPLATE_OPTIONS[0].key,
        };
      }
    } catch (err: any) {
      this.error = err?.message || "Unable to load portfolio.";
    } finally {
      this.loading = false;
    }
  }

  async saveProjectMeta() {
    if (!this.activeProject?.project?.id) return;

    this.loading = true;
    this.error = null;
    this.success = null;
    this.paywallMessage = null;

    try {
      const res = await actions.portfolioCreator.updateProject({
        projectId: this.activeProject.project.id,
        title: this.projectMeta.title,
        slug: this.projectMeta.slug,
        visibility: this.projectMeta.visibility,
        themeKey: this.projectMeta.themeKey,
      });
      if (res?.error?.code === "PAYMENT_REQUIRED") {
        this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
        return;
      }
      const data = this.unwrapResult(res) as { project: PortfolioProjectDTO };
      if (data?.project) {
        this.activeProject.project = data.project;
        this.updateProjectInList(data.project);
        this.projectMeta = {
          title: data.project.title,
          slug: data.project.slug,
          visibility: data.project.visibility,
          isPublished: data.project.isPublished,
          themeKey: data.project.themeKey ?? this.projectMeta.themeKey,
        };
      }
      this.success = "Portfolio updated.";
      this.bumpPreview();
    } catch (err: any) {
      this.error = err?.message || "Unable to update portfolio.";
    } finally {
      this.loading = false;
    }
  }

  async togglePublish() {
    if (!this.activeProject?.project?.id) return;
    const next = !this.projectMeta.isPublished;

    this.loading = true;
    this.error = null;
    this.paywallMessage = null;

    try {
      const res = await actions.portfolioCreator.setPublish({
        projectId: this.activeProject.project.id,
        isPublished: next,
      });
      if (res?.error?.code === "PAYMENT_REQUIRED") {
        this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
        return;
      }
      const data = this.unwrapResult(res) as { project: PortfolioProjectDTO };
      if (data?.project) {
        this.activeProject.project = data.project;
        this.updateProjectInList(data.project);
        this.projectMeta.isPublished = data.project.isPublished;
      }
      this.success = next ? "Portfolio published." : "Portfolio unpublished.";
      this.bumpPreview();
    } catch (err: any) {
      this.error = err?.message || "Unable to update publish status.";
    } finally {
      this.loading = false;
    }
  }

  async deleteProject(id: string) {
    this.loading = true;
    this.error = null;

    try {
      await actions.portfolioCreator.deleteProject({ projectId: id });
      this.projects = this.projects.filter((item) => item.id !== id);
      if (this.activeProject?.project?.id === id) {
        this.activeProject = null;
        this.activeProjectId = null;
      }
      this.pendingDeleteId = null;
      this.success = "Portfolio deleted.";
    } catch (err: any) {
      this.error = err?.message || "Unable to delete portfolio.";
    } finally {
      this.loading = false;
    }
  }

  openSection(key: PortfolioSectionKey) {
    this.activeSectionKey = key;
    this.drawerOpen = true;
    this.editingItemId = null;
    const section = this.activeProject?.sections.find((entry) => entry.key === key);
    const item = isSingleSection(key) ? section?.items?.[0] : null;
    this.formData = toFormData(key, item?.data ?? {});
  }

  closeDrawer() {
    this.drawerOpen = false;
    this.editingItemId = null;
  }

  editItem(item: PortfolioItemDTO) {
    if (!this.activeSectionKey) return;
    this.editingItemId = item.id;
    this.formData = toFormData(this.activeSectionKey, item.data ?? {});
    this.drawerOpen = true;
  }

  async toggleSectionEnabled(sectionId: string, value: boolean) {
    if (!this.activeProject?.project?.id) return;

    this.loading = true;
    this.error = null;
    this.paywallMessage = null;

    try {
      const res = await actions.portfolioCreator.toggleSection({ sectionId, isEnabled: value });
      if (res?.error?.code === "PAYMENT_REQUIRED") {
        this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
        return;
      }
      const data = this.unwrapResult(res) as { section: any };
      if (data?.section) {
        this.activeProject.sections = this.activeProject.sections.map((entry) =>
          entry.id === data.section.id ? { ...entry, isEnabled: data.section.isEnabled } : entry
        );
      }
      this.bumpPreview();
    } catch (err: any) {
      this.error = err?.message || "Unable to update section.";
    } finally {
      this.loading = false;
    }
  }

  async saveActiveSection() {
    if (!this.activeSectionKey || !this.activeProject?.project?.id) return;
    const section = this.activeProject.sections.find((entry) => entry.key === this.activeSectionKey);
    if (!section) return;

    const payload = toPayload(this.activeSectionKey, this.formData);

    try {
      this.loading = true;
      this.error = null;
      this.success = null;
      this.paywallMessage = null;

      if (isSingleSection(this.activeSectionKey)) {
        const existing = section.items[0];
        if (existing) {
          const res = await actions.portfolioCreator.updateItem({
            itemId: existing.id,
            data: payload,
          });
          if (res?.error?.code === "PAYMENT_REQUIRED") {
            this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
            return;
          }
          const data = this.unwrapResult(res) as { item: PortfolioItemDTO };
          if (data?.item) {
            section.items = [data.item];
          }
        } else {
          const res = await actions.portfolioCreator.createItem({
            sectionId: section.id,
            data: payload,
          });
          if (res?.error?.code === "PAYMENT_REQUIRED") {
            this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
            return;
          }
          const data = this.unwrapResult(res) as { item: PortfolioItemDTO };
          if (data?.item) {
            section.items = [data.item];
          }
        }
      } else {
        if (this.editingItemId) {
          const res = await actions.portfolioCreator.updateItem({
            itemId: this.editingItemId,
            data: payload,
          });
          if (res?.error?.code === "PAYMENT_REQUIRED") {
            this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
            return;
          }
          const data = this.unwrapResult(res) as { item: PortfolioItemDTO };
          if (data?.item) {
            section.items = section.items.map((item) => (item.id === data.item.id ? data.item : item));
          }
        } else {
          const res = await actions.portfolioCreator.createItem({
            sectionId: section.id,
            data: payload,
          });
          if (res?.error?.code === "PAYMENT_REQUIRED") {
            this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
            return;
          }
          const data = this.unwrapResult(res) as { item: PortfolioItemDTO };
          if (data?.item) {
            section.items = [...section.items, data.item];
          }
        }
      }

      this.success = "Changes saved.";
      this.editingItemId = null;
      this.bumpPreview();
    } catch (err: any) {
      this.error = err?.message || "Unable to save changes.";
    } finally {
      this.loading = false;
    }
  }

  async deleteItem(itemId: string) {
    if (!this.activeProject?.project?.id || !this.activeSection) return;

    try {
      this.loading = true;
      this.error = null;
      this.paywallMessage = null;

      const res = await actions.portfolioCreator.deleteItem({ itemId });
      if (res?.error?.code === "PAYMENT_REQUIRED") {
        this.paywallMessage = res.error.message || PAYWALL_MESSAGE;
        return;
      }
      this.activeSection.items = this.activeSection.items.filter((item) => item.id !== itemId);
      this.bumpPreview();
    } catch (err: any) {
      this.error = err?.message || "Unable to delete item.";
    } finally {
      this.loading = false;
    }
  }
}

export const registerPortfolioCreatorStore = (Alpine: Alpine) => {
  Alpine.store("portfolioCreator", new PortfolioCreatorStore());
};
