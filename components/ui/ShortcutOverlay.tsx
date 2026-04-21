"use client";

import * as React from "react";
import { Dialog, DialogPortal, DialogOverlay } from "@/components/ui/shadcn/dialog";
import { Kbd } from "@/components/ui/shadcn/kbd";
import { useActions, type Action, type ActionGroup } from "@/lib/actions-registry";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

/**
 * Global keyboard shortcut overlay.
 *
 * Opens on `?` (Shift+/). Pulls from the same action registry as the
 * command palette, so there's one source of truth. Groups by
 * category, shows the Kbd chip for each shortcut, filter box at top.
 *
 * Not a command palette — you can't invoke actions from here (that's
 * what ⌘K is for). This is a read-only reference.
 */

const GROUP_LABELS: Record<ActionGroup, string> = {
  navigate: "Navigate",
  create: "Create",
  plan: "Plan",
  video: "Video",
  publish: "Publish",
  series: "Series",
  settings: "Settings",
  help: "Help",
};

const GROUP_ORDER: ActionGroup[] = [
  "plan",
  "video",
  "publish",
  "series",
  "create",
  "navigate",
  "settings",
  "help",
];

export function ShortcutOverlay() {
  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const actions = useActions();

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // `?` is Shift+/ on US layout. Avoid trigger when in input/textarea.
      const target = e.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (!isEditable && e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = React.useMemo(() => {
    const withShortcuts = actions.filter(
      (a): a is Action & { shortcut: readonly string[] } =>
        !!(a.shortcut && a.shortcut.length > 0) && (!a.when || a.when()),
    );
    const q = filter.trim().toLowerCase();
    return q
      ? withShortcuts.filter((a) =>
          [a.label, a.hint, ...(a.keywords ?? [])]
            .filter(Boolean)
            .some((s) => (s as string).toLowerCase().includes(q)),
        )
      : withShortcuts;
  }, [actions, filter]);

  const grouped = React.useMemo(() => {
    const by = new Map<ActionGroup, Array<Action & { shortcut: readonly string[] }>>();
    for (const a of filtered) {
      const list = by.get(a.group) ?? [];
      list.push(a);
      by.set(a.group, list);
    }
    return GROUP_ORDER.map((g) => [g, by.get(g) ?? []] as const).filter(
      ([, list]) => list.length > 0,
    );
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-[680px]",
            "bg-surface text-text",
            "border border-[color:var(--border)]",
            "rounded-[var(--radius-modal)]",
            "overflow-hidden",
            "animate-dialogContentShow",
            "focus:outline-none",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            Keyboard shortcuts
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Browse every registered keyboard shortcut. Type to filter.
          </DialogPrimitive.Description>

          <div className="flex items-center gap-2 border-b border-[color:var(--divider)] px-3">
            <Search
              size={16}
              className="shrink-0 text-text-tertiary"
              aria-hidden="true"
            />
            <input
              type="text"
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter shortcuts…"
              className={cn(
                "flex-1 h-11",
                "bg-transparent text-[14px] leading-none text-text",
                "placeholder:text-text-tertiary",
                "outline-none focus:outline-none",
              )}
            />
            <DialogPrimitive.Close
              aria-label="Close"
              className={cn(
                "inline-flex h-7 w-7 items-center justify-center",
                "rounded-[var(--radius-input)] text-text-tertiary",
                "hover:text-text hover:bg-[color-mix(in_srgb,var(--gray-12)_4%,transparent)]",
                "transition-colors duration-fast ease-out-cubic",
              )}
            >
              <X size={14} aria-hidden="true" />
            </DialogPrimitive.Close>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {grouped.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-secondary">
                No shortcuts match. Try a different filter.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {grouped.map(([group, items]) => (
                  <section key={group} className="flex flex-col gap-0.5">
                    <h3 className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-text-tertiary">
                      {GROUP_LABELS[group]}
                    </h3>
                    <ul className="flex flex-col">
                      {items.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center gap-2 px-2 h-8 text-[13px] leading-none rounded-[var(--radius-input)] hover:bg-[color-mix(in_srgb,var(--gray-12)_3%,transparent)]"
                        >
                          <span className="flex-1 min-w-0 truncate text-text">
                            {a.label}
                          </span>
                          {a.hint ? (
                            <span className="text-text-tertiary text-[12px] truncate">
                              {a.hint}
                            </span>
                          ) : null}
                          <Kbd keys={a.shortcut} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-[color:var(--divider)] px-3 py-2 flex items-center justify-between text-[11px] text-text-tertiary">
            <span>
              <Kbd keys={["?"]} /> toggle this overlay
            </span>
            <span>
              <Kbd keys={["⌘", "K"]} /> runs actions
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
