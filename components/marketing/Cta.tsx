"use client"
import { useState } from "react"
import Balancer from "react-wrap-balancer"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/tremor/Button"
import { Input } from "@/components/tremor/Input"
import { ArrowAnimated } from "@/components/marketing/ArrowAnimated"
import { LANDING } from "@/content/landing"
import { APP } from "@/content/app"
import { useSafeMotion } from "@/lib/hooks/useSafeMotion"

type FormState = "idle" | "submitting" | "success" | "error"

export default function Cta() {
  const [email, setEmail] = useState("")
  const [formState, setFormState] = useState<FormState>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { transition } = useSafeMotion()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email || formState === "submitting") return

    setFormState("submitting")
    setErrorMsg(null)

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const json = (await res.json()) as { error?: string }
        setErrorMsg(json.error ?? APP.WAITLIST_CTA.errorGeneral)
        setFormState("error")
        return
      }

      setFormState("success")
    } catch {
      setErrorMsg(APP.WAITLIST_CTA.errorGeneral)
      setFormState("error")
    }
  }

  return (
    <section
      aria-labelledby="cta-title"
      className="relative w-full mt-24 sm:mt-36 overflow-hidden bg-anthropic-dark"
    >
      {/* Full-width dot grid */}
      <div
        className="pointer-events-none absolute inset-0 select-none opacity-60 bg-[radial-gradient(circle_at_center,theme(colors.brand.500/20)_1.5px,transparent_2px)] [background-size:28px_28px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center justify-center text-center">
          <h2
            id="cta-title"
            className="inline-block bg-brand-gradient bg-clip-text p-2 text-4xl font-bold tracking-tighter text-transparent md:text-6xl dark:bg-brand-gradient-dark font-serif"
          >
            {LANDING.FINAL_CTA.headline}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-gray-400 sm:text-lg">
            <Balancer>{LANDING.FINAL_CTA.subhead}</Balancer>
          </p>

          <div className="mt-14 w-full max-w-xl rounded-2xl bg-white/5 p-1.5 ring-1 ring-white/[5%] backdrop-blur">
            <div className="rounded-xl bg-[#1C1B1A] p-4 shadow-lg shadow-brand-500/10 ring-1 ring-white/5">
              <AnimatePresence mode="wait">
                {formState === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={transition({ duration: 0.28, ease: [0.16, 1, 0.3, 1] })}
                    className="flex flex-col items-center gap-1 py-2"
                  >
                    <p className="font-semibold text-gray-50">
                      {APP.WAITLIST_CTA.successTitle}
                    </p>
                    <p className="text-sm text-gray-400">
                      {APP.WAITLIST_CTA.successBody}
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={transition({ duration: 0.28, ease: [0.16, 1, 0.3, 1] })}
                    className="flex flex-col items-center gap-3 sm:flex-row"
                    onSubmit={handleSubmit}
                  >
                    <label htmlFor="cta-email" className="sr-only">
                      Email address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      id="cta-email"
                      className="h-11 w-full min-w-0 flex-auto"
                      inputClassName="h-full"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={formState === "submitting"}
                      aria-describedby="cta-error"
                      aria-invalid={formState === "error"}
                    />
                    <Button
                      className="group min-h-11 w-full sm:w-fit sm:flex-none"
                      type="submit"
                      variant="primary"
                      disabled={formState === "submitting"}
                      isLoading={formState === "submitting"}
                    >
                      {formState === "submitting"
                        ? APP.WAITLIST_CTA.submitting
                        : LANDING.FINAL_CTA.ctaLabel}
                      {formState !== "submitting" && <ArrowAnimated />}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {formState === "error" && errorMsg && (
                  <motion.p
                    key="error"
                    id="cta-error"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={transition({ duration: 0.2 })}
                    className="mt-2 text-xs text-red-400 text-center"
                  >
                    Error: {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500 sm:text-sm">
            {LANDING.FINAL_CTA.reassurance}
          </p>
        </div>
      </div>
    </section>
  )
}
