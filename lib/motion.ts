import type { Variants, Transition } from "framer-motion";

// Standard easing — used everywhere
export const ease = [0.16, 1, 0.3, 1] as const;

// Canonical durations — use these, never inline values
export const PAGE_ENTER = 0.25;
export const ELEMENT_ENTER = 0.28;

// Page wrapper — wrap every page's main content
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export const pageTransition: Transition = {
  duration: 0.25,
  ease,
};

// Staggered card grid container
export const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

// Staggered card grid item
export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease },
  },
};

// Day group header — enters 60ms before its cards
export const dayHeaderVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease },
  },
};

// Nav pill spring — sidebar active indicator
export const navPillTransition: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
};

// Tab indicator spring
export const tabIndicatorTransition: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 35,
};
