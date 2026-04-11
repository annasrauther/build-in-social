import { NICHE_OPTIONS } from "@/lib/constants/onboarding";

/**
 * Keyword signals: maps words/phrases found in a product description
 * to audience options that are likely relevant.
 */
const KEYWORD_MAP: Record<string, string[]> = {
  saas: ["SaaS founders", "Startup founders", "Bootstrapped founders"],
  api: ["Dev tool builders", "API consumers", "Backend engineers"],
  developer: ["Frontend developers", "Backend engineers", "Freelance developers"],
  frontend: ["Frontend developers", "Design engineers"],
  backend: ["Backend engineers", "Cloud architects"],
  mobile: ["Mobile app developers"],
  devops: ["DevOps / Platform teams", "Cloud architects"],
  data: ["Data engineers", "AI / ML teams"],
  ai: ["AI / ML teams", "Data engineers"],
  ml: ["AI / ML teams", "Data engineers"],
  machine: ["AI / ML teams"],
  product: ["Product managers", "SaaS founders"],
  startup: ["Startup founders", "Indie hackers", "Bootstrapped founders"],
  indie: ["Indie hackers", "Bootstrapped founders", "Solo consultants"],
  ecommerce: ["E-commerce operators", "Marketplace operators"],
  "e-commerce": ["E-commerce operators", "Marketplace operators"],
  shop: ["E-commerce operators", "Small business owners"],
  fintech: ["Fintech builders"],
  finance: ["Fintech builders"],
  health: ["Health tech teams"],
  medical: ["Health tech teams"],
  education: ["Education platforms"],
  learn: ["Education platforms", "Content creators"],
  creator: ["Creator tool makers", "Content creators"],
  content: ["Content creators", "Marketing teams"],
  "open source": ["Open source maintainers", "Developer advocates"],
  "no-code": ["No-code / low-code builders"],
  nocode: ["No-code / low-code builders"],
  "low-code": ["No-code / low-code builders"],
  agency: ["Agency owners", "Freelance developers"],
  security: ["Security engineers"],
  web3: ["Web3 / Crypto builders"],
  crypto: ["Web3 / Crypto builders"],
  blockchain: ["Web3 / Crypto builders"],
  game: ["Game developers"],
  design: ["Design engineers", "Frontend developers"],
  marketing: ["Marketing teams", "Growth hackers"],
  growth: ["Growth hackers", "Marketing teams"],
  seo: ["Marketing teams", "Growth hackers", "Content creators"],
  feedback: ["SaaS founders", "Product managers"],
  widget: ["Dev tool builders", "Frontend developers"],
  platform: ["SaaS founders", "Marketplace operators"],
  tool: ["Dev tool builders", "Indie hackers"],
  automation: ["DevOps / Platform teams", "Marketing teams"],
  analytics: ["Data engineers", "Product managers", "Growth hackers"],
  testing: ["QA / Test engineers"],
  qa: ["QA / Test engineers"],
  cloud: ["Cloud architects", "DevOps / Platform teams"],
  hr: ["HR tech teams"],
  legal: ["Legal tech builders"],
  writing: ["Technical writers", "Content creators"],
  documentation: ["Technical writers", "Developer advocates"],
  consulting: ["Solo consultants", "Agency owners"],
  freelance: ["Freelance developers", "Solo consultants"],
  enterprise: ["Enterprise engineering teams", "CTOs / Engineering leaders"],
  cto: ["CTOs / Engineering leaders"],
  engineering: ["CTOs / Engineering leaders", "Enterprise engineering teams"],
};

const POPULAR_DEFAULTS = [
  "Startup founders",
  "SaaS founders",
  "Indie hackers",
  "Dev tool builders",
  "Product managers",
];

/**
 * Suggests 5-8 audience options based on a product description.
 * Uses keyword matching against the expanded NICHE_OPTIONS list.
 */
export function suggestAudiences(productDescription: string): string[] {
  if (!productDescription.trim()) return POPULAR_DEFAULTS.slice(0, 6);

  const lower = productDescription.toLowerCase();
  const scores: Record<string, number> = {};

  // Score each niche option by keyword matches
  for (const [keyword, audiences] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(keyword)) {
      for (const audience of audiences) {
        scores[audience] = (scores[audience] || 0) + 1;
      }
    }
  }

  // Sort by score descending, take top matches
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([audience]) => audience)
    .filter((a) => NICHE_OPTIONS.includes(a as typeof NICHE_OPTIONS[number]));

  // Pad with popular defaults if fewer than 5
  const result = [...ranked];
  for (const d of POPULAR_DEFAULTS) {
    if (result.length >= 8) break;
    if (!result.includes(d)) result.push(d);
  }

  return result.slice(0, 8);
}
