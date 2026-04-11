export interface PseoPage {
  id: string;
  userId: string;
  videoId: string;
  title: string;
  slug: string;
  htmlContent: string;
  metaDescription?: string;
  ogImage?: string;
  faqJson?: string;
  videoObjectJsonLd?: string;
  canonicalUrl: string;
  indexed: boolean;
  indexedAt?: string;
  viewCount: number;
  createdAt: string;
}

export interface PseoGenerateInput {
  videoId: string;
  script: string;
  videoTitle: string;
  platform: string;
  brandName: string;
  pseoKeywords: string[];
  videoUrl?: string;
}

export interface PseoGenerateOutput {
  title: string;
  slug: string;
  htmlContent: string;
  metaDescription: string;
  canonicalUrl: string;
  faqJson: string;
  videoObjectJsonLd: string;
}
