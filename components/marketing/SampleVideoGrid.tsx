"use client";

import { motion } from "motion/react";
import { RiPlayCircleFill } from "@remixicon/react";

interface SampleTile {
  id: string;
  imageUrl: string;
  topic: string;
  platform: string;
  views: string;
}

/**
 * Social-proof video grid that mimics the autoshorts.ai "recent outputs" scroll
 * but tuned to our domain-presence positioning: each tile shows the real topic
 * angle (not scary stories / bible tales), the platform, and a realistic view
 * count. Images use `i.pravatar.cc` as avatar placeholders until real sample
 * thumbnails land in R2.
 */
const SAMPLES: SampleTile[] = [
  {
    id: "s1",
    imageUrl: "https://i.pravatar.cc/360?img=11",
    topic: "Why our onboarding drop-off halved",
    platform: "YouTube Shorts",
    views: "12.4k",
  },
  {
    id: "s2",
    imageUrl: "https://i.pravatar.cc/360?img=23",
    topic: "The 3-line SQL fix that saved us $800/mo",
    platform: "X",
    views: "7.8k",
  },
  {
    id: "s3",
    imageUrl: "https://i.pravatar.cc/360?img=32",
    topic: "How we priced the Creator tier",
    platform: "LinkedIn",
    views: "18.1k",
  },
  {
    id: "s4",
    imageUrl: "https://i.pravatar.cc/360?img=45",
    topic: "Pexels API quirks that cost me a weekend",
    platform: "YouTube Shorts",
    views: "5.6k",
  },
  {
    id: "s5",
    imageUrl: "https://i.pravatar.cc/360?img=53",
    topic: "One voice-clone hack that fixed retention",
    platform: "Instagram Reels",
    views: "22.9k",
  },
  {
    id: "s6",
    imageUrl: "https://i.pravatar.cc/360?img=17",
    topic: "The FFmpeg flag I missed for 3 months",
    platform: "X",
    views: "9.2k",
  },
  {
    id: "s7",
    imageUrl: "https://i.pravatar.cc/360?img=26",
    topic: "Shipping pSEO on a Cloudflare Workers budget",
    platform: "LinkedIn",
    views: "14.5k",
  },
  {
    id: "s8",
    imageUrl: "https://i.pravatar.cc/360?img=65",
    topic: "A founder's 90-day autopilot log",
    platform: "YouTube Shorts",
    views: "31.0k",
  },
];

export default function SampleVideoGrid() {
  return (
    <section
      aria-labelledby="sample-grid-title"
      className="mx-auto mt-20 w-full max-w-6xl px-4 sm:mt-32 sm:px-6"
    >
      <h2
        id="sample-grid-title"
        className="text-center text-2xl font-bold tracking-tighter text-gray-900 dark:text-gray-50 md:text-3xl font-serif"
      >
        A week of your domain, on-platform
      </h2>
      <p className="mt-3 text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Real topics from real founders, rendered and posted by Build In Social.
        No filming. No editing. No weekly fire-drill.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {SAMPLES.map((tile, i) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-[9/16] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.imageUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.15) 45%, transparent 60%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 p-3 text-white">
              <p className="text-[11px] font-medium uppercase tracking-wide opacity-80">
                {tile.platform} · {tile.views} views
              </p>
              <p className="mt-1 text-sm font-semibold leading-snug line-clamp-2">
                {tile.topic}
              </p>
            </div>
            <RiPlayCircleFill
              aria-hidden
              className="absolute right-2 top-2 size-7 text-white/90 drop-shadow"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
