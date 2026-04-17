import { getPseoPage, getPseoPageByVideoId } from "@/lib/services/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";

export const revalidate = 3600;

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
      "ul", "ol", "li", "a", "strong", "em", "b", "i", "u",
      "blockquote", "code", "pre", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td", "span", "div",
      "section", "article", "header", "footer", "nav", "main",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "target", "rel"],
  });
}

async function resolvePage(slug: string) {
  // Try by slug first, then by videoId (video detail links use video id as slug)
  const bySlug = await getPseoPage(slug);
  if (bySlug) return bySlug;
  const byVideoId = await getPseoPageByVideoId(slug);
  return byVideoId;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await resolvePage(slug);
  if (!page) return { title: "Not found" };

  return {
    title: page.title,
    alternates: { canonical: page.canonicalUrl },
    openGraph: {
      title: page.title,
      url: page.canonicalUrl,
      type: "website",
    },
  };
}

export default async function PseoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await resolvePage(slug);
  if (!page) notFound();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12" style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
      <div
        className="pseo-content"
        style={{ lineHeight: "1.75", fontSize: "16px" }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.htmlContent) }}
      />
    </main>
  );
}
