// Shared helpers for the quotation builders.
// All product/weight/price data is resolved from the LIVE catalog returned by
// GET /products (productsApi.list) - the same source that powers the wholesale
// catalogue PDF. No hardcoded products, weights, prices, GST or quantities.

export type CatalogPack = {
  id?: number | null;
  label: string;
  price: number | string;
  minOrderQty?: number | null;
};

export type CatalogProduct = {
  id: number;
  name: string;
  category?: string;
  basePrice?: number | string;
  packaging?: CatalogPack[];
};

function normalizeName(name: string): string {
  return String(name || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function findCatalogProduct(products: CatalogProduct[], name: string | undefined | null): CatalogProduct | null {
  if (!products.length || !name) return null;
  const target = normalizeName(name);
  if (!target) return null;
  return (
    products.find(p => normalizeName(p.name) === target) ||
    products.find(p => normalizeName(p.name).includes(target)) ||
    products.find(p => target.includes(normalizeName(p.name))) ||
    null
  );
}

export function catalogPacks(product: CatalogProduct | null | undefined): CatalogPack[] {
  if (!product) return [];
  if (Array.isArray(product.packaging) && product.packaging.length > 0) {
    return product.packaging;
  }
  return [];
}

function packKey(label: string | undefined | null): string {
  return String(label || "").trim().toLowerCase().replace(/\s+/g, "");
}

// Match a free-text weight hint (e.g. "5kg Pack", "25kg bags") against the
// wholesale packs loaded from the database for the selected product.
export function matchPack(hint: string | undefined | null, packs: CatalogPack[]): CatalogPack | undefined {
  if (!hint || !packs.length) return undefined;
  const hintLower = String(hint).trim().toLowerCase();
  const kg = hintLower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilo)\b/);
  if (kg) {
    const exactKey = kg[0].replace(/\s+/g, "");
    return (
      packs.find(p => packKey(p.label) === exactKey) ||
      packs.find(p => packKey(p.label).startsWith(kg[1])) ||
      packs.find(p => packKey(p.label).includes(kg[1])) ||
      undefined
    );
  }
  const hintKey = packKey(hint);
  return (
    packs.find(p => packKey(p.label) === hintKey) ||
    packs.find(p => packKey(p.label).includes(hintKey) || hintKey.includes(packKey(p.label))) ||
    undefined
  );
}

export function parseQuantityHint(hint: string | undefined | null): number | undefined {
  if (!hint) return undefined;
  const m = String(hint).match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export function packPrice(pack: CatalogPack | undefined | null): string {
  if (!pack) return "";
  const n = Number(pack.price);
  return Number.isFinite(n) && n > 0 ? String(n) : "";
}

export function makeEmptyItem(defaultGst: number | null): {
  name: string;
  weight: string;
  quantity: number;
  unitPrice: string;
  discount: number;
  gst: number | string;
} {
  return { name: "", weight: "", quantity: 1, unitPrice: "", discount: 0, gst: defaultGst ?? 0 };
}
