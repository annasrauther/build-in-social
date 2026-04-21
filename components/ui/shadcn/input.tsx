"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-8 w-full",
          "bg-surface text-text",
          "border border-[color:var(--border)]",
          "rounded-[var(--radius-input)]",
          "px-2.5 text-[13px] leading-none",
          "placeholder:text-text-tertiary",
          "transition-colors duration-fast ease-out-cubic",
          "hover:border-[color:var(--border-interactive)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "tabular-nums",
          className
        )}
        {...props}
      />
    );
  }
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[72px] w-full",
          "bg-surface text-text",
          "border border-[color:var(--border)]",
          "rounded-[var(--radius-input)]",
          "px-2.5 py-2 text-[13px] leading-5",
          "placeholder:text-text-tertiary",
          "transition-colors duration-fast ease-out-cubic",
          "hover:border-[color:var(--border-interactive)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:[outline-color:var(--focus-ring)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        {...props}
      />
    );
  }
);
