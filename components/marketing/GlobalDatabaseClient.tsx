"use client"

import dynamic from "next/dynamic"

const GlobalDatabase = dynamic(
  () =>
    import("@/components/marketing/GlobalDatabase").then(
      (mod) => mod.GlobalDatabase,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto mt-24 h-[520px] w-full max-w-6xl animate-pulse rounded-xl bg-anthropic-lightGray/20" />
    ),
  },
)

export default function GlobalDatabaseClient() {
  return <GlobalDatabase />
}
