"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/shadcn/command";
import { Kbd } from "@/components/ui/shadcn/kbd";
import {
  useActions,
  actionsStore,
  type Action,
  type ActionGroup,
} from "@/lib/actions-registry";
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  Circle,
  Compass,
  FilePlus2,
  HelpCircle,
  Settings,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";

/**
 * Global ⌘K command palette.
 *
 * Mounted once at app root. Listens for ⌘K / Ctrl+K and toggles open.
 * Esc closes. Arrow keys navigate, Enter invokes.
 *
 * Actions come from two sources:
 * 1. The built-in seed set below (navigation, create, help).
 * 2. The contextual registry (`useRegisterActions`) — screens add their
 *    actions while mounted and they disappear when unmounted.
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

function useSeedActions() {
  const router = useRouter();

  React.useEffect(() => {
    const seed: Action[] = [
      // Navigate
      {
        id: "nav.plan-current",
        label: "Go to today",
        hint: "Current week",
        group: "navigate",
        icon: Calendar,
        shortcut: ["⌘", "T"],
        keywords: ["home", "today", "plan", "current"],
        scope: "global",
        run: () => router.push("/plan/current"),
      },
      {
        id: "nav.plan-prev",
        label: "Previous week",
        group: "navigate",
        icon: CalendarDays,
        shortcut: ["⌘", "["],
        scope: "global",
        run: () => router.push("/plan"),
      },
      {
        id: "nav.plan-next",
        label: "Next week",
        group: "navigate",
        icon: CalendarDays,
        shortcut: ["⌘", "]"],
        scope: "global",
        run: () => router.push("/plan"),
      },
      {
        id: "nav.series",
        label: "Go to series",
        group: "navigate",
        icon: Compass,
        keywords: ["formats", "recurring"],
        scope: "global",
        run: () => router.push("/series"),
      },
      {
        id: "nav.videos",
        label: "Go to videos",
        hint: "Archive",
        group: "navigate",
        icon: Video,
        scope: "global",
        run: () => router.push("/videos"),
      },
      {
        id: "nav.settings",
        label: "Go to settings",
        group: "navigate",
        icon: Settings,
        scope: "global",
        run: () => router.push("/settings"),
      },

      // Create
      {
        id: "create.series",
        label: "New series",
        group: "create",
        icon: FilePlus2,
        shortcut: ["⌘", "⇧", "N"],
        keywords: ["format", "recurring"],
        scope: "global",
        run: () => router.push("/series/create"),
      },
      {
        id: "plan.from-theme",
        label: "Plan week from theme",
        hint: "Streaming 7-card generation",
        group: "plan",
        icon: Sparkles,
        shortcut: ["⌘", "⇧", "P"],
        keywords: ["generate", "draft", "week"],
        scope: "global",
        // Placeholder — wired in Phase 3
        run: () => router.push("/plan/current?action=plan-from-theme"),
      },
      {
        id: "publish.today",
        label: "Publish today",
        hint: "Follow-up picker for platforms",
        group: "publish",
        icon: Upload,
        shortcut: ["⌘", "⇧", "↵"],
        keywords: ["ship", "live"],
        scope: "global",
        run: () => router.push("/plan/current?action=publish-today"),
      },

      // Help
      {
        id: "help.shortcuts",
        label: "Keyboard shortcuts",
        group: "help",
        icon: HelpCircle,
        shortcut: ["⇧", "?"],
        scope: "global",
        run: () => router.push("/plan/current?action=help"),
      },
    ];

    return actionsStore.registerMany(seed);
  }, [router]);
}

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const actions = useActions();
  useSeedActions();

  // ⌘K / Ctrl+K globally opens the palette. Esc is handled by Radix Dialog.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const grouped = React.useMemo(() => {
    const by = new Map<ActionGroup, Action[]>();
    for (const a of actions) {
      if (a.when && !a.when()) continue;
      const list = by.get(a.group) ?? [];
      list.push(a);
      by.set(a.group, list);
    }
    return GROUP_ORDER.map((g) => [g, by.get(g) ?? []] as const).filter(
      ([, list]) => list.length > 0
    );
  }, [actions]);

  const invoke = React.useCallback(async (action: Action) => {
    setOpen(false);
    // Defer a tick so the dialog close animation completes before navigation
    await new Promise((r) => setTimeout(r, 0));
    await action.run();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, or search…" />
      <CommandList>
        <CommandEmpty>No matches. Try a different query.</CommandEmpty>
        {grouped.map(([group, items]) => (
          <CommandGroup key={group} heading={GROUP_LABELS[group]}>
            {items.map((action) => {
              const Icon = action.icon ?? Circle;
              return (
                <CommandItem
                  key={action.id}
                  value={[action.label, ...(action.keywords ?? [])].join(" ")}
                  onSelect={() => invoke(action)}
                  shortcut={
                    action.shortcut ? (
                      <Kbd keys={action.shortcut} />
                    ) : undefined
                  }
                >
                  <Icon
                    size={16}
                    strokeWidth={1.5}
                    className="text-text-tertiary shrink-0"
                    aria-hidden="true"
                  />
                  <span className="truncate">{action.label}</span>
                  {action.hint ? (
                    <>
                      <ChevronRight
                        size={12}
                        strokeWidth={1.5}
                        className="text-text-tertiary shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-text-tertiary truncate">
                        {action.hint}
                      </span>
                    </>
                  ) : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
