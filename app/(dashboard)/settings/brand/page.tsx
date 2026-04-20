"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiUpload2Line, RiCheckLine } from "@remixicon/react";
import { Button } from "@/components/tremor/Button";
import { StatusCard } from "@/components/ui/StatusCard";
import { CaptionStylePicker } from "@/components/plan/CaptionStylePicker";
import { APP } from "@/content/app";
import type { BrandKit } from "@/lib/types/brand";
import type { CaptionStyle } from "@/lib/types/caption";

const COPY = APP.SETTINGS_BRAND;

// Font style preview — shows sample text styled per option
const FONT_STYLE_PREVIEWS: Record<
  BrandKit["fontStyle"],
  { className: string; sample: string }
> = {
  modern: {
    className: "font-sans font-medium tracking-normal",
    sample: "Modern caption",
  },
  bold: {
    className: "font-sans font-black uppercase tracking-widest",
    sample: "BOLD CAPTION",
  },
  minimal: {
    className: "font-sans font-light tracking-wide",
    sample: "minimal caption",
  },
  playful: {
    className: "font-serif font-semibold tracking-tight",
    sample: "Playful caption!",
  },
};

const WATERMARK_POSITIONS: Array<{
  value: BrandKit["watermarkPosition"];
  label: string;
}> = [
  { value: "top-left", label: COPY.watermarkPositions["top-left"] },
  { value: "top-right", label: COPY.watermarkPositions["top-right"] },
  { value: "bottom-left", label: COPY.watermarkPositions["bottom-left"] },
  { value: "bottom-right", label: COPY.watermarkPositions["bottom-right"] },
  { value: "none", label: COPY.watermarkPositions["none"] },
];

const FONT_STYLES: BrandKit["fontStyle"][] = [
  "modern",
  "bold",
  "minimal",
  "playful",
];

export default function BrandKitPage() {
  const [_kit, setKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Local form state
  const [primaryColor, setPrimaryColor] = useState("#D97757");
  const [accentColor, setAccentColor] = useState("#6A9BCC");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [watermarkPosition, setWatermarkPosition] =
    useState<BrandKit["watermarkPosition"]>("bottom-right");
  const [fontStyle, setFontStyle] = useState<BrandKit["fontStyle"]>("modern");

  // Caption style (Phase 1: local state only — sent with render job later)
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("minimal");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/brand")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.error) {
          setLoadError(APP.COMMON.errorGeneric);
        } else {
          const k = j.data as BrandKit;
          setKit(k);
          setPrimaryColor(k.primaryColor);
          setAccentColor(k.accentColor);
          setLogoUrl(k.logoUrl);
          setWatermarkPosition(k.watermarkPosition);
          setFontStyle(k.fontStyle);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(APP.COMMON.errorGeneric);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLogoError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/png", "image/svg+xml", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        setLogoError("Only PNG, SVG, or JPG files are allowed.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setLogoError("File must be under 2 MB.");
        return;
      }
      setLogoFile(file);
      // Create a local preview URL
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaveError(null);

    try {
      let resolvedLogoUrl = logoUrl;

      // If a new logo file was selected, upload it via stub endpoint
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload/logo", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadJson = await uploadRes.json();
          resolvedLogoUrl = uploadJson.data?.url ?? resolvedLogoUrl;
        }
        // If upload stub fails, continue with the blob preview URL (non-blocking)
      }

      const res = await fetch("/api/brand", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryColor,
          accentColor,
          logoUrl: resolvedLogoUrl,
          watermarkPosition,
          fontStyle,
        }),
      });

      const j = await res.json();
      if (!res.ok || j.error) {
        setSaveError(j.error ?? APP.COMMON.errorSave);
        return;
      }

      setKit(j.data as BrandKit);
      setLogoFile(null);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError(APP.COMMON.errorSave);
    } finally {
      setSaving(false);
    }
  }, [
    primaryColor,
    accentColor,
    logoUrl,
    logoFile,
    watermarkPosition,
    fontStyle,
  ]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" aria-busy="true">
        <span className="sr-only">{APP.A11Y.loading}</span>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-lg bg-gray-100 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <StatusCard
        variant="error"
        title="Couldn't load brand kit"
        description={loadError}
        cta={APP.COMMON.retry}
        onCta={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <section aria-labelledby="brand-kit-heading">
        <div className="grid grid-cols-1 gap-x-14 gap-y-8 md:grid-cols-3">
          <div>
            <h2
              id="brand-kit-heading"
              className="scroll-mt-10 font-semibold text-gray-900 dark:text-gray-50"
            >
              {COPY.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              {COPY.description}
            </p>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Color pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Primary color */}
              <div>
                <label
                  htmlFor="primary-color"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
                >
                  {COPY.primaryColor}
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex-shrink-0 w-11 h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label={COPY.primaryColor}
                    />
                  </div>
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300 uppercase">
                    {primaryColor}
                  </span>
                </div>
              </div>

              {/* Accent color */}
              <div>
                <label
                  htmlFor="accent-color"
                  className="block text-sm font-medium text-gray-900 dark:text-gray-50 mb-2"
                >
                  {COPY.accentColor}
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex-shrink-0 w-11 h-11 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer"
                    style={{ backgroundColor: accentColor }}
                  >
                    <input
                      id="accent-color"
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label={COPY.accentColor}
                    />
                  </div>
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300 uppercase">
                    {accentColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Logo upload */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-1">
                {COPY.logoLabel}
              </p>
              <p className="text-xs text-gray-500 mb-3">{COPY.logoHint}</p>
              <div className="flex items-center gap-4">
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="w-14 h-14 object-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  />
                )}
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:border-brand-500 hover:text-brand-500 transition-colors min-h-[44px]"
                >
                  <RiUpload2Line className="size-4" aria-hidden />
                  {COPY.logoUpload}
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg"
                  className="sr-only"
                  onChange={handleLogoChange}
                  aria-label={COPY.logoUpload}
                />
              </div>
              {logoError && (
                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600 dark:text-red-400"
                >
                  {logoError}
                </p>
              )}
              {logoFile && (
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {logoFile.name}
                </p>
              )}
            </div>

            {/* Watermark position */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
                {COPY.watermarkLabel}
              </p>
              {/* Visual 2×2 grid + "none" option */}
              <div
                role="radiogroup"
                aria-label={COPY.watermarkLabel}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-sm"
              >
                {WATERMARK_POSITIONS.map(({ value, label }) => {
                  const isSelected = watermarkPosition === value;
                  return (
                    <label
                      key={value}
                      className={[
                        "flex items-center gap-2 rounded-lg border-2 px-3 py-3 cursor-pointer transition-colors min-h-[44px]",
                        isSelected
                          ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="watermark-position"
                        value={value}
                        checked={isSelected}
                        onChange={() =>
                          setWatermarkPosition(value)
                        }
                        className="sr-only"
                      />
                      <span
                        className={[
                          "text-sm font-medium",
                          isSelected
                            ? "text-brand-500"
                            : "text-gray-700 dark:text-gray-300",
                        ].join(" ")}
                      >
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Font style selector */}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-50 mb-3">
                {COPY.fontStyleLabel}
              </p>
              <div
                role="radiogroup"
                aria-label={COPY.fontStyleLabel}
                className="grid grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {FONT_STYLES.map((style) => {
                  const isSelected = fontStyle === style;
                  const preview = FONT_STYLE_PREVIEWS[style];
                  return (
                    <label
                      key={style}
                      className={[
                        "flex flex-col items-center gap-2 rounded-lg border-2 p-3 cursor-pointer transition-colors min-h-[44px]",
                        isSelected
                          ? "border-brand-500 bg-brand-500/5 dark:bg-brand-500/10"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="font-style"
                        value={style}
                        checked={isSelected}
                        onChange={() => setFontStyle(style)}
                        className="sr-only"
                      />
                      {/* Mini preview card */}
                      <div className="w-full rounded-md bg-gray-900 px-2 py-3 text-center">
                        <span
                          className={`text-[11px] leading-tight ${preview.className}`}
                        >
                          {preview.sample}
                        </span>
                      </div>
                      <span
                        className={[
                          "text-xs font-medium",
                          isSelected
                            ? "text-brand-500"
                            : "text-gray-700 dark:text-gray-300",
                        ].join(" ")}
                      >
                        {COPY.fontStyles[style]}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Caption style */}
            <CaptionStylePicker
              selected={captionStyle}
              onSelect={setCaptionStyle}
            />

            {/* Save */}
            {saveError && (
              <StatusCard
                variant="error"
                title={APP.COMMON.errorSave}
                description={saveError}
              />
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="min-h-[44px]"
              >
                {saving ? APP.COMMON.loading : COPY.saveLabel}
              </Button>

              <AnimatePresence>
                {saved && (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400"
                    role="status"
                  >
                    <RiCheckLine className="size-4" aria-hidden />
                    {COPY.savedLabel}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
