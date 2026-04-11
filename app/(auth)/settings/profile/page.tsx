"use client";

import dynamic from "next/dynamic";

// Base Web Textarea passes children to <textarea> which React 19 disallows
// during SSR pre-render. Dynamic import with ssr: false avoids the issue.
const ProfileSettingsContent = dynamic(() => import("./ProfileSettingsContent"), {
  ssr: false,
  loading: () => <div className="space-y-6 max-w-2xl animate-pulse" />,
});

export default function ProfileSettingsPage() {
  return <ProfileSettingsContent />;
}
