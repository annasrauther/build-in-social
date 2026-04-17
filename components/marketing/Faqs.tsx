"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/tremor/Accordion"

const faqs = [
  {
    question: "Is the content actually good, or is it generic AI slop?",
    answer:
      "Every video is built for a specific platform with the right duration, hook structure, and pacing. YouTube Shorts get 30-45 seconds. Reels get 20-30. LinkedIn gets 45-60. X gets 15-20. Build In Social learns your niche, your audience, and your voice — not a one-size-fits-all template. On Creator and Studio plans, it uses your cloned voice from a 60-second recording.",
  },
  {
    question: "Do I lose control over what gets posted?",
    answer:
      "You choose. Manual mode lets you review and approve every video before it goes live. Autopilot posts on schedule without waiting for you. You can switch between modes any week. Most founders start with manual, then move to autopilot once they trust the output.",
  },
  {
    question: "What if I have nothing to share this week?",
    answer:
      "That is exactly what autopilot is for. Build In Social draws from your niche, trending topics in your domain, and evergreen angles that perform for your audience type. You can go weeks without touching it and your channels stay active.",
  },
  {
    question: "How fast can I start posting?",
    answer:
      "Three minutes. Describe your niche, connect your platform accounts, and your first weekly batch is ready. No credit card for the 14-day trial. Most founders are live the same day they sign up.",
  },
]

export function Faqs() {
  return (
    <section className="mt-20 sm:mt-36" aria-labelledby="faq-title">
      <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-14">
        <div className="col-span-full sm:col-span-5">
          <h2
            id="faq-title"
            className="inline-block scroll-my-24 bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 pr-2 text-2xl font-bold tracking-tighter text-transparent lg:text-3xl dark:from-gray-50 dark:to-gray-300"
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-400">
            Can&rsquo;t find the answer you&rsquo;re looking for? Reach
            out to our{" "}
            <a
              href="mailto:support@buildinsocial.com"
              className="font-medium text-brand-500 hover:text-brand-300 dark:text-brand-400"
            >
              support team
            </a>
            .
          </p>
        </div>
        <div className="col-span-full mt-6 lg:col-span-7 lg:mt-0">
          <Accordion type="multiple" className="mx-auto">
            {faqs.map((item) => (
              <AccordionItem
                value={item.question}
                key={item.question}
                className="py-3 first:pb-3 first:pt-0"
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
