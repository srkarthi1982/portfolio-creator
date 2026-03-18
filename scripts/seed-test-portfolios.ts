import { randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";

type SectionKey =
  | "profile"
  | "about"
  | "featuredProjects"
  | "experience"
  | "skills"
  | "education"
  | "certifications"
  | "achievements"
  | "contact";

type PortfolioSeed = {
  title: string;
  slug: string;
  themeKey: "classic" | "gallery" | "minimal" | "story";
  visibility: "public" | "unlisted" | "private";
  isPublished: 0 | 1;
  sections: Record<SectionKey, Array<Record<string, unknown>>>;
};

const SECTION_ORDER: Array<{ key: SectionKey; order: number; label: string }> = [
  { key: "profile", order: 1, label: "Profile" },
  { key: "about", order: 2, label: "About" },
  { key: "featuredProjects", order: 3, label: "Featured Projects" },
  { key: "experience", order: 4, label: "Experience" },
  { key: "skills", order: 5, label: "Skills" },
  { key: "education", order: 6, label: "Education" },
  { key: "certifications", order: 7, label: "Certifications" },
  { key: "achievements", order: 8, label: "Achievements" },
  { key: "contact", order: 9, label: "Contact" },
];

const run = async () => {
  const userId = process.argv[2]?.trim();
  if (!userId) {
    throw new Error("Missing userId. Usage: tsx scripts/seed-test-portfolios.ts <userId>");
  }

  const url = process.env.ASTRO_DB_REMOTE_URL?.trim();
  const authToken = process.env.ASTRO_DB_APP_TOKEN?.trim();
  if (!url) throw new Error("ASTRO_DB_REMOTE_URL is not set.");

  const client = createClient({ url, authToken });
  const seedKey = userId.slice(0, 8).toLowerCase();
const nowIso = new Date().toISOString();
type SeedUuid = ReturnType<typeof randomUUID>;

  const seeds: PortfolioSeed[] = [
    {
      title: "Maya Srinivasan - Product Design Case Studies",
      slug: `seed-${seedKey}-classic-product-design`,
      themeKey: "classic",
      visibility: "public",
      isPublished: 1,
      sections: {
        profile: [
          {
            fullName: "Maya Srinivasan",
            headline: "Senior Product Designer",
            location: "Dubai, UAE",
            email: "maya.srinivasan.design@example.com",
            phone: "+971 50 412 7781",
            website: "https://mayasrinivasan.design",
            github: "",
            linkedin: "https://www.linkedin.com/in/maya-srinivasan-design",
          },
        ],
        about: [
          {
            text: "I design enterprise products where workflows are complex and user confidence matters. My focus is reducing friction across onboarding, reporting, and decision surfaces while keeping visual language clean and scalable.",
          },
        ],
        featuredProjects: [
          {
            name: "B2B Analytics Workspace Redesign",
            description: "Redesigned a legacy analytics workspace used by account managers and operations teams. The new IA reduced time-to-insight and improved dashboard adoption.",
            link: "https://example.com/case-study/analytics-workspace",
            startYear: 2024,
            startMonth: 2,
            endYear: 2024,
            endMonth: 9,
            isPresent: false,
            bullets: [
              "Mapped 14 core workflows and removed 31% redundant navigation paths.",
              "Introduced task-focused dashboard entry points with role-aware defaults.",
              "Raised weekly active usage from 52% to 74% within 10 weeks.",
            ],
            tags: ["Product Design", "UX Research", "Design Systems", "B2B SaaS"],
          },
          {
            name: "Self-Serve Customer Onboarding",
            description: "Built a guided onboarding flow for enterprise trial accounts, reducing dependency on CSM-led setup calls.",
            link: "https://example.com/case-study/self-serve-onboarding",
            startYear: 2023,
            startMonth: 5,
            endYear: 2023,
            endMonth: 12,
            isPresent: false,
            bullets: [
              "Defined progressive setup milestones with contextual validation.",
              "Reduced setup abandonment rate by 22%.",
              "Cut average activation time from 9 days to 5 days.",
            ],
            tags: ["Onboarding", "UX Writing", "Conversion", "Product Strategy"],
          },
        ],
        experience: [
          {
            role: "Senior Product Designer",
            company: "FlowGrid Technologies",
            startYear: 2022,
            startMonth: 1,
            endYear: 2025,
            endMonth: 12,
            isPresent: false,
            present: false,
            location: "Dubai, UAE",
            bullets: [
              "Led end-to-end design for analytics and admin modules across 3 product lines.",
              "Partnered with PM and engineering to ship quarterly UX debt reduction milestones.",
            ],
          },
          {
            role: "Product Designer",
            company: "NexaLoop",
            startYear: 2019,
            startMonth: 6,
            endYear: 2021,
            endMonth: 12,
            isPresent: false,
            present: false,
            location: "Bengaluru, India",
            bullets: [
              "Shipped onboarding and settings experiences for SMB and enterprise segments.",
              "Created a reusable component spec that reduced design QA churn.",
            ],
          },
        ],
        skills: [
          {
            groups: [
              { name: "Design", items: ["Product Design", "Interaction Design", "Prototyping"] },
              { name: "Research", items: ["Usability Testing", "JTBD Interviews", "Journey Mapping"] },
              { name: "Tools", items: ["Figma", "FigJam", "Notion", "Maze"] },
            ],
          },
        ],
        education: [
          {
            degree: "Bachelor of Design",
            field: "Interaction Design",
            institution: "National Institute of Design",
            startYear: 2015,
            startMonth: 7,
            endYear: 2019,
            endMonth: 4,
            grade: "8.7/10",
          },
        ],
        certifications: [
          {
            title: "Google UX Design Certificate",
            issuer: "Google",
            year: 2021,
            note: "Advanced specialization in research-informed interaction design.",
          },
        ],
        achievements: [
          {
            title: "Design Impact Award",
            issuer: "FlowGrid Annual Summit",
            year: 2024,
            note: "Recognized for analytics workspace redesign impact.",
          },
        ],
        contact: [
          {
            callToActionTitle: "Let's design better enterprise UX",
            callToActionText: "Available for senior IC and lead design roles.",
            email: "maya.srinivasan.design@example.com",
            website: "https://mayasrinivasan.design",
            links: [
              { label: "LinkedIn", url: "https://www.linkedin.com/in/maya-srinivasan-design" },
              { label: "Dribbble", url: "https://dribbble.com/mayasrinivasan" },
            ],
          },
        ],
      },
    },
    {
      title: "Arjun Patel - Visual Product Gallery",
      slug: `seed-${seedKey}-gallery-visual-product`,
      themeKey: "gallery",
      visibility: "unlisted",
      isPublished: 1,
      sections: {
        profile: [
          {
            fullName: "Arjun Patel",
            headline: "Product Designer (Visual Systems)",
            location: "Abu Dhabi, UAE",
            email: "arjun.patel.portfolio@example.com",
            phone: "+971 52 993 1407",
            website: "https://arjunpatel.design",
            github: "",
            linkedin: "https://www.linkedin.com/in/arjun-patel-design",
          },
        ],
        about: [
          {
            text: "I craft high-clarity interfaces for product teams that need visual consistency without slowing release velocity. I specialize in component systems and image-heavy product narratives.",
          },
        ],
        featuredProjects: [
          {
            name: "E-commerce Collection Storyboards",
            description: "Designed a visual-first product storytelling template for seasonal campaigns and merchandising updates.",
            link: "https://example.com/case-study/ecommerce-storyboards",
            startYear: 2024,
            startMonth: 1,
            endYear: 2024,
            endMonth: 8,
            isPresent: false,
            bullets: [
              "Unified campaign page structure across 11 collections.",
              "Improved campaign page scroll depth by 19%.",
              "Reduced asset handoff time by 27% with reusable blocks.",
            ],
            tags: ["Gallery", "E-commerce", "Brand Systems"],
          },
          {
            name: "Media-rich Product Detail Revamp",
            description: "Created modular product detail sections balancing visual storytelling with conversion-critical information.",
            link: "https://example.com/case-study/product-detail-revamp",
            startYear: 2023,
            startMonth: 4,
            endYear: 2023,
            endMonth: 11,
            isPresent: false,
            bullets: [
              "Built a tile-based layout optimized for mobile thumb navigation.",
              "Raised image interaction rate by 24% in A/B test cohort.",
            ],
            tags: ["Product UI", "Responsive Design", "Optimization"],
          },
        ],
        experience: [
          {
            role: "Product Designer",
            company: "CanvasCart",
            startYear: 2021,
            startMonth: 3,
            endYear: 2025,
            endMonth: 2,
            isPresent: false,
            present: false,
            location: "Abu Dhabi, UAE",
            bullets: [
              "Led visual direction for campaign tools and media modules.",
              "Partnered with frontend team to launch reusable gallery components.",
            ],
          },
        ],
        skills: [
          {
            groups: [
              { name: "Visual", items: ["Layout Systems", "Typography", "Color Direction"] },
              { name: "Product", items: ["UI Design", "Component Specs", "Handoff"] },
              { name: "Tools", items: ["Figma", "Photoshop", "After Effects"] },
            ],
          },
        ],
        education: [
          {
            degree: "B.Sc.",
            field: "Multimedia Design",
            institution: "M.S. University",
            startYear: 2016,
            startMonth: 7,
            endYear: 2020,
            endMonth: 5,
            grade: "First Class",
          },
        ],
        certifications: [
          {
            title: "Advanced Visual Design",
            issuer: "Interaction Design Foundation",
            year: 2022,
            note: "Visual hierarchy and responsive composition.",
          },
        ],
        achievements: [
          {
            title: "Best Visual Refresh 2024",
            issuer: "CanvasCart Product Awards",
            year: 2024,
            note: "Recognized for modular campaign system rollout.",
          },
        ],
        contact: [
          {
            callToActionTitle: "Need visual polish that scales?",
            callToActionText: "Open to product design and visual systems collaborations.",
            email: "arjun.patel.portfolio@example.com",
            website: "https://arjunpatel.design",
            links: [
              { label: "LinkedIn", url: "https://www.linkedin.com/in/arjun-patel-design" },
              { label: "Behance", url: "https://www.behance.net/arjunpatel" },
            ],
          },
        ],
      },
    },
    {
      title: "Nadia Rahman - Minimal Engineering Portfolio",
      slug: `seed-${seedKey}-minimal-engineering`,
      themeKey: "minimal",
      visibility: "private",
      isPublished: 0,
      sections: {
        profile: [
          {
            fullName: "Nadia Rahman",
            headline: "Senior Data Platform Engineer",
            location: "Remote (MENA)",
            email: "nadia.rahman.engineer@example.com",
            phone: "+971 56 777 8822",
            website: "https://nadiarahman.dev",
            github: "https://github.com/nadiarahman",
            linkedin: "https://www.linkedin.com/in/nadia-rahman-data",
          },
        ],
        about: [
          {
            text: "I build reliable data platforms that support product analytics, ML experimentation, and executive reporting. My work focuses on pipeline resilience, data contracts, and operational visibility.",
          },
        ],
        featuredProjects: [
          {
            name: "Real-time Event Ingestion Platform",
            description: "Architected Kafka + Flink ingestion stack processing product telemetry with schema validation and SLA monitoring.",
            link: "https://example.com/case-study/realtime-ingestion",
            startYear: 2024,
            startMonth: 3,
            endYear: 2025,
            endMonth: 1,
            isPresent: false,
            bullets: [
              "Scaled to 45M events/day with p95 latency under 3 minutes end-to-end.",
              "Introduced schema contract checks, reducing broken downstream jobs by 68%.",
            ],
            tags: ["Data Engineering", "Kafka", "Flink", "Observability"],
          },
        ],
        experience: [
          {
            role: "Senior Data Platform Engineer",
            company: "Atlas Metrics",
            startYear: 2022,
            startMonth: 2,
            endYear: undefined,
            endMonth: undefined,
            isPresent: true,
            present: true,
            location: "Remote",
            bullets: [
              "Own core ingestion and warehouse modeling pipelines.",
              "Reduced pipeline MTTR via alerting and runbook automation.",
            ],
          },
          {
            role: "Data Engineer",
            company: "Blue Harbor Labs",
            startYear: 2019,
            startMonth: 8,
            endYear: 2022,
            endMonth: 1,
            isPresent: false,
            present: false,
            location: "Dubai, UAE",
            bullets: [
              "Built ETL workflows for finance and operations analytics.",
              "Introduced CI checks for SQL models and data quality tests.",
            ],
          },
        ],
        skills: [
          {
            groups: [
              { name: "Data", items: ["dbt", "Airflow", "Kafka", "Flink"] },
              { name: "Cloud", items: ["AWS", "Terraform", "Kubernetes"] },
              { name: "Languages", items: ["Python", "SQL", "TypeScript"] },
            ],
          },
        ],
        education: [
          {
            degree: "B.Eng.",
            field: "Computer Engineering",
            institution: "American University of Sharjah",
            startYear: 2015,
            startMonth: 9,
            endYear: 2019,
            endMonth: 6,
            grade: "3.74/4.0",
          },
        ],
        certifications: [
          {
            title: "AWS Certified Data Analytics - Specialty",
            issuer: "Amazon Web Services",
            year: 2023,
            note: "Data lake, streaming, and governance domains.",
          },
        ],
        achievements: [
          {
            title: "Engineering Excellence Recognition",
            issuer: "Atlas Metrics",
            year: 2025,
            note: "For reliability improvements and platform modernization.",
          },
        ],
        contact: [
          {
            callToActionTitle: "Data platform collaboration",
            callToActionText: "Open to senior platform and data architecture opportunities.",
            email: "nadia.rahman.engineer@example.com",
            website: "https://nadiarahman.dev",
            links: [
              { label: "GitHub", url: "https://github.com/nadiarahman" },
              { label: "LinkedIn", url: "https://www.linkedin.com/in/nadia-rahman-data" },
            ],
          },
        ],
      },
    },
    {
      title: "Omar Khalid - Growth Story Portfolio",
      slug: `seed-${seedKey}-story-growth`,
      themeKey: "story",
      visibility: "public",
      isPublished: 1,
      sections: {
        profile: [
          {
            fullName: "Omar Khalid",
            headline: "Growth Product Manager",
            location: "Riyadh, KSA",
            email: "omar.khalid.growth@example.com",
            phone: "+966 55 310 4412",
            website: "https://omarkhalidgrowth.com",
            github: "",
            linkedin: "https://www.linkedin.com/in/omar-khalid-growth",
          },
        ],
        about: [
          {
            text: "I build growth loops that compound. My focus is blending product analytics, lifecycle experiments, and pricing insights to drive sustainable activation and retention.",
          },
        ],
        featuredProjects: [
          {
            name: "Activation Funnel Rebuild",
            description: "Reframed onboarding milestones and lifecycle messaging to improve week-1 activation.",
            link: "https://example.com/case-study/activation-funnel",
            startYear: 2024,
            startMonth: 6,
            endYear: 2025,
            endMonth: 2,
            isPresent: false,
            bullets: [
              "Raised activated-user rate from 34% to 49%.",
              "Introduced segment-aware nudges with controlled holdouts.",
              "Improved first-value time by 28%.",
            ],
            tags: ["Growth", "A/B Testing", "Lifecycle", "Activation"],
          },
          {
            name: "Annual Plan Conversion Program",
            description: "Designed a value communication and offer sequencing framework to grow annual subscription adoption.",
            link: "https://example.com/case-study/annual-plan",
            startYear: 2023,
            startMonth: 2,
            endYear: 2023,
            endMonth: 10,
            isPresent: false,
            bullets: [
              "Increased annual plan mix by 11 percentage points.",
              "Reduced discount dependency with narrative-based pricing pages.",
            ],
            tags: ["Monetization", "Pricing", "Experimentation"],
          },
        ],
        experience: [
          {
            role: "Growth Product Manager",
            company: "PulseSuite",
            startYear: 2022,
            startMonth: 5,
            endYear: undefined,
            endMonth: undefined,
            isPresent: true,
            present: true,
            location: "Riyadh, KSA",
            bullets: [
              "Own activation and retention roadmap for SMB self-serve segment.",
              "Launched experimentation governance and metrics review cadence.",
            ],
          },
          {
            role: "Product Analyst",
            company: "Orbit Fintech",
            startYear: 2019,
            startMonth: 1,
            endYear: 2022,
            endMonth: 4,
            isPresent: false,
            present: false,
            location: "Riyadh, KSA",
            bullets: [
              "Built growth dashboards and cohort reporting layer.",
              "Partnered on referral and reactivation programs.",
            ],
          },
        ],
        skills: [
          {
            groups: [
              { name: "Growth", items: ["Experiment Design", "Lifecycle", "Pricing Strategy"] },
              { name: "Analytics", items: ["Amplitude", "Mixpanel", "SQL"] },
              { name: "Execution", items: ["Roadmapping", "Cross-functional Leadership", "Stakeholder Communication"] },
            ],
          },
        ],
        education: [
          {
            degree: "BBA",
            field: "Marketing",
            institution: "King Saud University",
            startYear: 2013,
            startMonth: 9,
            endYear: 2017,
            endMonth: 6,
            grade: "4.48/5.0",
          },
        ],
        certifications: [
          {
            title: "Product-Led Growth Certified",
            issuer: "ProductLed",
            year: 2022,
            note: "Activation and expansion strategies for SaaS.",
          },
        ],
        achievements: [
          {
            title: "Growth MVP",
            issuer: "PulseSuite Leadership Awards",
            year: 2024,
            note: "Awarded for activation program impact.",
          },
        ],
        contact: [
          {
            callToActionTitle: "Let's grow the next product chapter",
            callToActionText: "Available for growth PM and product strategy roles.",
            email: "omar.khalid.growth@example.com",
            website: "https://omarkhalidgrowth.com",
            links: [
              { label: "LinkedIn", url: "https://www.linkedin.com/in/omar-khalid-growth" },
              { label: "Newsletter", url: "https://omarkhalidgrowth.com/newsletter" },
            ],
          },
        ],
      },
    },
  ];

  const results: Array<{ id: string; slug: string; themeKey: string; action: "created" | "updated" }> = [];

  for (const portfolio of seeds) {
    let projectId: SeedUuid = randomUUID();
    let slug = portfolio.slug;
    let action: "created" | "updated" = "created";

    const existing = await client.execute({
      sql: 'SELECT "id", "userId" FROM "PortfolioProject" WHERE "slug" = ? LIMIT 1',
      args: [slug],
    });
    const existingRow = existing.rows[0] as { id?: string; userId?: string } | undefined;

    if (existingRow?.id && existingRow?.userId === userId) {
      projectId = String(existingRow.id) as SeedUuid;
      action = "updated";
      await client.execute({
        sql: 'DELETE FROM "PortfolioItem" WHERE "sectionId" IN (SELECT "id" FROM "PortfolioSection" WHERE "projectId" = ?)',
        args: [projectId],
      });
      await client.execute({
        sql: 'DELETE FROM "PortfolioSection" WHERE "projectId" = ?',
        args: [projectId],
      });
      await client.execute({
        sql: 'UPDATE "PortfolioProject" SET "title" = ?, "visibility" = ?, "isPublished" = ?, "publishedAt" = ?, "themeKey" = ?, "updatedAt" = ? WHERE "id" = ?',
        args: [
          portfolio.title,
          portfolio.visibility,
          portfolio.isPublished,
          portfolio.isPublished ? nowIso : null,
          portfolio.themeKey,
          nowIso,
          projectId,
        ],
      });
    } else {
      if (existingRow?.id && existingRow?.userId && existingRow.userId !== userId) {
        slug = `${portfolio.slug}-${seedKey}`;
      }

      await client.execute({
        sql: 'INSERT INTO "PortfolioProject" ("id", "userId", "title", "slug", "visibility", "isPublished", "publishedAt", "themeKey", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          projectId,
          userId,
          portfolio.title,
          slug,
          portfolio.visibility,
          portfolio.isPublished,
          portfolio.isPublished ? nowIso : null,
          portfolio.themeKey,
          nowIso,
          nowIso,
        ],
      });
    }

    for (const section of SECTION_ORDER) {
      const sectionId = randomUUID();
      await client.execute({
        sql: 'INSERT INTO "PortfolioSection" ("id", "projectId", "key", "label", "order", "isEnabled", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [sectionId, projectId, section.key, section.label, section.order, 1, nowIso, nowIso],
      });

      const items = portfolio.sections[section.key] ?? [];
      for (let index = 0; index < items.length; index += 1) {
        await client.execute({
          sql: 'INSERT INTO "PortfolioItem" ("id", "sectionId", "order", "data", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?)',
          args: [randomUUID(), sectionId, index + 1, JSON.stringify(items[index]), nowIso, nowIso],
        });
      }
    }

    results.push({ id: projectId, slug, themeKey: portfolio.themeKey, action });
  }

  console.log(`Seeded ${results.length} portfolios for user ${userId}`);
  for (const item of results) {
    console.log(`- [${item.action}] ${item.themeKey} -> ${item.slug} (${item.id})`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
