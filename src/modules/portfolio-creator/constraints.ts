export const PORTFOLIO_YEAR_MIN = 1950;

export const getPortfolioYearMax = () => new Date().getFullYear();

export const getPortfolioYearOptions = () => {
  const max = getPortfolioYearMax();
  return Array.from({ length: max - PORTFOLIO_YEAR_MIN + 1 }, (_, index) => max - index);
};

export const PORTFOLIO_MONTH_OPTIONS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
] as const;

export const PORTFOLIO_MAX = {
  projectTitle: 60,
  slug: 80,
  profileFullName: 60,
  profileHeadline: 80,
  profileLocation: 60,
  profileEmail: 120,
  profilePhone: 30,
  profileWebsite: 160,
  profileGithub: 160,
  profileLinkedin: 160,
  aboutText: 500,
  projectName: 80,
  projectDescription: 240,
  projectLink: 160,
  bulletLine: 120,
  tag: 24,
  experienceRole: 80,
  experienceCompany: 80,
  experienceLocation: 60,
  educationDegree: 80,
  educationField: 80,
  educationInstitution: 100,
  educationGrade: 20,
  certificationTitle: 80,
  certificationIssuer: 80,
  note: 120,
  ctaTitle: 60,
  ctaText: 180,
  linkLabel: 30,
  linkUrl: 160,
  skillsGroupName: 40,
  skillItem: 40,
} as const;

export const PORTFOLIO_LIMITS = {
  projectBulletsMax: 6,
  projectTagsMax: 8,
  experienceBulletsMax: 8,
} as const;
