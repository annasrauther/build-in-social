"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Build In Social — Command Palette action registry.
 *
 * The palette is the second home of the app (see F1–F6 in
 * DESIGN_AUDIT.md). Every primary action surfaces here.
 *
 * Contract:
 * - `id` is stable — referenced in telemetry and cross-referenced from
 *   tooltips/menus that advertise the same shortcut.
 * - `group` collapses actions in the rendered palette list.
 * - `keywords` drive cmdk fuzzy matching; put synonyms here.
 * - `shortcut` is an array of tokens (e.g. ["⌘", "T"]). Render via <Kbd/>.
 * - `scope: "global" | "contextual"` — contextual actions only register
 *   while the owning surface is mounted (via `useRegisterAction`).
 * - `when` is an optional predicate evaluated at render time; return
 *   false to hide the action.
 */

export type ActionGroup =
  | "navigate"
  | "create"
  | "plan"
  | "video"
  | "publish"
  | "series"
  | "settings"
  | "help";

export interface Action {
  id: string;
  label: string;
  /** Short inline subtitle or hint. Shown muted after the label. */
  hint?: string;
  group: ActionGroup;
  /** Lucide icon, 16px stroke 1.5. */
  icon?: LucideIcon;
  /** Keyboard shortcut as tokens e.g. ["⌘", "⇧", "P"]. */
  shortcut?: readonly string[];
  /** cmdk search keywords. */
  keywords?: readonly string[];
  scope: "global" | "contextual";
  /** Optional predicate — return false to hide. */
  when?: () => boolean;
  /** The thing that runs when the action is invoked. */
  run: () => void | Promise<void>;
}

// -------------------------------------------------------------------
// Store — simple subscriber pattern. No external state lib required.
// -------------------------------------------------------------------

type Listener = (actions: ReadonlyArray<Action>) => void;

class ActionsStore {
  private actions = new Map<string, Action>();
  private listeners = new Set<Listener>();

  getAll(): ReadonlyArray<Action> {
    return Array.from(this.actions.values());
  }

  register(action: Action): () => void {
    this.actions.set(action.id, action);
    this.emit();
    return () => this.unregister(action.id);
  }

  registerMany(actions: ReadonlyArray<Action>): () => void {
    actions.forEach((a) => this.actions.set(a.id, a));
    this.emit();
    return () => actions.forEach((a) => this.unregister(a.id));
  }

  unregister(id: string) {
    if (this.actions.delete(id)) this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    const snapshot = this.getAll();
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const actionsStore = new ActionsStore();

// -------------------------------------------------------------------
// React hooks
// -------------------------------------------------------------------

/**
 * Subscribe to the registry. Use inside the palette to render actions.
 */
export function useActions(): ReadonlyArray<Action> {
  const [actions, setActions] = React.useState<ReadonlyArray<Action>>(() =>
    actionsStore.getAll()
  );
  React.useEffect(() => actionsStore.subscribe(setActions), []);
  return actions;
}

/**
 * Register one or more contextual actions for the lifetime of the caller.
 * Use this inside screens and drawers to expose their actions to ⌘K
 * only while they're mounted.
 *
 * ```tsx
 * useRegisterActions([{
 *   id: "plan.regenerate-day",
 *   label: "Regenerate day",
 *   group: "plan",
 *   scope: "contextual",
 *   shortcut: ["⌘", "R"],
 *   run: () => regenerateDay(dayId),
 * }]);
 * ```
 */
export function useRegisterActions(actions: ReadonlyArray<Action>) {
  // Stable identity for the effect dependency
  const ref = React.useRef(actions);
  ref.current = actions;

  React.useEffect(() => {
    const unregister = actionsStore.registerMany(ref.current);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions.map((a) => a.id).join("|")]);
}
