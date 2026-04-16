import dynamic from "next/dynamic"
import Hero from "@/components/marketing/Hero"
import LogoCloud from "@/components/marketing/LogoCloud"
import CodeExample from "@/components/marketing/CodeExample"
import Features from "@/components/marketing/Features"
import Cta from "@/components/marketing/Cta"

const GlobalDatabase = dynamic(
  () =>
    import("@/components/marketing/GlobalDatabase").then(
      (mod) => mod.GlobalDatabase,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto mt-24 h-[500px] w-full max-w-6xl animate-pulse rounded-xl bg-anthropic-lightGray/20" />
    ),
  },
)

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      <Hero />
      <LogoCloud />
      <GlobalDatabase />
      <CodeExample />
      <Features />
      <Cta />
    </main>
  )
}
