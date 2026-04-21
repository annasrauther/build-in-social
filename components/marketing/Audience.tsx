import { LANDING } from "@/content/landing";

/**
 * Audience — four persona cards that tell the "who it's for" story directly
 * under the hero. Deliberately short prose so the page scans: the persona
 * title is the headline; the one-liner is the proof.
 */
export default function Audience() {
  const { headline, subhead, personas } = LANDING.AUDIENCE;
  return (
    <section
      id="audience"
      aria-label={headline}
      className="mx-auto w-full max-w-6xl px-4 sm:px-6 pt-16 sm:pt-20"
    >
      <h2 className="font-serif text-2xl sm:text-3xl font-medium text-gray-900 dark:text-gray-50">
        {headline}
      </h2>
      <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl">
        {subhead}
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {personas.map((p) => (
          <li
            key={p.title}
            className="rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-surface)] p-5"
          >
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {p.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
