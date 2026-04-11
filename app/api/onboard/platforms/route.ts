import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";

const PlatformSchema = z.object({
  platforms: z
    .array(z.enum(["youtube", "instagram", "linkedin", "x"]))
    .min(2, "Select at least 2 platforms")
    .max(4, "Maximum 4 platforms"),
});

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const result = PlatformSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json({ data: { saved: true }, error: null });
  } catch {
    return NextResponse.json({ data: null, error: "Invalid request" }, { status: 400 });
  }
}
