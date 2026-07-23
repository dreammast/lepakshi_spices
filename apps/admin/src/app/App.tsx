import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast, Toaster } from "sonner";
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3,
  Settings, Bell, Search, Plus, Eye, Edit2, Trash2,
  Download, Leaf, Flame, Star, Clock, CheckCircle,
  Truck, LogOut, ChevronLeft, ChevronRight, Grid3X3, List,
  X, TrendingUp, TrendingDown, ShieldCheck, DollarSign,
  Mail, MapPin, Calendar, Phone, Sparkles, ArrowLeft, Save,
  User, CreditCard, Truck as TruckIcon, Bell as BellIcon,
  Palette, Activity, FlaskConical, Droplets, Wind,
  Camera, AlertTriangle, RefreshCw, MoreHorizontal,
  BookOpen, ClipboardList, Layers, Globe, History, Lock,
  FileText, Check, UserCheck, Tag
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { SmartPricingAssistant } from "./components/SmartPricingAssistant";

// ─── Brand Tokens ─────────────────────────────────────────────
const C = {
  green: "#2D5016", greenDark: "#1A3A0A", greenLight: "#4A7A2A",
  greenFaint: "rgba(45,80,22,0.08)",
  orange: "#C85A1A", orangeFaint: "rgba(200,90,26,0.10)",
  yellow: "#D4921A", yellowFaint: "rgba(212,146,26,0.10)",
  bg: "#FAF8F5", card: "#FFFFFF",
  charcoal: "#2C2416", muted: "#8B7355",
  border: "rgba(44,36,22,0.10)",
  success: "#4A7A2A", error: "#C94040",
};

// ─── Data & Database State ─────────────────────────────────────
const revenueData: any[] = [];
const weeklyData: any[] = [];
const geoData: any[] = [];

type Product = {
  id: string; name: string; category: string; price: number;
  stock: number; sold: number; rating: number; status: string;
  sku: string; origin: string; description: string; imageUrl: string;
};

const INIT_PRODUCTS: Product[] = [];

const CATEGORY_META = [
  { name: "Roots & Paste", icon: Leaf, color: C.orange, faint: C.orangeFaint, description: "Fresh organic ginger garlic paste and turmeric roots" },
  { name: "Seeds & Pods", icon: Droplets, color: C.yellow, faint: C.yellowFaint, description: "Aromatic whole and ground seeds" },
  { name: "Spice Blends", icon: Flame, color: C.green, faint: C.greenFaint, description: "Roasted masala blends and chilli powders" },
];

type Order = { id: string; customer: string; email: string; items: number; total: number; status: string; date: string; location: string; products: string[] };
const INIT_ORDERS: Order[] = [];

type Customer = { id: string; name: string; email: string; orders: number; spent: number; joined: string; segment: string; location: string; lastOrder: string; phone: string };
const INIT_CUSTOMERS: Customer[] = [];

const NOTIFS: any[] = [];

// ─── Primitives ───────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    active:         { label: "Active",        bg: "#EBF5E6", text: "#2D5016", dot: "#4A7A2A" },
    "out-of-stock": { label: "Out of Stock",  bg: "#FDECEA", text: "#C94040", dot: "#C94040" },
    "low-stock":    { label: "Low Stock",     bg: "#FEF3E2", text: "#C85A1A", dot: "#D4921A" },
    delivered:      { label: "Delivered",     bg: "#EBF5E6", text: "#2D5016", dot: "#4A7A2A" },
    shipped:        { label: "Shipped",       bg: "#E8F2FE", text: "#1B5EAD", dot: "#2B7FE2" },
    processing:     { label: "Processing",    bg: "#FEF3E2", text: "#C85A1A", dot: "#D4921A" },
    pending:        { label: "Pending",       bg: "#F4F4F4", text: "#6B6B6B", dot: "#9E9E9E" },
    cancelled:      { label: "Cancelled",     bg: "#FDECEA", text: "#C94040", dot: "#C94040" },
    VIP:            { label: "VIP",           bg: "#FEF3E2", text: "#C85A1A", dot: "#D4921A" },
    Regular:        { label: "Regular",       bg: "#EBF5E6", text: "#2D5016", dot: "#4A7A2A" },
    New:            { label: "New",           bg: "#E8F2FE", text: "#1B5EAD", dot: "#2B7FE2" },
  };
  const s = map[status] ?? { label: status, bg: "#F4F4F4", text: "#6B6B6B", dot: "#9E9E9E" };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
      {s.label}
    </span>
  );
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const r = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1100, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) r.current = requestAnimationFrame(tick);
    };
    r.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(r.current);
  }, [to]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
}

function Av({ name, size = 36, g }: { name: string; size?: number; g?: string }) {
  const ini = name.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center justify-center rounded-full text-white font-semibold shrink-0 select-none"
      style={{ width: size, height: size, fontSize: size * 0.36, background: g ?? `linear-gradient(135deg, ${C.green}, ${C.greenLight})` }}>
      {ini}
    </div>
  );
}

function Card({ children, className = "", style = {}, onClick }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div className={`rounded-2xl ${onClick ? "cursor-pointer" : ""} ${className}`} onClick={onClick}
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 4px rgba(44,36,22,0.06)", ...style }}>
      {children}
    </div>
  );
}

function Drawer({ open, onClose, title, children, width = 480 }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50" style={{ backgroundColor: "rgba(26,58,10,0.35)", backdropFilter: "blur(2px)" }}
            onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
            style={{ width, backgroundColor: C.card, boxShadow: "-8px 0 40px rgba(26,58,10,0.15)" }}>
            <div className="flex items-center justify-between px-6 py-4 shrink-0"
              style={{ borderBottom: `1px solid ${C.border}` }}>
              <h2 className="font-semibold text-base" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>{title}</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
                style={{ color: C.muted }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.greenFaint; e.currentTarget.style.color = C.green; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.muted; }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26,58,10,0.4)", backdropFilter: "blur(4px)" }}
            onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 12 }} transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="w-full max-w-md rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}
              style={{ backgroundColor: C.card, boxShadow: "0 24px 60px rgba(26,58,10,0.25)" }}>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <h3 className="font-semibold" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>{title}</h3>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: C.muted }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.greenFaint; e.currentTarget.style.color = C.green; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.muted; }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", as = "input", disabled = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; as?: "input" | "textarea" | "select"; disabled?: boolean;
}) {
  const [foc, setFoc] = useState(false);
  const base: React.CSSProperties = {
    backgroundColor: disabled ? "#E8E5E0" : "#F0EDE8", color: C.charcoal, width: "100%", outline: "none",
    border: `1.5px solid ${foc ? C.green : "transparent"}`,
    boxShadow: foc ? `0 0 0 3px rgba(45,80,22,0.07)` : "none",
    borderRadius: 12, padding: "10px 14px", fontSize: 14, fontFamily: "inherit",
    transition: "border-color 0.15s, box-shadow 0.15s",
    opacity: disabled ? 0.7 : 1,
    cursor: disabled ? "not-allowed" : "auto",
  };
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>{label}</label>
      {as === "textarea" ? (
        <textarea rows={3} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={{ ...base, resize: "none" }} />
      ) : as === "select" ? (
        <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={base}>
          {["active", "low-stock", "out-of-stock"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
          onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} style={base} />
      )}
    </div>
  );
}

function ImageDropzone({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          const res = await fetch("http://localhost:4000/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64, filename: file.name })
          });
          const json = await res.json();
          const url = json.data?.url || json.url || base64;
          onChange(url);
          toast.success("Image uploaded to Cloudinary!");
        } catch (err) {
          onChange(base64);
          toast.success("Image loaded successfully!");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-semibold text-[#2C2416]">Product Image (Drag & Drop or Local Upload)</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUploadFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e: any) => {
            if (e.target.files && e.target.files[0]) {
              handleUploadFile(e.target.files[0]);
            }
          };
          input.click();
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${dragOver ? "border-[#2D5016] bg-[#2D5016]/10" : "border-stone-300 bg-[#FAF8F5] hover:border-[#2D5016]"}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center py-4">
            <RefreshCw className="w-6 h-6 animate-spin text-[#2D5016] mb-2" />
            <p className="text-xs font-semibold text-[#2D5016]">Uploading image to Cloudinary...</p>
          </div>
        ) : value ? (
          <div className="space-y-3">
            <img src={value} alt="Uploaded product" className="max-h-36 mx-auto rounded-xl object-cover border" />
            <p className="text-[10px] text-[#8B7355] truncate max-w-xs mx-auto">{value}</p>
            <p className="text-xs text-[#2D5016] font-semibold underline">Click or drop another file to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#2D5016]/10 flex items-center justify-center text-[#2D5016]">
              <Camera className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#2C2416]">Drag and drop product image here</p>
            <p className="text-[10px] text-[#8B7355]">or click to select file from local computer</p>
          </div>
        )}
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-[#8B7355] mb-1">Or Paste Direct Image URL</label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border rounded-xl text-xs bg-[#FAF8F5] outline-none"
        />
      </div>
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, icon: Icon, size = "md", disabled = false, loading = false }: {
  children?: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger";
  onClick?: () => void; icon?: React.ElementType; size?: "sm" | "md"; disabled?: boolean; loading?: boolean;
}) {
  const st = { primary: { bg: C.green, text: "#fff", hover: C.greenDark }, secondary: { bg: C.greenFaint, text: C.green, hover: "rgba(45,80,22,0.13)" }, ghost: { bg: "transparent", text: C.muted, hover: C.greenFaint }, danger: { bg: "#FDECEA", text: C.error, hover: "#FAD6D6" } }[variant];
  const [hov, setHov] = useState(false);
  const pad = size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm";
  return (
    <motion.button onClick={onClick} disabled={disabled || loading} whileTap={{ scale: 0.96 }} transition={{ duration: 0.1 }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      className={`${pad} rounded-xl font-medium flex items-center gap-1.5 transition-colors duration-150 shrink-0`}
      style={{ backgroundColor: hov ? st.hover : st.bg, color: st.text, opacity: disabled ? 0.5 : 1, cursor: disabled || loading ? "not-allowed" : "pointer" }}>
      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </motion.button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Navigation",
    items: [
      { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard },
      { id: "products",   label: "Products",   icon: Package },
      { id: "orders",     label: "Orders",     icon: ShoppingBag, badge: 3 },
      { id: "wholesale",  label: "Wholesale",  icon: ClipboardList },
      { id: "website",    label: "Website",    icon: Globe },
      { id: "customers",  label: "Customers",  icon: Users },
      { id: "settings",   label: "Settings",   icon: Settings },
    ]
  }
];

function Sidebar({ page, setPage, collapsed, setCollapsed }: {
  page: string; setPage: (p: string) => void; collapsed: boolean; setCollapsed: (v: boolean) => void;
}) {
  return (
    <motion.aside animate={{ width: collapsed ? 72 : 256 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col overflow-hidden"
      style={{ backgroundColor: C.greenDark }}>
      <div className="flex items-center h-16 px-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${C.yellow}, #E8C030)` }}>
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.14 }} className="ml-3 overflow-hidden whitespace-nowrap">
              <p className="font-semibold text-sm leading-none text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Spiceora BOS</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Business Operations</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setCollapsed(!collapsed)}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto pr-1">
        {NAV_GROUPS.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <p className="text-[9px] font-bold uppercase tracking-wider px-3 text-stone-400/80 mb-1">{group.label}</p>
            )}
            {group.items.map(({ id, label, icon: Icon, badge }) => {
              const active = page === id;
              return (
                <motion.button key={id} onClick={() => setPage(id)}
                  className="w-full flex items-center gap-3 rounded-xl relative"
                  style={{ padding: "8px 12px" }}
                  animate={{ backgroundColor: active ? "rgba(212,146,26,0.14)" : "transparent", color: active ? "#E8A820" : "rgba(255,255,255,0.55)" }}
                  whileHover={{ backgroundColor: active ? "rgba(212,146,26,0.18)" : "rgba(255,255,255,0.06)", color: active ? "#E8A820" : "rgba(255,255,255,0.9)" }}
                  transition={{ duration: 0.15 }}>
                  {active && <motion.div layoutId="navInd" className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ backgroundColor: "#E8A820" }} />}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}
                        className="text-xs font-semibold flex-1 text-left whitespace-nowrap">{label}</motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && badge && (
                    <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 animate-pulse"
                      style={{ backgroundColor: C.orange, color: "white" }}>{badge}</span>
                  )}
                  {collapsed && badge && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: C.orange }} />}
                </motion.button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3 rounded-xl p-2 overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.yellow})` }}>AK</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white leading-none truncate">Arjun Kumar</p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>Head of Operations</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={() => toast("Signed out", { description: "You have been logged out." })}
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

// ─── Header ───────────────────────────────────────────────────
function Header({ page, offset, notifs, bellOpen, onBell, toggleDarkMode, darkMode, openCommandPalette }: {
  page: string; offset: number; notifs: typeof NOTIFS; bellOpen: boolean; onBell: () => void;
  toggleDarkMode: () => void; darkMode: boolean; openCommandPalette: () => void;
}) {
  const [sf, setSf] = useState(false);
  const unread = notifs.filter(n => !n.read).length;
  const title = {
    dashboard: "Dashboard",
    products: "Products",
    orders: "Orders",
    wholesale: "Wholesale",
    quotations: "Quotation Builder",
    catalog: "Product Catalog",
    website: "Website",
    customers: "Customers",
    settings: "Settings"
  }[page] ?? page;

  return (
    <header className="fixed top-0 right-0 h-16 flex items-center gap-3 px-6 z-30 transition-all duration-300"
      style={{ left: offset, backgroundColor: darkMode ? "#1F1A12" : "rgba(250,248,245,0.92)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${C.border}` }}>
      <h1 className="text-[17px] font-semibold flex-1" style={{ color: darkMode ? "#FFF" : C.charcoal, fontFamily: "'Playfair Display', serif" }}>{title}</h1>
      
      {/* Search Input triggering Command Palette */}
      <div onClick={openCommandPalette} className="flex items-center gap-2 rounded-xl px-3 py-2 overflow-hidden cursor-pointer w-44 bg-[#F0EDE8]/80 hover:bg-[#F0EDE8] transition-colors">
        <Search className="w-4 h-4 shrink-0 text-[#8B7355]" />
        <span className="text-xs text-[#8B7355] flex-1 text-left font-medium select-none font-sans">Search... <span className="font-mono opacity-60">⌘K</span></span>
      </div>

      {/* Dark Mode Toggle */}
      <button onClick={toggleDarkMode} className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all duration-150 hover:bg-[#F0EDE8] text-[#8B7355]">
        {darkMode ? <Sparkles className="w-5 h-5 text-amber-500" /> : <Clock className="w-5 h-5" />}
      </button>

      <div className="relative">
        <button onClick={onBell} className="w-9 h-9 rounded-xl flex items-center justify-center relative transition-all duration-150"
          style={{ backgroundColor: bellOpen ? C.greenFaint : "transparent", color: bellOpen ? C.green : C.muted }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.greenFaint; e.currentTarget.style.color = C.green; }}
          onMouseLeave={e => { if (!bellOpen) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = C.muted; } }}>
          <Bell className="w-5 h-5" />
          {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: C.orange, fontSize: 9 }}>{unread}</span>}
        </button>
        <AnimatePresence>
          {bellOpen && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 w-80 rounded-2xl overflow-hidden z-50"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}`, boxShadow: "0 12px 40px rgba(26,58,10,0.18)" }}>
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
                <p className="font-semibold text-sm" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>Notifications</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>{unread} unread</p>
              </div>
              {notifs.map(n => (
                <div key={n.id} className="px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors duration-100"
                   style={{ backgroundColor: n.read ? "transparent" : "rgba(212,146,26,0.04)" }}
                   onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                   onMouseLeave={e => (e.currentTarget.style.backgroundColor = n.read ? "transparent" : "rgba(212,146,26,0.04)")}>
                  <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: n.type === "order" ? C.greenFaint : n.type === "stock" ? C.orangeFaint : C.yellowFaint, color: n.type === "order" ? C.green : n.type === "stock" ? C.orange : C.yellow }}>
                    {n.type === "order" ? <ShoppingBag className="w-3.5 h-3.5" /> : n.type === "stock" ? <Package className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug" style={{ color: C.charcoal }}>{n.message}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted }}>{n.time}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: C.orange }} />}
                </div>
              ))}
              <div className="px-4 py-2.5" style={{ borderTop: `1px solid ${C.border}` }}>
                <button onClick={() => toast("All notifications marked as read")}
                  className="text-xs font-medium transition-colors duration-150" style={{ color: C.green }}>
                  Mark all as read →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Av name="Arjun Kumar" size={36} />
    </header>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function DashboardPage({ navigateTo }: { navigateTo: (p: string) => void }) {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  
  const products = (() => {
    try { return JSON.parse(localStorage.getItem("spiceora_products") || "[]"); } catch { return []; }
  })();
  const orders = (() => {
    try { return JSON.parse(localStorage.getItem("spiceora_orders") || "[]"); } catch { return []; }
  })();
  const inquiries = (() => {
    try { return JSON.parse(localStorage.getItem("spiceora_wholesale_inquiries") || "[]"); } catch { return []; }
  })();
  const testimonials = (() => {
    try { return JSON.parse(localStorage.getItem("spiceora_testimonials") || "[]"); } catch { return []; }
  })();

  const todayRevenue = orders.filter((o: any) => o.date === "2026-07-18" || o.date === "2024-12-28").reduce((s: number, o: any) => s + o.total, 0) || 0;
  const todayOrders = orders.filter((o: any) => o.date === "2026-07-18" || o.date === "2024-12-28").length || 0;
  const pendingOrdersCount = orders.filter((o: any) => o.status === "pending" || o.status === "processing").length || 0;
  const activeLeadsCount = inquiries.filter((i: any) => i.status === "new" || i.status === "Pending").length || 0;
  const lowStockCount = products.filter((p: any) => p.stock < 30).length;

  const catSplit = [
    { name: "Roots & Paste", value: 35, color: C.orange },
    { name: "Seeds & Pods", value: 25, color: C.yellow },
    { name: "Spice Blends", value: 40, color: C.green },
  ];

  const kpis = [
    { label: "Today's Revenue", value: todayRevenue, prefix: "₹", delta: 12.8, icon: DollarSign, color: C.green },
    { label: "Today's Orders", value: todayOrders, delta: 8.7, icon: ShoppingBag, color: C.orange },
    { label: "Pending Orders", value: pendingOrdersCount, delta: -3.1, icon: Clock, color: C.yellow },
    { label: "Wholesale Leads", value: activeLeadsCount, delta: 14.5, icon: ClipboardList, color: "#7A5C3A" },
    { label: "Low Stock Items", value: lowStockCount, delta: 0, icon: AlertTriangle, color: C.error },
  ];

  const tip = { contentStyle: { backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 12, color: C.charcoal, boxShadow: "0 4px 20px rgba(26,58,10,0.12)" }, cursor: { fill: "rgba(45,80,22,0.04)" } };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-5 group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${s.color}14`, color: s.color }}><s.icon className="w-5 h-5" /></div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${s.delta >= 0 ? "text-green-700" : "text-red-500"}`}>
                  {s.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{Math.abs(s.delta)}%
                </span>
              </div>
              <p className="text-xl font-bold mb-1" style={{ color: C.charcoal, fontFamily: "'Bodoni Moda', serif" }}>
                {s.prefix}{s.value}
              </p>
              <p className="text-xs" style={{ color: C.muted }}>{s.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-base" style={{ color: C.charcoal, fontFamily: "'Bodoni Moda', serif" }}>Revenue Overview</h3>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>Jan – Dec 2026</p>
              </div>
              <div className="flex gap-1.5 rounded-xl p-1 bg-[#F0EDE8]">
                {(["revenue", "orders"] as const).map(m => (
                  <button key={m} onClick={() => setMetric(m)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-150"
                    style={{ backgroundColor: metric === m ? C.card : "transparent", color: metric === m ? C.charcoal : C.muted, boxShadow: metric === m ? "0 1px 3px rgba(44,36,22,0.08)" : "none" }}>{m}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                <defs>
                  <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.green} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} axisLine={false} tickLine={false}
                  tickFormatter={v => metric === "revenue" ? `₹${(v / 1000).toFixed(0)}k` : String(v)} />
                <Tooltip {...tip} formatter={(v: number) => metric === "revenue" ? [`₹${v.toLocaleString()}`, "Revenue"] : [v.toLocaleString(), "Orders"]} />
                <Area type="monotone" dataKey={metric} stroke={C.green} strokeWidth={2} fill="url(#gr1)" dot={false} activeDot={{ r: 4, fill: C.green, stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
          <Card className="p-6 h-full flex flex-col justify-between">
            <h3 className="font-semibold text-base mb-4" style={{ color: C.charcoal, fontFamily: "'Bodoni Moda', serif" }}>Quick Controls</h3>
            <div className="grid grid-cols-2 gap-3 flex-1 items-center">
              {[
                { label: "New Product", action: () => navigateTo("products"), bg: C.greenFaint, color: C.green, icon: Plus },
                { label: "Add Recipe", action: () => navigateTo("recipes"), bg: C.orangeFaint, color: C.orange, icon: BookOpen },
                { label: "Add Coupon", action: () => navigateTo("coupons"), bg: C.yellowFaint, color: C.yellow, icon: Tag },
                { label: "Homepage CMS", action: () => navigateTo("homepage"), bg: "rgba(45,80,22,0.06)", color: "#7A5C3A", icon: Globe },
              ].map(action => (
                <button key={action.label} onClick={action.action} className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 border border-[#2C2416]/10 hover:shadow transition-all group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: action.bg, color: action.color }}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[#2C2416]">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C2416]/10">
              <h3 className="font-semibold text-base" style={{ color: C.charcoal, fontFamily: "'Bodoni Moda', serif" }}>Recent wholesale Leads</h3>
              <Btn variant="ghost" size="sm" onClick={() => navigateTo("wholesale")}>View all →</Btn>
            </div>
            <div className="divide-y divide-[#2C2416]/8">
              {inquiries.slice(0, 4).map((lead: any, idx: number) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors">
                  <div className="flex items-center gap-3">
                    <Av name={lead.businessName} size={36} />
                    <div>
                      <p className="text-sm font-semibold text-[#2C2416]">{lead.businessName}</p>
                      <p className="text-xs text-[#8B7355]">{lead.contactPerson} · {lead.email}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 capitalize">{lead.status}</span>
                </div>
              ))}
              {inquiries.length === 0 && (
                <div className="p-6 text-center text-xs text-[#8B7355]">No recent wholesale inquiries.</div>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6">
            <h3 className="font-semibold text-base mb-4" style={{ color: C.charcoal, fontFamily: "'Bodoni Moda', serif" }}>Category Split</h3>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={catSplit} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0} paddingAngle={2}>
                  {catSplit.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: C.card, border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {catSplit.map(d => (
                <div key={d.name} className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                  <p className="text-xs flex-1 truncate" style={{ color: C.charcoal }}>{d.name}</p>
                  <p className="text-xs font-semibold" style={{ color: C.muted }}>{d.value}%</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function blankProduct() {
  return {
    id: `P${Date.now()}`,
    name: "",
    category: "Roots & Paste",
    price: 50,
    prices: { p100: 29, p250: 65, p500: 129, p1000: 240 },
    stock: 150,
    lowStockThreshold: 30,
    sold: 0,
    rating: 5.0,
    status: "active",
    sku: `SPH-00${Date.now().toString().slice(-2)}`,
    origin: "India",
    description: ""
  };
}

function ProductsPage() {
  const [activeSubTab, setActiveSubTab] = useState<"all" | "categories" | "inventory" | "reviews">("all");
  
  // Products state
  const [products, setProducts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_products");
      return stored ? JSON.parse(stored) : INIT_PRODUCTS;
    } catch {
      return INIT_PRODUCTS;
    }
  });

  // Categories state
  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_categories");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const loadDbData = async () => {
    try {
      const resP = await fetch("http://localhost:4000/api/products");
      if (resP.ok) {
        const jsonP = await resP.json();
        const dataP = jsonP.data || jsonP;
        if (Array.isArray(dataP)) {
          setProducts(dataP);
          localStorage.setItem("spiceora_products", JSON.stringify(dataP));
        }
      }
      const resC = await fetch("http://localhost:4000/api/categories");
      if (resC.ok) {
        const jsonC = await resC.json();
        const dataC = jsonC.data || jsonC;
        if (Array.isArray(dataC)) {
          setCategories(dataC.map((c: any) => ({
            id: String(c.id),
            name: c.name,
            count: 0,
            description: c.description || ""
          })));
          localStorage.setItem("spiceora_categories", JSON.stringify(dataC));
        }
      }
    } catch (err) {
      console.warn("API connect error in Admin, using local state fallback:", err);
    }
  };

  useEffect(() => {
    loadDbData();
  }, []);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_testimonials");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Search & Filters
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");

  // Wizard Modal state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [form, setForm] = useState<any>(blankProduct());
  
  // Pricing Assistant helper state
  const [cogs, setCogs] = useState<number>(30);
  const [margin, setMargin] = useState<number>(30); // in percent

  // Inline Inventory editing state
  const [inventoryChanges, setInventoryChanges] = useState<Record<string, { stock: number; lowStockThreshold: number }>>({});

  useEffect(() => {
    localStorage.setItem("spiceora_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("spiceora_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("spiceora_testimonials", JSON.stringify(reviews));
  }, [reviews]);

  // Pricing Assistant calculation
  useEffect(() => {
    if (wizardStep === 4) {
      const calculatedBasePrice = Math.round(cogs / (1 - margin / 100));
      setForm(f => ({
        ...f,
        price: calculatedBasePrice,
        prices: {
          p100: Math.round(calculatedBasePrice * 0.6),
          p250: Math.round(calculatedBasePrice * 1.3),
          p500: Math.round(calculatedBasePrice * 2.4),
          p1000: Math.round(calculatedBasePrice * 4.5),
        }
      }));
    }
  }, [cogs, margin, wizardStep]);

  const handleStartAdd = () => {
    setForm(blankProduct());
    setEditTarget(null);
    setWizardStep(1);
    setCogs(30);
    setMargin(30);
    setWizardOpen(true);
  };

  const handleStartEdit = (p: any) => {
    setForm({
      ...p,
      imageUrl: p.imageUrl || p.image || "",
      prices: p.prices || { p100: Math.round(p.price * 0.6), p250: Math.round(p.price * 1.3), p500: Math.round(p.price * 2.4), p1000: Math.round(p.price * 4.5) },
      lowStockThreshold: p.lowStockThreshold || 30
    });
    setEditTarget(p);
    setWizardStep(1);
    setCogs(Math.round(p.price * 0.7));
    setMargin(30);
    setWizardOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    try {
      if (editTarget && !isNaN(Number(editTarget.id))) {
        await fetch(`http://localhost:4000/api/products/${editTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            categoryName: form.category,
            price: form.price,
            stock: form.stock,
            sku: form.sku,
            description: form.description,
            imageUrl: form.imageUrl || form.image
          })
        });
        toast.success("Product updated in database");
      } else {
        await fetch("http://localhost:4000/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            categoryName: form.category,
            price: form.price,
            stock: form.stock,
            sku: form.sku,
            description: form.description,
            imageUrl: form.imageUrl || form.image
          })
        });
        toast.success("Product created in database");
      }
    } catch (err) {
      console.error("Failed to save product to API:", err);
    }
    setWizardOpen(false);
    loadDbData();
  };

  const handleDeleteProduct = async (id: string | number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const numId = Number(id);
      if (!isNaN(numId)) {
        try {
          await fetch(`http://localhost:4000/api/products/${numId}`, { method: "DELETE" });
          toast.success("Product removed from database");
        } catch (err) {
          console.error("Failed to delete product from API:", err);
        }
      } else {
        toast.success("Product removed");
      }
      setProducts(prev => prev.filter(p => String(p.id) !== String(id)));
      loadDbData();
    }
  };


  // Inventory Save
  const handleSaveInventory = () => {
    setProducts(prev => prev.map(p => {
      const change = inventoryChanges[p.id];
      if (change) {
        return { ...p, stock: change.stock, lowStockThreshold: change.lowStockThreshold };
      }
      return p;
    }));
    setInventoryChanges({});
    toast.success("Inventory stock levels updated");
  };

  // Review Actions
  const handleReviewStatus = (id: string, newStatus: "approved" | "rejected" | "hidden") => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, approved: newStatus === "approved" } : r));
    toast.success(`Review marked as ${newStatus}`);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2C2416]/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Products</h2>
          <p className="text-xs text-[#8B7355]">Manage spice items, categories, stock counts, and customer reviews</p>
        </div>
        <div className="flex gap-2">
          {activeSubTab === "all" && <Btn icon={Plus} onClick={handleStartAdd}>Add Product</Btn>}
          {activeSubTab === "inventory" && Object.keys(inventoryChanges).length > 0 && (
            <Btn icon={Save} onClick={handleSaveInventory}>Save Stock Changes</Btn>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#2C2416]/10 w-fit">
        {[
          { id: "all", label: "All Products" },
          { id: "categories", label: "Categories" },
          { id: "inventory", label: "Inventory" },
          { id: "reviews", label: "Reviews" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeSubTab === tab.id ? "bg-[#2D5016] text-white shadow-sm" : "text-[#8B7355] hover:text-[#2C2416]"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar for Products and Inventory */}
      {(activeSubTab === "all" || activeSubTab === "inventory") && (
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[240px] flex items-center gap-2 border border-[#2C2416]/12 rounded-xl px-3 py-2 bg-white shadow-sm">
            <Search className="w-4 h-4 text-[#8B7355]" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search product name or SKU..." className="bg-transparent outline-none text-xs w-full text-[#2C2416]" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="bg-white border border-[#2C2416]/12 rounded-xl px-4 py-2 text-xs text-[#2C2416] outline-none cursor-pointer">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* SUB-TAB 1: ALL PRODUCTS */}
      {activeSubTab === "all" && (
        <Card className="overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
                {["Product", "Category", "Base Price", "Stock Level", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2416]/8">
              {products
                .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
                .filter(p => catFilter === "all" || p.category === catFilter)
                .map(p => (
                  <tr key={p.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#FAF8F5] flex items-center justify-center">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-[10px] text-[#8B7355] px-1">No image</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#2C2416]">{p.name}</p>
                          <p className="text-[10px] text-[#8B7355] font-mono truncate">{p.sku} | {p.origin}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#2C2416]">{p.category}</td>
                    <td className="px-5 py-4 font-semibold text-[#2D5016]">₹{p.price}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${p.stock < p.lowStockThreshold ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                        {p.stock} units {p.stock < p.lowStockThreshold && "(Low)"}
                      </span>
                    </td>
                    <td className="px-5 py-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === "active" ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleStartEdit(p)} className="p-1.5 hover:bg-[#FAF8F5] rounded text-[#8B7355]"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#8B7355]">
                    No products cataloged in this filter view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* SUB-TAB 2: CATEGORIES */}
      {activeSubTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <Card key={cat.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setCatFilter(cat.name); setActiveSubTab("all"); }}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 font-bold uppercase">{cat.id}</span>
                </div>
                <h3 className="font-semibold text-lg text-[#2C2416] mb-1">{cat.name}</h3>
                <p className="text-xs text-[#8B7355] leading-relaxed mb-4">{cat.description}</p>
              </div>
              <div className="border-t border-[#2C2416]/6 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-[#8B7355] uppercase font-semibold">Total Linked</span>
                <span className="text-xs font-semibold text-[#2D5016]">
                  {products.filter(p => p.category === cat.name).length} Products
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: INVENTORY */}
      {activeSubTab === "inventory" && (
        <Card className="overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
                {["Product Details", "Current Stock Level", "Low Stock Threshold Alert", "Status"].map(h => (
                  <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2416]/8">
              {products
                .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()))
                .filter(p => catFilter === "all" || p.category === catFilter)
                .map(p => {
                  const currentStock = inventoryChanges[p.id]?.stock ?? p.stock;
                  const currentThreshold = inventoryChanges[p.id]?.lowStockThreshold ?? p.lowStockThreshold ?? 30;
                  return (
                    <tr key={p.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-sm text-[#2C2416]">{p.name}</p>
                        <p className="text-[10px] text-[#8B7355] font-mono">{p.sku}</p>
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          value={currentStock}
                          onChange={e => setInventoryChanges({
                            ...inventoryChanges,
                            [p.id]: { stock: Number(e.target.value), lowStockThreshold: currentThreshold }
                          })}
                          className="w-20 px-2 py-1 border rounded-lg bg-[#FAF8F5] outline-none text-[#2C2416] font-semibold"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <input
                          type="number"
                          value={currentThreshold}
                          onChange={e => setInventoryChanges({
                            ...inventoryChanges,
                            [p.id]: { stock: currentStock, lowStockThreshold: Number(e.target.value) }
                          })}
                          className="w-20 px-2 py-1 border rounded-lg bg-[#FAF8F5] outline-none text-[#8B7355]"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${currentStock < currentThreshold ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                          {currentStock < currentThreshold ? "Restock Required" : "Healthy Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </Card>
      )}

      {/* SUB-TAB 4: REVIEWS */}
      {activeSubTab === "reviews" && (
        <Card className="overflow-hidden">
          <div className="p-4 bg-[#FAF8F5] border-b border-[#2C2416]/10 flex gap-2">
            {["all", "new", "approved", "rejected", "hidden"].map(status => (
              <button
                key={status}
                onClick={() => setReviewFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${reviewFilter === status ? "bg-[#2C2416] text-white border-[#2C2416]" : "bg-white text-[#8B7355] border-stone-200"}`}
              >
                {status}
              </button>
            ))}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
                {["Review Comment", "Customer", "Product", "Rating", "Status", "Date", "Actions"].map(h => (
                  <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2C2416]/8">
              {reviews
                .filter(r => reviewFilter === "all" || r.status === reviewFilter || (reviewFilter === "new" && !r.status))
                .map(r => (
                  <tr key={r.id}>
                    <td className="px-5 py-4 max-w-xs italic text-[#2C2416]">"{r.comment}"</td>
                    <td className="px-5 py-4 font-semibold text-[#2C2416]">{r.name}</td>
                    <td className="px-5 py-4">{r.product || "General"}</td>
                    <td className="px-5 py-4 text-amber-500 font-bold">{"★".repeat(r.rating)}</td>
                    <td className="px-5 py-4 capitalize">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === "approved" || r.approved ? "bg-green-100 text-green-800" : r.status === "rejected" ? "bg-red-100 text-red-800" : "bg-stone-100 text-stone-700"}`}>
                        {r.status || "new"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#8B7355]">{r.date || "N/A"}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleReviewStatus(r.id, "approved")} className="px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100">Approve</button>
                        <button onClick={() => handleReviewStatus(r.id, "rejected")} className="px-2 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100">Reject</button>
                        <button onClick={() => handleReviewStatus(r.id, "hidden")} className="px-2 py-1 rounded bg-stone-100 text-stone-700 hover:bg-stone-200">Hide</button>
                      </div>
                    </td>
                  </tr>
                ))}
              {reviews.filter(r => reviewFilter === "all" || r.status === reviewFilter).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#8B7355]">
                    No reviews in this status bucket.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* 5-STEP PRODUCT ADD/EDIT WIZARD */}
      <AnimatePresence>
        {wizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(26,23,20,0.5)", backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              
              {/* Progress Stepper Indicator */}
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-lg font-serif text-[#2C2416]">{editTarget ? "Edit Product Wizard" : "Create Product Wizard"}</h3>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(s => (
                    <div key={s} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${wizardStep === s ? "bg-[#2D5016] text-white" : wizardStep > s ? "bg-green-100 text-[#2D5016]" : "bg-stone-100 text-stone-400"}`}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* STEP 1: CATEGORY SELECTION */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[#8B7355]">Step 1: Choose the Product Sourcing Category</p>
                  <div className="grid grid-cols-1 gap-2">
                    {categories.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setForm({ ...form, category: c.name });
                          setWizardStep(2);
                        }}
                        className={`p-4 rounded-xl border text-left flex justify-between items-center transition-all ${form.category === c.name ? "border-[#2D5016] bg-[#2D5016]/5" : "border-stone-200 hover:bg-[#FAF8F5]"}`}
                      >
                        <div>
                          <p className="font-semibold text-xs text-[#2C2416]">{c.name}</p>
                          <p className="text-[10px] text-[#8B7355] mt-0.5">{c.description}</p>
                        </div>
                        {form.category === c.name && <CheckCircle className="w-4 h-4 text-[#2D5016]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: PRODUCT INFO */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[#8B7355]">Step 2: Basic Product Attributes</p>
                  <div className="space-y-4">
                    <Field label="Spice Item Name" value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Kashmiri Chilli Powder" />
                    <Field label="Sourcing Origin Location" value={form.origin} onChange={v => setForm({ ...form, origin: v })} placeholder="e.g. Salem, Tamil Nadu" />
                    <ImageDropzone value={form.imageUrl} onChange={url => setForm({ ...form, imageUrl: url })} />
                    <Field label="Product Description" value={form.description} onChange={v => setForm({ ...form, description: v })} as="textarea" placeholder="Describe taste profile, heat levels, and milling style..." />
                  </div>
                </div>
              )}

              {/* STEP 3: INVENTORY */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[#8B7355]">Step 3: Stock Levels & Sku Registry</p>
                  <div className="space-y-3">
                    <Field label="Product SKU Code" value={form.sku} onChange={v => setForm({ ...form, sku: v })} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field type="number" label="Initial Sacked Stock" value={form.stock} onChange={v => setForm({ ...form, stock: Number(v) })} />
                      <Field type="number" label="Low-stock Restock Alert Threshold" value={form.lowStockThreshold} onChange={v => setForm({ ...form, lowStockThreshold: Number(v) })} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: PRICING (WITH PROFIT MARGIN ASSISTANT) */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[#8B7355]">Step 4: Commercial Pricing Assistant</p>
                  <SmartPricingAssistant
                    initialCogs={cogs}
                    initialMargin={margin}
                    initialGst={5}
                    onPriceCalculated={({ basePrice, variants }) => {
                      setForm((prev: any) => ({
                        ...prev,
                        price: basePrice,
                        prices: variants
                      }));
                    }}
                  />
                </div>
              )}

              {/* STEP 5: PUBLISH & CONFIRM */}
              {wizardStep === 5 && (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-[#8B7355]">Step 5: Review & Publish Settings</p>
                  <div className="p-4 bg-[#FAF8F5] rounded-xl border space-y-3 text-xs">
                    <div className="flex justify-between"><span className="text-[#8B7355]">Product Name:</span><span className="font-semibold">{form.name}</span></div>
                    <div className="flex justify-between"><span className="text-[#8B7355]">Category Selected:</span><span className="font-semibold">{form.category}</span></div>
                    <div className="flex justify-between"><span className="text-[#8B7355]">SKU / Sourcing Origin:</span><span className="font-semibold">{form.sku} ({form.origin})</span></div>
                    <div className="flex justify-between"><span className="text-[#8B7355]">Base Catalog Price:</span><span className="font-bold text-[#2D5016]">₹{form.price}</span></div>
                    <div className="flex justify-between"><span className="text-[#8B7355]">Weight Packaging Variants:</span><span>100g (₹{form.prices?.p100}) | 250g (₹{form.prices?.p250}) | 500g (₹{form.prices?.p500}) | 1kg (₹{form.prices?.p1000})</span></div>
                    <div className="flex justify-between"><span className="text-[#8B7355]">Initial Stock Level:</span><span className="font-semibold">{form.stock} units</span></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#8B7355] block mb-1">Storefront Visibility Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none">
                      <option value="active">Active (Visible immediately on Client Storefront)</option>
                      <option value="draft">Draft (Saved in warehouse registry only)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Wizard navigation footer */}
              <div className="flex gap-3 pt-4 border-t">
                {wizardStep > 1 && (
                  <button onClick={() => setWizardStep(prev => prev - 1)} className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-stone-50">
                    Back
                  </button>
                )}
                <button onClick={() => setWizardOpen(false)} className="px-4 py-2 border rounded-xl text-xs text-[#8B7355] hover:bg-stone-50 ml-auto">
                  Cancel
                </button>
                {wizardStep < 5 ? (
                  <Btn onClick={() => setWizardStep(prev => prev + 1)}>
                    Continue
                  </Btn>
                ) : (
                  <Btn onClick={handleSaveProduct}>
                    {editTarget ? "Update Catalog" : "Publish to Storefront"}
                  </Btn>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_orders");
      return stored ? JSON.parse(stored) : INIT_ORDERS;
    } catch {
      return INIT_ORDERS;
    }
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawerTarget, setDrawerTarget] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("spiceora_orders", JSON.stringify(orders));
  }, [orders]);

  // Reset page on search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query, statusFilter]);

  // Simulated initial mount load
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  const handleReload = () => {
    setLoading(true);
    setHasError(false);
    setTimeout(() => setLoading(false), 600);
  };

  const updateStatus = (orderId: string, nextStatus: string) => {
    setUpdating(true);
    setTimeout(() => {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
      if (drawerTarget && drawerTarget.id === orderId) {
        setDrawerTarget((prev: any) => ({ ...prev, status: nextStatus }));
      }
      setUpdating(false);
      toast.success(`Order ${orderId} updated to ${nextStatus}`);
    }, 400);
  };

  const handleExportCSV = () => {
    const headers = ["Order ID", "Customer", "Date", "Items", "Total", "Status", "Location"];
    const rows = orders.map(o => [o.id, o.customer, o.date, o.items, o.total, o.status, o.location]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `spiceora_orders_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully");
  };

  const filtered = orders
    .filter(o => statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase())
    .filter(o => o.id.toLowerCase().includes(query.toLowerCase()) || o.customer.toLowerCase().includes(query.toLowerCase()));

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Retail Orders Desk</h2>
          <p className="text-xs text-[#8B7355]">Manage consumer order fulfillment, state status, and receipts</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setHasError(prev => !prev)} 
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            {hasError ? "Clear Mock Error" : "Simulate Server Error"}
          </button>
          <Btn icon={Download} onClick={handleExportCSV} variant="secondary">Export CSV</Btn>
        </div>
      </div>

      {hasError ? (
        <Card className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-red-100 bg-red-50/10">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-red-800">Connection Failed</h3>
            <p className="text-xs text-red-600 max-w-sm">
              We encountered a network error while retrieving real-time retail transaction records. Check server connection.
            </p>
          </div>
          <div className="flex gap-2">
            <Btn variant="primary" onClick={handleReload}>Retry Connection</Btn>
            <button onClick={() => setHasError(false)} className="text-xs font-semibold text-stone-500 hover:text-stone-700">Dismiss</button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex gap-3 bg-white p-4 rounded-2xl border border-[#2C2416]/10 flex-wrap sm:flex-nowrap">
            <div className="flex-1 flex items-center gap-2 border border-[#2C2416]/12 rounded-xl px-3 py-2 bg-[#FAF8F5]">
              <Search className="w-4 h-4 text-[#8B7355]" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search Order ID or customer..." className="bg-transparent outline-none text-xs w-full text-[#2C2416]" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#FAF8F5] border border-[#2C2416]/12 rounded-xl px-4 py-2 text-xs text-[#2C2416] outline-none cursor-pointer">
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <Card className="overflow-hidden p-8 flex flex-col items-center justify-center space-y-3 min-h-[300px]">
              <RefreshCw className="w-8 h-8 text-[#2D5016] animate-spin" />
              <p className="text-xs text-[#8B7355] animate-pulse">Loading transaction logs...</p>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#8B7355] border border-dashed border-[#2C2416]/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#2C2416]">No retail orders found</p>
                <p className="text-xs text-[#8B7355] max-w-xs">There are no orders that match your search or filter configurations.</p>
              </div>
              {(query || statusFilter !== "all") && (
                <Btn variant="secondary" size="sm" onClick={() => { setQuery(""); setStatusFilter("all"); }}>Reset Filters</Btn>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
                        {["Order ID", "Customer", "Date", "Items Count", "Total Amount", "Status", "Action"].map(h => (
                          <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2C2416]/8">
                      {paginated.map(o => (
                        <tr key={o.id} onClick={() => setDrawerTarget(o)} className="hover:bg-[#FAF8F5]/50 transition-colors cursor-pointer">
                          <td className="px-5 py-4 font-mono font-semibold text-[#2D5016]">{o.id}</td>
                          <td className="px-5 py-4 font-semibold text-[#2C2416]">{o.customer}</td>
                          <td className="px-5 py-4 text-[#8B7355]">{o.date}</td>
                          <td className="px-5 py-4">{o.items} items</td>
                          <td className="px-5 py-4 font-semibold text-[#2C2416]">₹{o.total}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase ${o.status === "delivered" ? "bg-green-50 text-green-700" : o.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button className="p-1.5 text-[#8B7355] hover:bg-[#2C2416]/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 text-xs text-[#8B7355] bg-white p-3 rounded-xl border border-[#2C2416]/10">
                  <p>Showing <span className="font-semibold text-[#2C2416]">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-semibold text-[#2C2416]">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-semibold text-[#2C2416]">{filtered.length}</span> orders</p>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      disabled={currentPage === 1}
                      className="px-2.5 py-1.5 rounded-lg border border-[#2C2416]/10 text-stone-600 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${currentPage === p ? "bg-[#2D5016] text-white" : "border border-[#2C2416]/10 text-stone-600 bg-white hover:bg-stone-50"}`}
                      >
                        {p}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                      disabled={currentPage === totalPages}
                      className="px-2.5 py-1.5 rounded-lg border border-[#2C2416]/10 text-stone-600 bg-white hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Order Details Drawer */}
      <AnimatePresence>
        {drawerTarget && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setDrawerTarget(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#2C2416]/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#2C2416]">Retail Transaction</h3>
                    <p className="text-xs text-[#8B7355] font-mono">{drawerTarget.id}</p>
                  </div>
                  <button onClick={() => setDrawerTarget(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FAF8F5]"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#2C2416]/8">
                    <p className="text-[10px] font-bold text-[#8B7355] uppercase tracking-widest mb-2">Customer Profile</p>
                    <p className="text-sm font-semibold text-[#2C2416]">{drawerTarget.customer}</p>
                    <p className="text-xs text-[#8B7355] mt-1">Delivery Address: {drawerTarget.location}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#8B7355] uppercase tracking-widest block mb-2">Order Items</p>
                    <div className="space-y-2 border border-[#2C2416]/8 p-3 rounded-xl">
                      <div className="flex items-center justify-between text-xs py-1 border-b border-[#2C2416]/6">
                        <span className="text-[#8B7355]">General Spices Pack (Weight Variant)</span>
                        <span className="font-semibold">{drawerTarget.items} items</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 font-semibold text-[#2C2416]">
                        <span>Subtotal</span>
                        <span>₹{drawerTarget.total}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#8B7355] uppercase tracking-widest block mb-2">Fulfillment Status</p>
                    <div className="flex gap-2">
                      {["pending", "processing", "shipped", "delivered"].map(st => (
                        <button key={st} onClick={() => updateStatus(drawerTarget.id, st)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-semibold uppercase border transition-all ${drawerTarget.status.toLowerCase() === st ? "bg-[#2D5016] border-[#2D5016] text-white shadow-sm" : "bg-[#FAF8F5] border-[#2C2416]/12 text-[#2C2416] hover:bg-[#FAF8F5]/80"}`}>
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_categories");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [products] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_products");
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [editTarget, setEditTarget] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ id: "", name: "", description: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [viewProductsFor, setViewProductsFor] = useState<any | null>(null);

  useEffect(() => {
    localStorage.setItem("spiceora_categories", JSON.stringify(categories));
  }, [categories]);

  const handleEdit = (cat: any) => {
    setForm({ ...cat });
    setEditTarget(cat);
  };

  const handleSave = async () => {
    // Update locally; server-side update endpoint is not implemented for partial edits, so keep local update
    setCategories(prev => prev.map(c => c.id === form.id ? { ...form } : c));
    setEditTarget(null);
    toast.success("Category updated successfully");
  };

  const handleCreateCategory = async () => {
    const name = createForm.name.trim();
    if (!name) return toast.error('Category name is required');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const res = await fetch('http://localhost:4000/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, description: createForm.description })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error((json && json.message) || 'Failed to create');
      // refetch categories from API to get canonical IDs
      const resC = await fetch('http://localhost:4000/api/categories');
      const jsonC = await resC.json();
      const dataC = jsonC.data || jsonC;
      setCategories(dataC.map((c: any) => ({ id: String(c.id), name: c.name, count: 0, description: c.description || '' })));
      setCreateOpen(false);
      setCreateForm({ name: '', description: '' });
      toast.success('Category created');
    } catch (err: any) {
      console.error('Create category failed', err);
      toast.error(err?.message || 'Failed to create category');
    }
  };

  const openViewProducts = (cat: any) => {
    // Show products related to this category by matching name or id
    const related = products.filter(p => String(p.categoryId) === String(cat.id) || String(p.category) === String(cat.name) || (p.category && p.category.name === cat.name));
    setViewProductsFor({ ...cat, products: related });
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Categories CMS</h2>
          <p className="text-xs text-[#8B7355]">Manage storefront filter categories, headings, and descriptions</p>
        </div>
        <div>
          <Btn onClick={() => setCreateOpen(true)} icon={Plus}>New Category</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map(cat => (
          <Card key={cat.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 font-bold uppercase">{cat.id}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(cat)} className="p-1.5 text-[#8B7355] hover:bg-[#2C2416]/10 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openViewProducts(cat)} className="p-1.5 text-[#8B7355] hover:bg-[#2C2416]/10 rounded-lg transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-[#2C2416] mb-1">{cat.name}</h3>
              <p className="text-xs text-[#8B7355] line-clamp-3 mb-4 leading-relaxed">{cat.description}</p>
            </div>
            <div className="border-t border-[#2C2416]/6 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-[#8B7355] uppercase font-semibold">Status</span>
              <span className="text-xs font-semibold text-[#2D5016]">Active on Storefront</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setCreateOpen(false)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-lg font-serif text-[#2C2416]">Create New Category</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Display Name</label>
                  <input value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Short Description</label>
                  <textarea rows={3} value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCreateOpen(false)} className="flex-1 py-2 text-xs font-semibold border border-[#2C2416]/10 rounded-xl hover:bg-[#FAF8F5]">Cancel</button>
                <Btn onClick={handleCreateCategory} className="flex-1">Create Category</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setEditTarget(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-lg font-serif text-[#2C2416]">Edit Category Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Display Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Short Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditTarget(null)} className="flex-1 py-2 text-xs font-semibold border border-[#2C2416]/10 rounded-xl hover:bg-[#FAF8F5]">Cancel</button>
                <Btn onClick={handleSave} className="flex-1">Save Category</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Products Modal */}
      <AnimatePresence>
        {viewProductsFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setViewProductsFor(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-lg font-serif text-[#2C2416]">Products in {viewProductsFor.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {viewProductsFor.products.length === 0 ? <p className="text-sm text-[#8B7355]">No products linked to this category yet.</p> : viewProductsFor.products.map((p:any) => (
                  <div key={p.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <img src={p.imageUrl || p.image || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&fit=crop'} alt={p.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div>
                        <p className="font-semibold text-sm text-[#2C2416]">{p.name}</p>
                        <p className="text-xs text-[#8B7355]">₹{p.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => setViewProductsFor(null)} className="py-2 px-4 rounded-xl border">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_collections");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("spiceora_collections", JSON.stringify(collections));
  }, [collections]);

  const toggleStatus = (id: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    toast.success("Collection status changed");
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Collections CMS</h2>
        <p className="text-xs text-[#8B7355]">Organize spice items into Best Sellers, Holiday Offers, or custom curated groups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map(col => (
          <Card key={col.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-50 text-amber-700 font-bold uppercase">{col.id}</span>
                <span className={`text-[10px] font-semibold uppercase ${col.active ? "text-green-600" : "text-stone-400"}`}>
                  {col.active ? "Enabled" : "Disabled"}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-[#2C2416] mb-1">{col.name}</h3>
              <p className="text-xs text-[#8B7355] mt-1 font-semibold">{col.products.length} products linked</p>
            </div>
            <div className="border-t border-[#2C2416]/6 pt-4 flex gap-2">
              <button onClick={() => toggleStatus(col.id)} className="w-full py-2 bg-[#FAF8F5] border border-[#2C2416]/12 text-xs font-semibold text-[#2C2416] rounded-xl hover:bg-[#FAF8F5]/80">
                {col.active ? "Disable Collection" : "Enable Collection"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CustomersPage() {
  const [customers] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_customers");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<any | null>(null);
  const [drawerTab, setDrawerTab] = useState<"info" | "orders" | "products" | "timeline">("info");

  const allOrders: any[] = (() => { try { const s = localStorage.getItem("spiceora_orders"); return s ? JSON.parse(s) : []; } catch { return []; } })();
  const allReviews: any[] = (() => { try { const s = localStorage.getItem("spiceora_testimonials"); return s ? JSON.parse(s) : []; } catch { return []; } })();

  const customerOrders = drawer ? allOrders.filter(o => o.customer?.toLowerCase() === drawer.name?.toLowerCase()) : [];
  const customerReviews = drawer ? allReviews.filter(r => r.name?.toLowerCase() === drawer.name?.toLowerCase()) : [];

  const filtered = customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.email.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Customers Directory</h2>
        <p className="text-xs text-[#8B7355]">Review registered profiles, transaction frequency, and lifetime value</p>
      </div>

      <div className="flex gap-3 bg-white p-4 rounded-2xl border border-[#2C2416]/10">
        <div className="flex-1 flex items-center gap-2 border border-[#2C2416]/12 rounded-xl px-3 py-2 bg-[#FAF8F5]">
          <Search className="w-4 h-4 text-[#8B7355]" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search client name or email..." className="bg-transparent outline-none text-xs w-full text-[#2C2416]" />
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
              {["Client ID", "Name", "Email", "Location", "Retail Orders", "Total Spent (LTV)", "Details"].map(h => (
                <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2C2416]/8">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                <td className="px-5 py-4 font-mono font-medium text-[#8B7355]">{c.id}</td>
                <td className="px-5 py-4 font-semibold text-[#2C2416]">{c.name}</td>
                <td className="px-5 py-4">{c.email}</td>
                <td className="px-5 py-4 text-[#8B7355]">{c.location}</td>
                <td className="px-5 py-4">{c.orders} orders</td>
                <td className="px-5 py-4 font-semibold text-[#2C2416]">₹{c.ltv}</td>
                <td className="px-5 py-4">
                  <button onClick={() => setDrawer(c)} className="p-1 text-[#8B7355] hover:bg-[#2C2416]/10 rounded-lg"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Customer details Drawer */}
      <AnimatePresence>
        {drawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setDrawer(null)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto">
              <div className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#2C2416]/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Av name={drawer.name} size={48} />
                    <div>
                      <p className="font-bold text-base text-[#2C2416]">{drawer.name}</p>
                      <p className="text-xs text-[#8B7355]">{drawer.email}</p>
                      <p className="text-[10px] text-[#8B7355] mt-0.5">Joined: {drawer.joined || "N/A"} · {drawer.phone || "No phone"}</p>
                    </div>
                  </div>
                  <button onClick={() => setDrawer(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FAF8F5] shrink-0"><X className="w-4 h-4" /></button>
                </div>

                {/* LTV summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border text-center">
                    <p className="text-[10px] text-[#8B7355] uppercase font-bold">Lifetime Value</p>
                    <p className="font-bold text-sm text-[#2D5016] mt-1">₹{drawer.ltv?.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border text-center">
                    <p className="text-[10px] text-[#8B7355] uppercase font-bold">Total Orders</p>
                    <p className="font-bold text-sm text-[#2C2416] mt-1">{drawer.orders}</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border text-center">
                    <p className="text-[10px] text-[#8B7355] uppercase font-bold">Avg. Order</p>
                    <p className="font-bold text-sm text-[#2C2416] mt-1">₹{drawer.orders ? Math.round(drawer.ltv / drawer.orders).toLocaleString('en-IN') : 0}</p>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-1.5 bg-[#FAF8F5] p-1 rounded-xl border border-[#2C2416]/10">
                  {(["info", "orders", "products", "timeline"] as const).map(t => (
                    <button key={t} onClick={() => setDrawerTab(t)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${drawerTab === t ? "bg-[#2D5016] text-white" : "text-[#8B7355] hover:text-[#2C2416]"}`}>
                      {t === "info" ? "Info" : t === "orders" ? "Orders" : t === "products" ? "Products" : "Timeline"}
                    </button>
                  ))}
                </div>

                {/* Tab: Info */}
                {drawerTab === "info" && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 rounded-xl border space-y-2.5">
                      <p className="font-bold text-[#2C2416] text-sm mb-2">Contact Information</p>
                      <div className="flex justify-between"><span className="text-[#8B7355]">Phone:</span><span className="font-semibold">{drawer.phone || "+91 98100 12345"}</span></div>
                      <div className="flex justify-between"><span className="text-[#8B7355]">Email:</span><span className="font-semibold">{drawer.email}</span></div>
                      <div className="flex justify-between"><span className="text-[#8B7355]">Location:</span><span className="font-semibold">{drawer.location}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border bg-[#FAF8F5]/60">
                        <p className="font-bold text-[#8B7355] mb-1 text-[10px] uppercase">Billing Address</p>
                        <p className="text-[11px] leading-relaxed text-[#2C2416]">102 Spice Towers,<br />{drawer.location}</p>
                      </div>
                      <div className="p-3 rounded-xl border bg-[#FAF8F5]/60">
                        <p className="font-bold text-[#8B7355] mb-1 text-[10px] uppercase">Shipping Address</p>
                        <p className="text-[11px] leading-relaxed text-[#2C2416]">102 Spice Towers,<br />{drawer.location}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Orders */}
                {drawerTab === "orders" && (
                  <div className="space-y-3 text-xs">
                    <p className="font-bold text-sm text-[#2C2416]">Order History & Invoices</p>
                    {customerOrders.length > 0 ? customerOrders.map(o => (
                      <div key={o.id} className="p-3 border rounded-xl flex justify-between items-center bg-[#FAF8F5]/30">
                        <div>
                          <p className="font-semibold text-[#2C2416]">{o.id}</p>
                          <p className="text-[10px] text-[#8B7355]">{o.date} · {o.items} items · {o.status}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#2D5016]">₹{o.total}</span>
                          <button onClick={() => toast.success(`Invoice ${o.id} downloaded`)} className="p-1 rounded bg-[#2D5016]/10 text-[#2D5016] hover:bg-[#2D5016]/20">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 border border-dashed rounded-xl text-center text-[#8B7355]">No orders found in retail sales log for this customer.</div>
                    )}
                  </div>
                )}

                {/* Tab: Products & Reviews */}
                {drawerTab === "products" && (
                  <div className="space-y-4 text-xs">
                    <div>
                      <p className="font-bold text-sm text-[#2C2416] mb-2">Purchased Products</p>
                      <div className="p-3 border rounded-xl space-y-2 bg-[#FAF8F5]/40">
                        {[{ name: "Chilli Powder", qty: 3, last: "18/07/2026" }, { name: "Garam Masala", qty: 1, last: "15/07/2026" }].map((item, i) => (
                          <div key={i} className="flex justify-between items-center py-1 border-b border-stone-100 last:border-0">
                            <span className="font-semibold text-[#2C2416]">{item.name}</span>
                            <span className="text-[#8B7355]">{item.qty} units · Last: {item.last}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#2C2416] mb-2">Reviews Submitted</p>
                      {customerReviews.length > 0 ? customerReviews.map(r => (
                        <div key={r.id} className="p-3 border rounded-xl bg-white space-y-1 mb-2">
                          <div className="flex justify-between"><span className="font-semibold text-[#2D5016]">{r.product}</span><span className="text-amber-500">{"★".repeat(r.rating)}</span></div>
                          <p className="text-[#8B7355] italic">"{r.comment}"</p>
                        </div>
                      )) : <p className="text-[#8B7355] italic">No reviews submitted by this customer.</p>}
                    </div>
                  </div>
                )}

                {/* Tab: Timeline */}
                {drawerTab === "timeline" && (
                  <div className="space-y-3 text-xs">
                    <p className="font-bold text-sm text-[#2C2416]">Activity Timeline</p>
                    <div className="relative pl-6 border-l-2 border-[#2D5016]/20 space-y-5">
                      {[
                        { label: "Latest Order Delivered", date: "28/12/2024", detail: "Order delivered to " + drawer.location, active: true },
                        { label: "First Order Placed", date: "24/12/2024", detail: "Placed first order containing Chilli and Garam Masala", active: false },
                        { label: "Account Registered", date: drawer.joined || "15/03/2025", detail: "Profile verified on Spiceora storefront portal", active: false }
                      ].map((ev, idx) => (
                        <div key={idx} className="relative">
                          <div className={`absolute -left-[30px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${ev.active ? "bg-[#2D5016]" : "bg-[#2D5016]/30"}`} />
                          <p className="font-bold text-[#2C2416]">{ev.label}</p>
                          <p className="text-[10px] text-[#8B7355]">{ev.date}</p>
                          <p className="text-[11px] text-[#8B7355] mt-0.5">{ev.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Analytics ────────────────────────────────────────────────
function FeedbackPage() {
  const [reviews, setReviews] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_testimonials");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<"pending" | "approved">("approved");

  useEffect(() => {
    localStorage.setItem("spiceora_testimonials", JSON.stringify(reviews));
  }, [reviews]);

  const toggleApproval = (id: string) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
    toast.success("Review approval status changed");
  };

  const handleDelete = (id: string) => {
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success("Review removed");
  };

  const filtered = reviews.filter(r => activeTab === "approved" ? r.approved : !r.approved);

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Feedback & Reviews</h2>
        <p className="text-xs text-[#8B7355]">Review client-submitted feedback and approve testimonials displayed on the homepage</p>
      </div>

      <div className="flex gap-2 border-b border-[#2C2416]/10 pb-px">
        {(["approved", "pending"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-semibold capitalize border-b-2 transition-all ${activeTab === tab ? "border-[#2D5016] text-[#2D5016]" : "border-transparent text-[#8B7355] hover:text-[#2C2416]"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map(r => (
          <Card key={r.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#2C2416]">{r.name}</span>
                <span className="text-xs text-amber-500">{"★".repeat(r.rating)}</span>
              </div>
              <p className="text-xs text-[#8B7355] italic mb-4 leading-relaxed">"{r.comment}"</p>
            </div>
            <div className="border-t border-[#2C2416]/6 pt-4 flex items-center justify-between">
              <span className="text-[10px] text-[#8B7355] uppercase font-bold">{r.product || "General Spice"}</span>
              <div className="flex gap-2">
                <button onClick={() => toggleApproval(r.id)} className="px-3 py-1.5 bg-[#FAF8F5] border border-[#2C2416]/12 text-[10px] font-bold text-[#2C2416] rounded-xl hover:bg-[#FAF8F5]/80">
                  {r.approved ? "Hide" : "Approve"}
                </button>
                <button onClick={() => handleDelete(r.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────────
function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [twoFAOpen, setTwoFAOpen] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);

  const [contacts, setContacts] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_contact_settings");
      return stored ? JSON.parse(stored) : { whatsapp: "", phone: "", email: "", hours: "" };
    } catch {
      return { whatsapp: "", phone: "", email: "", hours: "" };
    }
  });

  const [taxes, setTaxes] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_tax_settings");
      return stored ? JSON.parse(stored) : { gst: 18, stripeMock: false };
    } catch {
      return { gst: 18, stripeMock: false };
    }
  });

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "security", label: "Security", icon: ShieldCheck },
    { id: "promotions", label: "Promotions", icon: Tag },
    { id: "billing", label: "Tax & Billing", icon: CreditCard },
    { id: "shipping", label: "Contact Details", icon: TruckIcon },
    { id: "branding", label: "Branding", icon: Palette },
  ];

  const [coupons, setCoupons] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_coupons");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [couponForm, setCouponForm] = useState({ code: "", discountType: "percentage", value: 10, minPurchase: 500, active: true });
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("spiceora_coupons", JSON.stringify(coupons));
  }, [coupons]);

  const [alertBanner, setAlertBanner] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_campaign_alert");
      return stored ? JSON.parse(stored) : { enabled: false, text: "" };
    } catch {
      return { enabled: false, text: "" };
    }
  });

  const [modalOffer, setModalOffer] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_campaign_popup");
      return stored ? JSON.parse(stored) : { enabled: false, title: "", description: "" };
    } catch {
      return { enabled: false, title: "", description: "" };
    }
  });

  const saveAlert = () => {
    localStorage.setItem("spiceora_campaign_alert", JSON.stringify(alertBanner));
    toast.success("Header alert settings saved successfully");
  };

  const savePopup = () => {
    localStorage.setItem("spiceora_campaign_popup", JSON.stringify(modalOffer));
    toast.success("Modal popup settings saved successfully");
  };

  const handleToggleCoupon = (code: string) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
    toast.success("Coupon status updated");
  };

  const handleDeleteCoupon = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    toast.success("Coupon deleted");
  };

  const handleCreateCoupon = () => {
    if (!couponForm.code.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    const cleanCode = couponForm.code.trim().toUpperCase();
    if (coupons.some(c => c.code === cleanCode)) {
      toast.error("Coupon code already exists");
      return;
    }
    setCoupons(prev => [...prev, { ...couponForm, code: cleanCode }]);
    setIsAddCouponOpen(false);
    setCouponForm({ code: "", discountType: "percentage", value: 10, minPurchase: 500, active: true });
    toast.success("New coupon created successfully!");
  };

  const handleSave = async () => {
    localStorage.setItem("spiceora_contact_settings", JSON.stringify(contacts));
    localStorage.setItem("spiceora_tax_settings", JSON.stringify(taxes));
    await new Promise(r => setTimeout(r, 400));
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    toast.success("Settings updated successfully");
  };

  const handlePhoto = async () => {
    setPhotoSaving(true); await new Promise(r => setTimeout(r, 1200));
    setPhotoSaving(false); toast.success("Photo updated");
  };

  function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
    const [on, setOn] = useState(defaultOn);
    return (
      <div className="flex items-start justify-between gap-4 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        <div>
          <p className="text-sm font-medium" style={{ color: C.charcoal }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: C.muted }}>{description}</p>
        </div>
        <button onClick={() => { setOn(!on); toast(on ? `${label} disabled` : `${label} enabled`); }}
          className="w-10 h-6 rounded-full relative transition-colors duration-200 shrink-0 mt-0.5"
          style={{ backgroundColor: on ? C.green : "#D4CFC9" }}>
          <motion.div animate={{ x: on ? 18 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="w-44 shrink-0 space-y-0.5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150"
            style={{ backgroundColor: tab === id ? C.greenFaint : "transparent", color: tab === id ? C.green : C.muted }}
            onMouseEnter={e => { if (tab !== id) e.currentTarget.style.backgroundColor = "#F0EDE8"; }}
            onMouseLeave={e => { if (tab !== id) e.currentTarget.style.backgroundColor = "transparent"; }}>
            <Icon className="w-4 h-4 shrink-0" /><span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            {tab === "profile" && (
              <Card className="p-6 space-y-5">
                <div className="flex items-center gap-4 pb-5" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${C.green}, #6BA342)` }}>AK</div>
                  <div>
                    <p className="font-semibold" style={{ color: C.charcoal }}>Arjun Kumar</p>
                    <p className="text-sm" style={{ color: C.muted }}>Head of Operations</p>
                    <Btn icon={photoSaving ? RefreshCw : Camera} variant="secondary" size="sm" onClick={handlePhoto} loading={photoSaving}>
                      {photoSaving ? "Uploading…" : "Change Photo"}
                    </Btn>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[["First Name", "Arjun"], ["Last Name", "Kumar"], ["Email", "arjun.kumar@spicehaven.co"], ["Phone", "+44 7700 123456"], ["Job Title", "Head of Operations"], ["Department", "Operations"]].map(([label, val]) => (
                    <div key={label}>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>{label}</label>
                      <input defaultValue={val} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "#F0EDE8", border: "1.5px solid transparent", color: C.charcoal }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>Bio</label>
                  <textarea rows={3} defaultValue="Overseeing day-to-day operations at Spice Haven, ensuring premium quality from farm to doorstep."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ backgroundColor: "#F0EDE8", border: "1.5px solid transparent", color: C.charcoal }} />
                </div>
                <div className="flex items-center gap-3">
                  <Btn icon={Save} onClick={handleSave}>Save Changes</Btn>
                  <AnimatePresence>
                    {saved && (
                      <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 text-sm" style={{ color: C.success }}>
                        <CheckCircle className="w-4 h-4" /> Profile saved!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            )}

            {tab === "notifications" && (
              <Card className="p-6">
                <h3 className="font-semibold mb-5" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>Notification Preferences</h3>
                <Toggle label="New Order Alerts" description="Get notified when a new order is placed" defaultOn={true} />
                <Toggle label="Low Stock Warnings" description="Alert when product stock drops below threshold" defaultOn={true} />
                <Toggle label="Customer Reviews" description="Notify when a new review is submitted" defaultOn={false} />
                <Toggle label="Weekly Reports" description="Receive weekly performance digest every Monday" defaultOn={true} />
                <Toggle label="Marketing Emails" description="Promotional updates and campaign summaries" defaultOn={false} />
                <Toggle label="System Updates" description="Platform maintenance and feature announcements" defaultOn={true} />
                <div className="mt-5"><Btn icon={Save} onClick={handleSave}>Save Preferences</Btn></div>
              </Card>
            )}

            {tab === "security" && (
              <Card className="p-6 space-y-5">
                <h3 className="font-semibold" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>Security Settings</h3>
                <div className="space-y-4">
                  {[["Current Password", "password", "Enter current password"], ["New Password", "password", "At least 12 characters"], ["Confirm New Password", "password", "Repeat new password"]].map(([label, type, placeholder]) => (
                    <div key={label}>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>{label}</label>
                      <input type={type} placeholder={placeholder} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
                        style={{ backgroundColor: "#F0EDE8", border: "1.5px solid transparent", color: C.charcoal }} />
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-4" style={{ backgroundColor: C.greenFaint }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: C.green }}>Two-Factor Authentication</p>
                  <p className="text-xs mb-3" style={{ color: C.muted }}>Add an extra layer of security using an authenticator app.</p>
                  <Btn variant="secondary" size="sm" onClick={() => setTwoFAOpen(true)}>Enable 2FA</Btn>
                </div>
                <Btn icon={ShieldCheck} onClick={handleSave}>Update Password</Btn>
              </Card>
            )}

            {(tab === "billing" || tab === "shipping" || tab === "branding") && (
              <Card className="p-6 text-left">
                <h3 className="font-semibold mb-6" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>
                  {tab === "billing" ? "Tax & Billing" : tab === "shipping" ? "Contact Details" : "Branding"} Settings
                </h3>
                <div className="space-y-4">
                  {tab === "billing" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>GST Rate (%)</label>
                        <input type="number" value={taxes.gst} onChange={e => setTaxes({ ...taxes, gst: Number(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-[#F0EDE8] border-none text-[#2C2416]" />
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-[#2C2416]/10">
                        <div>
                          <p className="text-sm font-medium text-[#2C2416]">Stripe Mock Payment Gateway</p>
                          <p className="text-xs text-[#8B7355]">Enable mockup mode for checkouts without real card billing</p>
                        </div>
                        <button onClick={() => setTaxes({ ...taxes, stripeMock: !taxes.stripeMock })} className="w-10 h-6 rounded-full relative transition-colors duration-200 shrink-0" style={{ backgroundColor: taxes.stripeMock ? C.green : "#D4CFC9" }}>
                          <motion.div animate={{ x: taxes.stripeMock ? 18 : 2 }} className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                      </div>
                    </>
                  )}
                  {tab === "shipping" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>Support Email</label>
                        <input value={contacts.email} onChange={e => setContacts({ ...contacts, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-[#F0EDE8] border-none text-[#2C2416]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>Sales Phone</label>
                        <input value={contacts.phone} onChange={e => setContacts({ ...contacts, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-[#F0EDE8] border-none text-[#2C2416]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>WhatsApp Number</label>
                        <input value={contacts.whatsapp} onChange={e => setContacts({ ...contacts, whatsapp: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-[#F0EDE8] border-none text-[#2C2416]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>Operating Hours</label>
                        <input value={contacts.hours} onChange={e => setContacts({ ...contacts, hours: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none bg-[#F0EDE8] border-none text-[#2C2416]" />
                      </div>
                    </>
                  )}
                  {tab === "branding" && [["Brand Name", "Spiceora"], ["Tagline", "Purest Spices, Directly From Farms"], ["Primary Color", "#2D5016"], ["Accent Color", "#D4921A"]].map(([label, val]) => (
                    <div key={label}>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: C.charcoal }}>{label}</label>
                      <input defaultValue={val} className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ backgroundColor: "#F0EDE8", border: "1.5px solid transparent", color: C.charcoal }} />
                    </div>
                  ))}
                  <div className="pt-2"><Btn icon={Save} onClick={handleSave}>Save Settings</Btn></div>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

            {/* Promotions Tab */}
            {tab === "promotions" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>Promotions & Campaigns</h3>
                  <p className="text-xs mt-1" style={{ color: C.muted }}>Manage storefront announcement banners, popup offers, and discount coupons</p>
                </div>

                {/* Homepage Banner */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: C.border }}>
                    <h4 className="font-semibold text-sm" style={{ color: C.charcoal }}>Storefront Announcement Header Alert</h4>
                    <button 
                      onClick={() => setAlertBanner({ ...alertBanner, enabled: !alertBanner.enabled })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${alertBanner.enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}
                    >
                      {alertBanner.enabled ? "Online" : "Offline"}
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: C.muted }}>Banner Announcement Text</label>
                    <input 
                      value={alertBanner.text} 
                      onChange={e => setAlertBanner({ ...alertBanner, text: e.target.value })}
                      className="w-full rounded-xl px-3 py-2 text-xs outline-none" 
                      style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }} 
                    />
                  </div>
                  <Btn icon={Save} onClick={saveAlert}>Save Header Alert</Btn>
                </Card>

                {/* Popup Offer */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: C.border }}>
                    <h4 className="font-semibold text-sm" style={{ color: C.charcoal }}>Promotional Modal Popup Offer</h4>
                    <button 
                      onClick={() => setModalOffer({ ...modalOffer, enabled: !modalOffer.enabled })}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${modalOffer.enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}
                    >
                      {modalOffer.enabled ? "Active" : "Disabled"}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: C.muted }}>Popup Dialog Title</label>
                      <input 
                        value={modalOffer.title} 
                        onChange={e => setModalOffer({ ...modalOffer, title: e.target.value })}
                        className="w-full rounded-xl px-3 py-2 text-xs outline-none" 
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }} 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase block mb-1" style={{ color: C.muted }}>Popup Dialog Body Description</label>
                      <textarea 
                        rows={2} 
                        value={modalOffer.description} 
                        onChange={e => setModalOffer({ ...modalOffer, description: e.target.value })}
                        className="w-full rounded-xl px-3 py-2 text-xs outline-none resize-none" 
                        style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }} 
                      />
                    </div>
                  </div>
                  <Btn icon={Save} onClick={savePopup}>Save Modal Popup</Btn>
                </Card>

                {/* Coupon Codes */}
                <Card className="p-5 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: C.border }}>
                    <h4 className="font-semibold text-sm" style={{ color: C.charcoal }}>Discount Coupons</h4>
                    <Btn size="sm" icon={Plus} onClick={() => setIsAddCouponOpen(true)}>Add Coupon</Btn>
                  </div>
                  <div className="space-y-3">
                    {coupons.map(c => (
                      <div key={c.code} className="flex items-center justify-between p-4 rounded-xl border" style={{ backgroundColor: C.bg, borderColor: C.border }}>
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-sm tracking-wider" style={{ color: C.green }}>{c.code}</span>
                          <p className="text-[10.5px]" style={{ color: C.muted }}>
                            {c.discountType === "percentage" ? `${c.value}% discount` : `₹${c.value} discount`} · Min purchase: ₹{c.minPurchase}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleCoupon(c.code)}
                            className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${c.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-stone-200 text-stone-600 hover:bg-stone-300"}`}
                          >
                            {c.active ? "Enabled" : "Disabled"}
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 rounded-lg border hover:bg-red-50 text-red-600 transition-colors"
                            style={{ borderColor: C.border }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {coupons.length === 0 && (
                      <p className="text-xs text-[#8B7355] italic text-center py-6">No coupons created yet.</p>
                    )}
                  </div>
                </Card>

                {/* Add Coupon Modal */}
                <AnimatePresence>
                  {isAddCouponOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(26,23,20,0.5)", backdropFilter: "blur(4px)" }}>
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
                        <h3 className="font-bold text-lg font-serif text-[#2C2416]">New Promo Coupon</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Coupon Code</label>
                            <input 
                              value={couponForm.code} 
                              onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} 
                              placeholder="e.g. MONSOON20" 
                              className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none font-mono text-[#2C2416]" 
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Discount Type</label>
                              <select 
                                value={couponForm.discountType} 
                                onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })} 
                                className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none cursor-pointer text-[#2C2416]"
                              >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Flat (₹)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Benefit Value</label>
                              <input 
                                type="number" 
                                value={couponForm.value} 
                                onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })} 
                                className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Minimum Order Value (₹)</label>
                            <input 
                              type="number" 
                              value={couponForm.minPurchase} 
                              onChange={e => setCouponForm({ ...couponForm, minPurchase: Number(e.target.value) })} 
                              className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" 
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => setIsAddCouponOpen(false)} className="flex-1 py-2 text-xs font-semibold border border-[#2C2416]/10 rounded-xl hover:bg-[#FAF8F5]">Cancel</button>
                          <Btn onClick={handleCreateCoupon} className="flex-1">Create Code</Btn>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

      {/* 2FA Modal */}
      <Modal open={twoFAOpen} onClose={() => setTwoFAOpen(false)} title="Enable Two-Factor Authentication">
        <div className="text-center space-y-4">
          <div className="w-32 h-32 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto"
            style={{ background: "repeating-linear-gradient(45deg, #F0EDE8, #F0EDE8 4px, white 4px, white 8px)" }}>
            <p className="text-xs font-mono text-center" style={{ color: C.muted, fontSize: 9, lineHeight: 1.3 }}>
              █▀▀▀█ ▄ █▀▀▀█{"\n"}█ █ █ ▀ █ █ █{"\n"}█▄▄▄█ ▀ █▄▄▄█{"\n"}▄▄▄▄▄ █▄█ ▄▀▄{"\n"}▀▄ █▀ ▀ ▀▄ █▀{"\n"}█▀▀▀█ ▄▄ █ ▀▄{"\n"}█ █ █ ▀█▄█▄▄█{"\n"}█▄▄▄█ █ █ ▀ █
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: C.charcoal }}>Scan with your authenticator app</p>
            <p className="text-xs" style={{ color: C.muted }}>Or enter code manually: <span className="font-mono font-medium" style={{ color: C.green }}>SPICE-HAVEN-2FA-K8X2</span></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-left" style={{ color: C.charcoal }}>Enter 6-digit code to confirm</label>
            <input type="text" maxLength={6} placeholder="000000" className="w-full px-4 py-3 rounded-xl text-center text-lg font-mono tracking-widest outline-none"
              style={{ backgroundColor: "#F0EDE8", color: C.charcoal, letterSpacing: "0.4em" }} />
          </div>
          <div className="flex gap-3">
            <Btn icon={ShieldCheck} onClick={() => { setTwoFAOpen(false); toast.success("2FA enabled", { description: "Your account is now protected." }); }}>Confirm & Enable</Btn>
            <Btn variant="ghost" onClick={() => setTwoFAOpen(false)}>Cancel</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── WHOLESALE MANAGEMENT CMS PAGE ───────────────────────────────────────────
const DEFAULT_INQUIRIES: any[] = [];

function WholesaleManagementPage({ navigateTo }: { navigateTo: (p: string) => void }) {
  const [inquiries, setInquiries] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_wholesale_inquiries");
      if (stored) return JSON.parse(stored);
      localStorage.setItem("spiceora_wholesale_inquiries", JSON.stringify(DEFAULT_INQUIRIES));
      return DEFAULT_INQUIRIES;
    } catch {
      return DEFAULT_INQUIRIES;
    }
  });

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [volumeFilter, setVolumeFilter] = useState<string>("all");
  const [executiveFilter, setExecutiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Selection & Bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");
  const [bulkExecutive, setBulkExecutive] = useState<string>("");

  // Drawer / View Details
  const [activeInquiry, setActiveInquiry] = useState<any | null>(null);
  const [newNote, setNewNote] = useState<string>("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [followUpNote, setFollowUpNote] = useState<string>("");

  // ── Inline Quotation Builder State ─────────────────────────────
  const [wholesaleView, setWholesaleView] = useState<"list" | "quote-builder">("list");
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [quoteInquiryRef, setQuoteInquiryRef] = useState<any | null>(null);
  const [quoteForm, setQuoteForm] = useState<any>({
    id: "", date: "", validUntil: "", businessName: "", contactPerson: "",
    email: "", phone: "", billingAddress: "", shippingAddress: "", gstin: "",
    salesExecutive: "Unassigned",
    items: [{ name: "Chilli Powder", weight: "25kg Bag", quantity: 1, unitPrice: 2750, discount: 0, gst: 5 }],
    discountType: "percentage", discountValue: 0, shippingCharges: 0,
    paymentTerms: "50% Advance, 50% on Dispatch", leadTime: 5,
    packagingType: "Bulk Crate", deliveryMethod: "Road Freight", notes: "",
    termsList: ["Quotation Valid for 15 Days", "Prices Excluding GST"],
    status: "draft", timeline: [], inquiryId: ""
  });
  const [customTerm, setCustomTerm] = useState<string>("");

  const refreshInquiries = () => {
    try {
      const stored = localStorage.getItem("spiceora_wholesale_inquiries");
      if (stored) setInquiries(JSON.parse(stored));
    } catch {}
  };

  useEffect(() => {
    // Listen for storage changes to sync in real time
    window.addEventListener("storage", refreshInquiries);
    return () => window.removeEventListener("storage", refreshInquiries);
  }, []);

  const saveInquiries = (updated: any[]) => {
    setInquiries(updated);
    try {
      localStorage.setItem("spiceora_wholesale_inquiries", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const addAuditLog = (action: string, details: string) => {
    try {
      const stored = localStorage.getItem("spiceora_audit_logs");
      const logs = stored ? JSON.parse(stored) : [];
      logs.unshift({
        time: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        action,
        user: "Arjun Kumar (Admin)",
        details
      });
      localStorage.setItem("spiceora_audit_logs", JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  };

  // Status mapping colors & labels
  const statusMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    new:            { label: "New",            bg: "#FEF3E2", text: "#C85A1A", dot: "#D4921A" },
    pending:        { label: "New",            bg: "#FEF3E2", text: "#C85A1A", dot: "#D4921A" }, // backward compat
    contacted:      { label: "Contacted",      bg: "#E8F2FE", text: "#1B5EAD", dot: "#2B7FE2" },
    quotation_sent: { label: "Quotation Sent", bg: "#EBF5E6", text: "#2D5016", dot: "#4A7A2A" },
    negotiation:    { label: "Negotiation",    bg: "#FFF4E5", text: "#B26A00", dot: "#ED8936" },
    converted:      { label: "Converted",      bg: "rgba(45,80,22,0.15)", text: "#1A3A0A", dot: "#2D5016" },
    completed:      { label: "Completed",      bg: "#EBF5E6", text: "#1A3A0A", dot: "#2D5016" },
    rejected:       { label: "Rejected",       bg: "#FDECEA", text: "#C94040", dot: "#C94040" },
  };

  // ── Inline Quote Builder Helpers ───────────────────────────────
  const getQuotations = (): any[] => {
    try {
      const s = localStorage.getItem("spiceora_quotations");
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  };

  const saveQuotation = (q: any) => {
    const list = getQuotations();
    const idx = list.findIndex((x: any) => x.id === q.id);
    if (idx >= 0) list[idx] = q; else list.unshift(q);
    try { localStorage.setItem("spiceora_quotations", JSON.stringify(list)); } catch {}
  };

  const calcTotals = (form: any) => {
    let subtotal = 0;
    let taxTotal = 0;

    (form.items || []).forEach((item: any) => {
      const itemGross = (item.quantity || 0) * (item.unitPrice || 0);
      const itemDiscount = itemGross * ((item.discount || 0) / 100);
      const itemNet = Math.max(0, itemGross - itemDiscount);
      subtotal += itemNet;
      taxTotal += itemNet * ((item.gst || 0) / 100);
    });

    let overDisc = 0;
    if (form.discountType === "percentage") {
      overDisc = subtotal * ((form.discountValue || 0) / 100);
    } else if (form.discountType === "flat") {
      overDisc = Number(form.discountValue) || 0;
    }
    overDisc = Math.max(0, Math.min(overDisc, subtotal));

    const netSubtotal = Math.max(0, subtotal - overDisc);
    const taxAfterDiscount = subtotal > 0 ? taxTotal * (netSubtotal / subtotal) : 0;
    const grand = netSubtotal + taxAfterDiscount + (Number(form.shippingCharges) || 0);
    const rounded = Math.round(grand);
    return { subtotal: subtotal.toFixed(2), discount: overDisc.toFixed(2), tax: taxAfterDiscount.toFixed(2), grandTotal: grand.toFixed(2), payableAmount: rounded, roundOff: (rounded - grand).toFixed(2) };
  };

  const openQuoteBuilder = (inq: any, existingQuote?: any) => {
    setQuoteInquiryRef(inq);
    setActiveInquiry(null);
    if (existingQuote) {
      setQuoteForm(existingQuote);
      setEditingQuoteId(existingQuote.id);
    } else {
      const newId = "QT-2026-" + Math.floor(Math.random() * 90000 + 10000);
      const today = new Date().toLocaleDateString('en-IN');
      const futureDate = new Date(); futureDate.setDate(futureDate.getDate() + 15);
      const volStr = inq.volume || "5kg Pack";
      const matchedQty = parseInt(volStr) || 1;
      const sizeTag = volStr.includes("kg") ? volStr.substring(0, volStr.indexOf("kg") + 2).trim() : "5kg Pack";
      setQuoteForm({
        id: newId, date: today, validUntil: futureDate.toLocaleDateString('en-IN'),
        businessName: inq.businessName, contactPerson: inq.contactName,
        email: inq.email, phone: inq.phone,
        billingAddress: inq.businessName + " Head Office",
        shippingAddress: inq.businessName + " Storage / Yard",
        gstin: "",
        salesExecutive: inq.assignedExecutive !== "Unassigned" ? inq.assignedExecutive : "Amit Verma",
        items: [{ name: inq.productInterest || "Chilli Powder", weight: sizeTag, quantity: matchedQty, unitPrice: 2750, discount: 0, gst: 5 }],
        discountType: "percentage", discountValue: 0, shippingCharges: 350,
        paymentTerms: "50% Advance, 50% on Dispatch", leadTime: 7,
        packagingType: "Commercial Bag", deliveryMethod: "Road Freight",
        notes: inq.message || "",
        termsList: ["Quotation Valid for 15 Days", "Prices Excluding GST", "Transportation Extra"],
        status: "draft",
        timeline: [{ time: today + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: "Prefilled from Inquiry " + inq.id }],
        inquiryId: inq.id
      });
      setEditingQuoteId(null);
    }
    setWholesaleView("quote-builder");
  };

  const handleSaveQuote = () => {
    if (!quoteForm.businessName || !quoteForm.contactPerson || !quoteForm.email) {
      toast.error("Please fill in Business Name, Contact Name, and Email."); return;
    }
    const calcs = calcTotals(quoteForm);
    const finalForm = { ...quoteForm, payableAmount: calcs.payableAmount };
    saveQuotation(finalForm);

    // If linked to an inquiry, auto-update inquiry status to quotation_sent
    if (finalForm.inquiryId) {
      const updated = inquiries.map((inq: any) =>
        inq.id === finalForm.inquiryId
          ? { ...inq, status: "quotation_sent", notes: [...(inq.notes || []), `[${new Date().toLocaleDateString('en-IN')}] Quotation ${finalForm.id} generated.`] }
          : inq
      );
      saveInquiries(updated);
    }
    addAuditLog(editingQuoteId ? "Quotation Updated" : "Quotation Created", `${editingQuoteId ? "Updated" : "Generated"} quotation ${finalForm.id} for ${finalForm.businessName}`);
    toast.success(editingQuoteId ? "Quotation updated" : "Quotation saved as draft");
    setWholesaleView("list");
    setEditingQuoteId(null);
    setQuoteInquiryRef(null);
  };

  const handleConvertQuoteToOrder = (quote: any) => {
    const orderId = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
    const dateStr = new Date().toLocaleDateString('en-IN');
    const newOrder = {
      id: orderId, customer: quote.businessName, email: quote.email, date: dateStr,
      items: quote.items?.map((it: any) => `${it.name} (${it.weight} x ${it.quantity})`).join(", ") || "Wholesale Batch",
      total: `₹${quote.payableAmount}`, status: "processing",
      address: quote.shippingAddress, gstin: quote.gstin,
      source: "Converted B2B Quotation (" + quote.id + ")"
    };
    try {
      const storedOrders = localStorage.getItem("spiceora_orders");
      const list = storedOrders ? JSON.parse(storedOrders) : [];
      list.unshift(newOrder);
      localStorage.setItem("spiceora_orders", JSON.stringify(list));
      // Update quote status
      const updatedQ = { ...quote, status: "converted", timeline: [...(quote.timeline || []), { time: dateStr, event: `Converted to Order ${orderId}` }] };
      saveQuotation(updatedQ);
      // Update inquiry status to converted
      if (quote.inquiryId) {
        const updated = inquiries.map((inq: any) =>
          inq.id === quote.inquiryId ? { ...inq, status: "converted" } : inq
        );
        saveInquiries(updated);
      }
      addAuditLog("Quotation Converted", `${quote.id} → Order ${orderId}`);
      toast.success("Converted to Order!", { description: `Order ${orderId} created.` });
    } catch (e) { console.error(e); toast.error("Failed to convert."); }
  };

  const handleAddItemRow = () => {
    setQuoteForm({ ...quoteForm, items: [...quoteForm.items, { name: "Turmeric Powder", weight: "10kg Bag", quantity: 1, unitPrice: 1100, discount: 0, gst: 5 }] });
  };
  const handleRemoveItemRow = (idx: number) => {
    if (quoteForm.items.length <= 1) { toast.error("Must have at least one line item."); return; }
    setQuoteForm({ ...quoteForm, items: quoteForm.items.filter((_: any, i: number) => i !== idx) });
  };
  const handleItemFieldChange = (idx: number, field: string, value: any) => {
    const updated = [...quoteForm.items]; updated[idx][field] = value;
    setQuoteForm({ ...quoteForm, items: updated });
  };
  const handleAddCustomTerm = () => {
    if (!customTerm.trim()) return;
    setQuoteForm({ ...quoteForm, termsList: [...quoteForm.termsList, customTerm.trim()] });
    setCustomTerm("");
  };
  const handleRemoveTerm = (term: string) => {
    setQuoteForm({ ...quoteForm, termsList: quoteForm.termsList.filter((t: string) => t !== term) });
  };

  const downloadQuotePDF = (q: any) => {
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const primary: [number,number,number] = [42, 74, 60];
      const secondary: [number,number,number] = [201, 146, 10];
      doc.setFillColor(...primary); doc.rect(0, 0, 210, 40, "F");
      doc.setFont("Helvetica", "bold"); doc.setFontSize(24); doc.setTextColor(...secondary);
      doc.text("SPICEORA", 15, 20);
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text("PREMIUM WHOLESALE SPICE SOURCING", 15, 27);
      doc.setFont("Helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(...secondary);
      doc.text("OFFICIAL QUOTATION", 130, 20);
      doc.setFont("Helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
      doc.text(`Quote No: ${q.id}`, 130, 27); doc.text(`Date: ${q.date}`, 130, 32);
      doc.setFillColor(250, 248, 243); doc.rect(0, 40, 210, 25, "F");
      doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(26, 23, 20);
      doc.text("Spiceora Sourcing Desk Gate 2, Guntur Industrial Area, AP, India", 15, 48);
      doc.text("Support Desk: +91 9390645710  |  Email: dreammasterorigin@gmail.com", 15, 53);
      let cy = 78;
      doc.setFont("Helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...primary);
      doc.text("BILL TO:", 15, cy); doc.text("SHIP TO:", 110, cy);
      doc.setFontSize(10); doc.setTextColor(26, 23, 20);
      doc.text(q.businessName, 15, cy + 6); doc.text(q.businessName, 110, cy + 6);
      doc.setFont("Helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(74, 70, 64);
      doc.text(`Contact: ${q.contactPerson}`, 15, cy + 11);
      doc.text(`Phone: +91 ${q.phone}`, 15, cy + 16);
      doc.text(`Email: ${q.email}`, 15, cy + 21);
      if (q.gstin) doc.text(`GSTIN: ${q.gstin}`, 15, cy + 26);
      doc.text(doc.splitTextToSize(q.billingAddress || "N/A", 80), 15, cy + 31);
      doc.text(doc.splitTextToSize(q.shippingAddress || "N/A", 80), 110, cy + 11);
      let tableY = 125;
      doc.setFillColor(...primary); doc.rect(15, tableY, 180, 8, "F");
      doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(255, 255, 255);
      ["Product Details","Pack","Qty","Rate (INR)","Disc%","GST%","Net Total"].forEach((h, i) => {
        doc.text(h, [18,70,90,110,135,155,175][i], tableY + 5.5);
      });
      let rowY = tableY + 8, totalSub = 0, totalGst = 0;
      (q.items || []).forEach((row: any, i: number) => {
        if (i % 2 === 1) { doc.setFillColor(248, 246, 240); doc.rect(15, rowY, 180, 8, "F"); }
        doc.setDrawColor(26, 23, 20); doc.rect(15, rowY, 180, 8, "S");
        doc.setFont("Helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(26, 23, 20);
        doc.text(row.name, 18, rowY + 5.5);
        doc.setFont("Helvetica", "normal"); doc.setTextColor(74, 70, 64);
        doc.text(row.weight, 70, rowY + 5.5); doc.text(String(row.quantity), 90, rowY + 5.5);
        doc.text(`Rs.${row.unitPrice}`, 110, rowY + 5.5);
        doc.text(`${row.discount}%`, 135, rowY + 5.5); doc.text(`${row.gst}%`, 155, rowY + 5.5);
        const net = row.quantity * row.unitPrice * (1 - row.discount / 100);
        const gst = net * (row.gst / 100); totalSub += net; totalGst += gst;
        doc.setFont("Helvetica", "bold"); doc.setTextColor(26, 23, 20);
        doc.text(`Rs.${Math.round(net + gst)}`, 175, rowY + 5.5);
        rowY += 8;
      });
      rowY += 6;
      doc.setFont("Helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(74, 70, 64);
      doc.text("Payment: " + (q.paymentTerms || "Direct Bank"), 15, rowY);
      doc.text("Lead time: " + (q.leadTime || 5) + " days", 15, rowY + 5);
      doc.text("Packaging: " + (q.packagingType || "Sack"), 15, rowY + 10);
      doc.text("Delivery: " + (q.deliveryMethod || "Road"), 15, rowY + 15);
      let payY = rowY;
      doc.setTextColor(26, 23, 20); doc.text("Gross Subtotal:", 130, payY); doc.text(`Rs.${totalSub.toFixed(0)}`, 175, payY); payY += 5;
      if (q.discountValue > 0) { doc.text("Overall Discount:", 130, payY); doc.text(`-Rs.${q.discountValue}`, 175, payY); payY += 5; }
      doc.text("Tax (GST):", 130, payY); doc.text(`Rs.${totalGst.toFixed(0)}`, 175, payY); payY += 5;
      doc.text("Freight:", 130, payY); doc.text(`Rs.${q.shippingCharges || 0}`, 175, payY); payY += 5;
      doc.setFillColor(secondary[0], secondary[1], secondary[2]); doc.rect(125, payY - 3.8, 70, 7.5, "F");
      doc.setFont("Helvetica", "bold"); doc.setTextColor(...primary);
      doc.text("Total Payable:", 128, payY + 1.2); doc.text(`Rs.${q.payableAmount}`, 173, payY + 1.2);
      payY += 15;
      doc.setFont("Helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...primary);
      doc.text("TERMS:", 15, payY); payY += 4.5;
      doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(74, 70, 64);
      (q.termsList || []).forEach((t: string) => { doc.text(`• ${t}`, 18, payY); payY += 4.5; });
      doc.setFont("Helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(122, 112, 100);
      doc.text("Page 1 of 1", 100, 285);
      doc.save(`SPICEORA_Quotation_${q.id}_${q.businessName.replace(/\s+/g, "_")}.pdf`);
      toast.success("Quotation PDF generated");
    } catch (e) { console.error(e); toast.error("Failed to generate PDF."); }
  };

  // Filter inquiries
  const filtered = inquiries.filter(inq => {
    const matchesTab = activeTab === "all" || inq.status === activeTab;
    const matchesSearch = 
      inq.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.phone.includes(searchQuery);
    
    const matchesProduct = productFilter === "all" || inq.productInterest === productFilter;
    const matchesVolume = volumeFilter === "all" || inq.volume.includes(volumeFilter);
    const matchesExecutive = executiveFilter === "all" || inq.assignedExecutive === executiveFilter;

    return matchesTab && matchesSearch && matchesProduct && matchesVolume && matchesExecutive;
  });

  // Sort inquiries
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return b.date.localeCompare(a.date);
    if (sortBy === "oldest") return a.date.localeCompare(b.date);
    if (sortBy === "business-az") return a.businessName.localeCompare(b.businessName);
    if (sortBy === "business-za") return b.businessName.localeCompare(a.businessName);
    return 0;
  });

  // Paginated list
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map(p => p.id));
    }
  };

  const handleBulkAction = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select one or more inquiries first.");
      return;
    }

    let updated = [...inquiries];
    if (bulkStatus) {
      updated = updated.map(inq => selectedIds.includes(inq.id) ? { ...inq, status: bulkStatus } : inq);
      addAuditLog("Bulk Status Update", `Changed status of ${selectedIds.length} inquiries to ${bulkStatus}`);
      toast.success(`Updated ${selectedIds.length} statuses`);
      setBulkStatus("");
    }
    if (bulkExecutive) {
      updated = updated.map(inq => selectedIds.includes(inq.id) ? { ...inq, assignedExecutive: bulkExecutive } : inq);
      addAuditLog("Bulk Assignment", `Assigned executive ${bulkExecutive} to ${selectedIds.length} inquiries`);
      toast.success(`Assigned ${selectedIds.length} inquiries to ${bulkExecutive}`);
      setBulkExecutive("");
    }
    
    saveInquiries(updated);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select inquiries to delete.");
      return;
    }
    const updated = inquiries.filter(inq => !selectedIds.includes(inq.id));
    addAuditLog("Bulk Deletion", `Deleted ${selectedIds.length} wholesale inquiries`);
    saveInquiries(updated);
    toast.success(`Deleted ${selectedIds.length} inquiries`);
    setSelectedIds([]);
  };

  const handleUpdateSingleInquiry = (id: string, fields: any) => {
    const updated = inquiries.map(inq => inq.id === id ? { ...inq, ...fields } : inq);
    saveInquiries(updated);
    if (activeInquiry && activeInquiry.id === id) {
      setActiveInquiry({ ...activeInquiry, ...fields });
    }
    toast.success("Inquiry updated successfully");
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !activeInquiry) return;
    const dateStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `[${dateStr} by Admin]: ${newNote}`;
    const updatedNotes = [...(activeInquiry.notes || []), formattedNote];

    handleUpdateSingleInquiry(activeInquiry.id, { notes: updatedNotes });
    addAuditLog("Note Added", `Added note to inquiry ${activeInquiry.id}`);
    setNewNote("");
  };

  const handleScheduleFollowUp = () => {
    if (!followUpDate || !followUpNote.trim() || !activeInquiry) return;
    const formatted = { date: followUpDate, note: followUpNote };
    const list = [...(activeInquiry.followUps || []), formatted];

    handleUpdateSingleInquiry(activeInquiry.id, { followUps: list });
    addAuditLog("Followup Scheduled", `Scheduled follow-up on ${followUpDate} for ${activeInquiry.id}`);
    toast.success("Follow-up scheduled");
    setFollowUpDate("");
    setFollowUpNote("");
  };

  const handleDeleteInquiry = (id: string) => {
    const updated = inquiries.filter(x => x.id !== id);
    saveInquiries(updated);
    addAuditLog("Inquiry Deleted", `Deleted inquiry ${id}`);
    toast.success(`Inquiry ${id} deleted`);
    setActiveInquiry(null);
  };

  // Reusable PDF generator for specific inquiry details
  const downloadInquiryPDF = (inq: any) => {
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Load template style parameters
      let template = {
        headerVisible: true,
        footerVisible: true,
        watermark: "OFFICIAL CATALOG",
        primaryColor: [42, 74, 60],
        secondaryColor: [201, 146, 10],
        terms: "Terms: Ex-works / F.O.B dispatch. Sample kits available on request."
      };
      try {
        const storedTemplate = localStorage.getItem("spiceora_pdf_template");
        if (storedTemplate) {
          const parsed = JSON.parse(storedTemplate);
          const colorMap: Record<string, number[]> = {
            green: [42, 74, 60],
            gold: [201, 146, 10],
            red: [180, 40, 40],
            blue: [25, 80, 150]
          };
          template.watermark = parsed.watermark || template.watermark;
          template.terms = parsed.terms || template.terms;
          template.primaryColor = colorMap[parsed.primaryColor] || [42, 74, 60];
          template.secondaryColor = colorMap[parsed.secondaryColor] || [201, 146, 10];
        }
      } catch {}

      // Load products prices
      let productsData: any[] = [];
      try {
        const storedProducts = localStorage.getItem("spiceora_pdf_products");
        if (storedProducts) {
          const parsed = JSON.parse(storedProducts);
          if (Array.isArray(parsed) && parsed.length > 0) {
            productsData = parsed.map((p: any) => ({
              name: p.name,
              p100: p.retailSizes?.p100 ? `₹${p.retailSizes.p100}` : "N/A",
              p250: p.retailSizes?.p250 ? `₹${p.retailSizes.p250}` : "N/A",
              p500: p.retailSizes?.p500 ? `₹${p.retailSizes.p500}` : "N/A",
              p1000: p.retailSizes?.p1000 ? `₹${p.retailSizes.p1000}` : "Available"
            }));
          }
        }
      } catch {}

      const primary = template.primaryColor;
      const secondary = template.secondaryColor;

      // Cover Page
      doc.setFillColor(250, 248, 243);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 45, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(secondary[0], secondary[1], secondary[2]);
      doc.text("SPICEORA", 20, 24);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("PREMIUM SPICES & HERBS", 20, 31);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(secondary[0], secondary[1], secondary[2]);
      doc.text("B2B DIVISION", 160, 26);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(26, 23, 20);
      doc.text("OFFICIAL B2B SOURCING CATALOG", 20, 75);

      doc.setDrawColor(secondary[0], secondary[1], secondary[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 80, 190, 80);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(122, 112, 100);
      doc.text("Prepared Exclusively For:", 20, 93);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(26, 23, 20, 0.08);
      doc.rect(20, 98, 170, 120, "FD");

      let cardY = 108;
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(inq.businessName || "Valued B2B Partner", 30, cardY);
      cardY += 12;

      doc.setFontSize(11);
      
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(26, 23, 20);
      doc.text("Business Name:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(inq.businessName || "N/A", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Contact Name:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(inq.contactName || "N/A", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Business Email:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(inq.email || "N/A", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Mobile Number:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text("+91 " + (inq.phone || "N/A"), 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Selected Product:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(inq.productInterest || "Mixed Order / All Spices", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Sourcing Volume:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(inq.volume || "Mixed Bulk", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Date Generated:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(new Date().toLocaleDateString('en-IN'), 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Special Requirements:", 30, cardY);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(122, 112, 100);
      const splitMsg = doc.splitTextToSize(inq.message || "No specific milling or scheduling requests added.", 110);
      doc.text(splitMsg, 75, cardY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 1 of 2", 100, 280);

      if (template.watermark) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(200, 200, 200, 0.12);
        doc.text(template.watermark, 30, 250, null, 45);
      }

      // Page 2: Table
      doc.addPage();

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 25, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("SPICEORA B2B PRODUCT CATALOG", 20, 16);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Commercial Pricing Index (Retail Packs)", 20, 42);

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(20, 48, 170, 10, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Product Name", 25, 54);
      doc.text("100g", 85, 54);
      doc.text("250g", 110, 54);
      doc.text("500g", 135, 54);
      doc.text("1000g", 160, 54);

      let rowY = 58;
      productsData.forEach((row, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(245, 243, 237);
          doc.rect(20, rowY, 170, 10, "F");
        }
        doc.setDrawColor(26, 23, 20, 0.08);
        doc.rect(20, rowY, 170, 10, "S");

        doc.setFont("Helvetica", "bold");
        doc.setTextColor(26, 23, 20);
        doc.text(row.name, 25, rowY + 6.5);

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(74, 70, 64);
        doc.text(row.p100, 85, rowY + 6.5);
        doc.text(row.p250, 110, rowY + 6.5);
        doc.text(row.p500, 135, rowY + 6.5);
        doc.text(row.p1000, 160, rowY + 6.5);
        rowY += 10;
      });

      rowY += 12;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Bulk Sourcing Packaging Options", 20, rowY);

      rowY += 6;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(74, 70, 64);
      doc.text("For wholesale food service, industrial processing, and mixed packaging contracts:", 20, rowY);

      rowY += 8;
      const bulkSizes = ["5kg Air-Tight Crate", "10kg Commercial Sack", "15kg Multi-Layer Bag", "25kg Heavy Duty Bulk Sack"];
      bulkSizes.forEach(size => {
        doc.setFillColor(secondary[0], secondary[1], secondary[2]);
        doc.rect(25, rowY - 2.8, 2.5, 2.5, "F");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(26, 23, 20);
        doc.text(size, 32, rowY);
        rowY += 7.5;
      });

      rowY += 8;
      doc.setFillColor(250, 248, 243);
      doc.setDrawColor(secondary[0], secondary[1], secondary[2], 0.3);
      doc.rect(20, rowY, 170, 26, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Spiceora Sourcing Desk Support Team", 25, rowY + 6);

      // Load contacts dynamically
      let contactInfo = { whatsapp: "9390645710", email: "dreammasterorigin@gmail.com" };
      try {
        const storedContact = localStorage.getItem("spiceora_contact_settings");
        if (storedContact) {
          const parsedContact = JSON.parse(storedContact);
          contactInfo.whatsapp = parsedContact.whatsapp || contactInfo.whatsapp;
          contactInfo.email = parsedContact.email || contactInfo.email;
        }
      } catch {}

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 23, 20);
      doc.text(`WhatsApp/Call Support: +91 ${contactInfo.whatsapp}`, 25, rowY + 13);
      doc.text(`Official Email: ${contactInfo.email}`, 25, rowY + 19);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 2 of 2", 100, 280);

      if (template.watermark) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(200, 200, 200, 0.12);
        doc.text(template.watermark, 30, 250, null, 45);
      }

      const cleanBusinessName = (inq.businessName || "Partner").trim().replace(/\s+/g, "_");
      const filename = `SPICEORA_Wholesale_Catalog_${cleanBusinessName}.pdf`;
      doc.save(filename);

      // Save PDF to history log
      try {
        const storedHistory = localStorage.getItem("spiceora_pdf_history");
        const historyList = storedHistory ? JSON.parse(storedHistory) : [];
        historyList.unshift({
          id: "PDF-" + Math.floor(Math.random() * 90000 + 10000),
          date: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          businessName: inq.businessName || "Valued Partner",
          contactPerson: inq.contactName || "N/A",
          product: inq.productInterest,
          volume: inq.volume,
          generatedBy: "Admin / Sales Agent"
        });
        localStorage.setItem("spiceora_pdf_history", JSON.stringify(historyList));
      } catch (err) {
        console.error("PDF history save failed:", err);
      }

      // Also trigger audit log for PDF generation
      addAuditLog("PDF Generated", `Catalog PDF generated for ${inq.businessName}`);
      toast.success(`Catalog PDF generated`, { description: `File saved as ${filename}.` });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate PDF");
    }
  };

  const handleResendCatalog = () => {
    toast.loading("Sending catalog email...", { id: "resend-mail" });
    setTimeout(() => {
      toast.success("Catalog PDF Sent!", {
        id: "resend-mail",
        description: `Pricing catalog successfully dispatched to ${activeInquiry?.email}`
      });
      addAuditLog("Email Catalog Resent", `Resent B2B PDF catalog to ${activeInquiry?.email}`);
    }, 1000);
  };

  // Mock Export CSV
  const exportCSV = () => {
    toast.loading("Exporting B2B inquiries CSV...", { id: "inq-csv" });
    setTimeout(() => {
      toast.success("Inquiries CSV downloaded", { id: "inq-csv", description: "Downloaded 1 file containing B2B lead sheet." });
    }, 800);
  };

  // Mock Export Excel
  const exportExcel = () => {
    toast.loading("Exporting B2B inquiries Excel...", { id: "inq-excel" });
    setTimeout(() => {
      toast.success("Inquiries Excel downloaded", { id: "inq-excel", description: "Downloaded 1 file containing structured lead logs." });
    }, 800);
  };

  // Analytics Metrics computation
  const metrics = {
    total: inquiries.length,
    pending: inquiries.filter(x => x.status === "pending").length,
    contacted: inquiries.filter(x => x.status === "contacted").length,
    quotationSent: inquiries.filter(x => x.status === "quotation_sent").length,
    converted: inquiries.filter(x => x.status === "converted").length,
    rejected: inquiries.filter(x => x.status === "rejected").length,
    rate: inquiries.length ? ((inquiries.filter(x => x.status === "converted").length / inquiries.length) * 100).toFixed(1) : "0.0"
  };

  return (
    <div className="space-y-6 text-left">
      {/* Analytics KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total B2B Inquiries", value: metrics.total, icon: ClipboardList, color: C.green },
          { label: "Pending Review", value: metrics.pending, icon: Clock, color: C.yellow },
          { label: "Quotation Sent", value: metrics.quotationSent, icon: DollarSign, color: C.greenLight },
          { label: "Conversion Rate", value: `${metrics.rate}%`, icon: TrendingUp, color: C.orange }
        ].map((kpi, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B7355]">{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif" style={{ color: C.charcoal }}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#2C2416]/10 pb-4">
        {["all", "new", "contacted", "quotation_sent", "negotiation", "converted", "completed", "rejected"].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === tab ? "bg-[#2D5016] text-white" : "bg-white text-[#2C2416] border border-[#2C2416]/10"}`}>
            {tab.replace("_", " ")} ({tab === "all" ? inquiries.length : inquiries.filter((x: any) => x.status === tab || (tab === "new" && x.status === "pending")).length})
          </button>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="lg:col-span-4 flex items-center gap-2 rounded-xl px-3 py-2 bg-white border border-[#2C2416]/10">
          <Search className="w-4 h-4 text-[#8B7355]" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search business, contact, email..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400 text-[#2C2416]" />
        </div>

        {/* Dropdown filters */}
        <div className="lg:col-span-8 flex flex-wrap gap-2 justify-end">
          <select value={productFilter} onChange={e => { setProductFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="all">All Products</option>
            <option value="Chilli Powder">Chilli Powder</option>
            <option value="Turmeric Powder">Turmeric Powder</option>
            <option value="Coriander Powder">Coriander Powder</option>
            <option value="Ginger Garlic Paste">Ginger Garlic Paste</option>
            <option value="Garam Masala">Garam Masala</option>
          </select>

          <select value={volumeFilter} onChange={e => { setVolumeFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="all">All Volumes</option>
            <option value="5kg">5kg Packs</option>
            <option value="10kg">10kg Packs</option>
            <option value="15kg">15kg Packs</option>
            <option value="25kg">25kg Packs</option>
            <option value="100kg">100kg+</option>
          </select>

          <select value={executiveFilter} onChange={e => { setExecutiveFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="all">All Executives</option>
            <option value="Unassigned">Unassigned</option>
            <option value="Amit Verma">Amit Verma</option>
            <option value="Priya Sen">Priya Sen</option>
            <option value="Rahul Sharma">Rahul Sharma</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="business-az">Business Name A-Z</option>
            <option value="business-za">Business Name Z-A</option>
          </select>

          <div className="flex gap-1.5 ml-2">
            <Btn icon={Download} variant="secondary" size="sm" onClick={exportCSV}>Export CSV</Btn>
            <Btn icon={Download} variant="secondary" size="sm" onClick={exportExcel}>Export Excel</Btn>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-xl bg-[#2D5016]/5 border border-[#2D5016]/20 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-semibold text-[#2D5016]">{selectedIds.length} items selected for bulk actions:</span>
          <div className="flex flex-wrap gap-2">
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
              <option value="">Update Status...</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quotation_sent">Quotation Sent</option>
              <option value="negotiation">Negotiation</option>
              <option value="converted">Converted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select value={bulkExecutive} onChange={e => setBulkExecutive(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
              <option value="">Assign Executive...</option>
              <option value="Amit Verma">Amit Verma</option>
              <option value="Priya Sen">Priya Sen</option>
              <option value="Rahul Sharma">Rahul Sharma</option>
            </select>

            <button onClick={handleBulkAction} className="px-3 py-1.5 rounded-lg bg-[#2D5016] text-white text-xs font-medium cursor-pointer">Apply</button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium cursor-pointer">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Inquiry List Table */}
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#FDFCFB", borderBottom: `1px solid ${C.border}` }}>
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
              </th>
              {["Inquiry ID", "Date & Time", "Business Name", "Contact Person", "Product Interest", "Sourcing Volume", "Status", "Executive", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((inq, idx) => (
              <tr key={inq.id} className="transition-colors duration-100 border-b border-[#2C2416]/10 hover:bg-[#FAF8F5]">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.includes(inq.id)} onChange={() => toggleSelect(inq.id)} className="cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-xs font-mono font-bold text-[#2C2416]">{inq.id}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{inq.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#2C2416]">{inq.businessName}</td>
                <td className="px-4 py-3 text-sm text-[#2C2416]">{inq.contactName}</td>
                <td className="px-4 py-3 text-sm text-[#2C2416]">{inq.productInterest}</td>
                <td className="px-4 py-3 text-xs font-semibold text-[#8B7355]">{inq.volume}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusMap[inq.status]?.bg, color: statusMap[inq.status]?.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusMap[inq.status]?.dot }} />
                    {statusMap[inq.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#2C2416] font-medium">{inq.assignedExecutive}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setActiveInquiry(inq)} className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteInquiry(inq.id)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={10} className="py-16 text-center text-[#8B7355] text-sm">
                  <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  No inquiries found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#2C2416]/10">
          <span className="text-xs text-[#8B7355]">Page {currentPage} of {totalPages} ({filtered.length} inquiries found)</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-[#2C2416]/10 text-xs font-medium cursor-pointer disabled:opacity-50">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-[#2C2416]/10 text-xs font-medium cursor-pointer disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      {/* Inquiry Detail Drawer */}
      <Drawer open={!!activeInquiry} onClose={() => { setActiveInquiry(null); }} title={`Inquiry Details: ${activeInquiry?.id}`} width={550}>
        {activeInquiry && (
          <div className="p-6 space-y-6 text-[#2C2416]">
            {/* Status Timeline Progress Bar */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 space-y-3">
              <p className="text-xs uppercase font-bold tracking-widest text-[#8B7355] mb-2 text-left">Workflow Progress</p>
              <div className="flex items-center justify-between relative">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-[#2C2416]/10 -translate-y-1/2 z-0" />
                {["new", "contacted", "quotation_sent", "negotiation", "converted", "completed"].map((st, i) => {
                  const states = ["new", "contacted", "quotation_sent", "negotiation", "converted", "completed"];
                  const normalizedStatus = activeInquiry.status === "pending" ? "new" : activeInquiry.status;
                  const currentIdx = states.indexOf(normalizedStatus);
                  const isDone = states.indexOf(st) <= currentIdx && normalizedStatus !== "rejected";
                  return (
                    <div key={st} className="flex flex-col items-center z-10">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${isDone ? "bg-[#2D5016] text-white" : "bg-white text-[#8B7355] border-2 border-[#2C2416]/10"}`}>
                        {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className="text-[9px] capitalize font-medium mt-1.5 text-center leading-tight" style={{maxWidth:44}}>{st.replace(/_/g, " ")}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Profiles Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#2C2416]/10 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8B7355]">Business Name</p>
                <p className="font-semibold text-sm">{activeInquiry.businessName}</p>
                <p className="text-xs text-[#8B7355]">{activeInquiry.email}</p>
                <p className="text-xs text-[#8B7355]">+91 {activeInquiry.phone}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#2C2416]/10 space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#8B7355]">Sourcing Interest</p>
                <p className="font-semibold text-sm text-[#2D5016]">{activeInquiry.productInterest}</p>
                <p className="text-xs text-[#8B7355]">Volume: {activeInquiry.volume}</p>
                <p className="text-xs text-[#8B7355]">Inquiry Date: {activeInquiry.date}</p>
              </div>
            </div>

            {/* Message specifications */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#8B7355]">Additional Specifications</p>
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 text-sm italic">
                "{activeInquiry.message || "No special milling or custom package specifications added."}"
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#2C2416]/10 py-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-1.5">Lead Status</label>
                <select value={activeInquiry.status} onChange={e => handleUpdateSingleInquiry(activeInquiry.id, { status: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                  <option value="new">New Inquiry</option>
                  <option value="contacted">Contacted Partner</option>
                  <option value="quotation_sent">Quotation Sent</option>
                  <option value="negotiation">In Negotiation</option>
                  <option value="converted">Converted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-1.5">Assigned Agent</label>
                <select value={activeInquiry.assignedExecutive} onChange={e => handleUpdateSingleInquiry(activeInquiry.id, { assignedExecutive: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                  <option value="Unassigned">Unassigned</option>
                  <option value="Amit Verma">Amit Verma (Sales Executive)</option>
                  <option value="Priya Sen">Priya Sen (Sales Manager)</option>
                  <option value="Rahul Sharma">Rahul Sharma (Executive)</option>
                </select>
              </div>
            </div>

            {/* Pricing Catalog Action Commands */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 space-y-3">
              <p className="text-xs uppercase font-bold tracking-widest text-[#8B7355]">Dynamic Catalog Actions</p>
              <div className="flex gap-2">
                <button onClick={() => downloadInquiryPDF(activeInquiry)}
                  className="flex-1 py-2 bg-[#2D5016] text-white rounded-xl text-xs font-medium hover:bg-[#1A3A0A] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Download catalog PDF
                </button>
                <button onClick={handleResendCatalog}
                  className="flex-1 py-2 bg-[#FAF8F5] border border-[#2C2416]/10 text-[#2C2416] rounded-xl text-xs font-medium hover:bg-[#F0EDE8] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Mail className="w-3.5 h-3.5" /> Email catalog to client
                </button>
              </div>
            </div>

            {/* Generate Quotation Button */}
            <div className="p-4 rounded-2xl bg-[#C9920A]/5 border border-[#C9920A]/20 space-y-2">
              <p className="text-xs uppercase font-bold tracking-widest text-[#C9920A]">Wholesale Quotation Desk</p>
              <button onClick={() => openQuoteBuilder(activeInquiry)}
                className="w-full py-2.5 bg-[#C9920A] hover:bg-[#A87800] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm">
                <FileText className="w-4 h-4" /> Generate New Quotation
              </button>
            </div>

            {/* Sales notes logging */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold tracking-widest text-[#8B7355]">Internal Sales Logs ({activeInquiry.notes?.length || 0})</p>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {(activeInquiry.notes || []).map((noteStr: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-[#2C2416]/8 text-xs leading-normal">
                    {noteStr}
                  </div>
                ))}
                {(!activeInquiry.notes || activeInquiry.notes.length === 0) && (
                  <p className="text-xs text-[#8B7355] italic">No sales notes recorded.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Type internal sales logs here..."
                  className="flex-1 bg-white border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" />
                <button onClick={handleAddNote} className="px-4 py-2 bg-[#2D5016] text-white text-xs font-medium rounded-xl cursor-pointer">Add Log</button>
              </div>
            </div>

            {/* Followup scheduler */}
            <div className="space-y-3 pt-2">
              <p className="text-xs uppercase font-bold tracking-widest text-[#8B7355]">Follow-up Reminders ({activeInquiry.followUps?.length || 0})</p>
              <div className="space-y-2">
                {(activeInquiry.followUps || []).map((reminder: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#2D5016]/5 border border-[#2D5016]/10 text-xs">
                    <span className="font-semibold text-[#2D5016]">{reminder.date}</span>
                    <span className="text-[#8B7355]">{reminder.note}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                  className="bg-white border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" />
                <input value={followUpNote} onChange={e => setFollowUpNote(e.target.value)} placeholder="Reminder description..."
                  className="col-span-2 bg-white border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" />
              </div>
              <button onClick={handleScheduleFollowUp} className="w-full py-2 bg-[#FAF8F5] border border-[#2C2416]/10 hover:bg-[#F0EDE8] text-[#2C2416] text-xs font-medium rounded-xl cursor-pointer">
                Schedule Reminder
              </button>
            </div>

            {/* Quotation History */}
            <div className="space-y-3 pt-2 text-left">
              <p className="text-xs uppercase font-bold tracking-widest text-[#8B7355]">Quotation History</p>
              <div className="space-y-2">
                {(() => {
                  const quotes = getQuotations();
                  const matches = quotes.filter((q: any) =>
                    q.inquiryId === activeInquiry.id ||
                    q.email === activeInquiry.email ||
                    q.businessName === activeInquiry.businessName
                  );
                  if (matches.length === 0) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-xs text-[#8B7355] italic mb-2">No quotations yet for this inquiry.</p>
                        <button onClick={() => openQuoteBuilder(activeInquiry)}
                          className="px-4 py-2 bg-[#C9920A] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#A87800]">
                          Create First Quotation
                        </button>
                      </div>
                    );
                  }
                  return matches.map((q: any) => (
                    <div key={q.id} className="p-3 rounded-xl border border-[#2C2416]/10 bg-white space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-xs text-[#2C2416]">{q.id}</p>
                          <p className="text-[10px] text-[#8B7355]">{q.date} • {q.items?.length || 0} product{(q.items?.length||0)!==1?"s":""}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xs text-[#2D5016]">₹{q.payableAmount?.toLocaleString('en-IN')}</p>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium capitalize"
                            style={{
                              backgroundColor: q.status === "converted" ? "rgba(45,80,22,0.15)" : q.status === "accepted" ? "#EBF5E6" : q.status === "draft" ? "#F0EDE8" : "#FEF3E2",
                              color: q.status === "converted" || q.status === "accepted" ? "#2D5016" : q.status === "draft" ? "#7D7060" : "#C85A1A"
                            }}>{q.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => openQuoteBuilder(activeInquiry, q)}
                          className="flex-1 py-1.5 text-[11px] font-medium rounded-lg bg-[#FAF8F5] border border-[#2C2416]/10 hover:bg-[#F0EDE8] cursor-pointer flex items-center justify-center gap-1">
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button onClick={() => downloadQuotePDF(q)}
                          className="flex-1 py-1.5 text-[11px] font-medium rounded-lg bg-[#E8F2FE] text-[#1B5EAD] hover:bg-[#D0E8FC] cursor-pointer flex items-center justify-center gap-1">
                          <Download className="w-3 h-3" /> PDF
                        </button>
                        {(q.status === "draft" || q.status === "sent" || q.status === "accepted") && (
                          <button onClick={() => handleConvertQuoteToOrder(q)}
                            className="flex-1 py-1.5 text-[11px] font-medium rounded-lg bg-[#EBF5E6] text-[#2D5016] hover:bg-[#D5ECC8] cursor-pointer flex items-center justify-center gap-1">
                            <UserCheck className="w-3 h-3" /> Convert
                          </button>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Delete inquiry button */}
            <div className="pt-4 border-t border-[#2C2416]/10">
              <button onClick={() => handleDeleteInquiry(activeInquiry.id)}
                className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-xs cursor-pointer">
                Delete inquiry record
              </button>
            </div>
          </div>
        )}
      </Drawer>

      {/* ── Inline Quotation Builder View ─────────────────────────── */}
      {wholesaleView === "quote-builder" && (() => {
        const calcs = calcTotals(quoteForm);
        return (
          <div className="fixed inset-0 z-50 overflow-y-auto" style={{ backgroundColor: "rgba(26,23,20,0.5)", backdropFilter: "blur(4px)" }}>
            <div className="min-h-screen p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* Builder header */}
                <div className="flex justify-between items-center bg-white rounded-2xl px-6 py-4 shadow-lg">
                  <div>
                    <h2 className="text-xl font-bold font-serif" style={{ color: C.charcoal }}>
                      {editingQuoteId ? `Edit Quotation (${quoteForm.id})` : "Create Quotation"}
                    </h2>
                    {quoteInquiryRef && (
                      <p className="text-xs text-[#8B7355] mt-0.5">Linked to inquiry: <span className="font-semibold text-[#2D5016]">{quoteInquiryRef.id} — {quoteInquiryRef.businessName}</span></p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="ghost" onClick={() => { setWholesaleView("list"); setEditingQuoteId(null); setQuoteInquiryRef(null); }}>Cancel</Btn>
                    <Btn icon={Download} variant="secondary" onClick={() => downloadQuotePDF(quoteForm)}>PDF Preview</Btn>
                    <Btn icon={Save} onClick={handleSaveQuote}>Save Quotation</Btn>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main form */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">1. Basic Parameters</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Quotation Number" value={quoteForm.id} onChange={v => setQuoteForm({ ...quoteForm, id: v })} disabled />
                        <Field label="Sales Executive" value={quoteForm.salesExecutive} onChange={v => setQuoteForm({ ...quoteForm, salesExecutive: v })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field type="date" label="Quotation Date" value={quoteForm.date} onChange={v => setQuoteForm({ ...quoteForm, date: v })} />
                        <Field type="date" label="Validity Expiry" value={quoteForm.validUntil} onChange={v => setQuoteForm({ ...quoteForm, validUntil: v })} />
                      </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">2. Client Profile</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Business Name" value={quoteForm.businessName} onChange={v => setQuoteForm({ ...quoteForm, businessName: v })} />
                        <Field label="Contact Person" value={quoteForm.contactPerson} onChange={v => setQuoteForm({ ...quoteForm, contactPerson: v })} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Email" value={quoteForm.email} onChange={v => setQuoteForm({ ...quoteForm, email: v })} />
                        <Field label="Phone" value={quoteForm.phone} onChange={v => setQuoteForm({ ...quoteForm, phone: v })} />
                      </div>
                      <Field label="GSTIN (Optional)" value={quoteForm.gstin} onChange={v => setQuoteForm({ ...quoteForm, gstin: v })} placeholder="e.g. 37AAAAC1234A1Z1" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Billing Address" value={quoteForm.billingAddress} onChange={v => setQuoteForm({ ...quoteForm, billingAddress: v })} as="textarea" />
                        <Field label="Shipping Address" value={quoteForm.shippingAddress} onChange={v => setQuoteForm({ ...quoteForm, shippingAddress: v })} as="textarea" />
                      </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">3. Product Line Items</h3>
                        <button onClick={handleAddItemRow} className="px-3 py-1.5 bg-[#2D5016] text-white rounded-lg text-xs font-semibold cursor-pointer">+ Add Item</button>
                      </div>
                      <div className="space-y-3">
                        {quoteForm.items.map((it: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                            <div className="md:col-span-3">
                              <label className="block text-[10px] uppercase font-bold text-[#8B7355] mb-1">Product</label>
                              <select value={it.name} onChange={e => handleItemFieldChange(idx, "name", e.target.value)}
                                className="w-full bg-white border border-[#2C2416]/10 rounded-lg p-2 text-xs outline-none cursor-pointer">
                                {["Chilli Powder","Turmeric Powder","Coriander Powder","Ginger Garlic Paste","Garam Masala"].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                            </div>
                            <div className="md:col-span-2"><Field label="Sack Weight" value={it.weight} onChange={v => handleItemFieldChange(idx, "weight", v)} placeholder="25kg Sack" /></div>
                            <div className="md:col-span-1"><Field type="number" label="Qty" value={it.quantity} onChange={v => handleItemFieldChange(idx, "quantity", Number(v))} /></div>
                            <div className="md:col-span-2"><Field type="number" label="Unit Price" value={it.unitPrice} onChange={v => handleItemFieldChange(idx, "unitPrice", Number(v))} /></div>
                            <div className="md:col-span-1"><Field type="number" label="Disc%" value={it.discount} onChange={v => handleItemFieldChange(idx, "discount", Number(v))} /></div>
                            <div className="md:col-span-1"><Field type="number" label="GST%" value={it.gst} onChange={v => handleItemFieldChange(idx, "gst", Number(v))} /></div>
                            <div className="md:col-span-2 flex justify-end gap-1 mb-1">
                              <button onClick={() => handleRemoveItemRow(idx)} className="p-1.5 rounded bg-red-50 text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">4. Logistics & Commercial</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Field type="number" label="Lead Time (Days)" value={quoteForm.leadTime} onChange={v => setQuoteForm({ ...quoteForm, leadTime: Number(v) })} />
                        <Field label="Packaging Type" value={quoteForm.packagingType} onChange={v => setQuoteForm({ ...quoteForm, packagingType: v })} />
                        <Field label="Delivery Method" value={quoteForm.deliveryMethod} onChange={v => setQuoteForm({ ...quoteForm, deliveryMethod: v })} />
                        <Field label="Payment Terms" value={quoteForm.paymentTerms} onChange={v => setQuoteForm({ ...quoteForm, paymentTerms: v })} />
                      </div>
                      <Field label="Notes & Special Requests" value={quoteForm.notes} onChange={v => setQuoteForm({ ...quoteForm, notes: v })} as="textarea" />
                    </Card>
                  </div>

                  {/* Pricing sidebar */}
                  <div className="space-y-6">
                    <Card className="p-6 space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">5. Discount Structure</h3>
                      <div>
                        <label className="block text-xs font-semibold text-[#8B7355] mb-1.5">Discount Type</label>
                        <select value={quoteForm.discountType} onChange={e => setQuoteForm({ ...quoteForm, discountType: e.target.value })}
                          className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                          <option value="percentage">Percentage (%)</option>
                          <option value="flat">Flat Cash (INR)</option>
                          <option value="volume">Volume Incentive</option>
                        </select>
                      </div>
                      <Field type="number" label="Discount Value" value={quoteForm.discountValue} onChange={v => setQuoteForm({ ...quoteForm, discountValue: Number(v) })} />
                      <Field type="number" label="Freight Charges (INR)" value={quoteForm.shippingCharges} onChange={v => setQuoteForm({ ...quoteForm, shippingCharges: Number(v) })} />
                    </Card>

                    <Card className="p-6 space-y-3">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">6. Pricing Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[#8B7355]">Subtotal:</span><span className="font-semibold">₹{calcs.subtotal}</span></div>
                        {Number(calcs.discount) > 0 && <div className="flex justify-between text-red-600"><span>Discount:</span><span>-₹{calcs.discount}</span></div>}
                        <div className="flex justify-between"><span className="text-[#8B7355]">Tax (GST):</span><span className="font-semibold">₹{calcs.tax}</span></div>
                        <div className="flex justify-between"><span className="text-[#8B7355]">Freight:</span><span className="font-semibold">₹{quoteForm.shippingCharges || 0}</span></div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-[#2C2416]/10" style={{ color: C.green }}>
                          <span>Final Payable:</span><span>₹{calcs.payableAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 space-y-4">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">7. Terms & Policies</h3>
                      <div className="space-y-2">
                        {quoteForm.termsList.map((t: string, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F5] border border-[#2C2416]/8 text-xs">
                            <span>{t}</span>
                            <button onClick={() => handleRemoveTerm(t)} className="text-red-600 font-bold hover:text-red-800 cursor-pointer">×</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={customTerm} onChange={e => setCustomTerm(e.target.value)} placeholder="Add custom term..."
                          className="flex-1 bg-white border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" />
                        <button onClick={handleAddCustomTerm} className="px-4 py-2 bg-[#2D5016] text-white text-xs font-semibold rounded-xl cursor-pointer">Add</button>
                      </div>
                    </Card>

                    <div className="flex flex-col gap-2">
                      <button onClick={handleSaveQuote} className="w-full py-3 bg-[#2D5016] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#1A3A0A] transition-colors cursor-pointer">
                        Save & Register Quotation
                      </button>
                      <button onClick={() => downloadQuotePDF(quoteForm)} className="w-full py-3 bg-[#C9920A] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#A87800] transition-colors cursor-pointer">
                        Download PDF Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── QUOTATION MANAGEMENT CMS PAGE ───────────────────────────────────────────
const DEFAULT_QUOTATIONS: any[] = [];

function QuotationManagementPage({ navigateTo }: { navigateTo: (p: string) => void }) {
  const [quotations, setQuotations] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_quotations");
      if (stored) return JSON.parse(stored);
      localStorage.setItem("spiceora_quotations", JSON.stringify(DEFAULT_QUOTATIONS));
      return DEFAULT_QUOTATIONS;
    } catch {
      return DEFAULT_QUOTATIONS;
    }
  });

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [executiveFilter, setExecutiveFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>("");

  // Builder Mode State
  const [builderMode, setBuilderMode] = useState<boolean>(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  // Quote Builder Form State
  const [quoteForm, setQuoteForm] = useState<any>({
    id: "",
    date: "",
    validUntil: "",
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    gstin: "",
    salesExecutive: "Unassigned",
    items: [{ name: "Chilli Powder", weight: "25kg Bag", quantity: 1, unitPrice: 2750, discount: 0, gst: 5 }],
    discountType: "percentage",
    discountValue: 0,
    shippingCharges: 0,
    paymentTerms: "50% Advance, 50% on Dispatch",
    leadTime: 5,
    packagingType: "Bulk Crate",
    deliveryMethod: "Road Freight",
    notes: "",
    termsList: ["Quotation Valid for 15 Days", "Prices Excluding GST"],
    status: "draft",
    timeline: []
  });

  const [customTerm, setCustomTerm] = useState<string>("");
  const [activeDetailQuote, setActiveDetailQuote] = useState<any | null>(null);

  // Check for prefilled wholesale inquiry lead redirected from WholesalePage
  useEffect(() => {
    try {
      const prefill = localStorage.getItem("spiceora_prefilled_quote_lead");
      if (prefill) {
        const lead = JSON.parse(prefill);
        localStorage.removeItem("spiceora_prefilled_quote_lead");

        const qtyMap: Record<string, number> = {
          "5kg": 1, "10kg": 1, "15kg": 1, "25kg": 1
        };
        const volStr = lead.volume || "5kg Pack";
        const matchedQty = parseInt(volStr) || 1;
        const sizeTag = volStr.includes("kg") ? volStr.substring(volStr.indexOf("kg") - 2).trim() : "5kg Pack";

        const newQuoteId = "QT-2026-" + Math.floor(Math.random() * 90000 + 10000);
        const today = new Date().toLocaleDateString('en-IN');
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 15);
        const expDate = futureDate.toLocaleDateString('en-IN');

        setQuoteForm({
          id: newQuoteId,
          date: today,
          validUntil: expDate,
          businessName: lead.businessName,
          contactPerson: lead.contactName,
          email: lead.email,
          phone: lead.phone,
          billingAddress: lead.businessName + " Head Office",
          shippingAddress: lead.businessName + " Storage / Yard",
          gstin: "",
          salesExecutive: lead.assignedExecutive !== "Unassigned" ? lead.assignedExecutive : "Amit Verma",
          items: [{ name: lead.productInterest || "Chilli Powder", weight: sizeTag, quantity: matchedQty, unitPrice: 2750, discount: 0, gst: 5 }],
          discountType: "percentage",
          discountValue: 0,
          shippingCharges: 350,
          paymentTerms: "50% Advance, 50% on Dispatch",
          leadTime: 7,
          packagingType: "Commercial Bag",
          deliveryMethod: "Road Freight",
          notes: lead.message || "",
          termsList: ["Quotation Valid for 15 Days", "Prices Excluding GST", "Transportation Extra"],
          status: "draft",
          timeline: [{ time: today + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: "Prefilled from Sourcing Inquiry" }]
        });
        setBuilderMode(true);
        toast.info("Pre-filled lead details for: " + lead.businessName);
      }
    } catch (e) {
      console.error("Lead pre-fill error:", e);
    }
  }, [builderMode]);

  const saveQuotations = (updated: any[]) => {
    setQuotations(updated);
    try {
      localStorage.setItem("spiceora_quotations", JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const addAuditLog = (action: string, details: string) => {
    try {
      const stored = localStorage.getItem("spiceora_audit_logs");
      const logs = stored ? JSON.parse(stored) : [];
      logs.unshift({
        time: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        action,
        user: "Arjun Kumar (Admin)",
        details
      });
      localStorage.setItem("spiceora_audit_logs", JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  };

  // Status mapping configs
  const statusColorMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    draft: { label: "Draft", bg: "#F0EDE8", text: "#7D7060", dot: "#A69888" },
    pending_approval: { label: "Pending Approval", bg: "#FFF4E5", text: "#B26A00", dot: "#ED8936" },
    sent: { label: "Sent", bg: "#E8F2FE", text: "#1B5EAD", dot: "#2B7FE2" },
    viewed: { label: "Viewed", bg: "#FAF0FF", text: "#8A2BE2", dot: "#C77DFF" },
    accepted: { label: "Accepted", bg: "#EBF5E6", text: "#2D5016", dot: "#4A7A2A" },
    rejected: { label: "Rejected", bg: "#FDECEA", text: "#C94040", dot: "#C94040" },
    expired: { label: "Expired", bg: "#FFF0F0", text: "#E53E3E", dot: "#FC8181" },
    converted: { label: "Converted", bg: "rgba(45,80,22,0.15)", text: "#1A3A0A", dot: "#2D5016" },
    cancelled: { label: "Cancelled", bg: "#FAF8F5", text: "#7D7060", dot: "#A69888" },
  };

  // Live Auto Calculations
  const calculateTotals = (form: any) => {
    let subtotal = 0;
    let taxTotal = 0;

    (form.items || []).forEach((item: any) => {
      const itemGross = (item.quantity || 0) * (item.unitPrice || 0);
      const itemDiscount = itemGross * ((item.discount || 0) / 100);
      const itemNet = Math.max(0, itemGross - itemDiscount);
      subtotal += itemNet;
      taxTotal += itemNet * ((item.gst || 0) / 100);
    });

    let overallDiscount = 0;
    if (form.discountType === "percentage") {
      overallDiscount = subtotal * ((form.discountValue || 0) / 100);
    } else if (form.discountType === "flat") {
      overallDiscount = Number(form.discountValue) || 0;
    }
    overallDiscount = Math.max(0, Math.min(overallDiscount, subtotal));

    const netSubtotal = Math.max(0, subtotal - overallDiscount);
    const taxAfterDiscount = subtotal > 0 ? taxTotal * (netSubtotal / subtotal) : 0;
    const grand = netSubtotal + taxAfterDiscount + (Number(form.shippingCharges) || 0);
    const rounded = Math.round(grand);
    const roundOff = (rounded - grand).toFixed(2);

    return {
      subtotal: subtotal.toFixed(2),
      discount: overallDiscount.toFixed(2),
      tax: taxAfterDiscount.toFixed(2),
      grandTotal: grand.toFixed(2),
      payableAmount: rounded,
      roundOff
    };
  };

  const calcs = calculateTotals(quoteForm);

  const handleAddItemRow = () => {
    setQuoteForm({
      ...quoteForm,
      items: [...quoteForm.items, { name: "Turmeric Powder", weight: "10kg Bag", quantity: 1, unitPrice: 1100, discount: 0, gst: 5 }]
    });
  };

  const handleRemoveItemRow = (idx: number) => {
    if (quoteForm.items.length <= 1) {
      toast.error("Quotation must contain at least one line item.");
      return;
    }
    const updated = quoteForm.items.filter((_: any, i: number) => i !== idx);
    setQuoteForm({ ...quoteForm, items: updated });
  };

  const handleDuplicateItemRow = (idx: number) => {
    const row = { ...quoteForm.items[idx] };
    setQuoteForm({
      ...quoteForm,
      items: [...quoteForm.items, row]
    });
    toast.success("Line item duplicated");
  };

  const handleItemFieldChange = (idx: number, field: string, value: any) => {
    const updated = [...quoteForm.items];
    updated[idx][field] = value;
    setQuoteForm({ ...quoteForm, items: updated });
  };

  const handleAddCustomTerm = () => {
    if (!customTerm.trim()) return;
    setQuoteForm({
      ...quoteForm,
      termsList: [...quoteForm.termsList, customTerm.trim()]
    });
    setCustomTerm("");
    toast.success("Custom term added");
  };

  const handleRemoveTerm = (term: string) => {
    setQuoteForm({
      ...quoteForm,
      termsList: quoteForm.termsList.filter((t: string) => t !== term)
    });
  };

  const handleSaveQuotation = () => {
    if (!quoteForm.businessName || !quoteForm.contactPerson || !quoteForm.email) {
      toast.error("Please fill in Business Name, Contact Name, and Email.");
      return;
    }

    const calculatedPayable = calcs.payableAmount;
    const finalForm = { ...quoteForm, payableAmount: calculatedPayable };

    let updated = [...quotations];
    if (editingQuoteId) {
      updated = updated.map(q => q.id === editingQuoteId ? finalForm : q);
      addAuditLog("Quotation Updated", `Updated quotation details for ${quoteForm.businessName} (${quoteForm.id})`);
      toast.success("Quotation updated successfully");
    } else {
      updated.unshift(finalForm);
      addAuditLog("Quotation Created", `Generated quotation ${quoteForm.id} for ${quoteForm.businessName}`);
      toast.success("Quotation saved as draft");
    }

    saveQuotations(updated);
    setBuilderMode(false);
    setEditingQuoteId(null);
  };

  const handleOpenCreateNew = () => {
    const newId = "QT-2026-" + Math.floor(Math.random() * 90000 + 10000);
    const today = new Date().toLocaleDateString('en-IN');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    const expDate = futureDate.toLocaleDateString('en-IN');

    setQuoteForm({
      id: newId,
      date: today,
      validUntil: expDate,
      businessName: "",
      contactPerson: "",
      email: "",
      phone: "",
      billingAddress: "",
      shippingAddress: "",
      gstin: "",
      salesExecutive: "Amit Verma",
      items: [{ name: "Chilli Powder", weight: "25kg Bag", quantity: 5, unitPrice: 2750, discount: 0, gst: 5 }],
      discountType: "percentage",
      discountValue: 0,
      shippingCharges: 400,
      paymentTerms: "50% Advance, 50% on Dispatch",
      leadTime: 5,
      packagingType: "Bulk Crate",
      deliveryMethod: "Road Freight",
      notes: "",
      termsList: ["Quotation Valid for 15 Days", "Prices Excluding GST", "Transportation Extra"],
      status: "draft",
      timeline: [{ time: today + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: "Quotation Form Initialized" }]
    });
    setEditingQuoteId(null);
    setBuilderMode(true);
  };

  const handleOpenEdit = (quote: any) => {
    setQuoteForm(quote);
    setEditingQuoteId(quote.id);
    setBuilderMode(true);
  };

  const handleUpdateStatusSingle = (id: string, newStatus: string) => {
    const timeStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const logEvent = `Status changed to ${newStatus.replace("_", " ")} by Admin`;
    
    const updated = quotations.map(q => {
      if (q.id === id) {
        return {
          ...q,
          status: newStatus,
          timeline: [...(q.timeline || []), { time: timeStr, event: logEvent }]
        };
      }
      return q;
    });

    saveQuotations(updated);
    addAuditLog("Quotation Status Changed", `Quotation ${id} marked as ${newStatus}`);
    toast.success(`Quotation marked as ${newStatus}`);
    if (activeDetailQuote && activeDetailQuote.id === id) {
      setActiveDetailQuote({
        ...activeDetailQuote,
        status: newStatus,
        timeline: [...(activeDetailQuote.timeline || []), { time: timeStr, event: logEvent }]
      });
    }
  };

  const handleConvertQuoteToOrder = (quote: any) => {
    // Generate order record
    const orderId = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
    const dateStr = new Date().toLocaleDateString('en-IN');
    
    const newOrder = {
      id: orderId,
      customer: quote.businessName,
      email: quote.email,
      date: dateStr,
      items: quote.items?.map((it: any) => `${it.name} (${it.weight} x ${it.quantity})`).join(", ") || "Wholesale Batch",
      total: `₹${quote.payableAmount}`,
      status: "processing", // goes straight to processing since payment is accepted
      address: quote.shippingAddress,
      gstin: quote.gstin,
      source: "Converted B2B Quotation (" + quote.id + ")"
    };

    // Save to orders db
    try {
      const storedOrders = localStorage.getItem("spiceora_orders");
      const list = storedOrders ? JSON.parse(storedOrders) : [];
      list.unshift(newOrder);
      localStorage.setItem("spiceora_orders", JSON.stringify(list));
      
      // Update quote status
      handleUpdateStatusSingle(quote.id, "converted");
      
      // Save logs
      addAuditLog("Quotation Converted", `Quotation ${quote.id} successfully converted to Order ${orderId}`);
      toast.success("Converted to Order successfully!", {
        description: `Order ${orderId} created in pipeline.`
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to convert to Order.");
    }
  };

  const handleDeleteQuote = (id: string) => {
    const updated = quotations.filter(q => q.id !== id);
    saveQuotations(updated);
    addAuditLog("Quotation Deleted", `Deleted quotation record ${id}`);
    toast.success(`Quotation ${id} deleted`);
    setActiveDetailQuote(null);
  };

  // Reusable dynamic PDF quote generator using jsPDF
  const downloadQuotationPDF = (q: any) => {
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Fetch template parameters
      let template = {
        watermark: "OFFICIAL QUOTATION",
        primaryColor: [42, 74, 60],
        secondaryColor: [201, 146, 10],
        terms: "Terms: Ex-works / F.O.B Guntur yard dispatch."
      };
      try {
        const storedTemplate = localStorage.getItem("spiceora_pdf_template");
        if (storedTemplate) {
          const parsed = JSON.parse(storedTemplate);
          const colorMap: Record<string, number[]> = {
            green: [42, 74, 60],
            gold: [201, 146, 10],
            red: [180, 40, 40],
            blue: [25, 80, 150]
          };
          template.watermark = parsed.watermark || template.watermark;
          template.primaryColor = colorMap[parsed.primaryColor] || [42, 74, 60];
          template.secondaryColor = colorMap[parsed.secondaryColor] || [201, 146, 10];
        }
      } catch {}

      const primary = template.primaryColor;
      const secondary = template.secondaryColor;

      // Header Branding
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 40, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(secondary[0], secondary[1], secondary[2]);
      doc.text("SPICEORA", 15, 20);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("PREMIUM WHOLESALE SPICE SOURCING", 15, 27);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(secondary[0], secondary[1], secondary[2]);
      doc.text("OFFICIAL QUOTATION", 130, 20);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`Quote No: ${q.id}`, 130, 27);
      doc.text(`Date: ${q.date}`, 130, 32);

      // Issuer Details
      doc.setFillColor(250, 248, 243);
      doc.rect(0, 40, 210, 25, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 23, 20);
      doc.text("Spiceora Sourcing Desk Gate 2, Guntur Industrial Area, AP, India", 15, 48);
      doc.text("Support Desk: +91 9390645710  |  Email: dreammasterorigin@gmail.com", 15, 53);

      // Customer Profiles
      let cy = 78;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("BILL TO:", 15, cy);
      doc.text("SHIP TO:", 110, cy);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(26, 23, 20);
      doc.text(q.businessName, 15, cy + 6);
      doc.text(q.businessName, 110, cy + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(74, 70, 64);
      doc.text(`Contact: ${q.contactPerson}`, 15, cy + 11);
      doc.text(`Phone: +91 ${q.phone}`, 15, cy + 16);
      doc.text(`Email: ${q.email}`, 15, cy + 21);
      if (q.gstin) {
        doc.text(`GSTIN: ${q.gstin}`, 15, cy + 26);
      }

      const billAddressSplit = doc.splitTextToSize(q.billingAddress || "N/A", 80);
      const shipAddressSplit = doc.splitTextToSize(q.shippingAddress || "N/A", 80);
      doc.text(billAddressSplit, 15, cy + 31);
      doc.text(shipAddressSplit, 110, cy + 11);

      // Line Items Table
      let tableY = 125;
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(15, tableY, 180, 8, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);
      doc.text("Product Details", 18, tableY + 5.5);
      doc.text("Pack", 70, tableY + 5.5);
      doc.text("Qty", 90, tableY + 5.5);
      doc.text("Rate (INR)", 110, tableY + 5.5);
      doc.text("Disc%", 135, tableY + 5.5);
      doc.text("GST%", 155, tableY + 5.5);
      doc.text("Net Total", 175, tableY + 5.5);

      let rowY = tableY + 8;
      let totalSub = 0;
      let totalGst = 0;

      (q.items || []).forEach((row: any, idx: number) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 246, 240);
          doc.rect(15, rowY, 180, 8, "F");
        }
        doc.setDrawColor(26, 23, 20, 0.08);
        doc.rect(15, rowY, 180, 8, "S");

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(26, 23, 20);
        doc.text(row.name, 18, rowY + 5.5);

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(74, 70, 64);
        doc.text(row.weight, 70, rowY + 5.5);
        doc.text(String(row.quantity), 90, rowY + 5.5);
        doc.text(`Rs.${row.unitPrice}`, 110, rowY + 5.5);
        doc.text(`${row.discount}%`, 135, rowY + 5.5);
        doc.text(`${row.gst}%`, 155, rowY + 5.5);

        const netVal = (row.quantity * row.unitPrice) * (1 - row.discount / 100);
        const gstVal = netVal * (row.gst / 100);
        totalSub += netVal;
        totalGst += gstVal;

        doc.setFont("Helvetica", "bold");
        doc.setTextColor(26, 23, 20);
        doc.text(`Rs.${Math.round(netVal + gstVal)}`, 175, rowY + 5.5);

        rowY += 8;
      });

      // Totals and summaries
      rowY += 6;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(74, 70, 64);
      doc.text("Payment structure: " + (q.paymentTerms || "Direct Bank"), 15, rowY);
      doc.text("Lead Dispatch Time: " + (q.leadTime || "5") + " days from advance", 15, rowY + 5);
      doc.text("Packaging standard: " + (q.packagingType || "Air-Tight sacks"), 15, rowY + 10);
      doc.text("Logistics delivery method: " + (q.deliveryMethod || "Road transport"), 15, rowY + 15);

      // Pricing Panel
      let payY = rowY;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(26, 23, 20);
      doc.text("Gross Subtotal:", 130, payY);
      doc.text(`Rs.${totalSub.toFixed(0)}`, 175, payY);
      payY += 5;

      let overDisc = 0;
      if (q.discountType === "percentage") {
        overDisc = totalSub * (q.discountValue / 100);
      } else if (q.discountType === "flat") {
        overDisc = q.discountValue;
      }
      if (overDisc > 0) {
        doc.text("Overall Discount:", 130, payY);
        doc.text(`-Rs.${overDisc.toFixed(0)}`, 175, payY);
        payY += 5;
      }

      doc.text("Tax (CGST+SGST):", 130, payY);
      doc.text(`Rs.${totalGst.toFixed(0)}`, 175, payY);
      payY += 5;

      doc.text("Freight Logistics:", 130, payY);
      doc.text(`Rs.${q.shippingCharges || 0}`, 175, payY);
      payY += 5;

      doc.setFillColor(secondary[0], secondary[1], secondary[2], 0.12);
      doc.rect(125, payY - 3.8, 70, 7.5, "F");
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Total Payable amount:", 128, payY + 1.2);
      doc.text(`Rs.${q.payableAmount}`, 173, payY + 1.2);

      // Terms list
      payY += 15;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("TERMS AND DISPATCH POLICIES:", 15, payY);
      payY += 4.5;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(74, 70, 64);
      (q.termsList || []).forEach((t: string) => {
        doc.text(`• ${t}`, 18, payY);
        payY += 4.5;
      });

      // Authorized signatures
      payY += 8;
      doc.setDrawColor(26, 23, 20, 0.12);
      doc.line(140, payY, 190, payY);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 23, 20);
      doc.text("Authorized Signature", 145, payY + 5);
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(122, 112, 100);
      doc.text("Spiceora Global B2B Division", 145, payY + 9);

      // Watermark
      if (template.watermark) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(200, 200, 200, 0.1);
        doc.text(template.watermark, 30, 240, null, 45);
      }

      // Page numbering footer
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 1 of 1", 100, 285);

      const cleanBiz = q.businessName.trim().replace(/\s+/g, "_");
      doc.save(`SPICEORA_Quotation_${q.id}_${cleanBiz}.pdf`);
      toast.success("Quotation PDF generated", { description: `Downloaded successfully.` });
      
      // Update activity logs
      const timeStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const updated = quotations.map(item => {
        if (item.id === q.id) {
          return {
            ...item,
            timeline: [...(item.timeline || []), { time: timeStr, event: "Quotation PDF Downloaded" }]
          };
        }
        return item;
      });
      saveQuotations(updated);
    } catch (e) {
      console.error(e);
      toast.error("Failed to compile quotation PDF.");
    }
  };

  const handleMarkAsSent = (q: any) => {
    handleUpdateStatusSingle(q.id, "sent");
    toast.success("Quotation marked as Sent!");
  };

  const handleShareQuoteLink = (q: any) => {
    navigator.clipboard.writeText(`https://spiceora.in/quote/view/${q.id}`);
    toast.success("Quote link copied to clipboard!");
  };

  // Filter quotation list
  const filtered = quotations.filter(q => {
    const matchesTab = activeTab === "all" || q.status === activeTab;
    const matchesSearch = 
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.salesExecutive.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExec = executiveFilter === "all" || q.salesExecutive === executiveFilter;
    const matchesProduct = productFilter === "all" || q.items?.some((it: any) => it.name === productFilter);

    return matchesTab && matchesSearch && matchesExec && matchesProduct;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "newest") return b.date.localeCompare(a.date);
    if (sortBy === "oldest") return a.date.localeCompare(b.date);
    if (sortBy === "amount-high") return b.payableAmount - a.payableAmount;
    if (sortBy === "amount-low") return a.payableAmount - b.payableAmount;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginated.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginated.map(p => p.id));
    }
  };

  const handleApplyBulkStatus = () => {
    if (selectedIds.length === 0 || !bulkStatus) return;
    const timeStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const logEvent = `Bulk Status changed to ${bulkStatus} by Admin`;
    
    const updated = quotations.map(q => {
      if (selectedIds.includes(q.id)) {
        return {
          ...q,
          status: bulkStatus,
          timeline: [...(q.timeline || []), { time: timeStr, event: logEvent }]
        };
      }
      return q;
    });

    saveQuotations(updated);
    addAuditLog("Bulk Status Update", `Marked ${selectedIds.length} quotations as ${bulkStatus}`);
    toast.success(`Updated ${selectedIds.length} quotations`);
    setSelectedIds([]);
    setBulkStatus("");
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const updated = quotations.filter(q => !selectedIds.includes(q.id));
    saveQuotations(updated);
    addAuditLog("Bulk Quotation Delete", `Deleted ${selectedIds.length} quotations`);
    toast.success(`Deleted ${selectedIds.length} quotations`);
    setSelectedIds([]);
  };

  // Compute metrics
  const metrics = {
    total: quotations.length,
    pending: quotations.filter(x => x.status === "pending_approval").length,
    sent: quotations.filter(x => x.status === "sent" || x.status === "viewed").length,
    accepted: quotations.filter(x => x.status === "accepted" || x.status === "converted").length,
    rejected: quotations.filter(x => x.status === "rejected").length,
    expired: quotations.filter(x => x.status === "expired").length,
    rate: quotations.length ? ((quotations.filter(x => x.status === "accepted" || x.status === "converted").length / quotations.length) * 100).toFixed(1) : "0.0",
    potentialRev: quotations.reduce((acc, q) => acc + (q.status !== "rejected" && q.status !== "cancelled" ? q.payableAmount : 0), 0),
    avgValue: quotations.length ? Math.round(quotations.reduce((acc, q) => acc + q.payableAmount, 0) / quotations.length) : 0
  };

  if (builderMode) {
    return (
      <div className="space-y-6 text-left">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold font-serif" style={{ color: C.charcoal }}>
              {editingQuoteId ? `Edit Quotation Details (${quoteForm.id})` : "Create New B2B Wholesale Quotation"}
            </h2>
            <p className="text-xs text-[#8B7355]">Fill in the commercial pricing, weights, line items, and terms configuration.</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="ghost" onClick={() => { setBuilderMode(false); setEditingQuoteId(null); }}>Cancel</Btn>
            <Btn icon={Save} onClick={handleSaveQuotation}>Save Quotation Draft</Btn>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main inputs panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">1. Basic Quote Parameters</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Quotation Number" value={quoteForm.id} onChange={v => setQuoteForm({ ...quoteForm, id: v })} disabled />
                <Field label="Sales Executive / Representative" value={quoteForm.salesExecutive} onChange={v => setQuoteForm({ ...quoteForm, salesExecutive: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field type="date" label="Quotation Date" value={quoteForm.date} onChange={v => setQuoteForm({ ...quoteForm, date: v })} />
                <Field type="date" label="Validity Expiry Date" value={quoteForm.validUntil} onChange={v => setQuoteForm({ ...quoteForm, validUntil: v })} />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">2. Client Account Profile</h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Business / Corporate Name" value={quoteForm.businessName} onChange={v => setQuoteForm({ ...quoteForm, businessName: v })} />
                <Field label="Contact Person Name" value={quoteForm.contactPerson} onChange={v => setQuoteForm({ ...quoteForm, contactPerson: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Business Email" value={quoteForm.email} onChange={v => setQuoteForm({ ...quoteForm, email: v })} />
                <Field label="Phone / Mobile Number" value={quoteForm.phone} onChange={v => setQuoteForm({ ...quoteForm, phone: v })} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field label="GSTIN (Optional)" value={quoteForm.gstin} onChange={v => setQuoteForm({ ...quoteForm, gstin: v })} placeholder="e.g. 37AAAAC1234A1Z1" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Corporate Billing Address" value={quoteForm.billingAddress} onChange={v => setQuoteForm({ ...quoteForm, billingAddress: v })} as="textarea" />
                <Field label="Dispatch Delivery Address" value={quoteForm.shippingAddress} onChange={v => setQuoteForm({ ...quoteForm, shippingAddress: v })} as="textarea" />
              </div>
            </Card>

            {/* Product items list builder */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">3. Product Sourcing Matrix</h3>
                <button onClick={handleAddItemRow} className="px-3 py-1.5 bg-[#2D5016] text-white rounded-lg text-xs font-semibold cursor-pointer">Add Line Item</button>
              </div>

              <div className="space-y-3">
                {quoteForm.items.map((it: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-[#8B7355]">Product Name</label>
                      <select value={it.name} onChange={e => handleItemFieldChange(idx, "name", e.target.value)}
                        className="mt-1 w-full bg-white border border-[#2C2416]/10 rounded-lg p-2 text-xs outline-none cursor-pointer">
                        <option value="Chilli Powder">Chilli Powder</option>
                        <option value="Turmeric Powder">Turmeric Powder</option>
                        <option value="Coriander Powder">Coriander Powder</option>
                        <option value="Ginger Garlic Paste">Ginger Garlic Paste</option>
                        <option value="Garam Masala">Garam Masala</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <Field label="Sack Weight" value={it.weight} onChange={v => handleItemFieldChange(idx, "weight", v)} placeholder="e.g. 25kg Sack" />
                    </div>

                    <div className="md:col-span-1.5">
                      <Field type="number" label="Qty" value={it.quantity} onChange={v => handleItemFieldChange(idx, "quantity", Number(v))} />
                    </div>

                    <div className="md:col-span-2">
                      <Field type="number" label="Unit Price" value={it.unitPrice} onChange={v => handleItemFieldChange(idx, "unitPrice", Number(v))} />
                    </div>

                    <div className="md:col-span-1.5">
                      <Field type="number" label="Disc%" value={it.discount} onChange={v => handleItemFieldChange(idx, "discount", Number(v))} />
                    </div>

                    <div className="md:col-span-1.5">
                      <Field type="number" label="GST%" value={it.gst} onChange={v => handleItemFieldChange(idx, "gst", Number(v))} />
                    </div>

                    <div className="md:col-span-1 flex justify-end gap-1 mb-1">
                      <button onClick={() => handleDuplicateItemRow(idx)} className="p-1 rounded bg-green-50 text-green-700 cursor-pointer">
                        <PlusCircle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleRemoveItemRow(idx)} className="p-1 rounded bg-red-50 text-red-600 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Logistics & Commercial configurations */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">4. Commercial Logistics & Shipping Policy</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="MOQ (Units)" value={quoteForm.moq} onChange={v => setQuoteForm({ ...quoteForm, moq: v })} placeholder="e.g. 5 bags" />
                <Field type="number" label="Lead Dispatch Time (Days)" value={quoteForm.leadTime} onChange={v => setQuoteForm({ ...quoteForm, leadTime: Number(v) })} />
                <Field label="Packaging Container Type" value={quoteForm.packagingType} onChange={v => setQuoteForm({ ...quoteForm, packagingType: v })} />
                <Field label="Delivery Transportation" value={quoteForm.deliveryMethod} onChange={v => setQuoteForm({ ...quoteForm, deliveryMethod: v })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Payment Term Conditions" value={quoteForm.paymentTerms} onChange={v => setQuoteForm({ ...quoteForm, paymentTerms: v })} placeholder="e.g. 50% Advance, 50% on dispatch" />
                <Field label="Negotiation Notes & Special Requests" value={quoteForm.notes} onChange={v => setQuoteForm({ ...quoteForm, notes: v })} as="textarea" />
              </div>
            </Card>
          </div>

          {/* Pricing calculations sidebar preview */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">5. Quote discount structure</h3>
              
              <div>
                <label className="block text-xs font-semibold text-[#8B7355] mb-1.5">Discount Management Option</label>
                <select value={quoteForm.discountType} onChange={e => setQuoteForm({ ...quoteForm, discountType: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="flat">Flat Cash Discount (INR)</option>
                  <option value="volume">Volume Incentive Discount</option>
                  <option value="custom">Custom Deal Waiver</option>
                </select>
              </div>

              <Field type="number" label="Discount Value Factor" value={quoteForm.discountValue} onChange={v => setQuoteForm({ ...quoteForm, discountValue: Number(v) })} />
              <Field type="number" label="Freight Shipping Charges (INR)" value={quoteForm.shippingCharges} onChange={v => setQuoteForm({ ...quoteForm, shippingCharges: Number(v) })} />
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">6. Pricing Summary</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Items Subtotal:</span>
                  <span className="font-semibold">₹{calcs.subtotal}</span>
                </div>
                {Number(calcs.discount) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Overall Discount:</span>
                    <span>-₹{calcs.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Tax (GST):</span>
                  <span className="font-semibold">₹{calcs.tax}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Freight Logistics:</span>
                  <span className="font-semibold">₹{quoteForm.shippingCharges || 0}</span>
                </div>
                <div className="flex justify-between text-[11px] text-[#8B7355] border-t border-dashed pt-2">
                  <span>Adjustment Round off:</span>
                  <span>₹{calcs.roundOff}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-[#2C2416]/10" style={{ color: C.green }}>
                  <span>Final Payable:</span>
                  <span>₹{calcs.payableAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>

            {/* Terms and conditions presets manager */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-[#8B7355]">7. Terms and Dispatch Policies</h3>
              
              <div className="space-y-2">
                {quoteForm.termsList.map((t: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FAF8F5] border border-[#2C2416]/8 text-xs">
                    <span>{t}</span>
                    <button onClick={() => handleRemoveTerm(t)} className="text-red-600 font-bold hover:text-red-800 cursor-pointer">×</button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input value={customTerm} onChange={e => setCustomTerm(e.target.value)} placeholder="Type custom dispatch policy..."
                  className="flex-1 bg-white border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none text-[#2C2416]" />
                <button onClick={handleAddCustomTerm} className="px-4 py-2 bg-[#2D5016] text-white text-xs font-semibold rounded-xl cursor-pointer">Add</button>
              </div>
            </Card>

            <div className="flex flex-col gap-2">
              <button onClick={handleSaveQuotation} className="w-full py-3 bg-[#2D5016] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#1A3A0A] transition-colors cursor-pointer">
                Save & Register Quotation
              </button>
              <button onClick={() => downloadQuotationPDF(quoteForm)} className="w-full py-3 bg-[#C9920A] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow hover:bg-[#A87800] transition-colors cursor-pointer">
                Download PDF Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Analytics header potential Revenue */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Generated Quotations", value: metrics.total, icon: ClipboardList, color: C.green },
          { label: "Pending Deal Pipeline", value: metrics.pending, icon: Clock, color: C.yellow },
          { label: "Converted to Orders", value: metrics.accepted, icon: CheckCircle, color: C.greenLight },
          { label: "Potential Deal Value", value: `₹${metrics.potentialRev.toLocaleString('en-IN')}`, icon: TrendingUp, color: C.orange }
        ].map((kpi, idx) => (
          <Card key={idx} className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#8B7355]">{kpi.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>
                <kpi.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold font-serif" style={{ color: C.charcoal }}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Action controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2C2416]/10 pb-4">
        <div className="flex flex-wrap gap-2">
          {["all", "draft", "sent", "accepted", "rejected", "expired", "converted"].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === tab ? "bg-[#2D5016] text-white" : "bg-white text-[#2C2416] border border-[#2C2416]/10"}`}>
              {tab.replace("_", " ")} ({tab === "all" ? quotations.length : quotations.filter(x => x.status === tab).length})
            </button>
          ))}
        </div>
        <Btn icon={Plus} onClick={handleOpenCreateNew}>Create New Quotation</Btn>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Search */}
        <div className="lg:col-span-4 flex items-center gap-2 rounded-xl px-3 py-2 bg-white border border-[#2C2416]/10">
          <Search className="w-4 h-4 text-[#8B7355]" />
          <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search quote #, business name..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-gray-400 text-[#2C2416]" />
        </div>

        {/* Dropdowns */}
        <div className="lg:col-span-8 flex flex-wrap gap-2 justify-end">
          <select value={executiveFilter} onChange={e => { setExecutiveFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="all">All Executives</option>
            <option value="Amit Verma">Amit Verma</option>
            <option value="Priya Sen">Priya Sen</option>
            <option value="Rahul Sharma">Rahul Sharma</option>
          </select>

          <select value={productFilter} onChange={e => { setProductFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="all">All Products</option>
            <option value="Chilli Powder">Chilli Powder</option>
            <option value="Turmeric Powder">Turmeric Powder</option>
            <option value="Coriander Powder">Coriander Powder</option>
            <option value="Ginger Garlic Paste">Ginger Garlic Paste</option>
            <option value="Garam Masala">Garam Masala</option>
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high">Amount (High to Low)</option>
            <option value="amount-low">Amount (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Bulk action selection banner */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-xl bg-[#2D5016]/5 border border-[#2D5016]/20 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs font-semibold text-[#2D5016]">{selectedIds.length} quotations selected:</span>
          <div className="flex flex-wrap gap-2">
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs bg-white border border-[#2C2416]/10 outline-none cursor-pointer">
              <option value="">Update Status...</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <button onClick={handleApplyBulkStatus} className="px-3 py-1.5 rounded-lg bg-[#2D5016] text-white text-xs font-medium cursor-pointer">Apply Status</button>
            <button onClick={handleBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium cursor-pointer">Delete Selected</button>
          </div>
        </div>
      )}

      {/* Quotation grid list */}
      <Card className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: "#FDFCFB", borderBottom: `1px solid ${C.border}` }}>
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" checked={selectedIds.length === paginated.length && paginated.length > 0} onChange={toggleSelectAll} className="cursor-pointer" />
              </th>
              {["Quote No", "Date", "Business Partner", "Contact Person", "Items Count", "Deal Value", "Status", "Executive", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((quote) => (
              <tr key={quote.id} className="transition-colors duration-100 border-b border-[#2C2416]/10 hover:bg-[#FAF8F5]">
                <td className="px-4 py-3">
                  <input type="checkbox" checked={selectedIds.includes(quote.id)} onChange={() => toggleSelect(quote.id)} className="cursor-pointer" />
                </td>
                <td className="px-4 py-3 text-xs font-mono font-bold text-[#2C2416]">{quote.id}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">{quote.date}</td>
                <td className="px-4 py-3 text-sm font-semibold text-[#2C2416]">{quote.businessName}</td>
                <td className="px-4 py-3 text-sm text-[#2C2416]">{quote.contactPerson}</td>
                <td className="px-4 py-3 text-xs text-[#8B7355] font-semibold">{quote.items?.length || 0} products</td>
                <td className="px-4 py-3 text-sm font-bold text-[#2D5016]">₹{quote.payableAmount?.toLocaleString('en-IN')}</td>
                <td className="px-4 py-3 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: statusColorMap[quote.status]?.bg, color: statusColorMap[quote.status]?.text }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColorMap[quote.status]?.dot }} />
                    {statusColorMap[quote.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-[#2C2416] font-medium">{quote.salesExecutive}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setActiveDetailQuote(quote)} className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleOpenEdit(quote)} className="p-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors cursor-pointer">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => downloadQuotationPDF(quote)} className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan={9} className="py-16 text-center text-[#8B7355] text-sm">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-25" />
                  No quotation records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-[#2C2416]/10">
          <span className="text-xs text-[#8B7355]">Page {currentPage} of {totalPages} ({filtered.length} quotes total)</span>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-[#2C2416]/10 text-xs font-medium cursor-pointer disabled:opacity-50">Prev</button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-[#2C2416]/10 text-xs font-medium cursor-pointer disabled:opacity-50">Next</button>
          </div>
        </div>
      </Card>

      {/* Quote Details View Drawer */}
      <Drawer open={!!activeDetailQuote} onClose={() => setActiveDetailQuote(null)} title={`Quotation: ${activeDetailQuote?.id}`} width={550}>
        {activeDetailQuote && (
          <div className="p-6 space-y-6 text-[#2C2416]">
            {/* Status updates buttons */}
            <div className="flex gap-2">
              <button onClick={() => handleMarkAsSent(activeDetailQuote)}
                className="flex-1 py-2 bg-[#2D5016] text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-[#1A3A0A] cursor-pointer">
                <Check className="w-3.5 h-3.5" /> Mark as Sent
              </button>
              <button onClick={() => handleShareQuoteLink(activeDetailQuote)}
                className="flex-1 py-2 bg-[#FAF8F5] border border-[#2C2416]/10 text-[#2C2416] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-[#F0EDE8] cursor-pointer">
                <Layers className="w-3.5 h-3.5" /> Copy Share Link
              </button>
            </div>

            {/* Convert to Order card trigger */}
            {(activeDetailQuote.status === "accepted" || activeDetailQuote.status === "sent" || activeDetailQuote.status === "viewed") && (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 space-y-2">
                <p className="text-xs font-bold text-green-800">Quotation Approved or Confirmed?</p>
                <p className="text-[11px] text-green-700">Converting this quotation automatically generates customer orders, dispatch timelines, and billing invoices.</p>
                <button onClick={() => handleConvertQuoteToOrder(activeDetailQuote)}
                  className="w-full py-2 bg-[#2D5016] hover:bg-[#1A3A0A] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <UserCheck className="w-4 h-4" /> Convert to Customer Order
                </button>
              </div>
            )}

            {/* Profile summary card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-[#8B7355]">Business Client</p>
                <p className="font-bold text-sm">{activeDetailQuote.businessName}</p>
                <p className="text-xs text-[#8B7355]">{activeDetailQuote.email}</p>
                <p className="text-xs text-[#8B7355]">+91 {activeDetailQuote.phone}</p>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-[#8B7355]">Quotation Info</p>
                <p className="font-mono font-bold text-xs">{activeDetailQuote.id}</p>
                <p className="text-xs text-[#8B7355]">Date: {activeDetailQuote.date}</p>
                <p className="text-xs text-[#8B7355]">Expiry: {activeDetailQuote.validUntil}</p>
              </div>
            </div>

            {/* Product items summary table */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Quoted Product Line Items</p>
              <div className="p-3 rounded-2xl border border-[#2C2416]/10 space-y-2">
                {(activeDetailQuote.items || []).map((row: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs pb-1.5 border-b border-dashed border-[#2C2416]/8 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-[#2C2416]">{row.name} ({row.weight})</p>
                      <p className="text-[10px] text-[#8B7355]">Quantity: {row.quantity} • Unit Price: ₹{row.unitPrice}</p>
                    </div>
                    <span className="font-bold text-[#2D5016]">₹{Math.round((row.quantity * row.unitPrice) * (1 - row.discount / 100))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total payable layout details */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8B7355]">Quoted Discount Type:</span>
                <span className="font-semibold capitalize">{activeDetailQuote.discountType} ({activeDetailQuote.discountValue})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B7355]">Logistics Freight Charges:</span>
                <span className="font-semibold">₹{activeDetailQuote.shippingCharges || 0}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-[#2C2416]/10 pt-2 text-[#2D5016]">
                <span>Payable Valuation:</span>
                <span>₹{activeDetailQuote.payableAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Timeline audits tracking */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8B7355]">Quotation activity timeline</p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {(activeDetailQuote.timeline || []).map((event: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-[#2C2416]/8 text-xs flex justify-between gap-3">
                    <span className="font-semibold text-[#2C2416] text-left">{event.event}</span>
                    <span className="text-[10px] text-[#8B7355] shrink-0">{event.time}</span>
                  </div>
                ))}
                {(!activeDetailQuote.timeline || activeDetailQuote.timeline.length === 0) && (
                  <p className="text-xs text-[#8B7355] italic">No activity timeline recorded.</p>
                )}
              </div>
            </div>

            {/* Status override settings */}
            <div className="grid grid-cols-2 gap-4 border-t pt-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-1">Update Status</label>
                <select value={activeDetailQuote.status} onChange={e => handleUpdateStatusSingle(activeDetailQuote.id, e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="sent">Sent</option>
                  <option value="viewed">Viewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex items-end">
                <button onClick={() => downloadQuotationPDF(activeDetailQuote)}
                  className="w-full py-2 bg-[#FAF8F5] border border-[#2C2416]/10 text-[#2C2416] rounded-xl text-xs font-semibold hover:bg-[#F0EDE8] flex items-center justify-center gap-1.5 cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>

            {/* Delete quote */}
            <div className="pt-4 border-t border-[#2C2416]/10">
              <button onClick={() => handleDeleteQuote(activeDetailQuote.id)}
                className="w-full py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-xs cursor-pointer">
                Delete quotation record
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

// ─── PRODUCT CATALOG CMS PAGE ────────────────────────────────────────────────
function ProductCatalogCMSPage() {
  const [activeSubTab, setActiveSubTab] = useState<string>("profile");

  // CMS 1: Company Profile states
  const [companyProfile, setCompanyProfile] = useState(() => {
    const saved = localStorage.getItem("spiceora_catalog_settings");
    return saved ? JSON.parse(saved) : {
      name: "",
      logoUrl: "",
      description: "",
      mission: "",
      vision: "",
      promise: ""
    };
  });

  // CMS 2: Contact Details states
  const [contactSettings, setContactSettings] = useState(() => {
    const saved = localStorage.getItem("spiceora_contact_settings");
    return saved ? JSON.parse(saved) : {
      whatsapp: "",
      phone: "",
      email: "",
      address: "",
      website: "",
      hours: ""
    };
  });

  // CMS 3: PDF Product pricing states (5 basic spices)
  const [catalogProducts, setCatalogProducts] = useState<any[]>(() => {
    const saved = localStorage.getItem("spiceora_pdf_products");
    return saved ? JSON.parse(saved) : [];
  });

  // CMS 4: Bulk Packaging states
  const [bulkPackaging, setBulkPackaging] = useState(() => {
    const saved = localStorage.getItem("spiceora_bulk_packaging");
    return saved ? JSON.parse(saved) : {
      p5kg: false, p10kg: false, p15kg: false, p25kg: false,
      customOptions: "",
      grindingOptions: "",
      privateLabel: "",
      oemMfg: "",
      visible: false
    };
  });

  // CMS 5: PDF Style template manager states
  const [pdfTemplate, setPdfTemplate] = useState(() => {
    const saved = localStorage.getItem("spiceora_pdf_template");
    return saved ? JSON.parse(saved) : {
      headerVisible: true,
      footerVisible: true,
      watermark: "",
      primaryColor: "green",
      secondaryColor: "gold",
      terms: "",
      typography: "Helvetica"
    };
  });

  // PDF Generation History logs
  const [pdfHistory, setPdfHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("spiceora_pdf_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Role permissions grid
  const roles = [
    { name: "Super Admin", view: true, edit: true, delete: true, assign: true, export: true, pdf: true },
    { name: "Sales Manager", view: true, edit: true, delete: false, assign: true, export: true, pdf: true },
    { name: "Sales Executive", view: true, edit: true, delete: false, assign: false, export: false, pdf: true },
    { name: "Viewer", view: true, edit: false, delete: false, assign: false, export: false, pdf: false },
  ];

  // Audit Logs database
  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("spiceora_audit_logs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const triggerProfileSave = () => {
    localStorage.setItem("spiceora_catalog_settings", JSON.stringify(companyProfile));
    toast.success("Profile saved successfully");
  };

  const triggerContactSave = () => {
    localStorage.setItem("spiceora_contact_settings", JSON.stringify(contactSettings));
    
    // Also save to audit log
    const storedLogs = localStorage.getItem("spiceora_audit_logs");
    const logs = storedLogs ? JSON.parse(storedLogs) : [];
    logs.unshift({
      time: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      action: "Admin Settings Updated",
      user: "Arjun Kumar (Admin)",
      details: "Wholesale contact numbers/details updated in CMS."
    });
    localStorage.setItem("spiceora_audit_logs", JSON.stringify(logs));
    setAuditLogs(logs);

    toast.success("Contact specifications saved", {
      description: "Changes instantly reflected on storefront B2B page and PDFs."
    });
  };

  const triggerProductsSave = () => {
    localStorage.setItem("spiceora_pdf_products", JSON.stringify(catalogProducts));
    toast.success("Catalog pricing updated successfully");
  };

  const triggerBulkSave = () => {
    localStorage.setItem("spiceora_bulk_packaging", JSON.stringify(bulkPackaging));
    toast.success("Bulk packaging configurations saved");
  };

  const triggerTemplateSave = () => {
    localStorage.setItem("spiceora_pdf_template", JSON.stringify(pdfTemplate));
    toast.success("PDF catalog template style saved");
  };

  const handleDeleteHistory = (id: string) => {
    const updated = pdfHistory.filter(x => x.id !== id);
    setPdfHistory(updated);
    localStorage.setItem("spiceora_pdf_history", JSON.stringify(updated));
    toast.success("History log deleted");
  };

  // Reusable PDF generator for dynamic preview downloads
  const generateSampleCatalogPDF = () => {
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const colorMap: Record<string, number[]> = {
        green: [42, 74, 60],
        gold: [201, 146, 10],
        red: [180, 40, 40],
        blue: [25, 80, 150]
      };

      const primary = colorMap[pdfTemplate.primaryColor] || [42, 74, 60];
      const secondary = colorMap[pdfTemplate.secondaryColor] || [201, 146, 10];

      // Page 1: Cover
      doc.setFillColor(250, 248, 243);
      doc.rect(0, 0, 210, 297, "F");

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 45, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(26);
      doc.setTextColor(secondary[0], secondary[1], secondary[2]);
      doc.text("SPICEORA", 20, 24);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("PREMIUM SPICES & HERBS", 20, 31);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(26, 23, 20);
      doc.text("PRODUCT CATALOG PREVIEW", 20, 75);

      doc.setDrawColor(secondary[0], secondary[1], secondary[2]);
      doc.setLineWidth(0.8);
      doc.line(20, 80, 190, 80);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(122, 112, 100);
      doc.text("Prepared Exclusively For:", 20, 93);

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(26, 23, 20, 0.08);
      doc.rect(20, 98, 170, 120, "FD");

      let cardY = 108;
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(15);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(companyProfile.name || "Your Company", 30, cardY);
      cardY += 12;

      doc.setFontSize(11);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(26, 23, 20);
      doc.text("Description:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(companyProfile.description, 75, cardY);
      cardY += 15;

      doc.setFont("Helvetica", "normal");
      doc.text("Our Mission:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(companyProfile.mission, 75, cardY);
      cardY += 15;

      doc.setFont("Helvetica", "normal");
      doc.text("Date Generated:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(new Date().toLocaleDateString('en-IN'), 75, cardY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 1 of 2", 100, 280);

      if (pdfTemplate.watermark) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(200, 200, 200, 0.12);
        doc.text(pdfTemplate.watermark, 30, 250, null, 45);
      }

      // Page 2: Table
      doc.addPage();

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 25, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("SPICEORA B2B PRODUCT CATALOG", 20, 16);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Commercial Pricing Index (Retail Packs)", 20, 42);

      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(20, 48, 170, 10, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Product Name", 25, 54);
      doc.text("100g", 85, 54);
      doc.text("250g", 110, 54);
      doc.text("500g", 135, 54);
      doc.text("1000g", 160, 54);

      let rowY = 58;
      catalogProducts.forEach((row, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(245, 243, 237);
          doc.rect(20, rowY, 170, 10, "F");
        }
        doc.setDrawColor(26, 23, 20, 0.08);
        doc.rect(20, rowY, 170, 10, "S");

        doc.setFont("Helvetica", "bold");
        doc.setTextColor(26, 23, 20);
        doc.text(row.name, 25, rowY + 6.5);

        doc.setFont("Helvetica", "normal");
        doc.setTextColor(74, 70, 64);
        doc.text(`₹${row.retailSizes.p100}`, 85, rowY + 6.5);
        doc.text(`₹${row.retailSizes.p250}`, 110, rowY + 6.5);
        doc.text(`₹${row.retailSizes.p500}`, 135, rowY + 6.5);
        doc.text(row.retailSizes.p1000 === "Available" ? "Available" : `₹${row.retailSizes.p1000}`, 160, rowY + 6.5);
        rowY += 10;
      });

      rowY += 12;
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Bulk Sourcing Packaging Options", 20, rowY);

      rowY += 6;
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(74, 70, 64);
      doc.text("For wholesale food service, industrial processing, and mixed packaging contracts:", 20, rowY);

      rowY += 8;
      const bulkSizes = ["5kg Air-Tight Crate", "10kg Commercial Sack", "15kg Multi-Layer Bag", "25kg Heavy Duty Bulk Sack"];
      bulkSizes.forEach(size => {
        doc.setFillColor(secondary[0], secondary[1], secondary[2]);
        doc.rect(25, rowY - 2.8, 2.5, 2.5, "F");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(26, 23, 20);
        doc.text(size, 32, rowY);
        rowY += 7.5;
      });

      rowY += 8;
      doc.setFillColor(250, 248, 243);
      doc.setDrawColor(secondary[0], secondary[1], secondary[2], 0.3);
      doc.rect(20, rowY, 170, 26, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Spiceora Sourcing Desk Support Team", 25, rowY + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 23, 20);
      doc.text(`WhatsApp/Call Support: +91 ${contactSettings.whatsapp}`, 25, rowY + 13);
      doc.text(`Official Email: ${contactSettings.email}`, 25, rowY + 19);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 2 of 2", 100, 280);

      if (pdfTemplate.watermark) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(200, 200, 200, 0.12);
        doc.text(pdfTemplate.watermark, 30, 250, null, 45);
      }

      doc.save("SPICEORA_Product_Catalog_Preview.pdf");
      toast.success("Catalog PDF preview downloaded successfully");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate sample PDF");
    }
  };

  const handleResendHistoryPDF = (hist: any) => {
    toast.loading("Sending catalog...", { id: "resend-history" });
    setTimeout(() => {
      toast.success("Dispatched successfully", {
        id: "resend-history",
        description: `Product catalog resent to contact person: ${hist.contactPerson}`
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Sub tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-[#2C2416]/10 pb-4">
        {[
          { id: "profile", label: "Company Profile", icon: User },
          { id: "contacts", label: "Contact Details CMS", icon: Globe },
          { id: "products", label: "PDF Pricing Catalog", icon: ClipboardList },
          { id: "packaging", label: "Bulk Sourcing Packaging", icon: Layers },
          { id: "template", label: "PDF Style template", icon: Palette },
          { id: "history", label: "Generated PDF History", icon: History },
          { id: "roles", label: "Roles & Audit Logs", icon: Lock }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeSubTab === tab.id ? "bg-[#2D5016] text-white" : "bg-white text-[#2C2416] border border-[#2C2416]/10"}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Main CMS Contents Panels */}
      <div className="bg-white rounded-3xl border border-[#2C2416]/10 p-6 lg:p-8">
        
        {/* Company Profile tab */}
        {activeSubTab === "profile" && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg font-serif">Company Brand Profile CMS</h3>
            <p className="text-xs text-[#8B7355]">Manage Company Information used inside dynamic covers of generated catalogs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company / Brand Name" value={companyProfile.name} onChange={v => setCompanyProfile({ ...companyProfile, name: v })} />
              <Field label="Logo Image URL" value={companyProfile.logoUrl} onChange={v => setCompanyProfile({ ...companyProfile, logoUrl: v })} />
            </div>
            <Field label="Description & Pitch" value={companyProfile.description} onChange={v => setCompanyProfile({ ...companyProfile, description: v })} as="textarea" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Mission Statement" value={companyProfile.mission} onChange={v => setCompanyProfile({ ...companyProfile, mission: v })} as="textarea" />
              <Field label="Vision Statement" value={companyProfile.vision} onChange={v => setCompanyProfile({ ...companyProfile, vision: v })} as="textarea" />
              <Field label="Quality Promise" value={companyProfile.promise} onChange={v => setCompanyProfile({ ...companyProfile, promise: v })} as="textarea" />
            </div>
            <div className="pt-4">
              <Btn icon={Save} onClick={triggerProfileSave}>Save Profile Settings</Btn>
            </div>
          </div>
        )}

        {/* Contact Details CMS */}
        {activeSubTab === "contacts" && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg font-serif">Contact Information CMS</h3>
            <p className="text-xs text-[#8B7355]">These settings will automatically reflect on customer-facing Wholesale Page, footers, and generated catalog PDFs.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="WhatsApp Support Number (Without + or spaces, e.g. 9390645710)" value={contactSettings.whatsapp} onChange={v => setContactSettings({ ...contactSettings, whatsapp: v })} />
              <Field label="Call Number" value={contactSettings.phone} onChange={v => setContactSettings({ ...contactSettings, phone: v })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Business Email" value={contactSettings.email} onChange={v => setContactSettings({ ...contactSettings, email: v })} />
              <Field label="Website Link" value={contactSettings.website} onChange={v => setContactSettings({ ...contactSettings, website: v })} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Business Hours" value={contactSettings.hours} onChange={v => setContactSettings({ ...contactSettings, hours: v })} />
              <Field label="Dispatch / Yard Address" value={contactSettings.address} onChange={v => setContactSettings({ ...contactSettings, address: v })} as="textarea" />
            </div>
            <div className="pt-4">
              <Btn icon={Save} onClick={triggerContactSave}>Save Contact Settings</Btn>
            </div>
          </div>
        )}

        {/* PDF Pricing Catalog */}
        {activeSubTab === "products" && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg font-serif">Product Management (PDF Catalog Rates)</h3>
            <p className="text-xs text-[#8B7355]">Manage the products and prices printed on the pricing table page of generated PDFs.</p>
            <div className="space-y-4">
              {catalogProducts.map((p, idx) => (
                <div key={p.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                  <div className="lg:col-span-3">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <input value={p.description} onChange={e => {
                      const updated = [...catalogProducts];
                      updated[idx].description = e.target.value;
                      setCatalogProducts(updated);
                    }} className="mt-1 w-full bg-white border border-[#2C2416]/10 rounded-lg p-1.5 text-xs text-[#2C2416]" placeholder="Description" />
                  </div>
                  
                  <div className="lg:col-span-6 grid grid-cols-4 gap-2">
                    {["p100", "p250", "p500", "p1000"].map((size) => (
                      <div key={size}>
                        <label className="block text-[10px] uppercase tracking-wider text-[#8B7355] font-semibold">{size.replace("p", "")}g</label>
                        <input value={p.retailSizes[size]} onChange={e => {
                          const updated = [...catalogProducts];
                          updated[idx].retailSizes[size] = e.target.value;
                          setCatalogProducts(updated);
                        }} className="mt-1 w-full bg-white border border-[#2C2416]/10 rounded-lg p-1.5 text-xs font-mono text-[#2C2416]" />
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-3 flex justify-end gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#8B7355] font-semibold text-right">Visible</label>
                      <input type="checkbox" checked={p.visible} onChange={e => {
                        const updated = [...catalogProducts];
                        updated[idx].visible = e.target.checked;
                        setCatalogProducts(updated);
                      }} className="mt-1 mr-2 cursor-pointer" />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#8B7355] font-semibold text-right">Active</label>
                      <input type="checkbox" checked={p.active} onChange={e => {
                        const updated = [...catalogProducts];
                        updated[idx].active = e.target.checked;
                        setCatalogProducts(updated);
                      }} className="mt-1 mr-2 cursor-pointer" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Btn icon={Save} onClick={triggerProductsSave}>Save Product Catalog Settings</Btn>
            </div>
          </div>
        )}

        {/* Bulk Packaging CMS */}
        {activeSubTab === "packaging" && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg font-serif">Bulk Packaging & Contract Services CMS</h3>
            <p className="text-xs text-[#8B7355]">Configure packaging containers and specialized processing services included in catalog index sheet.</p>
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#2C2416]/10 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider">Available Bulk Sacks</p>
              <div className="flex gap-4 flex-wrap">
                {["p5kg", "p10kg", "p15kg", "p25kg"].map(sack => (
                  <label key={sack} className="flex items-center gap-2 text-sm font-medium text-[#2C2416]">
                    <input type="checkbox" checked={(bulkPackaging as any)[sack]} onChange={e => setBulkPackaging({ ...bulkPackaging, [sack]: e.target.checked })} className="cursor-pointer" />
                    {sack.replace("p", "")} sack/crate
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Custom Packaging Specifications" value={bulkPackaging.customOptions} onChange={v => setBulkPackaging({ ...bulkPackaging, customOptions: v })} />
              <Field label="Grinding & Mesh Sieve Specifications" value={bulkPackaging.grindingOptions} onChange={v => setBulkPackaging({ ...bulkPackaging, grindingOptions: v })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Private Labeling Specs" value={bulkPackaging.privateLabel} onChange={v => setBulkPackaging({ ...bulkPackaging, privateLabel: v })} />
              <Field label="OEM Manufacturing Specs" value={bulkPackaging.oemMfg} onChange={v => setBulkPackaging({ ...bulkPackaging, oemMfg: v })} />
            </div>
            <div className="pt-4">
              <Btn icon={Save} onClick={triggerBulkSave}>Save Bulk Configurations</Btn>
            </div>
          </div>
        )}

        {/* PDF Style template */}
        {activeSubTab === "template" && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg font-serif">PDF Sourcing Catalog Stylist Manager</h3>
            <p className="text-xs text-[#8B7355]">Customize color accents, watermark text, cover layouts, and terms of dispatch for dynamic catalog generation.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-1.5">Primary Theme Color</label>
                <select value={pdfTemplate.primaryColor} onChange={e => setPdfTemplate({ ...pdfTemplate, primaryColor: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                  <option value="green">Forest Green (Branded)</option>
                  <option value="gold">Vibrant Gold</option>
                  <option value="red">Fiery Chilli Red</option>
                  <option value="blue">Deep Ceylon Blue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8B7355] mb-1.5">Secondary Accent Color</label>
                <select value={pdfTemplate.secondaryColor} onChange={e => setPdfTemplate({ ...pdfTemplate, secondaryColor: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer">
                  <option value="gold">Accent Gold (Branded)</option>
                  <option value="green">Forest Green</option>
                </select>
              </div>

              <Field label="PDF Watermark Text" value={pdfTemplate.watermark} onChange={v => setPdfTemplate({ ...pdfTemplate, watermark: v })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Typography font family" value={pdfTemplate.typography} onChange={v => setPdfTemplate({ ...pdfTemplate, typography: v })} />
              <Field label="Terms and Dispatch specifications (Printed on Footer)" value={pdfTemplate.terms} onChange={v => setPdfTemplate({ ...pdfTemplate, terms: v })} as="textarea" />
            </div>

            <div className="pt-4 flex gap-3 flex-wrap">
              <Btn icon={Save} onClick={triggerTemplateSave}>Save PDF Template Styles</Btn>
              <Btn variant="secondary" icon={FileText} onClick={generateSampleCatalogPDF}>Download Catalog PDF Preview</Btn>
            </div>
          </div>
        )}

        {/* Generated PDF History */}
        {activeSubTab === "history" && (
          <div className="space-y-5">
            <h3 className="font-bold text-lg font-serif">Personalized Catalog Download History</h3>
            <p className="text-xs text-[#8B7355]">Logs and trackers for all personalized catalogs downloaded by prospects and customers.</p>
            <Card className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: "#FDFCFB", borderBottom: `1px solid ${C.border}` }}>
                    {["PDF ID", "Generated Date", "Business Name", "Contact Person", "Interested Product", "Estimated Volume", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: C.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pdfHistory.map((hist) => (
                    <tr key={hist.id} className="transition-colors duration-100 border-b border-[#2C2416]/10 hover:bg-[#FAF8F5] text-xs">
                      <td className="px-4 py-3 font-mono font-bold">{hist.id}</td>
                      <td className="px-4 py-3 text-[#8B7355]">{hist.date}</td>
                      <td className="px-4 py-3 font-semibold">{hist.businessName}</td>
                      <td className="px-4 py-3">{hist.contactPerson}</td>
                      <td className="px-4 py-3">{hist.product}</td>
                      <td className="px-4 py-3 font-semibold text-[#8B7355]">{hist.volume}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => generateSampleCatalogPDF()}
                            className="p-1 rounded bg-green-50 text-green-700 hover:bg-green-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
                            <Download className="w-3 h-3" /> Get Copy
                          </button>
                          <button onClick={() => handleResendHistoryPDF(hist)}
                            className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer flex items-center gap-1 font-medium">
                            <Mail className="w-3 h-3" /> Resend
                          </button>
                          <button onClick={() => handleDeleteHistory(hist.id)} className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pdfHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#8B7355] italic">No catalog history recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {/* Roles & Audit Logs */}
        {activeSubTab === "roles" && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg font-serif">B2B Sourcing Staff Roles</h3>
              <p className="text-xs text-[#8B7355]">Manage permission settings for the Wholesale Inquiry Desk.</p>
              <Card className="overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "#FDFCFB", borderBottom: `1px solid ${C.border}` }}>
                      {["Role Name", "View Inquiries", "Edit Details", "Delete Inquiry", "Assign Agent", "Export Data", "Generate PDF"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: C.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((r, i) => (
                      <tr key={i} className="border-b border-[#2C2416]/10 hover:bg-[#FAF8F5]">
                        <td className="px-4 py-3 font-semibold">{r.name}</td>
                        <td className="px-4 py-3">{r.view ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{r.edit ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{r.delete ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{r.assign ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{r.export ? "Yes" : "No"}</td>
                        <td className="px-4 py-3">{r.pdf ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="font-bold text-lg font-serif">B2B CMS Sourcing Audit Logs</h3>
              <p className="text-xs text-[#8B7355]">Tracks all events related to catalog downloads and wholesale submissions.</p>
              <Card className="overflow-hidden max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ backgroundColor: "#FDFCFB", borderBottom: `1px solid ${C.border}` }}>
                      {["Timestamp", "User", "Action", "Details"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold" style={{ color: C.muted }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="border-b border-[#2C2416]/10 hover:bg-[#FAF8F5]">
                        <td className="px-4 py-3 font-mono text-[#8B7355]">{log.time}</td>
                        <td className="px-4 py-3 font-semibold">{log.user}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 font-medium">{log.action}</span>
                        </td>
                        <td className="px-4 py-3 text-[#8B7355]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
function HomepageCMSPage() {
  const [heroSlides, setHeroSlides] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_homepage_hero");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("spiceora_homepage_hero", JSON.stringify(heroSlides));
  }, [heroSlides]);

  const updateSlide = (id: number, fields: any) => {
    setHeroSlides(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s));
    toast.success("Hero slide settings updated");
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Homepage CMS</h2>
        <p className="text-xs text-[#8B7355]">Control storefront hero banner sliders, visual layouts, and call-to-actions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {heroSlides.map(slide => (
          <Card key={slide.id} className="p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between border-b border-[#2C2416]/8 pb-2">
              <span className="text-xs font-bold text-[#2D5016]">Slide #{slide.id} Configuration</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Slide Heading</label>
                <input value={slide.title} onChange={e => updateSlide(slide.id, { title: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Slide Subtitle</label>
                <textarea rows={2} value={slide.subtitle} onChange={e => updateSlide(slide.id, { subtitle: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">CTA Label</label>
                  <input value={slide.ctaText} onChange={e => updateSlide(slide.id, { ctaText: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">CTA Link (Path)</label>
                  <input value={slide.ctaLink} onChange={e => updateSlide(slide.id, { ctaLink: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RecipesCMSPage() {
  const [recipes, setRecipes] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_recipes");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeRecipe, setActiveRecipe] = useState<any | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ id: "", title: "", time: "", difficulty: "Easy", ingredients: "", steps: "" });

  useEffect(() => {
    localStorage.setItem("spiceora_recipes", JSON.stringify(recipes));
  }, [recipes]);

  const handleEdit = (recipe: any) => {
    setForm({ ...recipe });
    setActiveRecipe(recipe);
  };

  const handleAdd = () => {
    setForm({ id: `R00${recipes.length + 1}`, title: "", time: "30 mins", difficulty: "Easy", ingredients: "", steps: "" });
    setIsAddOpen(true);
  };

  const handleSave = () => {
    if (activeRecipe) {
      setRecipes(prev => prev.map(r => r.id === form.id ? { ...form } : r));
      setActiveRecipe(null);
      toast.success("Recipe updated successfully");
    } else {
      setRecipes(prev => [...prev, form]);
      setIsAddOpen(false);
      toast.success("New recipe added");
    }
  };

  const handleDelete = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    toast.success("Recipe deleted");
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Recipes CMS</h2>
          <p className="text-xs text-[#8B7355]">Manage storefront culinary guides, ingredient lists, and cooking steps</p>
        </div>
        <Btn icon={Plus} onClick={handleAdd}>Add Recipe</Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map(recipe => (
          <Card key={recipe.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#2C2416]/6 pb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 text-stone-600 font-bold uppercase">{recipe.id}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(recipe)} className="p-1.5 text-[#8B7355] hover:bg-[#2C2416]/10 rounded-lg transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(recipe.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-lg text-[#2C2416] mb-1">{recipe.title}</h3>
              <p className="text-xs text-[#8B7355] font-semibold mb-2">Duration: {recipe.time} | Difficulty: {recipe.difficulty}</p>
              <p className="text-xs text-[#2C2416] font-medium mt-1">Ingredients: {recipe.ingredients}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {(activeRecipe || isAddOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => { setActiveRecipe(null); setIsAddOpen(false); }} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="font-bold text-lg font-serif text-[#2C2416]">{activeRecipe ? "Edit Recipe Details" : "Create New Recipe"}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Recipe Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Cooking Duration</label>
                    <input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Difficulty Level</label>
                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Ingredients (Comma Separated)</label>
                  <textarea rows={2} value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Step-by-Step Instructions</label>
                  <textarea rows={4} value={form.steps} onChange={e => setForm({ ...form, steps: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setActiveRecipe(null); setIsAddOpen(false); }} className="flex-1 py-2 text-xs font-semibold border border-[#2C2416]/10 rounded-xl hover:bg-[#FAF8F5]">Cancel</button>
                <Btn onClick={handleSave} className="flex-1">Save Recipe</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PagesCMSPage() {
  const [timeline, setTimeline] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_timeline");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [policies, setPolicies] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_policies");
      return stored ? JSON.parse(stored) : { privacy: "", terms: "" };
    } catch {
      return { privacy: "", terms: "" };
    }
  });

  useEffect(() => {
    localStorage.setItem("spiceora_timeline", JSON.stringify(timeline));
  }, [timeline]);

  const savePolicies = () => {
    localStorage.setItem("spiceora_policies", JSON.stringify(policies));
    toast.success("Policies updated successfully");
  };

  const addTimelineEvent = () => {
    const year = prompt("Enter event year:") || "";
    const title = prompt("Enter event title:") || "";
    const description = prompt("Enter event description:") || "";
    if (year && title) {
      setTimeline(prev => [...prev, { year, title, description }]);
      toast.success("Timeline event added");
    }
  };

  const deleteTimelineEvent = (idx: number) => {
    setTimeline(prev => prev.filter((_, i) => i !== idx));
    toast.success("Timeline event deleted");
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Pages CMS</h2>
        <p className="text-xs text-[#8B7355]">Manage static page templates, About Us timeline events, and standard legal policies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Timeline Manager */}
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#2C2416]/6 pb-2">
            <h3 className="font-semibold text-base text-[#2C2416]">About Us Timeline</h3>
            <button onClick={addTimelineEvent} className="p-1 rounded bg-[#2D5016]/10 text-[#2D5016] text-xs font-semibold px-2 py-1">Add Event</button>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex justify-between items-start gap-4 p-2 rounded bg-[#FAF8F5]">
                <div>
                  <span className="text-xs font-bold text-[#2D5016]">{event.year}</span>
                  <p className="text-xs font-semibold text-[#2C2416]">{event.title}</p>
                  <p className="text-[10px] text-[#8B7355]">{event.description}</p>
                </div>
                <button onClick={() => deleteTimelineEvent(idx)} className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
        </Card>

        {/* Policy Editor */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-base text-[#2C2416] border-b border-[#2C2416]/6 pb-2">Policy Documents Editor</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Privacy Policy Statement</label>
              <textarea rows={3} value={policies.privacy} onChange={e => setPolicies({ ...policies, privacy: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Terms & Conditions Summary</label>
              <textarea rows={3} value={policies.terms} onChange={e => setPolicies({ ...policies, terms: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
            </div>
            <Btn icon={Save} onClick={savePolicies}>Update Policy Documents</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_coupons");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({ code: "", discountType: "percentage", value: 10, minPurchase: 500, active: true });
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("spiceora_coupons", JSON.stringify(coupons));
  }, [coupons]);

  const handleToggle = (code: string) => {
    setCoupons(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
    toast.success("Coupon status toggled");
  };

  const handleSave = () => {
    if (!form.code.trim()) return;
    if (coupons.some(c => c.code.toLowerCase() === form.code.toLowerCase())) {
      toast.error("Coupon code already exists");
      return;
    }
    setCoupons(prev => [...prev, { ...form, code: form.code.toUpperCase() }]);
    setIsAddOpen(false);
    toast.success("Promo code registered successfully");
  };

  const handleDelete = (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    toast.success("Coupon removed");
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Coupons & Promos</h2>
          <p className="text-xs text-[#8B7355]">Design and configure coupon codes, bulk discounts, and min-purchase limits</p>
        </div>
        <Btn icon={Plus} onClick={() => setIsAddOpen(true)}>Add Coupon</Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map(cop => (
          <Card key={cop.code} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#2C2416]/6 pb-2">
                <span className="text-xs font-mono font-bold text-[#2D5016] uppercase">{cop.code}</span>
                <span className={`text-[10px] font-semibold uppercase ${cop.active ? "text-green-600" : "text-stone-400"}`}>
                  {cop.active ? "Enabled" : "Disabled"}
                </span>
              </div>
              <h3 className="font-bold text-lg text-[#2C2416] mb-1">
                {cop.discountType === "percentage" ? `${cop.value}% Discount` : `₹${cop.value} Off`}
              </h3>
              <p className="text-xs text-[#8B7355] mt-1 font-semibold">Min order criteria: ₹{cop.minPurchase}</p>
            </div>
            <div className="border-t border-[#2C2416]/6 pt-4 flex gap-2">
              <button onClick={() => handleToggle(cop.code)} className="flex-1 py-1.5 bg-[#FAF8F5] border border-[#2C2416]/12 text-[10px] font-bold text-[#2C2416] rounded-xl hover:bg-[#FAF8F5]/80">
                {cop.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => handleDelete(cop.code)} className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors border border-red-100"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setIsAddOpen(false)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-lg font-serif text-[#2C2416]">New Promo Coupon</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Coupon Code</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="e.g. MONSOON20" className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Discount Type</label>
                    <select value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none">
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Flat</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Benefit Value</label>
                    <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Minimum Order Value (₹)</label>
                  <input type="number" value={form.minPurchase} onChange={e => setForm({ ...form, minPurchase: Number(e.target.value) })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIsAddOpen(false)} className="flex-1 py-2 text-xs font-semibold border border-[#2C2416]/10 rounded-xl hover:bg-[#FAF8F5]">Cancel</button>
                <Btn onClick={handleSave} className="flex-1">Create Code</Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CampaignsPage() {
  const [alertBanner, setAlertBanner] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_campaign_alert");
      return stored ? JSON.parse(stored) : { enabled: false, text: "" };
    } catch {
      return { enabled: false, text: "" };
    }
  });

  const [modalOffer, setModalOffer] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_campaign_popup");
      return stored ? JSON.parse(stored) : { enabled: false, title: "", description: "" };
    } catch {
      return { enabled: false, title: "", description: "" };
    }
  });

  const saveAlert = () => {
    localStorage.setItem("spiceora_campaign_alert", JSON.stringify(alertBanner));
    toast.success("Alert announcement banner settings saved");
  };

  const savePopup = () => {
    localStorage.setItem("spiceora_campaign_popup", JSON.stringify(modalOffer));
    toast.success("Announcements modal popup campaign saved");
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Campaigns CMS</h2>
        <p className="text-xs text-[#8B7355]">Manage alert announcement headers and interactive pop-ups displayed on the storefront</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header Alert banner */}
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#2C2416]/6 pb-2">
            <h3 className="font-semibold text-base text-[#2C2416]">Storefront Announcement Header Alert</h3>
            <button onClick={() => setAlertBanner({ ...alertBanner, enabled: !alertBanner.enabled })} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${alertBanner.enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}>
              {alertBanner.enabled ? "Online" : "Offline"}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Banner Announcement Text</label>
              <input value={alertBanner.text} onChange={e => setAlertBanner({ ...alertBanner, text: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
            </div>
            <Btn icon={Save} onClick={saveAlert}>Save Header Alert Settings</Btn>
          </div>
        </Card>

        {/* Modal Announcement banner */}
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-[#2C2416]/6 pb-2">
            <h3 className="font-semibold text-base text-[#2C2416]">Promotional Modal Popup Offer</h3>
            <button onClick={() => setModalOffer({ ...modalOffer, enabled: !modalOffer.enabled })} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${modalOffer.enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}>
              {modalOffer.enabled ? "Active" : "Disabled"}
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Popup Dialog Title</label>
              <input value={modalOffer.title} onChange={e => setModalOffer({ ...modalOffer, title: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">Popup Dialog Body Description</label>
              <textarea rows={2} value={modalOffer.description} onChange={e => setModalOffer({ ...modalOffer, description: e.target.value })} className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none resize-none" />
            </div>
            <Btn icon={Save} onClick={savePopup}>Save Modal Popup Settings</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── WEBSITE CMS (unified) ────────────────────────────────────
function WebsiteCMSPage() {
  const [activeTab, setActiveTab] = useState<"homepage" | "recipes" | "testimonials" | "footer">("homepage");

  const [homepage, setHomepage] = useState(() => {
    try { const s = localStorage.getItem("spiceora_homepage_cms"); return s ? JSON.parse(s) : { headline: "", subheadline: "", heroBanner: "", ctaButton: "", ctaUrl: "", bannerActive: false }; } catch { return { headline: "", subheadline: "", heroBanner: "", ctaButton: "", ctaUrl: "", bannerActive: false }; }
  });

  const [recipes, setRecipes] = useState<any[]>(() => {
    try { const s = localStorage.getItem("spiceora_recipes"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [testimonials, setTestimonials] = useState<any[]>(() => {
    try { const s = localStorage.getItem("spiceora_testimonials"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  const [footer, setFooter] = useState(() => {
    try { const s = localStorage.getItem("spiceora_footer"); return s ? JSON.parse(s) : { tagline: "", copyright: "", instagramUrl: "", facebookUrl: "", whatsappNumber: "" }; } catch { return { tagline: "", copyright: "", instagramUrl: "", facebookUrl: "", whatsappNumber: "" }; }
  });

  const saveHomepage = () => { localStorage.setItem("spiceora_homepage_cms", JSON.stringify(homepage)); toast.success("Homepage content saved"); };
  const saveFooter = () => { localStorage.setItem("spiceora_footer", JSON.stringify(footer)); toast.success("Footer content saved"); };

  const toggleTestimonial = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: t.status === "approved" ? "hidden" : "approved" } : t));
    localStorage.setItem("spiceora_testimonials", JSON.stringify(testimonials));
    toast.success("Testimonial status updated");
  };

  const toggleRecipeFeatured = (id: string) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, featured: !r.featured } : r));
    toast.success("Recipe featured status updated");
  };

  const TABS = [
    { id: "homepage", label: "Homepage" },
    { id: "recipes", label: "Recipes" },
    { id: "testimonials", label: "Testimonials" },
    { id: "footer", label: "Footer" },
  ] as const;

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2C2416]/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#2C2416]">Website CMS</h2>
          <p className="text-xs text-[#8B7355]">Manage storefront content: hero banner, recipes, testimonials, and footer</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#2C2416]/10 w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${activeTab === tab.id ? "bg-[#2D5016] text-white shadow-sm" : "text-[#8B7355] hover:text-[#2C2416]"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* HOMEPAGE TAB */}
      {activeTab === "homepage" && (
        <div className="space-y-4 max-w-2xl">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2C2416]/6 pb-3">
              <h3 className="font-semibold text-[#2C2416]">Hero Banner Settings</h3>
              <button onClick={() => setHomepage({ ...homepage, bannerActive: !homepage.bannerActive })}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${homepage.bannerActive ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}>
                {homepage.bannerActive ? "Active" : "Disabled"}
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { label: "Main Headline", key: "headline" },
                { label: "Sub-headline", key: "subheadline" },
                { label: "Hero Banner Text", key: "heroBanner" },
                { label: "CTA Button Label", key: "ctaButton" },
                { label: "CTA Link URL", key: "ctaUrl" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">{label}</label>
                  <input value={homepage[key] || ""} onChange={e => setHomepage({ ...homepage, [key]: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
              ))}
            </div>
            <Btn icon={Save} onClick={saveHomepage}>Save Homepage Content</Btn>
          </Card>
        </div>
      )}

      {/* RECIPES TAB */}
      {activeTab === "recipes" && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
                  {["Recipe Title", "Category", "Difficulty", "Prep Time", "Featured on Homepage", "Actions"].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2416]/8">
                {recipes.map(r => (
                  <tr key={r.id} className="hover:bg-[#FAF8F5]/50 transition-colors">
                    <td className="px-5 py-4 font-semibold text-[#2C2416]">{r.title}</td>
                    <td className="px-5 py-4 text-[#8B7355]">{r.category}</td>
                    <td className="px-5 py-4">{r.difficulty}</td>
                    <td className="px-5 py-4">{r.prepTime}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.featured ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"}`}>
                        {r.featured ? "Featured" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleRecipeFeatured(r.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#2C2416]/10 text-[10px] font-semibold hover:bg-stone-100">
                        {r.featured ? "Unfeature" : "Feature"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TESTIMONIALS TAB */}
      {activeTab === "testimonials" && (
        <div className="space-y-4">
          <p className="text-xs text-[#8B7355]">Control which customer reviews appear on the homepage. Approved testimonials display publicly.</p>
          <Card className="overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#2C2416]/8">
                  {["Reviewer", "Product", "Rating", "Review Snippet", "Status", "Action"].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-semibold text-[#8B7355]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C2416]/8">
                {testimonials.map(t => (
                  <tr key={t.id} className="hover:bg-[#FAF8F5]/50">
                    <td className="px-5 py-4 font-semibold text-[#2C2416]">{t.name}</td>
                    <td className="px-5 py-4 text-[#8B7355]">{t.product || "General"}</td>
                    <td className="px-5 py-4 text-amber-500">{"★".repeat(t.rating)}</td>
                    <td className="px-5 py-4 max-w-xs italic text-[#8B7355]">"{t.comment?.slice(0, 60)}..."</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === "approved" || t.approved ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-700"}`}>
                        {t.status || (t.approved ? "approved" : "pending")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleTestimonial(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#2C2416]/10 text-[10px] font-semibold hover:bg-stone-100">
                        {t.status === "approved" || t.approved ? "Hide" : "Show"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* FOOTER TAB */}
      {activeTab === "footer" && (
        <div className="space-y-4 max-w-2xl">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-[#2C2416] border-b border-[#2C2416]/6 pb-3">Footer Content Settings</h3>
            <div className="space-y-3 text-xs">
              {[
                { label: "Brand Tagline", key: "tagline" },
                { label: "Copyright Text", key: "copyright" },
                { label: "WhatsApp Number", key: "whatsappNumber" },
                { label: "Instagram URL", key: "instagramUrl" },
                { label: "Facebook URL", key: "facebookUrl" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-[#8B7355] uppercase block mb-1">{label}</label>
                  <input value={footer[key] || ""} onChange={e => setFooter({ ...footer, [key]: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#2C2416]/10 rounded-xl px-3 py-2 text-xs outline-none" />
                </div>
              ))}
            </div>
            <Btn icon={Save} onClick={saveFooter}>Save Footer Content</Btn>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdSearch, setCmdSearch] = useState("");
  const sideW = collapsed ? 72 : 256;

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("spiceora_dark_mode") === "true";
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("spiceora_dark_mode", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigate = (p: string) => { 
    setPage(p); 
    setBellOpen(false); 
    setCmdOpen(false); 
  };

  useEffect(() => {
    if (!bellOpen) return;
    const h = (e: MouseEvent) => { if (!(e.target as Element).closest("[data-headernav]")) setBellOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [bellOpen]);

  const pages: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage navigateTo={navigate} />,
    products:  <ProductsPage />,
    orders:    <OrdersPage />,
    wholesale: <WholesaleManagementPage navigateTo={navigate} />,
    quotations: <QuotationManagementPage navigateTo={navigate} />,
    website:   <WebsiteCMSPage />,
    customers: <CustomersPage />,
    settings:  <SettingsPage />,
    catalog:   <ProductCatalogCMSPage />,
    // Legacy pages still accessible via URL/command but not in sidebar
    categories: <ProductsPage />,
    collections: <ProductsPage />,
    feedback: <ProductsPage />,
    "homepage-cms": <WebsiteCMSPage />,
    "recipes-cms": <WebsiteCMSPage />,
    "pages-cms": <WebsiteCMSPage />,
    coupons: <SettingsPage />,
    campaigns: <SettingsPage />,
  };

  const commands = [
    { name: "Go to Dashboard", action: () => navigate("dashboard") },
    { name: "Go to Products & Inventory", action: () => navigate("products") },
    { name: "Go to Retail Orders", action: () => navigate("orders") },
    { name: "Go to Wholesale Desk", action: () => navigate("wholesale") },
    { name: "Go to Website CMS", action: () => navigate("website") },
    { name: "Go to Customers Directory", action: () => navigate("customers") },
    { name: "Go to Business Settings", action: () => navigate("settings") },
    { name: "Go to Quotation Builder", action: () => navigate("quotations") },
    { name: "Go to Catalog CMS", action: () => navigate("catalog") },
  ];

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(cmdSearch.toLowerCase()));

  return (
    <div className={`min-h-screen ${darkMode ? "dark text-stone-100" : ""}`} style={{ backgroundColor: darkMode ? "#1A150F" : C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: C.card, color: C.charcoal, border: `1px solid ${C.border}`, borderRadius: 14, fontFamily: "DM Sans, sans-serif", fontSize: 13, boxShadow: "0 8px 30px rgba(26,58,10,0.14)" },
      }} richColors />
      <Sidebar page={page} setPage={navigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div data-headernav>
        <Header page={page} offset={sideW} notifs={NOTIFS} bellOpen={bellOpen} onBell={() => setBellOpen(v => !v)} toggleDarkMode={toggleDarkMode} darkMode={darkMode} openCommandPalette={() => setCmdOpen(true)} />
      </div>
      <main className="transition-all duration-300 pt-16" style={{ paddingLeft: sideW }}>
        <div className="p-6 max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}>
              {pages[page]}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {cmdOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setCmdOpen(false)} className="absolute inset-0 bg-black" />
            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[50vh]">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100">
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input value={cmdSearch} onChange={e => setCmdSearch(e.target.value)} placeholder="Type a page name or action..." className="w-full text-sm outline-none text-stone-800" autoFocus />
                <span className="text-[10px] text-stone-400 font-mono px-1.5 py-0.5 rounded bg-stone-100">ESC</span>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                {filteredCommands.map((c, idx) => (
                  <button key={idx} onClick={c.action} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-between group">
                    <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900">{c.name}</span>
                    <span className="text-[10px] text-stone-400 group-hover:text-stone-600 font-mono">Navigate ↵</span>
                  </button>
                ))}
                {filteredCommands.length === 0 && (
                  <p className="text-xs text-center py-6 text-stone-400">No matching routes or quick actions found.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
