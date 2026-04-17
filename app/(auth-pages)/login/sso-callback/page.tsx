export const dynamic = "force-dynamic";

import SSOCallback from "./SSOCallback";

export default function SSOCallbackPage() {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!hasClerk) return null;
  return <SSOCallback />;
}
