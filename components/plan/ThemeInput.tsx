"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { cn } from "@/lib/utils";

/**
 * ThemeInput — F4 hero for empty weeks and "Regenerate all" prompts.
 *
 * One line of user intent + one button. The parent wires `onSubmit` to
 * `/api/plan/generate` with `mode: "autopilot"` + `autopilotHint: theme`
 * (the existing API parameter). Streaming is visual-only: the
 * staggered reveal on DayCard rows (index * 40ms) makes the resolved
 * response feel incremental without changing the backend.
 */
export interface ThemeInputProps {
  defaultValue?: string;
  placeholder?: string;
  buttonLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: (theme: string) => void;
  className?: string;
  compact?: boolean;
}

export function ThemeInput({
  defaultValue = "",
  placeholder = "Type a theme for this week — or leave blank for AI picks.",
  buttonLabel = "Plan week",
  loading,
  disabled,
  onSubmit,
  className,
  compact,
}: ThemeInputProps) {
  const [theme, setTheme] = React.useState(defaultValue);
  React.useEffect(() => {
    setTheme(defaultValue);
  }, [defaultValue]);

  const submit = () => {
    if (loading || disabled) return;
    onSubmit(theme.trim());
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={cn(
        "flex items-stretch gap-2",
        compact ? "" : "p-1 rounded-[var(--radius-card)] bg-surface border border-[color:var(--border)]",
        className,
      )}
    >
      <Input
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        placeholder={placeholder}
        maxLength={140}
        disabled={loading || disabled}
        aria-label="Week theme"
        className={cn(compact ? "" : "border-0 shadow-none focus-visible:outline-none bg-transparent")}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={loading || disabled}
      >
        <Sparkles
          size={14}
          strokeWidth={1.5}
          aria-hidden="true"
          className={loading ? "animate-pulse" : undefined}
        />
        {loading ? "Drafting…" : buttonLabel}
      </Button>
    </form>
  );
}
