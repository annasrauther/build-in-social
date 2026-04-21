import { LANDING } from "@/content/landing";

/**
 * Modes — the signature section that explains Build In Social's four render
 * modes side-by-side. Communicates the credit-cost story visually so users
 * don't have to hunt for it in pricing.
 */
export default function Modes() {
  const { eyebrow, headline, subhead, cards } = LANDING.MODES;
  return (
    <section
      id="modes"
      aria-label="Rendering modes"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-20 sm:py-28"
    >
      <p className="text-xs uppercase tracking-wider text-[color:var(--accent)]">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-gray-900 dark:text-gray-50">
        {headline}
      </h2>
      <p className="mt-3 text-base text-gray-600 dark:text-gray-400 max-w-2xl">
        {subhead}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <li
            key={c.name}
            className="flex h-full flex-col rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {c.name}
              </span>
              <span className="text-xs font-medium text-[color:var(--accent)]">
                {c.creditCost}
              </span>
            </div>
            <h3 className="mt-2 text-base font-medium text-gray-900 dark:text-gray-50">
              {c.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {c.body}
            </p>
            <p className="mt-auto pt-3 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Best for:
              </span>{" "}
              {c.bestFor}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
