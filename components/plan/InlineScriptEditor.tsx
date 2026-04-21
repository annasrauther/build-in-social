"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RiPencilLine } from "@remixicon/react";
import { Button } from "@/components/tremor/Button";
import { APP } from "@/content/app";

const SCRIPT_MAX = 2000;

interface InlineScriptEditorProps {
  videoId: string;
  initialScript: string;
  onSaved?: (newScript: string) => void;
}

export function InlineScriptEditor({
  videoId,
  initialScript,
  onSaved,
}: InlineScriptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(initialScript);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when editor opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const isUnchanged = draft === initialScript;
  const isOverLimit = draft.length > SCRIPT_MAX;
  const canSave = !isUnchanged && !isOverLimit && draft.trim().length > 0 && !saving;

  function handleOpen() {
    setDraft(initialScript);
    setError(null);
    setIsOpen(true);
  }

  function handleCancel() {
    setDraft(initialScript);
    setError(null);
    setIsOpen(false);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/script/update", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ videoId, script: draft }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(
          (j?.error as string) ?? APP.COMMON.errorSave
        );
        return;
      }

      const savedScript = (j?.data?.script as string) ?? draft;
      setIsOpen(false);
      onSaved?.(savedScript);

      // Show "Saved" flash for 2 seconds
      setSavedFlash(true);
      window.setTimeout(() => setSavedFlash(false), 2000);
    } catch {
      setError(APP.COMMON.errorSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4">
      <AnimatePresence mode="wait">
        {savedFlash && (
          <motion.p
            key="saved-flash"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
            role="status"
          >
            {APP.VIDEO_DETAIL.editScriptSaved}
          </motion.p>
        )}
      </AnimatePresence>

      {!isOpen ? (
        <Button
          variant="ghost"
          onClick={handleOpen}
          className="flex min-h-[44px] items-center gap-2 px-3 text-sm"
          aria-label={APP.VIDEO_DETAIL.editScript}
        >
          <RiPencilLine className="h-4 w-4 shrink-0" aria-hidden="true" />
          {APP.VIDEO_DETAIL.editScript}
        </Button>
      ) : (
        <motion.div
          key="editor"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-3"
        >
          <label
            htmlFor="inline-script-editor"
            className="block text-sm font-medium text-gray-900 dark:text-gray-50"
          >
            {APP.VIDEO_DETAIL.editScript}
          </label>

          <textarea
            id="inline-script-editor"
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={APP.VIDEO_DETAIL.editScriptPlaceholder}
            disabled={saving}
            aria-invalid={isOverLimit}
            maxLength={SCRIPT_MAX + 50}
            rows={8}
            className="w-full resize-y rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-900 focus:border-[#D97757] focus:outline-none focus:ring-1 focus:ring-[#D97757] disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50"
          />

          <div className="flex items-center justify-between text-xs">
            <span
              className={
                isOverLimit
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }
            >
              {APP.VIDEO_DETAIL.editScriptCharCount(draft.length)}
            </span>
            {error && (
              <span role="alert" className="text-red-600 dark:text-red-400">
                {error}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="min-h-[44px]"
            >
              {saving ? APP.COMMON.loading : APP.VIDEO_DETAIL.editScriptSave}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              disabled={saving}
              className="min-h-[44px]"
            >
              {APP.VIDEO_DETAIL.editScriptCancel}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
