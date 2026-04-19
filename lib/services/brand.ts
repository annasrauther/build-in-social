/**
 * Brand kit service facade — switches between mock and real implementations.
 * Real implementation is used when NOCODEBACKEND_SECRET_KEY is set.
 */

import type { BrandKit } from "@/lib/types/brand";
import * as mock from "@/lib/mock/brand.mock";
import * as real from "@/lib/services/brand.real";

const useReal = !!process.env.NOCODEBACKEND_SECRET_KEY;

export const getBrandKit: (userId: string) => Promise<BrandKit> = useReal
  ? real.getBrandKit
  : mock.getBrandKit;

export const updateBrandKit: (
  userId: string,
  partial: Partial<BrandKit>
) => Promise<BrandKit> = useReal ? real.updateBrandKit : mock.updateBrandKit;
