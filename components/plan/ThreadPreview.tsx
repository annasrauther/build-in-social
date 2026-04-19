"use client";

import { motion } from "framer-motion";
import { APP } from "@/content/app";

interface TweetItem {
  index: number;
  text: string;
}

interface ThreadPreviewProps {
  tweets: TweetItem[];
}

const TWEET_MAX = 280;

/** Extract the body text (without the counter suffix) and the char count. */
function parseTweet(tweet: TweetItem): { body: string; charCount: number } {
  // The counter suffix format is " {n}/{total}" appended at the end.
  // We strip it to show just the content in the text area, while showing
  // the raw tweet.text length (which includes the suffix) in the counter.
  return {
    body: tweet.text,
    charCount: tweet.text.length,
  };
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
};

export function ThreadPreview({ tweets }: ThreadPreviewProps) {
  const total = tweets.length;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {APP.VIDEO_DETAIL.threadLabel}
        </span>
        <span className="rounded-full bg-[#FAF9F5] px-2 py-0.5 text-xs font-medium text-[#D97757] ring-1 ring-[#D97757]/20 dark:bg-gray-900 dark:text-[#D97757]">
          {APP.VIDEO_DETAIL.threadTweetCount(total)}
        </span>
      </div>

      <motion.div
        className="space-y-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {tweets.map((tweet) => {
          const { body, charCount } = parseTweet(tweet);
          const isOverLimit = charCount > TWEET_MAX;

          return (
            <motion.div
              key={tweet.index}
              variants={cardVariants}
              className="relative overflow-hidden rounded-lg border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950"
              style={{ borderLeftWidth: "3px", borderLeftColor: "#D97757" }}
            >
              <div className="p-4">
                {/* Tweet counter badge */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-full bg-[#D97757]/10 px-2 text-xs font-semibold text-[#D97757]">
                    {tweet.index}/{total}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      isOverLimit
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {APP.VIDEO_DETAIL.threadCharCount(charCount)}
                  </span>
                </div>

                {/* Tweet body */}
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-50">
                  {body}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
