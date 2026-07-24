import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Calculator, CheckCircle2, AlertTriangle, TrendingUp, Info, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";

// ─── TYPES & UTILITIES ─────────────────────────────────────────────────────────

export interface PricingInputs {
  cogs: number; // Cost of Goods Sold (Raw Sourcing Cost)
  targetMargin: number; // e.g., 30 for 30%
  gstRate: number; // e.g., 5 for 5%
  packagingCost: number;
  shippingCost: number;
  platformFee: number;
  miscCost: number;
  masterWeightGrams: number; // Default 1000g (1kg)
}

export interface PricingResult {
  totalCost: number;
  sellingPriceBeforeGst: number;
  profit: number;
  gstAmount: number;
  finalSellingPrice: number; // Rounded to nearest Rupee
  exactFinalSellingPrice: number; // 2 decimals
  healthBadge: {
    label: string;
    color: "emerald" | "green" | "amber" | "red";
    bgClass: string;
    textClass: string;
    borderClass: string;
  };
}

export interface VariantResult extends PricingResult {
  weightLabel: string;
  weightGrams: number;
  proportionalCogs: number;
}

/**
 * Calculates TRUE PROFIT MARGIN selling price:
 * Selling Price Before GST = Total Cost / (1 - Margin%)
 * Profit = Selling Price Before GST - Total Cost
 * GST = Selling Price Before GST * GST%
 * Final Selling Price = Selling Price Before GST + GST
 */
export function calculateTrueMarginPricing(inputs: PricingInputs): PricingResult {
  const cogs = Math.max(0, inputs.cogs || 0);
  const pkg = Math.max(0, inputs.packagingCost || 0);
  const ship = Math.max(0, inputs.shippingCost || 0);
  const platform = Math.max(0, inputs.platformFee || 0);
  const misc = Math.max(0, inputs.miscCost || 0);

  const totalCost = cogs + pkg + ship + platform + misc;
  const marginFraction = Math.min(0.95, Math.max(0, (inputs.targetMargin || 0) / 100));

  // True Margin Formula
  const sellingPriceBeforeGst = marginFraction >= 1 
    ? totalCost 
    : totalCost / (1 - marginFraction);

  const profit = sellingPriceBeforeGst - totalCost;

  const gstRateFraction = Math.max(0, (inputs.gstRate || 0) / 100);
  const gstAmount = sellingPriceBeforeGst * gstRateFraction;

  const exactFinalSellingPrice = sellingPriceBeforeGst + gstAmount;
  const finalSellingPrice = Math.round(exactFinalSellingPrice);

  let healthBadge: PricingResult["healthBadge"] = {
    label: "Healthy Margin",
    color: "green",
    bgClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-300",
  };

  if (inputs.targetMargin >= 35) {
    healthBadge = {
      label: "Excellent Margin (>35%)",
      color: "emerald",
      bgClass: "bg-emerald-50 text-emerald-800 border-emerald-300",
      textClass: "text-emerald-700",
      borderClass: "border-emerald-400",
    };
  } else if (inputs.targetMargin >= 20) {
    healthBadge = {
      label: "Healthy Margin (20-35%)",
      color: "green",
      bgClass: "bg-green-50 text-green-800 border-green-300",
      textClass: "text-green-700",
      borderClass: "border-green-400",
    };
  } else if (inputs.targetMargin >= 10) {
    healthBadge = {
      label: "Low Profit (10-20%)",
      color: "amber",
      bgClass: "bg-amber-50 text-amber-800 border-amber-300",
      textClass: "text-amber-700",
      borderClass: "border-amber-400",
    };
  } else {
    healthBadge = {
      label: "Warning: Low/Loss (<10%)",
      color: "red",
      bgClass: "bg-red-50 text-red-800 border-red-300",
      textClass: "text-red-700",
      borderClass: "border-red-400",
    };
  }

  return {
    totalCost: Number(totalCost.toFixed(2)),
    sellingPriceBeforeGst: Number(sellingPriceBeforeGst.toFixed(2)),
    profit: Number(profit.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    finalSellingPrice,
    exactFinalSellingPrice: Number(exactFinalSellingPrice.toFixed(2)),
    healthBadge,
  };
}

/**
 * Calculates weight variant prices (100g, 250g, 500g, 1kg) proportional to master weight
 */
export function calculateWeightVariants(inputs: PricingInputs): VariantResult[] {
  const masterGrams = inputs.masterWeightGrams || 1000;
  const masterCogs = inputs.cogs || 0;

  const variants = [
    { weightLabel: "100g", weightGrams: 100 },
    { weightLabel: "250g", weightGrams: 250 },
    { weightLabel: "500g", weightGrams: 500 },
    { weightLabel: "1kg", weightGrams: 1000 },
  ];

  return variants.map((v) => {
    const ratio = v.weightGrams / masterGrams;
    const proportionalCogs = masterCogs * ratio;
    
    // Scale packaging and shipping proportionally for variants
    const scaledInputs: PricingInputs = {
      ...inputs,
      cogs: proportionalCogs,
      packagingCost: inputs.packagingCost * (0.4 + 0.6 * ratio), // Slight baseline packaging cost
      shippingCost: inputs.shippingCost * (0.5 + 0.5 * ratio),
      platformFee: inputs.platformFee * ratio,
      miscCost: inputs.miscCost * ratio,
    };

    const res = calculateTrueMarginPricing(scaledInputs);

    return {
      ...res,
      weightLabel: v.weightLabel,
      weightGrams: v.weightGrams,
      proportionalCogs: Number(proportionalCogs.toFixed(2)),
    };
  });
}

// ─── PROPS FOR COMPONENT ───────────────────────────────────────────────────────

export interface SmartPricingAssistantProps {
  initialCogs?: number;
  initialMargin?: number;
  initialGst?: number;
  initialVariants?: { p100: number; p250: number; p500: number; p1000: number };
  onPriceCalculated?: (data: {
    basePrice: number;
    variants: { p100: number; p250: number; p500: number; p1000: number };
    pricingResult: PricingResult;
  }) => void;
}

export function SmartPricingAssistant({
  initialCogs = 30,
  initialMargin = 30,
  initialGst = 5,
  initialVariants,
  onPriceCalculated,
}: SmartPricingAssistantProps) {
  const [cogs, setCogs] = useState<number>(initialCogs);
  const [targetMargin, setTargetMargin] = useState<number>(initialMargin);
  const [gstRate, setGstRate] = useState<number>(initialGst);

  // Optional operational costs
  const [packagingCost, setPackagingCost] = useState<number>(2);
  const [shippingCost, setShippingCost] = useState<number>(5);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [miscCost, setMiscCost] = useState<number>(0);

  const [showAdvancedCosts, setShowAdvancedCosts] = useState<boolean>(true);

  // Perform calculation
  const currentInputs: PricingInputs = {
    cogs,
    targetMargin,
    gstRate,
    packagingCost,
    shippingCost,
    platformFee,
    miscCost,
    masterWeightGrams: 1000,
  };

  const result = calculateTrueMarginPricing(currentInputs);
  const variants = calculateWeightVariants(currentInputs);

  // Extract variant prices
  const calculatedVariantPrices = {
    p100: variants.find((v) => v.weightGrams === 100)?.finalSellingPrice || 0,
    p250: variants.find((v) => v.weightGrams === 250)?.finalSellingPrice || 0,
    p500: variants.find((v) => v.weightGrams === 500)?.finalSellingPrice || 0,
    p1000: variants.find((v) => v.weightGrams === 1000)?.finalSellingPrice || result.finalSellingPrice,
  };
  const [variantPrices, setVariantPrices] = useState(initialVariants || calculatedVariantPrices);
  const inputKey = `${cogs}|${targetMargin}|${gstRate}|${packagingCost}|${shippingCost}|${platformFee}|${miscCost}`;
  const lastInputKeyRef = useRef("");

  // Sync with parent wizard
  useEffect(() => {
    const firstRun = lastInputKeyRef.current === "";
    lastInputKeyRef.current = inputKey;

    if (firstRun && initialVariants) {
      onPriceCalculated?.({
        basePrice: initialVariants.p1000,
        variants: initialVariants,
        pricingResult: result,
      });
      return;
    }

    setVariantPrices(calculatedVariantPrices);
    onPriceCalculated?.({
      basePrice: calculatedVariantPrices.p1000,
      variants: calculatedVariantPrices,
      pricingResult: result,
    });
  }, [inputKey]);

  function handleVariantPriceChange(key: keyof typeof variantPrices, value: number) {
    const nextPrices = { ...variantPrices, [key]: Math.max(0, value || 0) };
    setVariantPrices(nextPrices);
    onPriceCalculated?.({
      basePrice: nextPrices.p1000,
      variants: nextPrices,
      pricingResult: result,
    });
  }

  // Segment percentages for visual bar
  const totalPrice = result.exactFinalSellingPrice || 1;
  const costPct = Math.round((result.totalCost / totalPrice) * 100);
  const profitPct = Math.round((result.profit / totalPrice) * 100);
  const gstPct = Math.max(0, 100 - costPct - profitPct);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#2D5016]/10 via-[#2D5016]/5 to-transparent border border-[#2D5016]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D5016] flex items-center justify-center text-white shadow-md">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#2C2416] text-base">Smart Commercial Pricing Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2D5016]/15 text-[#2D5016]">
                True Profit Margin Math
              </span>
            </div>
            <p className="text-xs text-[#8B7355] mt-0.5">
              Accurately computes retail price using <code className="bg-white/60 px-1 py-0.5 rounded text-[10px] font-mono">Cost / (1 - Margin%)</code> formula.
            </p>
          </div>
        </div>

        {/* Health Badge */}
        <div className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${result.healthBadge.bgClass}`}>
          {targetMargin >= 20 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          )}
          <span>{result.healthBadge.label}</span>
        </div>
      </div>

      {/* Main Grid: Inputs vs Breakdown Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Required & Operational Cost Inputs (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-[#2C2416]/10 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2416]/8 pb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D5016] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C85A1A]" /> Primary Sourcing & Margin Parameters
              </h4>
              <span className="text-[10px] text-[#8B7355]">Required Inputs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COGS Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2C2416] flex items-center justify-between">
                  <span>COGS (Raw Sourcing Cost)</span>
                  <span className="text-[10px] text-[#8B7355] font-normal">₹ per kg</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8B7355]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={cogs}
                    onChange={(e) => setCogs(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border rounded-xl text-sm font-semibold bg-[#FAF8F5] border-[#2C2416]/15 focus:border-[#2D5016] focus:bg-white outline-none transition-all"
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              {/* Target Profit Margin Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#2C2416]">
                  Target Profit Margin (%)
                </label>
                <select
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium bg-[#FAF8F5] border-[#2C2416]/15 focus:border-[#2D5016] focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value={20}>20% (Low Margin)</option>
                  <option value={25}>25% (Standard Trader)</option>
                  <option value={30}>30% (Recommended B2C)</option>
                  <option value={35}>35% (High Margin)</option>
                  <option value={40}>40% (Premium Brand)</option>
                  <option value={45}>45% (Luxury D2C)</option>
                  <option value={50}>50% (Max Profit)</option>
                </select>
              </div>

              {/* GST Rate Dropdown */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-[#2C2416] flex items-center justify-between">
                  <span>GST Rate (%)</span>
                  <span className="text-[10px] text-[#8B7355]">Default Indian Spice Slab: 5%</span>
                </label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-medium bg-[#FAF8F5] border-[#2C2416]/15 focus:border-[#2D5016] focus:bg-white outline-none transition-all cursor-pointer"
                >
                  <option value={0}>0% (Exempted Raw Goods)</option>
                  <option value={5}>5% (Standard Spices & Essential Oils - Default)</option>
                  <option value={12}>12% (Processed Spice Blends / Extracts)</option>
                  <option value={18}>18% (Luxury Packaged FMCG)</option>
                </select>
              </div>
            </div>

            {/* Advanced Operational Expenses Toggle */}
            <div className="border-t border-[#2C2416]/8 pt-3">
              <button
                type="button"
                onClick={() => setShowAdvancedCosts(!showAdvancedCosts)}
                className="flex items-center justify-between w-full text-xs font-bold text-[#8B7355] hover:text-[#2C2416] transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  Operational Overhead Costs (Packaging, Freight, Fees)
                </span>
                <span className="text-[10px] text-[#2D5016] font-semibold">
                  {showAdvancedCosts ? "− Hide Overheads" : "+ Add Overheads"}
                </span>
              </button>

              <AnimatePresence>
                {showAdvancedCosts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 pt-3 overflow-hidden"
                  >
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8B7355] mb-1">Packaging Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={packagingCost}
                        onChange={(e) => setPackagingCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-[#FAF8F5] border-[#2C2416]/10 outline-none"
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8B7355] mb-1">Shipping Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={shippingCost}
                        onChange={(e) => setShippingCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-[#FAF8F5] border-[#2C2416]/10 outline-none"
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8B7355] mb-1">Platform Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={platformFee}
                        onChange={(e) => setPlatformFee(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-[#FAF8F5] border-[#2C2416]/10 outline-none"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#8B7355] mb-1">Misc Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={miscCost}
                        onChange={(e) => setMiscCost(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded-xl text-xs bg-[#FAF8F5] border-[#2C2416]/10 outline-none"
                        placeholder="0"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column: Live Pricing Breakdown Card (5 cols) */}
        <div className="lg:col-span-5">
          <div className="p-5 bg-[#FAF8F5] rounded-2xl border-2 border-[#2D5016]/20 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#2C2416]/10 pb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D5016] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#2D5016]" /> Pricing Breakdown Card
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Live Calculator
              </span>
            </div>

            {/* Price Callout */}
            <div className="p-4 bg-white rounded-xl border border-[#2C2416]/10 text-center shadow-inner relative">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B7355] block mb-1">
                Recommended Selling Price
              </span>
              <motion.div
                key={result.finalSellingPrice}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-extrabold text-[#2D5016] tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                ₹{result.finalSellingPrice}
              </motion.div>
              <div className="text-[10px] text-[#8B7355] mt-1 flex items-center justify-center gap-1">
                <span>Exact pre-round:</span>
                <span className="font-semibold text-[#2C2416]">₹{result.exactFinalSellingPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Detailed Line Items */}
            <div className="space-y-2 text-xs font-medium border-b border-[#2C2416]/10 pb-3">
              <div className="flex justify-between text-[#8B7355]">
                <span>Raw Product Cost (COGS):</span>
                <span className="font-semibold text-[#2C2416]">₹{cogs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8B7355]">
                <span>Packaging Cost:</span>
                <span className="font-semibold text-[#2C2416]">₹{packagingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8B7355]">
                <span>Shipping Cost:</span>
                <span className="font-semibold text-[#2C2416]">₹{shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8B7355]">
                <span>Platform Charges:</span>
                <span className="font-semibold text-[#2C2416]">₹{platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#8B7355]">
                <span>Miscellaneous:</span>
                <span className="font-semibold text-[#2C2416]">₹{miscCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between font-bold text-[#2C2416] border-t border-dashed border-[#2C2416]/15 pt-2">
                <span>Total Product Cost:</span>
                <span className="text-[#C85A1A]">₹{result.totalCost.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between text-[#8B7355]">
                <span>Target Profit Margin ({targetMargin}%):</span>
                <span className="font-bold text-emerald-700">₹{result.profit.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-[#8B7355]">
                <span>GST Tax ({gstRate}%):</span>
                <span className="font-semibold text-amber-700">₹{result.gstAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Profit Distribution Visual Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold text-[#8B7355]">
                <span>Cost ({costPct}%)</span>
                <span>Profit ({profitPct}%)</span>
                <span>GST ({gstPct}%)</span>
              </div>
              <div className="h-2.5 w-full bg-stone-200 rounded-full overflow-hidden flex">
                <div style={{ width: `${costPct}%` }} className="bg-[#C85A1A] h-full" title={`Total Cost: ₹${result.totalCost}`} />
                <div style={{ width: `${profitPct}%` }} className="bg-emerald-600 h-full" title={`Profit: ₹${result.profit}`} />
                <div style={{ width: `${gstPct}%` }} className="bg-amber-500 h-full" title={`GST: ₹${result.gstAmount}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Variant Auto Calculator Section */}
      <div className="p-5 bg-white rounded-2xl border border-[#2C2416]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2C2416]/8 pb-3">
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#2D5016] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2D5016]" /> Weight Variant Auto Calculator
            </h4>
            <p className="text-[11px] text-[#8B7355] mt-0.5">
              Simulates independent selling prices for 100g, 250g, 500g, and 1kg based on master 1kg COGS (₹{cogs}).
            </p>
          </div>
          <span className="text-[10px] font-bold bg-[#2D5016]/10 text-[#2D5016] px-2.5 py-1 rounded-full w-max">
            4 Auto-Simulated Variants
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {variants.map((v) => {
            const key = `p${v.weightGrams}` as keyof typeof variantPrices;
            return (
            <div
              key={v.weightLabel}
              className="min-w-0 p-4 rounded-xl bg-[#FAF8F5] border border-[#2C2416]/10 hover:border-[#2D5016]/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-extrabold text-base text-[#2C2416] whitespace-nowrap">{v.weightLabel} pack</span>
                <span className="shrink-0 text-[10px] font-semibold text-[#8B7355] bg-white px-2 py-1 rounded-md border border-[#2C2416]/8">
                  Cost: ₹{v.proportionalCogs}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#2C2416]/8">
                <span className="text-[10px] text-[#8B7355] uppercase font-bold tracking-wider block">Retail Selling Price</span>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-2 text-xs font-bold text-[#8B7355]">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={variantPrices[key] ?? v.finalSellingPrice}
                    onChange={(e) => handleVariantPriceChange(key, Number(e.target.value))}
                    className="w-full min-w-0 pl-8 pr-3 py-2.5 rounded-lg border border-[#2C2416]/10 text-right text-xl font-extrabold text-[#2D5016] outline-none focus:border-[#2D5016] bg-[#FAF8F5]"
                  />
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-[#8B7355]">
                <div className="flex justify-between">
                  <span>Net Profit ({targetMargin}%):</span>
                  <span className="font-bold text-emerald-700">₹{v.profit}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST ({gstRate}%):</span>
                  <span className="font-semibold text-[#2C2416]">₹{v.gstAmount}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
