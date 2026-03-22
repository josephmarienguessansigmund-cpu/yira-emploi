/**
 * YIRA – API Tarification Dynamique
 * GET /api/pricing — Retourne les prix de tous les modules
 */

import { NextResponse } from "next/server";
import { getAllModulePrices, MODULE_LABELS, MODULE_DESCRIPTIONS } from "@/lib/pricing";
import type { ModuleType } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function GET() {
  const prices = getAllModulePrices();

  const modules = (Object.keys(prices) as ModuleType[]).map((key) => ({
    id: key,
    label: MODULE_LABELS[key],
    description: MODULE_DESCRIPTIONS[key],
    price: prices[key],
    currency: "FCFA",
  }));

  return NextResponse.json({
    success: true,
    data: { modules },
  });
}
