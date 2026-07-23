import { useState, useEffect, useRef, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart, Heart, Search, User, Menu, X, Star, ChevronRight,
  ChevronLeft, ChevronDown, Plus, Minus, Trash2, ArrowRight, Package,
  MapPin, CreditCard, Check, Bell, Settings, LogOut, Filter, LayoutGrid,
  List, Share2, Leaf, Award, Truck, RefreshCw, Shield,
  Instagram, Facebook, Twitter, Youtube, Mail, Globe, Zap, CheckCircle,
  AlertCircle, BookOpen, Tag, Clock, HelpCircle, FileText, Phone
} from "lucide-react";

// ─── DATA & LIVE API INTEGRATION ──────────────────────────────────────────────────

export type Product = {
  id: number;
  name: string;
  subtitle?: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  weight?: string;
  origin?: string;
  image?: string;
  badge?: string | null;
  inStock?: boolean;
  description?: string;
  nutritionPer100g?: Record<string, string>;
  ingredients?: string[];
  storage?: string;
  tags?: string[];
};

const PRODUCTS: Product[] = [];
const CATEGORIES: any[] = [];
const TESTIMONIALS: any[] = [];
const RECIPES: any[] = [];

const PROCESS_STEPS = [
  { step: "01", title: "Ethically Sourced", desc: "Direct relationships with farming families across India. No middlemen. Fair prices. Traceable origins.", icon: Globe },
  { step: "02", title: "Quality Tested", desc: "Every batch is tested for purity, essential oil content, and moisture levels before reaching our processing facility.", icon: Shield },
  { step: "03", title: "Small-Batch Ground", desc: "Spices are stone-ground in small batches to preserve volatile oils and the true flavor compounds of each variety.", icon: Zap },
  { step: "04", title: "Freshly Packed", desc: "Packed within 48 hours of grinding in nitrogen-flushed, food-grade pouches — locking in freshness until you open it.", icon: Package },
];

// ─── TYPES ─────────────────────────────────────────────────────────────────────

type CartItem = { product: Product; quantity: number };
type Page = "home" | "shop" | "product" | "cart" | "checkout" | "profile" | "recipes" | "recipe" | "founder" | "bundle" | "wholesale";

function getWeightOptions(basePrice: number) {
  return [
    { label: "100g Standard", price: 50 },
    { label: "250g Chef Pack", price: 110 },
    { label: "500g Family Pack", price: 260 },
    { label: "1000g Pantry Bag", price: 550 },
    { label: "5kg Bulk Crate", price: 2750 },
    { label: "10kg Bulk Sack", price: 5500 },
    { label: "15kg Bulk Crate", price: 8250 },
    { label: "25kg Bulk Supply", price: 11000 },
  ];
}

// ─── CONTEXT ───────────────────────────────────────────────────────────────────

const AppCtx = createContext<any>(null);
const useApp = () => useContext(AppCtx);

// ─── HOOKS ─────────────────────────────────────────────────────────────────────

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

function useSEO(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | Spiceora Premium Spices`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [title, description]);
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── UI ATOMS ──────────────────────────────────────────────────────────────────

function Btn({ children, variant = "primary", size = "md", onClick, disabled = false, loading = false, className = "", type = "button" }: any) {
  const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer select-none shrink-0";
  const sizes: Record<string, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };
  const variants: Record<string, string> = {
    primary: "bg-[#2A4A3C] text-white hover:bg-[#1E3529] active:scale-[0.98] focus-visible:ring-[#2A4A3C] shadow-sm hover:shadow-md",
    secondary: "bg-[#C55A20] text-white hover:bg-[#A84A1A] active:scale-[0.98] focus-visible:ring-[#C55A20]",
    outline: "border-2 border-[#2A4A3C] text-[#2A4A3C] hover:bg-[#2A4A3C] hover:text-white active:scale-[0.98] focus-visible:ring-[#2A4A3C]",
    ghost: "text-[#2A4A3C] hover:bg-[#2A4A3C]/8 active:scale-[0.98] focus-visible:ring-[#2A4A3C]",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

function Badge({ children, color = "green" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: "bg-[#2A4A3C]/10 text-[#2A4A3C]",
    orange: "bg-[#C55A20]/10 text-[#C55A20]",
    gold: "bg-[#C9920A]/15 text-[#A87800]",
    gray: "bg-black/8 text-[#7A7064]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${colors[color]}`}>
      {children}
    </span>
  );
}

function Stars({ rating, size = "sm" }: { rating: number; size?: string }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} ${i <= Math.round(rating) ? "fill-[#C9920A] text-[#C9920A]" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
  );
}

function StarRating({ rating, count, size = "sm" }: { rating: number; count?: number; size?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Stars rating={rating} size={size} />
      <span className="text-sm text-[#7A7064]">{rating}</span>
      {count != null && <span className="text-sm text-[#7A7064]">({count})</span>}
    </div>
  );
}

function QtySelector({ value, onChange, min = 1, max = 99 }: any) {
  return (
    <div className="flex items-center rounded-xl border border-[#2A4A3C]/20 overflow-hidden">
      <button onClick={() => onChange(Math.max(min, value - 1))} className="w-10 h-10 flex items-center justify-center text-[#2A4A3C] hover:bg-[#2A4A3C]/8 transition-colors">
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-10 h-10 flex items-center justify-center text-sm font-semibold text-[#1A1714]">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className="w-10 h-10 flex items-center justify-center text-[#2A4A3C] hover:bg-[#2A4A3C]/8 transition-colors">
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function Reveal({ children, delay = 0, className = "" }: any) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── PRODUCT CARD ──────────────────────────────────────────────────────────────

function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { navigate, addToCart, toggleWishlist, wishlist } = useApp();
  const [adding, setAdding] = useState(false);
  const isWished = wishlist.has(product.id);
  const badgeColor: Record<string, string> = { Bestseller: "orange", Premium: "gold", New: "green", Luxury: "gold" };

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    setAdding(true);
    setTimeout(() => { addToCart(product); setAdding(false); }, 600);
  }

  return (
    <Reveal delay={index * 70}>
      <div
        onClick={() => navigate("product", product)}
        className="group bg-white rounded-2xl overflow-hidden cursor-pointer border border-[#1A1714]/6 hover:border-[#2A4A3C]/20 hover:shadow-[0_8px_40px_rgba(42,74,60,0.12)] transition-all duration-300"
      >
        <div className="relative overflow-hidden bg-[#F5F0E8]" style={{ aspectRatio: "1/1" }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {product.badge && (
            <div className="absolute top-3 left-3">
              <Badge color={badgeColor[product.badge] || "green"}>{product.badge}</Badge>
            </div>
          )}
          <button
            onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-all duration-200"
          >
            <Heart className={`w-4 h-4 transition-all ${isWished ? "fill-red-500 text-red-500 scale-110" : "text-[#7A7064]"}`} />
          </button>
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <Btn size="sm" loading={adding} onClick={handleAdd} className="w-full">
              {adding ? "Adding…" : "Add to Cart"}
            </Btn>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1">{product.origin}</p>
          <h3 className="font-semibold text-[#1A1714] leading-tight mb-0.5">{product.name}</h3>
          <p className="text-xs text-[#7A7064] mb-2">{product.subtitle} · {product.weight}</p>
          <StarRating rating={product.rating} count={product.reviewCount} />
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-[#1A1714]">₹{product.price}</span>
              {product.originalPrice && <span className="text-sm text-[#7A7064] line-through">₹{product.originalPrice}</span>}
            </div>
            {product.originalPrice && (
              <span className="text-xs font-bold text-[#C55A20]">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────────────

function Header() {
  const { navigate, cart, wishlist, currentPage, user, setAuthModalOpen, logout, products } = useApp();
  const scrolled = useScrolled();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((s: number, i: CartItem) => s + i.quantity, 0);
  const wishCount = wishlist.size;

  useEffect(() => { if (searchOpen) searchRef.current?.focus(); }, [searchOpen]);

  const navLinks = [
    { label: "Shop", page: "shop" },
    { label: "Our Story", page: "founder" },
    { label: "Recipes", page: "recipes" },
    { label: "Wholesale", page: "wholesale" },
  ];

  const results = query.length > 1 ? products.filter((p: any) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4) : [];

  const closeAll = () => { setProfileOpen(false); setNotifOpen(false); };

  const myOrders = (() => {
    if (!user || !user.email) return [];
    try {
      const allOrders = JSON.parse(localStorage.getItem("spiceora_orders") || "[]");
      return allOrders.filter((o: any) => o.userEmail === user.email);
    } catch { return []; }
  })();

  const notifs = [
    { title: "New Recipe Added", desc: "Try our Saffron Risotto recipe", time: "1d ago", icon: BookOpen, color: "#C9920A" },
    { title: "Flash Sale — 20% Off", desc: "Saffron & Premium Blends today", time: "2d ago", icon: Tag, color: "#C55A20" },
  ];

  if (myOrders.length > 0) {
    const latest = myOrders[myOrders.length - 1];
    notifs.unshift({
      title: `Order ${latest.status === 'dispatched' ? 'is on its way!' : 'Update'}`,
      desc: `Order ${latest.id} is ${latest.status}`,
      time: "Just now", icon: Truck, color: "#2A4A3C"
    });
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-xl border-b border-[#1A1714]/8 shadow-[0_2px_20px_rgba(26,23,20,0.06)]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button onClick={() => navigate("home")} className="flex items-center gap-2.5 focus:outline-none group">
            <div className="w-8 h-8 rounded-full bg-[#2A4A3C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Leaf className="w-4 h-4 text-[#C9920A]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1A1714]" style={{ fontFamily: "'Bodoni Moda', serif" }}>Spiceora</span>
          </button>

          {/* Nav desktop */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={() => navigate(link.page as Page, link.data)}
                className={`text-sm font-medium relative group py-1 transition-colors ${currentPage === link.page ? "text-[#2A4A3C]" : "text-[#7A7064] hover:text-[#1A1714]"}`}
              >
                {link.label}
                <span className={`absolute inset-x-0 bottom-0 h-0.5 bg-[#2A4A3C] rounded-full transition-transform duration-250 origin-left ${currentPage === link.page ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5">
            {/* Search */}
            <div className="relative">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="absolute right-10 top-1/2 -translate-y-1/2 overflow-hidden"
                  >
                    <input
                      ref={searchRef}
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search spices…"
                      className="w-full bg-[#F5F0E8] rounded-xl px-4 py-2 text-sm outline-none text-[#1A1714] placeholder-[#7A7064]"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {searchOpen && results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute right-10 top-12 w-72 bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,23,20,0.12)] border border-[#1A1714]/8 overflow-hidden z-50"
                  >
                    {results.map(p => (
                      <button key={p.id} onClick={() => { navigate("product", p); setSearchOpen(false); setQuery(""); }}
                        className="flex items-center gap-3 w-full p-3 hover:bg-[#FAF8F3] transition-colors text-left">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-[#F5F0E8]" />
                        <div>
                          <p className="text-sm font-medium text-[#1A1714]">{p.name}</p>
                          <p className="text-xs text-[#7A7064]">₹{p.price} · {p.weight}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <button onClick={() => { setSearchOpen(v => !v); if (searchOpen) setQuery(""); }}
                aria-label="Toggle search bar"
                className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-[#7A7064] hover:text-[#1A1714] hover:bg-[#2A4A3C]/8 transition-all">
                {searchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {/* Wishlist */}
            <button onClick={() => navigate("profile", { anchor: "wishlist" })}
              aria-label="View wishlist"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#7A7064] hover:text-[#1A1714] hover:bg-[#2A4A3C]/8 transition-all">
              <Heart className="w-4 h-4" />
              <AnimatePresence>
                {wishCount > 0 && (
                  <motion.span key={wishCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notifications */}
            <div className="relative hidden sm:block">
              <button onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
                aria-label="View notifications"
                className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#7A7064] hover:text-[#1A1714] hover:bg-[#2A4A3C]/8 transition-all">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#C55A20] rounded-full" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                    className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,23,20,0.12)] border border-[#1A1714]/8 overflow-hidden z-50">
                    <div className="p-4 border-b border-[#1A1714]/8 flex items-center justify-between">
                      <h3 className="font-semibold text-[#1A1714] text-sm">Notifications</h3>
                      <button onClick={() => setNotifOpen(false)} className="text-xs text-[#2A4A3C] hover:underline">Mark all read</button>
                    </div>
                    {notifs.map((n, i) => (
                      <button key={i} onClick={() => setNotifOpen(false)}
                        className="flex items-start gap-3 w-full p-4 hover:bg-[#FAF8F3] transition-colors border-b border-[#1A1714]/5 last:border-0 text-left">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: n.color + "18" }}>
                          <n.icon className="w-4 h-4" style={{ color: n.color }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1A1714]">{n.title}</p>
                          <p className="text-xs text-[#7A7064] mt-0.5">{n.desc}</p>
                        </div>
                        <span className="text-xs text-[#7A7064] shrink-0">{n.time}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button onClick={() => navigate("cart")}
              aria-label="View shopping cart"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#7A7064] hover:text-[#1A1714] hover:bg-[#2A4A3C]/8 transition-all">
              <ShoppingCart className="w-4 h-4" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span key={cartCount} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#2A4A3C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Profile */}
            <div className="relative hidden sm:block">
              {user ? (
                <>
                  <button onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                    aria-label="User profile menu"
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#7A7064] hover:text-[#1A1714] hover:bg-[#2A4A3C]/8 transition-all">
                    <User className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                        className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-[0_8px_40px_rgba(26,23,20,0.12)] border border-[#1A1714]/8 overflow-hidden z-50 py-1">
                        <div className="px-4 py-3 border-b border-[#1A1714]/8">
                          <p className="text-sm font-semibold text-[#1A1714]">{user.name}</p>
                          <p className="text-xs text-[#7A7064]">{user.email}</p>
                        </div>
                        {[
                          { label: "My Profile", icon: User },
                          { label: "My Orders", icon: Package },
                          { label: "Wishlist", icon: Heart },
                          { label: "Settings", icon: Settings },
                        ].map(item => (
                          <button key={item.label} onClick={() => { navigate("profile"); closeAll(); }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#7A7064] hover:text-[#1A1714] hover:bg-[#FAF8F3] transition-colors">
                            <item.icon className="w-4 h-4" /> {item.label}
                          </button>
                        ))}
                        <div className="border-t border-[#1A1714]/8 mt-1">
                          <button onClick={() => { logout(); closeAll(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button onClick={() => setAuthModalOpen("login")}
                  className="px-4 py-2 text-sm font-medium text-[#2A4A3C] hover:bg-[#2A4A3C]/8 rounded-xl transition-all cursor-pointer">
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle mobile menu"
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#7A7064] hover:bg-[#2A4A3C]/8 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-[#1A1714]/8 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <button key={link.label} onClick={() => { navigate(link.page as Page, link.data); setMenuOpen(false); }}
                  className="text-left px-4 py-3 rounded-xl text-[#1A1714] font-medium hover:bg-[#FAF8F3] transition-colors">
                  {link.label}
                </button>
              ))}
              <button onClick={() => { navigate("profile"); setMenuOpen(false); }}
                className="text-left px-4 py-3 rounded-xl text-[#1A1714] font-medium hover:bg-[#FAF8F3] transition-colors">
                My Account
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global backdrop */}
      {(profileOpen || notifOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAll} />
      )}
    </header>
  );
}

// ─── HOME SECTIONS ──────────────────────────────────────────────────────────────

function Hero() {
  const { navigate, cmsSettings } = useApp();
  const [idx, setIdx] = useState(0);
  const slides = [
    {
      title: cmsSettings?.hero?.headline || "Spices Worthy\nof the Source",
      sub: cmsSettings?.hero?.subheadline || "Single-origin. Small-batch. Traceable from farm to jar.",
      image: cmsSettings?.hero?.image || "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920&h=1080&fit=crop&auto=format",
      overlay: "from-[#1A2E25]/85 via-[#2A4A3C]/50 to-transparent",
    },
    {
      title: "The Golden\nTurmeric Collection",
      sub: "Hand-harvested from Kerala. Over 5% curcumin — lab verified.",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1920&h=1080&fit=crop&auto=format",
      overlay: "from-[#3D2B00]/85 via-[#7A5200]/50 to-transparent",
    },
    {
      title: "Kashmir Saffron\nHand-Picked at Dawn",
      sub: "The world's finest saffron — 1 acre of crocus flowers for 1 kg of spice.",
      image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1920&h=1080&fit=crop&auto=format",
      overlay: "from-[#2D1A00]/85 via-[#6B3C00]/50 to-transparent",
    },
  ];
  const s = slides[idx];

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1A2E25]">
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0">
          <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 w-full">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-px w-8 bg-[#C9920A]" />
                <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Premium Spices</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 whitespace-pre-line" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                {s.title}
              </h1>
              <p className="text-lg text-white/75 mb-10 max-w-lg leading-relaxed">{s.sub}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Btn size="lg" onClick={() => navigate("shop")} className="bg-[#C9920A] hover:bg-[#A87800] border-0 shadow-lg">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Btn>
                <button onClick={() => navigate("founder")}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/30 text-white text-base font-medium hover:bg-white/10 transition-all">
                  Our Story
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-350 ${i === idx ? "w-7 h-2 bg-[#C9920A]" : "w-2 h-2 bg-white/35 hover:bg-white/60"}`} />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 right-8 hidden lg:flex flex-col items-center gap-2">
          <span className="text-white/40 text-xs tracking-[0.15em] uppercase -rotate-90 mb-4">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { navigate, categories } = useApp();
  const cats = categories.filter((c: any) => c.id !== "all") as any[];
  if (!cats || cats.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-[#FAF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9920A]" />
              <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Explore</span>
              <div className="h-px w-8 bg-[#C9920A]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>
              Shop by Category
            </h2>
            <p className="text-[#7A7064] text-lg max-w-lg mx-auto">From ancient roots to artisan blends — every ingredient with a story.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {cats.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 80}>
              <button onClick={() => navigate("shop", { category: cat.id })}
                className="group relative rounded-2xl overflow-hidden cursor-pointer w-full" style={{ aspectRatio: "3/4" }}>
                <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-all duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
                  <span className="text-xs text-white/65 font-medium mb-1">{cat.description}</span>
                  <h3 className="text-base font-semibold text-white leading-tight mb-1">{cat.name}</h3>
                  <span className="text-xs text-white/55">{cat.count} products</span>
                  <div className="flex items-center gap-1 mt-3 text-[#C9920A] text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-250 translate-y-1 group-hover:translate-y-0">
                    Browse <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {/* Custom Gift Box CTA banner */}
        <Reveal delay={200}>
          <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#2A4A3C] text-white flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <span className="text-xs font-bold text-[#C9920A] uppercase tracking-widest block mb-1">Gifting Crate Builder</span>
              <h3 className="text-2xl font-bold" style={{ fontFamily: "'Bodoni Moda', serif" }}>Create a Custom Spices Gift Box</h3>
              <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-xl">Choose a box wrapping design, pack it with your favorite single-origin spices, and add a custom card to make it a perfect gift.</p>
            </div>
            <Btn variant="secondary" onClick={() => navigate("bundle")} className="bg-[#C9920A] hover:bg-[#A87800] border-0 text-white font-semibold text-xs py-3 px-6 cursor-pointer">
              Build Spice Box <ArrowRight className="w-4 h-4" />
            </Btn>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  const { navigate, products } = useApp();
  if (!products || products.length === 0) return null;
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C9920A]" />
                <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Curated Selection</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714]" style={{ fontFamily: "'Bodoni Moda', serif" }}>Featured Spices</h2>
            </div>
            <Btn variant="outline" onClick={() => navigate("shop")} size="md">
              View All <ArrowRight className="w-4 h-4" />
            </Btn>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {products.slice(0, 4).map((p: any, i: number) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const features = [
    { icon: Leaf, title: "100% Organic", desc: "Every spice is certified organic — no pesticides, no artificial additives, ever." },
    { icon: Globe, title: "Single Origin", desc: "Traceable from farm to jar. Know exactly where your spice was grown and by whom." },
    { icon: Award, title: "Award Winning", desc: "Recognized by the World Spice Congress for quality and sustainable sourcing." },
    { icon: Truck, title: "Free Delivery", desc: "Free express delivery on orders over ₹499. Most orders arrive in 2–3 days." },
    { icon: RefreshCw, title: "30-Day Returns", desc: "If not satisfied, return within 30 days — no questions, no friction." },
    { icon: Shield, title: "Lab Certified", desc: "Every batch is third-party tested for purity, potency, and zero contaminants." },
  ];
  return (
    <section className="py-20 lg:py-28 bg-[#2A4A3C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9920A]" />
              <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Our Promise</span>
              <div className="h-px w-8 bg-[#C9920A]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Why Spiceora?</h2>
            <p className="text-white/65 text-lg max-w-xl mx-auto">Great food starts with great ingredients. That's a promise, not a tagline.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 55}>
              <div className="group p-6 lg:p-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#C9920A]/20 flex items-center justify-center mb-5 group-hover:bg-[#C9920A]/30 transition-colors">
                  <f.icon className="w-5 h-5 text-[#C9920A]" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function OurStory() {
  const { navigate } = useApp();
  return (
    <section id="story" className="py-20 lg:py-28 bg-[#FAF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden" style={{ aspectRatio: "4/5" }}>
                <img src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=1000&fit=crop&auto=format" alt="Spice farm" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-5 -right-5 w-44 h-44 rounded-2xl overflow-hidden border-4 border-[#FAF8F3] shadow-xl hidden lg:block">
                <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop&auto=format" alt="Grinding spices" className="w-full h-full object-cover" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#C9920A]" />
                <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Since 2018</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714] mb-6 leading-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                Born From a Journey<br />Across Spice Routes
              </h2>
              <p className="text-[#7A7064] text-lg leading-relaxed mb-5">
                Spiceora began when our founder, Rajan Menon, traveled the spice trail from Kerala to Kashmir and found something troubling: the world's finest spices were leaving India while Indian homes cooked with inferior imports.
              </p>
              <p className="text-[#7A7064] leading-relaxed mb-8">
                We built Spiceora to change that — working directly with 47 farming families across 8 states and 3 countries, bringing you the same grade of spice exported to Michelin-starred restaurants, in your kitchen, at a fair price.
              </p>
              <Btn size="lg" onClick={() => navigate("founder")}>
                Read Our Full Story <ArrowRight className="w-4 h-4" />
              </Btn>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9920A]" />
              <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Transparency</span>
              <div className="h-px w-8 bg-[#C9920A]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Farm to Jar</h2>
            <p className="text-[#7A7064] text-lg max-w-xl mx-auto">Every step is designed to maximize flavor and preserve what nature intended.</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-[#2A4A3C]/15" />
          {PROCESS_STEPS.map((step, i) => (
            <Reveal key={step.step} delay={i * 90}>
              <div className="relative flex flex-col items-center text-center p-6">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-[#FAF8F3] border-2 border-[#2A4A3C]/15 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-[#2A4A3C]" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#C9920A] text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#1A1714] mb-2">{step.title}</h3>
                <p className="text-xs text-[#7A7064] leading-relaxed">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Recipes() {
  const { navigate, recipes } = useApp();
  if (!recipes || recipes.length === 0) return null;
  return (
    <section id="recipes" className="py-20 lg:py-28 bg-[#FAF8F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C9920A]" />
                <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Inspiration</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714]" style={{ fontFamily: "'Bodoni Moda', serif" }}>Recipes to Try</h2>
            </div>
            <Btn variant="outline" onClick={() => navigate("recipes")}>All Recipes <ArrowRight className="w-4 h-4" /></Btn>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {recipes.slice(0, 3).map((r: any, i: number) => (
            <Reveal key={r.id} delay={i * 80}>
              <button onClick={() => navigate("recipe", r)} className="group text-left rounded-2xl overflow-hidden bg-white border border-[#1A1714]/6 hover:border-[#2A4A3C]/20 hover:shadow-lg transition-all duration-300 w-full cursor-pointer">
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="text-xs bg-black/40 text-white backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {r.time}
                    </span>
                    <span className="text-xs bg-black/40 text-white backdrop-blur-sm px-2.5 py-1 rounded-full">{r.difficulty}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-[#1A1714] mb-2 group-hover:text-[#2A4A3C] transition-colors">{r.title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {r.spices.map(s => <span key={s} className="text-xs text-[#7A7064] bg-[#FAF8F3] px-2 py-1 rounded-full">{s}</span>)}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const { testimonials } = useApp();
  const [active, setActive] = useState(0);
  if (!testimonials || testimonials.length === 0) return null;
  return (
    <section className="py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9920A]" />
              <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Community</span>
              <div className="h-px w-8 bg-[#C9920A]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714]" style={{ fontFamily: "'Bodoni Moda', serif" }}>What Our Community Says</h2>
          </div>
        </Reveal>
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.38 }} className="text-center">
              <div className="flex justify-center mb-5">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-[#C9920A] text-[#C9920A]" />)}
              </div>
              <blockquote className="text-xl lg:text-2xl text-[#1A1714] leading-relaxed mb-8 italic" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                "{testimonials[active]?.text}"
              </blockquote>
              <div className="flex flex-col items-center gap-3">
                <img src={testimonials[active]?.avatar || testimonials[active]?.image} alt={testimonials[active]?.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-[#C9920A]/25" />
                <div>
                  <p className="font-semibold text-[#1A1714]">{testimonials[active]?.name}</p>
                  <p className="text-sm text-[#7A7064]">{testimonials[active]?.role}</p>
                  <p className="text-xs text-[#C9920A] mt-0.5">Review for {testimonials[active]?.product}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_: any, i: number) => (
              <button key={i} onClick={() => setActive(i)}
                className={`rounded-full transition-all duration-300 ${i === active ? "w-6 h-2 bg-[#2A4A3C]" : "w-2 h-2 bg-[#2A4A3C]/25 hover:bg-[#2A4A3C]/50"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setTimeout(() => setStatus("done"), 1400);
  }
  return (
    <section className="py-20 lg:py-28 bg-[#FAF8F3]">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <Reveal>
          <div className="w-14 h-14 rounded-2xl bg-[#2A4A3C] flex items-center justify-center mx-auto mb-6">
            <Mail className="w-6 h-6 text-[#C9920A]" />
          </div>
          <h2 className="text-4xl font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Join the Spiceora Circle</h2>
          <p className="text-[#7A7064] text-lg mb-10">Recipes, provenance stories, and early access to new arrivals. No spam — ever.</p>
          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 p-6 bg-[#2A4A3C]/8 rounded-2xl">
                <CheckCircle className="w-10 h-10 text-[#2A4A3C]" />
                <p className="font-semibold text-[#1A1714]">You're in the circle!</p>
                <p className="text-sm text-[#7A7064]">Welcome to Spiceora. Check your inbox for a welcome gift.</p>
              </motion.div>
            ) : (
              <motion.form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required
                  className="flex-1 bg-white border border-[#1A1714]/12 rounded-xl px-5 py-3.5 text-sm text-[#1A1714] placeholder-[#7A7064] focus:outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/15 transition-all" />
                <Btn type="submit" size="md" loading={status === "loading"}>Subscribe <Mail className="w-4 h-4" /></Btn>
              </motion.form>
            )}
          </AnimatePresence>
          <p className="text-xs text-[#7A7064] mt-4">No spam. Unsubscribe anytime.</p>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const { navigate } = useApp();

  function handleFooterClick(link: string) {
    if (link === "All Spices") {
      navigate("shop");
    } else if (link === "Roots & Rhizomes") {
      navigate("shop", { category: "roots" });
    } else if (link === "Seeds & Pods") {
      navigate("shop", { category: "seeds" });
    } else if (link === "Spice Blends") {
      navigate("shop", { category: "blends" });
    } else if (link === "Our Story" || link === "Our Process" || link === "Sustainability") {
      navigate("founder");
    } else if (link === "Wholesale & Bulk") {
      navigate("wholesale");
    } else {
      navigate("shop");
    }
  }

  return (
    <footer className="bg-[#1A1714] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <button onClick={() => navigate("home")} className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#2A4A3C] flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-[#C9920A]" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "'Bodoni Moda', serif" }}>Spiceora</span>
            </button>
            <p className="text-white/50 text-sm leading-relaxed mb-5 max-w-xs">Premium single-origin spices from farm to jar. Traceable, organic, crafted for culinary excellence.</p>
            <div className="flex gap-2">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center hover:bg-[#C9920A]/25 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-white/60" />
                </button>
              ))}
            </div>
          </div>
          {[
            { title: "Shop", links: ["All Spices", "Roots & Rhizomes", "Seeds & Pods", "Spice Blends", "Gift Hampers"] },
            { title: "Company", links: ["Our Story", "Our Process", "Sustainability", "Wholesale & Bulk"] },
            { title: "Help", links: ["FAQ", "Shipping & Returns", "Track Order", "Contact Us", "Privacy Policy"] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-white/80 mb-4 tracking-[0.15em] uppercase">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <button onClick={() => handleFooterClick(link)} className="text-sm text-white/45 hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">© 2024 Spiceora. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/35">Secure payments:</span>
            {["Visa", "Mastercard", "UPI", "Razorpay"].map(p => (
              <span key={p} className="text-xs text-white/45 bg-white/8 px-2 py-1 rounded font-medium">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function RecentlyViewedHomepage() {
  const { navigate, recentlyViewed, products } = useApp();
  const list = products.filter((p: any) => recentlyViewed?.includes(p.id)).slice(0, 4);

  if (list.length === 0) return null;

  return (
    <section className="py-16 bg-[#FAF8F3] border-t border-[#1A1714]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <Reveal>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#C9920A]" />
            <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Your History</span>
          </div>
          <h2 className="text-3xl font-bold text-[#1A1714] mb-8" style={{ fontFamily: "'Bodoni Moda', serif" }}>Recently Viewed Spices</h2>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {list.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  useSEO("Single-Origin Premium Spices", "Discover organic, farm-direct single-origin A-grade premium spices slow ground under 35°C for maximum flavor and aroma.");
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <WhyUs />
      <FarmToKitchenTimeline />
      <OurStory />
      <Recipes />
      <InstagramGallery />
      <BulkOrderSection />
      <RecentlyViewedHomepage />
      <Testimonials />
      <Newsletter />
      <Footer />
    </>
  );
}

// ─── SHOP PAGE ─────────────────────────────────────────────────────────────────

function ShopPage({ initCategory = "all" }: { initCategory?: string }) {
  const { navigate, logAnalyticsEvent, products, categories } = useApp();
  useSEO("Shop Premium Spices", "Browse our collection of single-origin cardamoms, saffron, turmeric, and peppercorns. Organic certified, hand-picked A-grade spices.");
  const [category, setCategory] = useState(initCategory);
  const [sort, setSort] = useState("featured");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortOpen, setSortOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (q.trim()) {
      const handler = setTimeout(() => {
        logAnalyticsEvent("Search Query", { query: q });
      }, 750);
      return () => clearTimeout(handler);
    }
  }, [q]);

  const sortOpts = [
    { v: "featured", l: "Featured" },
    { v: "price-asc", l: "Price: Low to High" },
    { v: "price-desc", l: "Price: High to Low" },
    { v: "rating", l: "Highest Rated" },
  ];

  const catIdMap: Record<string, string> = {
    "Roots & Paste": "roots",
    "roots": "roots",
    "Seeds & Pods": "seeds",
    "seeds": "seeds",
    "Spice Blends": "blends",
    "blends": "blends"
  };

  const filtered = products
    .filter((p: any) => category === "all" || catIdMap[p.category] === category || p.category.toLowerCase().includes(category))
    .filter((p: any) => !q || p.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a: any, b: any) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      {/* Page header */}
      <div className="bg-[#2A4A3C] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/55 text-sm mb-2">
            <button onClick={() => navigate("home")} className="hover:text-white transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Shop</span>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>All Spices</h1>
          <p className="text-white/60 text-sm mt-1">{products.length} premium products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-5 sticky top-24">
              <h3 className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-3">Categories</h3>
              <div className="flex flex-col gap-0.5">
                {categories.map((cat: any) => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${category === cat.id ? "bg-[#2A4A3C] text-white font-medium" : "text-[#7A7064] hover:bg-[#FAF8F3] hover:text-[#1A1714]"}`}>
                    <span>{cat.name}</span>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${category === cat.id ? "bg-white/20 text-white" : "bg-[#F5F0E8] text-[#7A7064]"}`}>
                      {cat.id === "all" ? products.length : products.filter((p: any) => catIdMap[p.category] === cat.id || p.category.toLowerCase().includes(cat.id)).length}
                    </span>
                  </button>
                ))}
              </div>
              <div className="border-t border-[#1A1714]/8 mt-4 pt-4">
                <h3 className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-3">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["organic", "vegan", "gluten-free", "premium", "keto", "luxury"].map(tag => (
                    <button key={tag} className="text-xs px-2.5 py-1 rounded-full border border-[#1A1714]/12 text-[#7A7064] hover:border-[#2A4A3C] hover:text-[#2A4A3C] transition-colors capitalize">{tag}</button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-5">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products…"
                className="bg-white border border-[#1A1714]/12 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all w-full sm:w-56" />
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setSortOpen(v => !v)}
                    className="flex items-center gap-2 bg-white border border-[#1A1714]/12 rounded-xl px-3.5 py-2.5 text-sm text-[#7A7064] hover:border-[#2A4A3C] transition-all">
                    <Filter className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{sortOpts.find(s => s.v === sort)?.l}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <AnimatePresence>
                    {sortOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-lg border border-[#1A1714]/8 overflow-hidden z-20">
                          {sortOpts.map(o => (
                            <button key={o.v} onClick={() => { setSort(o.v); setSortOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${sort === o.v ? "bg-[#2A4A3C] text-white" : "text-[#7A7064] hover:bg-[#FAF8F3]"}`}>
                              {o.l}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex bg-white rounded-xl border border-[#1A1714]/12 overflow-hidden">
                  <button onClick={() => setView("grid")} className={`p-2.5 transition-colors ${view === "grid" ? "bg-[#2A4A3C] text-white" : "text-[#7A7064] hover:bg-[#FAF8F3]"}`}>
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setView("list")} className={`p-2.5 transition-colors ${view === "list" ? "bg-[#2A4A3C] text-white" : "text-[#7A7064] hover:bg-[#FAF8F3]"}`}>
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#7A7064] mb-4">Showing <span className="font-medium text-[#1A1714]">{filtered.length}</span> products</p>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#1A1714]/8">
                <Search className="w-10 h-10 text-[#7A7064] mx-auto mb-3" />
                <h3 className="font-semibold text-[#1A1714] mb-1">No products found</h3>
                <p className="text-sm text-[#7A7064] mb-5">Try a different search or category</p>
                <Btn onClick={() => { setCategory("all"); setQ(""); }}>Reset Filters</Btn>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((p, i) => <ListCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ListCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { navigate, addToCart, toggleWishlist, wishlist } = useApp();
  const [adding, setAdding] = useState(false);
  const isWished = wishlist.has(product.id);
  return (
    <Reveal delay={index * 50}>
      <div onClick={() => navigate("product", product)}
        className="group flex gap-4 bg-white rounded-2xl overflow-hidden border border-[#1A1714]/6 hover:border-[#2A4A3C]/20 hover:shadow-md transition-all duration-300 cursor-pointer p-4">
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#F5F0E8] flex-shrink-0">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest">{product.origin}</p>
              <h3 className="font-semibold text-[#1A1714]">{product.name}</h3>
              <p className="text-xs text-[#7A7064]">{product.subtitle} · {product.weight}</p>
            </div>
            {product.badge && <Badge color="orange">{product.badge}</Badge>}
          </div>
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#1A1714]">₹{product.price}</span>
              <button onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
                className="w-9 h-9 rounded-xl bg-[#FAF8F3] flex items-center justify-center hover:bg-red-50 transition-colors">
                <Heart className={`w-4 h-4 ${isWished ? "fill-red-500 text-red-500" : "text-[#7A7064]"}`} />
              </button>
              <Btn size="sm" loading={adding} onClick={e => { e.stopPropagation(); setAdding(true); setTimeout(() => { addToCart(product); setAdding(false); }, 600); }}>
                {adding ? "…" : "Add"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─── PRODUCT PAGE ───────────────────────────────────────────────────────────────

function ProductPage({ product }: { product: any }) {
  const { navigate, addToCart, toggleWishlist, wishlist, user, recentlyViewed, products } = useApp();
  useSEO(product.name, product.description);
  const [qty, setQty] = useState(1);
  const [weightTab, setWeightTab] = useState<"retail" | "wholesale">("retail");
  const [tab, setTab] = useState("description");
  const [imgIdx, setImgIdx] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const isWished = wishlist.has(product.id);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState(user?.name || "");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (user) setReviewName(user.name);
  }, [user]);

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim() || !reviewTitle.trim()) return;
    setReviewLoading(true);
    setTimeout(() => {
      setReviewLoading(false);
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewOpen(false);
        setReviewSuccess(false);
        setReviewTitle("");
        setReviewText("");
      }, 2000);
    }, 1500);
  }

  const images = [product.image, product.image, product.image];
  const tabs = [
    { id: "description", label: "Description" },
    { id: "nutrition", label: "Nutrition" },
    { id: "ingredients", label: "Ingredients" },
    { id: "storage", label: "Storage & Origin" },
  ];

  const weightOptions = getWeightOptions(product.price);
  const retailOptions = weightOptions.filter(o => !o.label.toLowerCase().includes("kg"));
  const wholesaleOptions = weightOptions.filter(o => o.label.toLowerCase().includes("kg"));
  const [selectedWeightOpt, setSelectedWeightOpt] = useState(weightOptions[0]); // default 100g

  useEffect(() => {
    setSelectedWeightOpt(weightOptions[0]);
    setQty(1);
    setImgIdx(0);
    setWeightTab("retail");
  }, [product]);

  function handleAdd() {
    setAdding(true);
    setTimeout(() => {
      for (let i = 0; i < qty; i++) addToCart(product, selectedWeightOpt.label, selectedWeightOpt.price);
      setAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 650);
  }

  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const related = products.filter((p: any) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const recentlyViewedProducts = products.filter((p: any) => recentlyViewed?.includes(p.id) && p.id !== product.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#7A7064] mb-8 flex-wrap">
          <button onClick={() => navigate("home")} className="hover:text-[#1A1714] transition-colors">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("shop")} className="hover:text-[#1A1714] transition-colors">Shop</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1A1714] font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
          {/* Images */}
          <div>
            <div className="relative rounded-3xl overflow-hidden bg-[#F5F0E8] mb-4" style={{ aspectRatio: "1/1" }}>
              <AnimatePresence mode="wait">
                <motion.img key={imgIdx} src={images[imgIdx]} alt={product.name}
                  initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                  className="w-full h-full object-cover" />
              </AnimatePresence>
              {product.badge && (
                <div className="absolute top-4 left-4"><Badge color="orange">{product.badge}</Badge></div>
              )}
            </div>
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${imgIdx === i ? "border-[#2A4A3C] shadow-md" : "border-transparent hover:border-[#2A4A3C]/25"}`}>
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover bg-[#F5F0E8]" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-2">{product.origin}</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1714] mb-1 leading-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>{product.name}</h1>
            <p className="text-[#7A7064] mb-5">{product.subtitle} · {selectedWeightOpt.label.split(" ")[0]}</p>

            <div className="flex items-center gap-3 mb-5">
              <StarRating rating={product.rating} count={product.reviewCount} size="md" />
              <button onClick={() => setReviewOpen(true)} className="text-sm text-[#2A4A3C] underline underline-offset-2 hover:text-[#C55A20] transition-colors font-medium cursor-pointer">Write a review</button>
            </div>

            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-4xl font-bold text-[#1A1714]">₹{selectedWeightOpt.price}</span>
              {product.originalPrice && selectedWeightOpt.label.includes("100g") && (
                <>
                  <span className="text-xl text-[#7A7064] line-through">₹{product.originalPrice}</span>
                  <Badge color="orange">{Math.round((1 - product.price / product.originalPrice) * 100)}% OFF</Badge>
                </>
              )}
            </div>

            <p className="text-[#7A7064] leading-relaxed mb-5">{product.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(t => (
                <span key={t} className="text-xs px-3 py-1.5 bg-[#2A4A3C]/8 text-[#2A4A3C] rounded-full font-medium">#{t}</span>
              ))}
            </div>

            {/* Sourcing Journey Tabs */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-2 block">Sourcing Option</label>
              <div className="flex bg-[#F5F0E8] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => { setWeightTab("retail"); setSelectedWeightOpt(retailOptions[0]); }}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${weightTab === "retail" ? "bg-white text-[#2A4A3C] shadow-sm font-bold" : "text-[#7A7064] hover:text-[#1A1714]"}`}
                >
                  Retail Packs
                </button>
                <button
                  type="button"
                  onClick={() => { setWeightTab("wholesale"); setSelectedWeightOpt(wholesaleOptions[0]); }}
                  className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all ${weightTab === "wholesale" ? "bg-white text-[#2A4A3C] shadow-sm font-bold" : "text-[#7A7064] hover:text-[#1A1714]"}`}
                >
                  Wholesale Packs (B2B)
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-2.5 block">Select Size</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(weightTab === "retail" ? retailOptions : wholesaleOptions).map(opt => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedWeightOpt(opt)}
                    className={`px-4 py-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${selectedWeightOpt.label === opt.label ? "bg-[#2A4A3C] border-[#2A4A3C] text-white shadow-sm" : "bg-white border-[#1A1714]/12 text-[#7A7064] hover:border-[#2A4A3C]/45 hover:text-[#1A1714]"}`}
                  >
                    <span className="block">{opt.label.split(" ")[0]}</span>
                    <span className="block text-[10px] mt-0.5 opacity-80">₹{opt.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add or B2B Sourcing CTA */}
            {weightTab === "retail" ? (
              <div className="flex gap-3 mb-3">
                <QtySelector value={qty} onChange={setQty} />
                <Btn size="md" loading={adding} onClick={handleAdd}
                  className={`flex-1 transition-all duration-300 ${added ? "!bg-[#2A7A55] hover:!bg-[#2A7A55]" : ""}`}>
                  {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
                </Btn>
              </div>
            ) : (
              <div className="mb-3">
                <Btn size="md" onClick={() => navigate("wholesale", { product: product.name, volume: selectedWeightOpt.label })}
                  className="w-full !bg-[#C9920A] hover:!bg-[#A87800] border-0 text-white font-semibold flex items-center justify-center gap-2 py-3 rounded-xl shadow-sm hover:shadow transition-all duration-350">
                  <FileText className="w-4 h-4" /> Request Wholesale Quote
                </Btn>
              </div>
            )}

            <div className="flex gap-3 mb-7">
              <button onClick={() => toggleWishlist(product.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 cursor-pointer ${isWished ? "border-red-200 bg-red-50 text-red-500" : "border-[#1A1714]/15 text-[#7A7064] hover:border-[#2A4A3C] hover:text-[#2A4A3C]"}`}>
                <Heart className={`w-4 h-4 ${isWished ? "fill-red-500" : ""}`} />
                {isWished ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})}
                className="w-12 h-12 rounded-xl border-2 border-[#1A1714]/15 flex items-center justify-center text-[#7A7064] hover:border-[#2A4A3C] hover:text-[#2A4A3C] transition-all">
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: "Free Delivery", sub: "on orders ₹499+" },
                { icon: RefreshCw, label: "30-Day Returns", sub: "no questions" },
                { icon: Shield, label: "Lab Certified", sub: "third-party tested" },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center text-center p-3 bg-white rounded-xl border border-[#1A1714]/8">
                  <b.icon className="w-4 h-4 text-[#2A4A3C] mb-1.5" />
                  <p className="text-[11px] font-semibold text-[#1A1714]">{b.label}</p>
                  <p className="text-[10px] text-[#7A7064]">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl border border-[#1A1714]/8 mb-12 overflow-hidden">
          <div className="flex border-b border-[#1A1714]/8 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${tab === t.id ? "text-[#2A4A3C]" : "text-[#7A7064] hover:text-[#1A1714]"}`}>
                {t.label}
                {tab === t.id && (
                  <motion.div layoutId="product-tab" className="absolute bottom-0 inset-x-0 h-0.5 bg-[#2A4A3C]" />
                )}
              </button>
            ))}
          </div>
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {tab === "description" && (
                  <div>
                    <p className="text-[#7A7064] leading-relaxed">{product.description}</p>
                    <p className="text-[#7A7064] leading-relaxed mt-4">
                      Grown using traditional agricultural practices with no synthetic inputs. Our {product.name.toLowerCase()} is a testament to what patience and proper technique can achieve. Our farmers follow generations of accumulated wisdom alongside modern quality standards.
                    </p>
                  </div>
                )}
                {tab === "nutrition" && (
                  <div>
                    <p className="text-sm text-[#7A7064] mb-4">Nutritional information per 100g serving</p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {Object.entries(product.nutritionPer100g).map(([key, val]) => (
                        <div key={key} className="p-4 bg-[#FAF8F3] rounded-xl text-center">
                          <p className="text-xl font-bold text-[#1A1714]">{val}</p>
                          <p className="text-xs text-[#7A7064] capitalize mt-1">{key}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === "ingredients" && (
                  <div>
                    <p className="text-sm text-[#7A7064] mb-4">Our commitment to purity: every ingredient, listed clearly.</p>
                    <div className="flex flex-wrap gap-3">
                      {product.ingredients.map(ing => (
                        <div key={ing} className="flex items-center gap-2 px-4 py-2.5 bg-[#FAF8F3] rounded-xl border border-[#2A4A3C]/12">
                          <Leaf className="w-3.5 h-3.5 text-[#2A4A3C]" />
                          <span className="text-sm text-[#1A1714]">{ing}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === "storage" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#1A1714] mb-2 flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#2A4A3C]" /> Storage Instructions
                      </h4>
                      <p className="text-sm text-[#7A7064] leading-relaxed">{product.storage}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#1A1714] mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#2A4A3C]" /> Origin
                      </h4>
                      <p className="text-sm text-[#7A7064] leading-relaxed">
                        Sourced from <strong className="text-[#1A1714]">{product.origin}</strong>. We maintain direct relationships with farming partners, visiting farms annually to ensure quality and fair trade standards.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-[#1A1714] mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mb-16 border-t border-[#1A1714]/8 pt-12">
            <h2 className="text-2xl font-bold text-[#1A1714] mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>Recently Viewed</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {recentlyViewedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* Sticky Bottom buying drawer */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-[#1A1714]/12 shadow-[0_-8px_30px_rgba(26,23,20,0.08)] py-4 px-4 sm:px-6 z-40 flex items-center justify-between gap-4 max-w-7xl mx-auto rounded-t-3xl text-left"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-[#F5F0E8]" />
              <div className="min-w-0">
                <h4 className="font-semibold text-sm text-[#1A1714] truncate">{product.name}</h4>
                <p className="text-xs text-[#7A7064]">{selectedWeightOpt.label.split(" ")[0]} · <strong className="text-[#1A1714]">₹{selectedWeightOpt.price}</strong></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {weightTab === "retail" && (
                <div className="hidden sm:block">
                  <QtySelector value={qty} onChange={setQty} />
                </div>
              )}
              {weightTab === "retail" ? (
                <Btn size="md" loading={adding} onClick={handleAdd}
                  className={`py-2 px-6 text-xs sm:text-sm ${added ? "!bg-[#2A7A55] hover:!bg-[#2A7A55]" : ""}`}>
                  {added ? <><Check className="w-4 h-4" /> Added!</> : <><ShoppingCart className="w-4 h-4" /> Add</>}
                </Btn>
              ) : (
                <Btn size="md" onClick={() => navigate("wholesale", { product: product.name, volume: selectedWeightOpt.label })}
                  className="py-2 px-6 text-xs sm:text-sm !bg-[#C9920A] hover:!bg-[#A87800] border-0 text-white font-semibold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Quote
                </Btn>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewOpen(false)} className="fixed inset-0 bg-[#1A1714]/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-[#1A1714]/12 shadow-2xl z-10 p-6 sm:p-8 text-left">
              <button onClick={() => setReviewOpen(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF8F3] hover:bg-[#EEE9E0] flex items-center justify-center text-[#7A7064] transition-colors"><X className="w-4 h-4" /></button>
              <h3 className="text-xl font-bold text-[#1A1714] mb-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>Write a Review</h3>
              <p className="text-xs text-[#7A7064] mb-6 font-medium">Share your experience with {product.name} with the community.</p>

              {reviewSuccess ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="w-12 h-12 text-[#2A4A3C]" />
                  <h4 className="font-semibold text-[#1A1714] text-base">Thank You!</h4>
                  <p className="text-xs text-[#7A7064] max-w-xs leading-relaxed">Your review has been successfully submitted and is under moderation.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Your Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)} className="hover:scale-110 transition-transform cursor-pointer">
                          <Star className={`w-7 h-7 ${star <= reviewRating ? "fill-[#C9920A] text-[#C9920A]" : "text-gray-200"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Your Name</label>
                    <input type="text" required value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder="Enter your name"
                      className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Review Title</label>
                    <input type="text" required value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="e.g. Exceptional aroma!"
                      className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Review Details</label>
                    <textarea required rows={4} value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Write details about flavor, color, packaging..."
                      className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all resize-none" />
                  </div>
                  <Btn type="submit" size="md" loading={reviewLoading} className="w-full mt-2">Submit Review</Btn>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CART PAGE ─────────────────────────────────────────────────────────────────

function CartPage() {
  const { navigate, cart, updateCartItem, removeFromCart, addToCart, discount, setDiscount, couponCode: coupon, setCouponCode: setCoupon } = useApp();
  const [couponStatus, setCouponStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [removed, setRemoved] = useState<CartItem[]>([]);

  const subtotal = cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 49;
  const total = subtotal - discount + shipping;

  function applyCoupon() {
    if (!coupon.trim()) {
      setCouponStatus("invalid");
      setTimeout(() => setCouponStatus("idle"), 2000);
      return;
    }

    setCouponStatus("loading");
    setTimeout(() => {
      try {
        const stored = localStorage.getItem("spiceora_coupons");
        const coupons = stored ? JSON.parse(stored) : [];
        const matched = coupons.find((c: any) => c.active && c.code?.toUpperCase() === coupon.toUpperCase());

        if (matched) {
          const discountAmount = matched.discountType === "percentage"
            ? subtotal * (matched.value / 100)
            : matched.value;
          setDiscount(discountAmount);
          setCouponStatus("valid");
        } else {
          setCouponStatus("invalid");
          setTimeout(() => setCouponStatus("idle"), 2000);
        }
      } catch {
        setCouponStatus("invalid");
        setTimeout(() => setCouponStatus("idle"), 2000);
      }
    }, 1000);
  }

  function handleRemove(item: CartItem) {
    setRemoved(prev => [...prev, { ...item }]);
    removeFromCart(item.product.id, item.selectedWeight);
    setTimeout(() => setRemoved(prev => prev.filter(i => !(i.product.id === item.product.id && i.selectedWeight === item.selectedWeight))), 5000);
  }

  function undoRemove(item: CartItem) {
    addToCart(item.product, item.selectedWeight, item.price);
    setRemoved(prev => prev.filter(i => !(i.product.id === item.product.id && i.selectedWeight === item.selectedWeight)));
  }

  if (cart.length === 0 && removed.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] pt-20 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-[#EEE9E0] flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-[#7A7064]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1714] mb-3" style={{ fontFamily: "'Bodoni Moda', serif" }}>Your cart is empty</h2>
          <p className="text-[#7A7064] mb-8 font-medium">Explore our premium spice collection and fill your cart with the finest ingredients.</p>
          <Btn size="lg" onClick={() => navigate("shop")}>Browse Spices <ArrowRight className="w-4 h-4" /></Btn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1A1714] mb-8" style={{ fontFamily: "'Bodoni Moda', serif" }}>
          Shopping Cart <span className="text-[#7A7064] text-lg font-normal">({cart.length} items)</span>
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>
              {cart.map((item: CartItem) => (
                <motion.div key={item.product.id + "-" + item.selectedWeight} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  className="bg-white rounded-2xl border border-[#1A1714]/8 p-4 flex gap-4">
                  <button onClick={() => navigate("product", item.product)} className="w-24 h-24 rounded-xl overflow-hidden bg-[#F5F0E8] flex-shrink-0 hover:opacity-90 transition-opacity">
                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <button onClick={() => navigate("product", item.product)} className="font-semibold text-[#1A1714] hover:text-[#2A4A3C] transition-colors text-left text-sm">
                          {item.product.name}
                        </button>
                        <p className="text-xs text-[#7A7064]">{item.product.subtitle} · {item.selectedWeight}</p>
                        <p className="text-xs text-[#7A7064]">{item.product.origin}</p>
                      </div>
                      <button onClick={() => handleRemove(item)} className="text-[#7A7064] hover:text-red-500 transition-colors p-1 flex-shrink-0 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <QtySelector value={item.quantity} onChange={(q: number) => updateCartItem(item.product.id, item.selectedWeight, q)} />
                      <p className="font-bold text-[#1A1714]">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {removed.map(item => (
                <motion.div key={item.product.id + "-" + item.selectedWeight} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-between bg-[#1A1714]/5 rounded-xl p-3.5 px-4">
                  <p className="text-sm text-[#7A7064]">
                    <span className="font-medium text-[#1A1714]">{item.product.name} ({item.selectedWeight})</span> removed
                  </p>
                  <button onClick={() => undoRemove(item)} className="text-sm font-semibold text-[#2A4A3C] hover:underline cursor-pointer">Undo</button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-6 sticky top-24">
              <h3 className="font-semibold text-[#1A1714] mb-5">Order Summary</h3>
              <div className="space-y-2.5 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A7064]">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2A4A3C]">Discount {coupon ? `(${coupon})` : ""}</span>
                    <span className="font-medium text-[#2A4A3C]">−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#7A7064]">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-[#1A1714]/8 pt-2.5 flex justify-between">
                  <span className="font-semibold text-[#1A1714]">Total</span>
                  <span className="font-bold text-xl text-[#1A1714]">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-2">Promo Code</p>
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} placeholder="Enter code"
                    className={`flex-1 bg-[#FAF8F3] border rounded-xl px-3 py-2.5 text-sm outline-none transition-all ${couponStatus === "valid" ? "border-[#2A4A3C] text-[#2A4A3C]" : couponStatus === "invalid" ? "border-red-400" : "border-[#1A1714]/12 focus:border-[#2A4A3C]"}`} />
                  <Btn size="sm" loading={couponStatus === "loading"} onClick={applyCoupon}>Apply</Btn>
                </div>
                <AnimatePresence>
                  {couponStatus === "valid" && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#2A4A3C] mt-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> 20% discount applied!
                    </motion.p>
                  )}
                  {couponStatus === "invalid" && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Invalid coupon code
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Btn size="lg" onClick={() => navigate("checkout")} className="w-full">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Btn>
              <p className="text-xs text-center text-[#7A7064] mt-3">
                Enter a valid promo code to apply available discounts at checkout.
              </p>
              {subtotal < 499 && (
                <p className="text-xs text-center text-[#C55A20] mt-1 font-medium">
                  Add ₹{(499 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── CHECKOUT ──────────────────────────────────────────────────────────────────

function CheckoutPage() {
  const { navigate, cart, logAnalyticsEvent, discount } = useApp();
  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("card");
  const [loading, setLoading] = useState(false);
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [addr, setAddr] = useState({ name: "", phone: "", line1: "", city: "", state: "", pin: "" });
  const [errors, setErrors] = useState<any>({});

  const steps = ["Address", "Delivery", "Payment", "Review"];
  const subtotal = cart.reduce((s: number, i: CartItem) => s + i.price * i.quantity, 0);
  const delivFee = delivery === "free" ? 0 : (subtotal > 499 ? (delivery === "express" ? 49 : 0) : (delivery === "express" ? 99 : 49));
  const total = subtotal - discount + delivFee;

  useEffect(() => {
    if (step === 4) {
      logAnalyticsEvent("Order Complete", { total, itemsCount: cart.length });
    }
  }, [step]);

  function handleNext() {
    setErrors({});
    if (step === 0) {
      const newErrors: any = {};
      if (!addr.name.trim()) newErrors.name = "Full Name is required.";
      if (!addr.phone.trim()) {
        newErrors.phone = "Phone Number is required.";
      } else if (!/^\+?[\d\s-]{10,15}$/.test(addr.phone.trim())) {
        newErrors.phone = "Enter a valid 10-15 digit phone number.";
      }
      if (!addr.line1.trim()) newErrors.line1 = "Street Address is required.";
      if (!addr.city.trim()) newErrors.city = "City is required.";
      if (!addr.state.trim()) newErrors.state = "State is required.";
      if (!addr.pin.trim()) {
        newErrors.pin = "PIN Code is required.";
      } else if (!/^\d{6}$/.test(addr.pin.trim())) {
        newErrors.pin = "PIN Code must be exactly 6 digits.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (payment === "card") {
        const newErrors: any = {};
        if (!cardNum.trim() || cardNum.replace(/\s/g, "").length !== 16) {
          newErrors.cardNum = "Enter a valid 16-digit card number.";
        }
        if (!cardExpiry.trim() || !/^\d{2}\s*\/\s*\d{2}$/.test(cardExpiry)) {
          newErrors.expiry = "Use MM/YY format.";
        }
        if (!cardCvv.trim() || cardCvv.length !== 3) {
          newErrors.cvv = "CVV must be 3 digits.";
        }
        if (!cardName.trim()) {
          newErrors.cardName = "Cardholder Name is required.";
        }

        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      } else if (payment === "upi") {
        const newErrors: any = {};
        if (!upiId.trim() || !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
          newErrors.upiId = "Enter a valid UPI ID (e.g. name@upi).";
        }
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      setLoading(true);
      setTimeout(() => { setLoading(false); setStep(4); }, 2000);
    }
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] pt-20 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
            className="w-24 h-24 rounded-full bg-[#2A4A3C] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Check className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-[#1A1714] mb-2" style={{ fontFamily: "'Bodoni Moda', serif" }}>Order Placed!</h2>
          <p className="text-[#7A7064] mb-1">Order #SP-{Math.floor(Math.random() * 9000 + 1000)}</p>
          <p className="text-[#7A7064] mb-8 text-sm leading-relaxed">Your spices are being prepared with care. You'll receive a shipping confirmation within 24 hours.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Btn onClick={() => navigate("profile")}>Track Order</Btn>
            <Btn variant="outline" onClick={() => navigate("home")}>Continue Shopping</Btn>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1A1714] mb-8" style={{ fontFamily: "'Bodoni Moda', serif" }}>Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center mb-10 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none min-w-0">
              <button onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 ${i < step ? "cursor-pointer" : "cursor-default"} shrink-0`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i < step ? "bg-[#2A4A3C] text-white" : i === step ? "bg-[#2A4A3C] text-white ring-4 ring-[#2A4A3C]/20" : "bg-[#EEE9E0] text-[#7A7064]"}`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${i === step ? "text-[#1A1714]" : i < step ? "text-[#2A4A3C]" : "text-[#7A7064]"}`}>{s}</span>
              </button>
              {i < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-px bg-[#EEE9E0] relative min-w-4">
                  <div className={`absolute inset-y-0 left-0 bg-[#2A4A3C] transition-all duration-500 ${i < step ? "right-0" : "right-full"}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-6">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="addr" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-semibold text-[#1A1714] text-lg mb-5">Delivery Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { k: "name", l: "Full Name", ph: "Ananya Krishnan", full: true },
                        { k: "phone", l: "Phone Number", ph: "+91 98765 43210" },
                        { k: "line1", l: "Street Address", ph: "House / Flat, Street Name", full: true },
                        { k: "city", l: "City", ph: "Bengaluru" },
                        { k: "state", l: "State", ph: "Karnataka" },
                        { k: "pin", l: "PIN Code", ph: "560001" },
                      ].map(f => (
                        <div key={f.k} className={(f as any).full ? "sm:col-span-2" : ""}>
                          <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">{f.l}</label>
                          <input value={(addr as any)[f.k]} onChange={e => setAddr(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph}
                            className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all ${errors[f.k] ? "border-red-400 focus:border-red-400" : "border-[#1A1714]/12 focus:border-[#2A4A3C]"}`} />
                          {errors[f.k] && <p className="text-[10px] text-red-500 mt-1">{errors[f.k]}</p>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 1 && (
                  <motion.div key="deliv" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-semibold text-[#1A1714] text-lg mb-5">Delivery Method</h3>
                    <div className="space-y-3">
                      {[
                        { id: "standard", label: "Standard Delivery", desc: "3–5 business days", price: subtotal > 499 ? "Free" : "₹49.00" },
                        { id: "express", label: "Express Delivery", desc: "1–2 business days", price: subtotal > 499 ? "₹49.00" : "₹99.00" },
                        ...(subtotal > 499 ? [{ id: "free", label: "Free Delivery", desc: "5–7 business days", price: "Free" }] : []),
                      ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                          style={{ borderColor: delivery === opt.id ? "#2A4A3C" : "rgba(26,23,20,0.1)", background: delivery === opt.id ? "rgba(42,74,60,0.04)" : "white" }}>
                          <input type="radio" name="delivery" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${delivery === opt.id ? "border-[#2A4A3C]" : "border-[#7A7064]/40"}`}>
                            {delivery === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2A4A3C]" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-[#1A1714] text-sm">{opt.label}</p>
                            <p className="text-xs text-[#7A7064]">{opt.desc}</p>
                          </div>
                          <p className="font-semibold text-[#1A1714] text-sm">{opt.price}</p>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step === 2 && (
                  <motion.div key="pay" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-semibold text-[#1A1714] text-lg mb-5">Payment Method</h3>
                    <div className="space-y-3 mb-5">
                      {[
                        { id: "card", label: "Credit / Debit Card", icon: CreditCard },
                        { id: "upi", label: "UPI", icon: Zap },
                        { id: "cod", label: "Cash on Delivery", icon: Package },
                      ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all"
                          style={{ borderColor: payment === opt.id ? "#2A4A3C" : "rgba(26,23,20,0.1)", background: payment === opt.id ? "rgba(42,74,60,0.04)" : "white" }}>
                          <input type="radio" name="payment" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} className="sr-only" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payment === opt.id ? "border-[#2A4A3C]" : "border-[#7A7064]/40"}`}>
                            {payment === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2A4A3C]" />}
                          </div>
                          <opt.icon className="w-4 h-4 text-[#7A7064]" />
                          <p className="font-medium text-[#1A1714] text-sm">{opt.label}</p>
                        </label>
                      ))}
                    </div>
                    {payment === "card" && (
                      <div className="space-y-4 p-4 bg-[#FAF8F3] rounded-xl">
                        <div>
                          <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Card Number</label>
                          <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim())}
                            placeholder="1234 5678 9012 3456" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all font-mono ${errors.cardNum ? "border-red-400" : "border-[#1A1714]/12"}`} />
                          {errors.cardNum && <p className="text-[10px] text-red-500 mt-1">{errors.cardNum}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Expiry</label>
                            <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value.replace(/\D/g, "").slice(0, 4).replace(/(.{2})/, "$1 / ").trim())}
                              placeholder="MM / YY" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.expiry ? "border-red-400" : "border-[#1A1714]/12"}`} />
                            {errors.expiry && <p className="text-[10px] text-red-500 mt-1">{errors.expiry}</p>}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">CVV</label>
                            <input type="password" maxLength={3} value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                              placeholder="•••" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.cvv ? "border-red-400" : "border-[#1A1714]/12"}`} />
                            {errors.cvv && <p className="text-[10px] text-red-500 mt-1">{errors.cvv}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Name on Card</label>
                          <input value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}
                            placeholder="ANANYA KRISHNAN" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.cardName ? "border-red-400" : "border-[#1A1714]/12"}`} />
                          {errors.cardName && <p className="text-[10px] text-red-500 mt-1">{errors.cardName}</p>}
                        </div>
                      </div>
                    )}
                    {payment === "upi" && (
                      <div className="p-4 bg-[#FAF8F3] rounded-xl">
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">UPI ID</label>
                        <input value={upiId} onChange={e => setUpiId(e.target.value.replace(/\s/g, ""))}
                          placeholder="yourname@upi" className={`w-full bg-white border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.upiId ? "border-red-400" : "border-[#1A1714]/12"}`} />
                        {errors.upiId && <p className="text-[10px] text-red-500 mt-1">{errors.upiId}</p>}
                      </div>
                    )}
                  </motion.div>
                )}
                {step === 3 && (
                  <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="font-semibold text-[#1A1714] text-lg mb-5">Review Your Order</h3>
                    <div className="space-y-2 mb-5">
                      {cart.map((item: CartItem) => (
                        <div key={item.product.id} className="flex items-center gap-3 p-3 bg-[#FAF8F3] rounded-xl">
                          <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover bg-[#EEE9E0]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-[#1A1714]">{item.product.name}</p>
                            <p className="text-xs text-[#7A7064]">{item.product.weight} × {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-[#1A1714] text-sm">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-[#2A4A3C]/5 rounded-xl flex items-start gap-3">
                      <Shield className="w-5 h-5 text-[#2A4A3C] mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-[#7A7064] leading-relaxed">Your payment and data are protected with 256-bit SSL encryption. We never store card details.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#1A1714]/8">
                <Btn variant="ghost" onClick={() => step > 0 ? setStep(s => s - 1) : navigate("cart")}>
                  <ChevronLeft className="w-4 h-4" /> {step === 0 ? "Back to Cart" : "Back"}
                </Btn>
                <Btn size="md" loading={loading} onClick={handleNext}>
                  {step === 3 ? "Place Order" : <>Continue <ArrowRight className="w-4 h-4" /></>}
                </Btn>
              </div>
            </div>
          </div>

          {/* Summary sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-5 sticky top-24">
              <h3 className="font-semibold text-[#1A1714] mb-4 text-sm">Order Total</h3>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-[#7A7064]">Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (20%)</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-[#7A7064]">Delivery</span><span>{delivFee === 0 ? "Free" : `₹${delivFee.toFixed(2)}`}</span></div>
                <div className="border-t border-[#1A1714]/8 pt-2 flex justify-between font-semibold">
                  <span>Total</span><span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2 border-t border-[#1A1714]/8 pt-3">
                {cart.slice(0, 3).map((item: CartItem) => (
                  <div key={item.product.id} className="flex items-center gap-2.5">
                    <img src={item.product.image} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover bg-[#EEE9E0]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1A1714] truncate">{item.product.name}</p>
                      <p className="text-[10px] text-[#7A7064]">×{item.quantity}</p>
                    </div>
                  </div>
                ))}
                {cart.length > 3 && <p className="text-xs text-[#7A7064]">+{cart.length - 3} more items</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ───────────────────────────────────────────────────────────────

function ProfilePage() {
  const { navigate, wishlist, user, logout, products } = useApp();
  const [tab, setTab] = useState("overview");
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Settings form states
  const [settingsName, setSettingsName] = useState(user?.name || "");
  const [settingsEmail, setSettingsEmail] = useState(user?.email || "");
  const [settingsPhone, setSettingsPhone] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // User real orders
  const [orders, setOrders] = useState<any[]>(() => {
    if (!user?.email) return [];
    try {
      return JSON.parse(localStorage.getItem(`spiceora_orders_${user.email}`) || "[]");
    } catch { return []; }
  });

  // User real addresses
  const [userAddresses, setUserAddresses] = useState<any[]>(() => {
    if (!user?.email) return [];
    try {
      return JSON.parse(localStorage.getItem(`spiceora_addrs_${user.email}`) || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    if (user?.email) {
      try {
        setOrders(JSON.parse(localStorage.getItem(`spiceora_orders_${user.email}`) || "[]"));
        setUserAddresses(JSON.parse(localStorage.getItem(`spiceora_addrs_${user.email}`) || "[]"));
      } catch {
        setOrders([]);
        setUserAddresses([]);
      }
      setSettingsName(user.name || "");
      setSettingsEmail(user.email || "");
    }
  }, [user]);

  // Support states
  const [supportMsg, setSupportMsg] = useState("");
  const [supportLoading, setSupportLoading] = useState(false);
  const [chatLogs, setChatLogs] = useState([
    { sender: "agent", text: "Hello! Thank you for contacting Spiceora. How can we help you today?", time: "09:30 AM" }
  ]);

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "support", label: "Help & Support", icon: HelpCircle },
  ];

  const wishedProducts = products.filter((p: any) => wishlist.has(p.id));

  function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaveLoading(true);
    setTimeout(() => {
      setSaveLoading(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }, 1000);
  }

  function handleSendSupport(e: React.FormEvent) {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    const userMsg = { sender: "user", text: supportMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setChatLogs(prev => [...prev, userMsg]);
    setSupportMsg("");
    setSupportLoading(true);
    setTimeout(() => {
      setSupportLoading(false);
      setChatLogs(prev => [...prev, {
        sender: "agent",
        text: "Thank you for reaching out! We've received your query. Our direct trade specialist will email response updates within 1 hour.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 text-left">
            <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-5">
              <div className="text-center mb-5">
                <div className="w-16 h-16 rounded-full bg-[#2A4A3C] flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                    {(user?.name || "Member").split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1A1714]">{user?.name || "Spiceora Member"}</h3>
                <p className="text-xs text-[#7A7064]">{user?.email || "Member"}</p>
                <div className="mt-2"><Badge color="green">Active Account</Badge></div>
              </div>
              <nav className="space-y-0.5">
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${tab === t.id ? "bg-[#2A4A3C] text-white" : "text-[#7A7064] hover:bg-[#FAF8F3] hover:text-[#1A1714]"}`}>
                    <t.icon className="w-4 h-4" /> {t.label}
                  </button>
                ))}
                <div className="border-t border-[#1A1714]/8 pt-2 mt-2">
                  <button onClick={() => logout()} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 text-left">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                {tab === "overview" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Total Orders", value: orders.length, icon: Package, color: "#2A4A3C" },
                        { label: "Wishlist", value: wishlist.size, icon: Heart, color: "#C55A20" },
                        { label: "Saved Addresses", value: userAddresses.length, icon: MapPin, color: "#C9920A" },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-2xl border border-[#1A1714]/8 p-4 text-center">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: s.color + "15" }}>
                            <s.icon className="w-5 h-5" style={{ color: s.color }} />
                          </div>
                          <p className="text-2xl font-bold text-[#1A1714]">{s.value}</p>
                          <p className="text-xs text-[#7A7064] mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-5">
                      <h3 className="font-semibold text-[#1A1714] mb-4">Recent Orders</h3>
                      {orders.length > 0 ? (
                        <>
                          {orders.slice(0, 2).map(o => (
                            <div key={o.id} className="flex items-center justify-between py-3 border-b border-[#1A1714]/8 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-[#1A1714]">#{o.id}</p>
                                <p className="text-xs text-[#7A7064]">{Array.isArray(o.items) ? o.items.join(", ") : o.items}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-800">{o.status}</span>
                                <p className="text-sm font-bold text-[#1A1714] mt-1">₹{o.total}</p>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => setTab("orders")} className="text-sm text-[#2A4A3C] font-semibold hover:underline mt-3 block cursor-pointer">View all orders →</button>
                        </>
                      ) : (
                        <div className="py-8 text-center text-xs text-[#7A7064]">
                          No orders placed yet. <button onClick={() => navigate("shop")} className="text-[#2A4A3C] font-semibold underline">Browse spices</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {tab === "orders" && (
                  <div className="space-y-4">
                    {trackingOrderId ? (
                      <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-6">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
                          <div>
                            <button onClick={() => setTrackingOrderId(null)} className="text-xs text-[#2A4A3C] hover:underline flex items-center gap-1 mb-1 font-semibold cursor-pointer">
                              <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders
                            </button>
                            <h3 className="text-lg font-bold text-[#1A1714]">Tracking Order #{trackingOrderId}</h3>
                          </div>
                          <Badge color="orange">Processing</Badge>
                        </div>
                        
                        <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EEE9E0]">
                          {[
                            { title: "Order Placed", desc: "Your payment was processed and order confirmed.", date: "Just now", done: true },
                            { title: "Stone Grinding & Packing", desc: "Spices slow-milled under 35°C and vacuum-sealed.", date: "In Progress", done: false, active: true },
                            { title: "Shipped", desc: "Handed over to Express Courier Partner.", date: "Pending", done: false },
                            { title: "Delivered", desc: "Will require contact-free verification.", date: "Pending", done: false },
                          ].map((milestone, idx) => (
                            <div key={idx} className="relative text-left">
                              <div className={`absolute -left-8 top-1.5 w-6.5 h-6.5 rounded-full border-2 flex items-center justify-center bg-white transition-all ${milestone.done ? "border-[#2A4A3C] text-[#2A4A3C]" : milestone.active ? "border-[#C9920A] text-[#C9920A]" : "border-gray-200 text-gray-300"}`}>
                                {milestone.done ? <Check className="w-3 h-3" /> : <div className={`w-2 h-2 rounded-full ${milestone.active ? "bg-[#C9920A]" : "bg-transparent"}`} />}
                              </div>
                              <div>
                                <h4 className={`font-semibold text-sm ${milestone.done || milestone.active ? "text-[#1A1714]" : "text-[#7A7064]"}`}>{milestone.title}</h4>
                                <p className="text-xs text-[#7A7064] mt-0.5">{milestone.desc}</p>
                                <span className="text-[10px] text-[#7A7064]/60 font-medium block mt-1">{milestone.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="bg-white rounded-2xl border border-[#1A1714]/8 overflow-hidden">
                        <div className="p-5 border-b border-[#1A1714]/8"><h3 className="font-semibold text-[#1A1714]">Order History</h3></div>
                        {orders.map(o => (
                          <div key={o.id} className="p-5 border-b border-[#1A1714]/8 last:border-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-[#1A1714] text-sm">#{o.id}</p>
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">{o.status}</span>
                                </div>
                                <p className="text-xs text-[#7A7064]">{o.date}</p>
                                <p className="text-sm text-[#7A7064] mt-1">{Array.isArray(o.items) ? o.items.join(", ") : o.items}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-[#1A1714]">₹{o.total}</p>
                                <Btn size="sm" variant="ghost" onClick={() => setTrackingOrderId(o.id)} className="mt-1.5 text-xs">Track</Btn>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-12 text-center">
                        <Package className="w-12 h-12 text-[#7A7064] mx-auto mb-3" />
                        <h3 className="font-semibold text-[#1A1714] text-base mb-1">No Orders Placed Yet</h3>
                        <p className="text-xs text-[#7A7064] mb-6">When you place an order, your order details and live tracking will appear here.</p>
                        <Btn onClick={() => navigate("shop")}>Explore & Order Spices</Btn>
                      </div>
                    )}
                  </div>
                )}

                {tab === "wishlist" && (
                  wishedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {wishedProducts.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-14 text-center">
                      <Heart className="w-12 h-12 text-[#7A7064] mx-auto mb-3" />
                      <p className="font-semibold text-[#1A1714] mb-1">Your wishlist is empty</p>
                      <p className="text-sm text-[#7A7064] mb-5">Save products you love for later</p>
                      <Btn onClick={() => navigate("shop")}>Browse Spices</Btn>
                    </div>
                  )
                )}

                {tab === "reviews" && (
                  <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-12 text-center">
                    <Star className="w-12 h-12 text-[#7A7064] mx-auto mb-3" />
                    <p className="font-semibold text-[#1A1714] mb-1">No Reviews Written Yet</p>
                    <p className="text-sm text-[#7A7064] mb-5">Share your feedback on spices you've ordered</p>
                    <Btn onClick={() => navigate("shop")}>Browse Spices</Btn>
                  </div>
                )}

                {tab === "addresses" && (
                  <div className="space-y-4">
                    {userAddresses.length > 0 ? (
                      userAddresses.map((addr: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-2xl border-2 border-[#2A4A3C] p-5 relative">
                          {idx === 0 && <div className="absolute top-4 right-4"><Badge color="green">Default</Badge></div>}
                          <p className="font-semibold text-[#1A1714] mb-1">{addr.name}</p>
                          <p className="text-sm text-[#7A7064]">{addr.line1}</p>
                          <p className="text-sm text-[#7A7064]">{addr.city}, {addr.state} {addr.pin}</p>
                          <p className="text-sm text-[#7A7064]">{addr.phone}</p>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-12 text-center">
                        <MapPin className="w-12 h-12 text-[#7A7064] mx-auto mb-3" />
                        <h3 className="font-semibold text-[#1A1714] text-base mb-1">No Saved Addresses</h3>
                        <p className="text-xs text-[#7A7064] mb-6">Add your shipping details for faster checkout.</p>
                      </div>
                    )}
                  </div>
                )}

                {tab === "settings" && (
                  <div className="bg-white rounded-2xl border border-[#1A1714]/8 p-6 space-y-6">
                    <form onSubmit={handleSaveSettings}>
                      <h3 className="font-semibold text-[#1A1714] mb-4">Account Settings</h3>
                      <div className="space-y-4 mb-6 text-left">
                        {saveSuccess && (
                          <div className="p-3 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Changes saved successfully!
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block text-left">Full Name</label>
                          <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} required
                            className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none focus:border-[#2A4A3C] transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block text-left">Email Address</label>
                          <input type="email" value={settingsEmail} onChange={e => setSettingsEmail(e.target.value)} required
                            className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none focus:border-[#2A4A3C] transition-all" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block text-left">Phone Number</label>
                          <input type="text" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} required
                            className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none focus:border-[#2A4A3C] transition-all" />
                        </div>
                        <Btn type="submit" size="md" loading={saveLoading}>Save Changes</Btn>
                      </div>
                    </form>
                    <div className="border-t border-[#1A1714]/8 pt-5">
                      <h3 className="font-semibold text-[#1A1714] mb-4">Notifications</h3>
                      {["Order updates", "Promotions & offers", "New arrivals", "Newsletter"].map((pref, i) => (
                        <label key={pref} className="flex items-center justify-between py-3 cursor-pointer border-b border-[#1A1714]/6 last:border-0">
                          <span className="text-sm text-[#1A1714]">{pref}</span>
                          <div className="relative">
                            <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" readOnly />
                            <div className="w-10 h-6 bg-[#EEE9E0] rounded-full peer-checked:bg-[#2A4A3C] transition-colors cursor-pointer" />
                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-all peer-checked:translate-x-4 pointer-events-none" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {tab === "support" && (
                  <div className="bg-white rounded-2xl border border-[#1A1714]/8 overflow-hidden flex flex-col" style={{ minHeight: "450px" }}>
                    <div className="p-4 bg-[#2A4A3C]/5 border-b border-[#1A1714]/8 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2A4A3C] flex items-center justify-center text-[#C9920A] font-serif font-bold">S</div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#1A1714]">Spiceora Direct Support</h4>
                        <p className="text-[10px] text-[#7A7064]">Active · Sourcing Team Response</p>
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAF8F3] max-h-[300px]">
                      {chatLogs.map((log, idx) => (
                        <div key={idx} className={`flex ${log.sender === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${log.sender === "user" ? "bg-[#2A4A3C] text-white rounded-tr-none" : "bg-white border border-[#1A1714]/8 text-[#1A1714] rounded-tl-none shadow-sm"}`}>
                            <p>{log.text}</p>
                            <span className={`text-[9px] block mt-1 text-right ${log.sender === "user" ? "text-white/60" : "text-[#7A7064]/60"}`}>{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendSupport} className="p-4 border-t border-[#1A1714]/8 bg-white flex gap-2">
                      <textarea
                        value={supportMsg}
                        onChange={e => setSupportMsg(e.target.value)}
                        placeholder="Type message regarding orders, spice origin, laboratory certificates..."
                        required
                        rows={1}
                        className="flex-1 bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-2.5 text-xs text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] transition-all resize-none"
                      />
                      <Btn type="submit" size="sm" loading={supportLoading} className="py-2.5 px-4 text-xs">Send</Btn>
                    </form>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

const SPICE_MAP: Record<string, number> = {
  "Turmeric": 1,
  "Pepper": 2,
  "Cinnamon": 3,
  "Cardamom": 4,
  "Saffron": 5,
  "Paprika": 6,
  "Cumin": 7,
  "Masala": 8
};

function renderIngredient(ing: string, navigate: any) {
  let matchedKey = "";
  Object.keys(SPICE_MAP).forEach(k => {
    if (ing.toLowerCase().includes(k.toLowerCase())) {
      matchedKey = k;
    }
  });

  if (matchedKey) {
    const prodId = SPICE_MAP[matchedKey];
    const stored = localStorage.getItem("spiceora_products");
    const products = stored ? JSON.parse(stored) : PRODUCTS;
    const product = products.find((p: any) => p.id === prodId || p.id === `P00${prodId}` || Number(p.id) === prodId);
    if (product) {
      const parts = ing.split(new RegExp(`(${matchedKey})`, "i"));
      return (
        <span>
          {parts[0]}
          <button
            onClick={() => navigate("product", product)}
            className="text-[#2A4A3C] font-semibold underline underline-offset-2 hover:text-[#C55A20] transition-colors cursor-pointer"
          >
            {parts[1]}
          </button>
          {parts[2]}
        </span>
      );
    }
  }
  return <span>{ing}</span>;
}

function FarmToKitchenTimeline() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      num: "01",
      title: "Ethical Sourcing",
      desc: "We partner directly with 47 family-owned farms across India, Spain, and Sri Lanka, cutting out middle-men to pay fair-trade premium wages.",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=500&fit=crop&auto=format",
      detail: "Our spice travels are led by strict sourcing criteria: geographic origin, pesticide-free certifications, and curcumin/essential oil content. Rajan Menon personally audits every farm annually."
    },
    {
      num: "02",
      title: "Rigorous Lab Testing",
      desc: "Every batch of spice undergoes testing in independent labs for purity, chemical residues, moisture content, and essential oil levels.",
      image: "https://images.unsplash.com/photo-1576086213369-97a306dca665?w=800&h=500&fit=crop&auto=format",
      detail: "We verify chemical purity and potency before shipping. For instance, our Turmeric is certified to contain over 5% curcumin content, which is double the industry average."
    },
    {
      num: "03",
      title: "Small-Batch Stone Grinding",
      desc: "Using traditional slow stone-grinding wheels that prevent heat buildup, preserving volatile aromatic oils that industrial steel grinders burn off.",
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&h=500&fit=crop&auto=format",
      detail: "Heat is the enemy of spice aroma. Our cold-milled stone wheels operate at low RPMs, keeping the internal temperature below 35°C to preserve natural spice oils."
    },
    {
      num: "04",
      title: "UV-Blocked UV Packaging",
      desc: "Packed in custom nitrogen-flushed, triple-layer resealable pouches that seal out oxygen, light, and humidity to lock in absolute freshness.",
      image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&h=500&fit=crop&auto=format",
      detail: "Standard glass jars and plastic let in UV light, which degrades spice potency. Our bespoke nitrogen-flushed packaging ensures zero oxidation until you break the seal."
    },
    {
      num: "05",
      title: "Direct Doorstep Delivery",
      desc: "Shipped directly from our packaging center. We pledge a 3-day delivery promise, bringing you spices freshly ground within 48 hours.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=500&fit=crop&auto=format",
      detail: "Unlike supermarket spices that sit on shelves for up to 18 months, our direct supply chain ensures you receive spices within days of milling."
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FAF8F3] overflow-hidden border-t border-[#1A1714]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9920A]" />
              <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Sourcing Journey</span>
              <div className="h-px w-8 bg-[#C9920A]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Farm to Kitchen Timeline</h2>
            <p className="text-[#7A7064] text-lg max-w-xl mx-auto">Explore our premium, single-origin crafting pipeline from soil to seal.</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Step Indicators */}
          <div className="lg:col-span-5 space-y-3">
            {steps.map((s, idx) => (
              <button
                key={s.num}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${idx === activeStep ? "bg-white border-[#2A4A3C] shadow-lg translate-x-2" : "bg-transparent border-transparent hover:bg-white/40"}`}
              >
                <span className={`text-xl font-bold font-mono ${idx === activeStep ? "text-[#C9920A]" : "text-[#7A7064]/50"}`}>{s.num}</span>
                <div>
                  <h3 className={`font-semibold text-base transition-colors ${idx === activeStep ? "text-[#2A4A3C]" : "text-[#1A1714]"}`}>{s.title}</h3>
                  <p className="text-xs text-[#7A7064] leading-relaxed mt-1.5">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Immersive Detail Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl overflow-hidden border border-[#1A1714]/8 shadow-xl"
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <img src={steps[activeStep].image} alt={steps[activeStep].title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-6 flex items-center gap-3">
                    <span className="text-3xl font-bold font-mono text-[#C9920A]">{steps[activeStep].num}</span>
                    <span className="h-6 w-px bg-white/40" />
                    <span className="text-white font-semibold text-lg">{steps[activeStep].title}</span>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h4 className="text-xs font-bold text-[#7A7064] uppercase tracking-widest mb-3">Crafting Standards</h4>
                  <p className="text-sm text-[#7A7064] leading-relaxed mb-4">{steps[activeStep].detail}</p>
                  <div className="flex gap-6 mt-6 border-t border-[#1A1714]/8 pt-6">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-[#2A4A3C]" />
                      <span className="text-xs font-semibold text-[#1A1714]">100% Organic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#2A4A3C]" />
                      <span className="text-xs font-semibold text-[#1A1714]">Lab-Certified Purity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#2A4A3C]" />
                      <span className="text-xs font-semibold text-[#1A1714]">Direct Trade Sourced</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

function InstagramGallery() {
  const posts = [
    { id: 1, img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&fit=crop", tag: "#FreshlyStoneGround", likes: "1.2k" },
    { id: 2, img: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&fit=crop", tag: "#KeralaTurmericHarvest", likes: "840" },
    { id: 3, img: "https://images.unsplash.com/photo-1599909525099-93de38b2f9fc?w=400&fit=crop", tag: "#MichelinStarredIngredients", likes: "1.5k" },
    { id: 4, img: "https://images.unsplash.com/photo-1541538816-0a3ad11e254e?w=400&fit=crop", tag: "#TrueCeylonCinnamon", likes: "960" },
    { id: 5, img: "https://images.unsplash.com/photo-1568845369-7f5572de17a0?w=400&fit=crop", tag: "#CardamomInfusions", likes: "1.1k" },
    { id: 6, img: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=400&fit=crop", tag: "#PureKashmirSaffron", likes: "2.3k" },
  ];

  return (
    <section className="py-20 bg-white border-t border-[#1A1714]/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9920A]" />
              <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Social Circle</span>
              <div className="h-px w-8 bg-[#C9920A]" />
            </div>
            <h2 className="text-4xl font-bold text-[#1A1714] mb-3" style={{ fontFamily: "'Bodoni Moda', serif" }}>On the Gram</h2>
            <p className="text-[#7A7064] text-sm max-w-md mx-auto">Follow our sourcing travels and culinary journey at <strong className="text-[#2A4A3C]">@spiceoraspices</strong></p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={i * 60}>
              <div className="group relative rounded-2xl overflow-hidden cursor-pointer" style={{ aspectRatio: "1/1" }}>
                <img src={post.img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-[#1A2E25]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white text-left">
                  <Instagram className="w-5 h-5 text-[#C9920A] self-end" />
                  <div>
                    <p className="text-xs font-medium tracking-wide text-white">{post.tag}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      <span className="text-[10px] font-semibold text-white/90">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function BulkOrderSection() {
  const { navigate, logAnalyticsEvent } = useApp();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", business: "", volume: "10-50kg", message: "" });
  const [errors, setErrors] = useState<any>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    const newErrors: any = {};
    if (!form.name.trim()) newErrors.name = "Full Name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email.";
    if (!form.business.trim()) newErrors.business = "Business Name is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      logAnalyticsEvent("Bulk Inquiry Submitted", { business: form.business, volume: form.volume });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setForm({ name: "", email: "", business: "", volume: "10-50kg", message: "" });
      }, 2500);
    }, 1500);
  }

  return (
    <section id="bulk" className="py-20 lg:py-24 bg-[#2A4A3C] text-white overflow-hidden border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <Reveal>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Bulk Sourcing & Wholesale Inquiry</h2>
          <p className="text-white/70 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            Are you a chef, restaurant owner, distributor, or food brand owner looking for premium-grade, single-origin spices? Partner with Spiceora for consistent, lab-tested wholesale supplies.
          </p>
          <Btn variant="secondary" size="lg" onClick={() => navigate("wholesale")} className="bg-[#C9920A] hover:bg-[#A87800] border-0 text-white font-semibold">
            Request Wholesale Rates
          </Btn>
        </Reveal>
      </div>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 bg-[#1A1714]/75 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-[#1A1714]/12 shadow-2xl z-10 p-6 sm:p-8 text-[#1A1714] text-left">
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF8F3] hover:bg-[#EEE9E0] flex items-center justify-center text-[#7A7064] transition-colors"><X className="w-4 h-4" /></button>
              <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>Wholesale Inquiry</h3>
              <p className="text-xs text-[#7A7064] mb-6">Complete the request details. Our wholesale division replies within 4 business hours.</p>

              {success ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle className="w-12 h-12 text-[#2A4A3C]" />
                  <h4 className="font-semibold text-base">Inquiry Submitted!</h4>
                  <p className="text-xs text-[#7A7064] max-w-xs leading-relaxed">Thank you. Rajan Menon and our sales team will reach out to you directly at the provided email.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Your Name</label>
                      <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="E.g. Chef Sanjay"
                        className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none ${errors.name ? "border-red-400" : "border-[#1A1714]/12"}`} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Contact Email</label>
                      <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="sanjay@restaurant.com"
                        className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none ${errors.email ? "border-red-400" : "border-[#1A1714]/12"}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Business Name</label>
                      <input type="text" required value={form.business} onChange={e => setForm(p => ({ ...p, business: e.target.value }))} placeholder="E.g. Olive Bistro"
                        className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none ${errors.business ? "border-red-400" : "border-[#1A1714]/12"}`} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Monthly Volume</label>
                      <select value={form.volume} onChange={e => setForm(p => ({ ...p, volume: e.target.value }))}
                        className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none">
                        <option value="10-50kg">10kg – 50kg</option>
                        <option value="50-100kg">50kg – 100kg</option>
                        <option value="100-500kg">100kg – 500kg</option>
                        <option value="500kg+">500kg +</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Inquiry Details</label>
                    <textarea rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="List spices and packaging preferences (e.g. bulk sacks, ground fresh, whole seeds)..."
                      className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] outline-none resize-none" />
                  </div>
                  <Btn type="submit" size="md" loading={loading} className="w-full mt-2 bg-[#2A4A3C] hover:bg-[#1E3529] text-white">
                    Request Catalog & Price List
                  </Btn>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function RecipesPage() {
  const { navigate, recipes } = useApp();
  useSEO("Artisan Recipes", "Learn how to cook with Spiceora premium spices. View step-by-step cooking instructions for traditional and modern recipes.");
  const [difficulty, setDifficulty] = useState("all");

  const filtered = recipes.filter((r: any) => difficulty === "all" || r.difficulty.toLowerCase() === difficulty.toLowerCase());

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="bg-[#2A4A3C] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/55 text-sm mb-2">
            <button onClick={() => navigate("home")} className="hover:text-white transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Recipes</span>
          </div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Bodoni Moda', serif" }}>Spiceora Kitchen</h1>
          <p className="text-white/60 text-sm mt-1">Immersive recipes crafted to highlight premium, single-origin spices</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {["all", "easy", "medium"].map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize border cursor-pointer ${difficulty === d ? "bg-[#2A4A3C] border-[#2A4A3C] text-white" : "bg-white border-[#1A1714]/12 text-[#7A7064] hover:bg-[#FAF8F3] hover:text-[#1A1714]"}`}
            >
              {d} Difficulty
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map((r, i) => (
            <Reveal key={r.id} delay={i * 80}>
              <button onClick={() => navigate("recipe", r)}
                className="group text-left rounded-2xl overflow-hidden bg-white border border-[#1A1714]/6 hover:border-[#2A4A3C]/20 hover:shadow-lg transition-all duration-300 w-full cursor-pointer">
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="text-xs bg-black/40 text-white backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {r.time}
                    </span>
                    <span className="text-xs bg-black/40 text-white backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">{r.difficulty}</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-[#1A1714] mb-2 group-hover:text-[#2A4A3C] transition-colors" style={{ fontFamily: "'Bodoni Moda', serif" }}>{r.title}</h3>
                  <p className="text-xs text-[#7A7064] leading-relaxed mb-4 line-clamp-2">{r.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {r.spices.map(s => <span key={s} className="text-xs text-[#7A7064] bg-[#FAF8F3] px-2 py-1 rounded-full border border-[#1A1714]/6">#{s}</span>)}
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function RecipeDetailPage({ recipe }: { recipe: any }) {
  const { navigate, addToCart, products } = useApp();
  useSEO(recipe.title, `Learn how to make ${recipe.title}. Portions: ${recipe.servings}. Prep time: ${recipe.prepTime}. Ingredients include: ${recipe.ingredients.join(", ")}.`);
  const [batchAdding, setBatchAdding] = useState(false);
  const [batchAdded, setBatchAdded] = useState(false);

  function handleAddAllSpices() {
    setBatchAdding(true);
    setTimeout(() => {
      recipe.spices.forEach((spiceName: string) => {
        let matchedKey = "";
        Object.keys(SPICE_MAP).forEach(k => {
          if (spiceName.toLowerCase().includes(k.toLowerCase())) {
            matchedKey = k;
          }
        });
        if (matchedKey) {
          const prodId = SPICE_MAP[matchedKey];
          const product = products.find((p: any) => p.id === prodId || p.id === `P00${prodId}` || Number(p.id) === prodId);
          if (product) {
            addToCart(product);
          }
        }
      });
      setBatchAdding(false);
      setBatchAdded(true);
      setTimeout(() => setBatchAdded(false), 2000);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-[#7A7064] mb-8 flex-wrap">
          <button onClick={() => navigate("home")} className="hover:text-[#1A1714] transition-colors">Home</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <button onClick={() => navigate("recipes")} className="hover:text-[#1A1714] transition-colors">Recipes</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1A1714] font-medium">{recipe.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 items-start">
          {/* Left Column: Image + Info */}
          <div className="md:col-span-7">
            <div className="rounded-3xl overflow-hidden shadow-md bg-[#F5F0E8] mb-6" style={{ aspectRatio: "16/10" }}>
              <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#1A1714] mb-3" style={{ fontFamily: "'Bodoni Moda', serif" }}>{recipe.title}</h1>
            <p className="text-[#7A7064] leading-relaxed mb-6">{recipe.description}</p>
            
            <div className="flex gap-4 border-y border-[#1A1714]/8 py-4 mb-6">
              <div className="flex-1 text-center border-r border-[#1A1714]/8">
                <span className="text-xs text-[#7A7064] block">Time</span>
                <span className="font-bold text-sm text-[#1A1714]">{recipe.time}</span>
              </div>
              <div className="flex-1 text-center border-r border-[#1A1714]/8">
                <span className="text-xs text-[#7A7064] block">Servings</span>
                <span className="font-bold text-sm text-[#1A1714]">{recipe.servings} servings</span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-[#7A7064] block">Difficulty</span>
                <span className="font-bold text-sm text-[#1A1714]">{recipe.difficulty}</span>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-xl font-bold text-[#1A1714] mb-5" style={{ fontFamily: "'Bodoni Moda', serif" }}>Cooking Method</h3>
              <div className="space-y-4">
                {recipe.instructions.map((step: string, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <span className="w-6 h-6 rounded-full bg-[#2A4A3C]/10 text-[#2A4A3C] font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                    <p className="text-sm text-[#7A7064] leading-relaxed flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Ingredients sidebar */}
          <div className="md:col-span-5 bg-white border border-[#1A1714]/8 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Ingredients</h3>
            <ul className="space-y-3.5 border-b border-[#1A1714]/8 pb-6 mb-6">
              {recipe.ingredients.map((ing: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-[#7A7064]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2A4A3C] mt-2 flex-shrink-0" />
                  <span className="leading-relaxed">{renderIngredient(ing, navigate)}</span>
                </li>
              ))}
            </ul>

            {/* Add Spices to Cart */}
            <div className="p-4 bg-[#FAF8F3] rounded-2xl border border-[#2A4A3C]/10 text-center">
              <Leaf className="w-6 h-6 text-[#2A4A3C] mx-auto mb-2" />
              <h4 className="font-semibold text-xs text-[#1A1714] mb-1">Single-Origin Ingredients</h4>
              <p className="text-[11px] text-[#7A7064] mb-4 leading-relaxed">Instantly add all organic spices required for this recipe to your shopping cart.</p>
              <Btn
                onClick={handleAddAllSpices}
                loading={batchAdding}
                className={`w-full text-xs py-2.5 ${batchAdded ? "!bg-[#2A7A55] hover:!bg-[#2A7A55]" : ""}`}
              >
                {batchAdded ? <><Check className="w-4 h-4" /> Spices Added!</> : "Add All Recipe Spices"}
              </Btn>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function FounderPage() {
  const { navigate, cmsSettings } = useApp();
  useSEO("Our Story & Sourcing", "Learn about Spiceora's founding journey, Rajan Menon's travel logs along the Indian spice route, and our direct trade cooperative partnerships.");
  const [activeYear, setActiveYear] = useState("2018");
  const timeline = [
    { year: "2018", title: "The Journey Begins", desc: "Our founder, Rajan Menon, sets out along the ancient Indian spice route, documenting family farms from Kerala's pepper coast to the saffron valleys of Kashmir." },
    { year: "2020", title: "First Cooperative Partnerships", desc: "Partnered directly with the first 15 farming families in Kerala, establishing a direct-trade agreement to pay 35% above market rates for organic turmeric and black pepper." },
    { year: "2022", title: "Small-Batch Facility Opened", desc: "Designed and opened our micro-milling plant, building slow-turning cold stone grinding wheels to avoid heating spice aromatic oils during powdering." },
    { year: "2024", title: "Digital Brand Launch", desc: "Expanding our catalog to 8 single-origin spices and launching our digital spice shop, connecting home chefs globally directly with smallholder heritage farms." },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      {/* Hero Section */}
      <div className="relative bg-[#2A4A3C] py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#C9920A_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-5 h-5 text-[#C9920A]" />
            <span className="text-[#C9920A] text-xs font-semibold tracking-[0.2em] uppercase">Meet the Founder</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>
            Our Story & Sourcing Philosophy
          </h1>
          <p className="text-white/80 text-base max-w-2xl mx-auto leading-relaxed">
            At Spiceora, we believe that premium cooking begins with transparency, respect for heritage, and absolute purity. Meet our team and discover our sourcing travel roots.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Sourcing Travel Logs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <Reveal>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1000&fit=crop&auto=format" alt="Rajan Menon" className="rounded-3xl shadow-lg w-full max-h-[500px] object-cover" />
              <div className="absolute -bottom-5 -right-5 bg-white border border-[#1A1714]/8 p-4 rounded-2xl shadow-xl max-w-xs hidden sm:block">
                <p className="text-xs italic text-[#7A7064] leading-relaxed">
                  "Supermarket spices sit on shelves losing essential oils for months. We grind in small batches and deliver within days."
                </p>
                <p className="text-xs font-bold text-[#1A1714] mt-2.5">— Rajan Menon, Founder</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div>
              <span className="text-xs font-bold text-[#C9920A] uppercase tracking-widest block mb-2">Our Founder's Mission</span>
              <h2 className="text-3xl font-bold text-[#1A1714] mb-5 leading-tight" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                Rajan Menon's Spice Route Travel Log
              </h2>
              <p className="text-sm text-[#7A7064] leading-relaxed mb-6 whitespace-pre-line">
                {cmsSettings?.about?.founderStory || `"In 2018, I spent six months traveling across India's micro-climates. I met fourth-generation farmers cultivating green cardamom in Cardamom Hills, true Ceylon cinnamon bark-peelers in Sri Lanka, and farmers picking saffron threads under cold Kashmir skies.\n\nI was shocked to discover that while the finest A-grade exports left our shores for Michelin-starred kitchens globally, local households were consumed with dust-heavy, chemical-packed commercial spices. We started Spiceora to restore direct access to single-origin purity."`}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-[#1A1714]/6 shadow-sm">
                  <span className="text-2xl font-bold text-[#2A4A3C] block">47</span>
                  <span className="text-xs text-[#7A7064]">Partnering Farming Families</span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-[#1A1714]/6 shadow-sm">
                  <span className="text-2xl font-bold text-[#2A4A3C] block">100%</span>
                  <span className="text-xs text-[#7A7064]">Lab-Verified A-Grade Purity</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Interactive Timeline */}
        <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 sm:p-8 mb-16 shadow-sm">
          <h3 className="text-2xl font-bold text-[#1A1714] text-center mb-8" style={{ fontFamily: "'Bodoni Moda', serif" }}>Company Milestones</h3>
          
          <div className="flex border-b border-[#1A1714]/8 overflow-x-auto gap-2 justify-center mb-8 pb-3">
            {timeline.map(t => (
              <button
                key={t.year}
                onClick={() => setActiveYear(t.year)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${activeYear === t.year ? "bg-[#2A4A3C] text-white" : "text-[#7A7064] hover:bg-[#FAF8F3] hover:text-[#1A1714]"}`}
              >
                {t.year}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeYear}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center max-w-xl mx-auto"
            >
              <h4 className="text-lg font-bold text-[#2A4A3C] mb-2">{timeline.find(t => t.year === activeYear)?.title}</h4>
              <p className="text-sm text-[#7A7064] leading-relaxed">{timeline.find(t => t.year === activeYear)?.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Video Placeholder */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[#1A1714] text-center mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>Immersive Video Overview</h3>
          <div className="relative rounded-3xl overflow-hidden shadow-lg bg-[#FAF8F3] border border-[#1A1714]/12 flex items-center justify-center cursor-pointer group" style={{ aspectRatio: "16/9" }}>
            <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200&h=675&fit=crop" alt="Spice processing video" className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
            <div className="absolute inset-0 bg-[#1A2E25]/35 group-hover:bg-[#1A2E25]/45 transition-colors" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-[#C9920A] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ChevronRight className="w-8 h-8 text-white ml-1 fill-white" />
            </div>
            <span className="absolute bottom-4 left-4 text-xs font-semibold text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">Sourcing Travels Log (Placeholder Player)</span>
          </div>
        </div>

        {/* Factory, Packaging, & Quality Standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Stone Grinding Process", desc: "Our slow-milled cold stone grinding wheels run at low RPMs, avoiding temperature rises that burn off aromatic oils and terpenes.", icon: RefreshCw },
            { title: "Nitrogen Resealable Seal", desc: "Triple-layer, light-blocking resealable pouches are flushed with nitrogen to eliminate humidity and oxygen degradation.", icon: Shield },
            { title: "Ethical Quality Sourcing", desc: "We bypass broker boards entirely. Buying directly guarantees traceable origins, fair premium payouts, and purity.", icon: Globe },
          ].map((std, i) => (
            <div key={i} className="p-6 bg-white border border-[#1A1714]/8 rounded-3xl shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#2A4A3C]/10 flex items-center justify-center mb-4">
                <std.icon className="w-5 h-5 text-[#2A4A3C]" />
              </div>
              <h4 className="font-semibold text-base text-[#1A1714] mb-2">{std.title}</h4>
              <p className="text-xs text-[#7A7064] leading-relaxed">{std.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function BundleBuilderPage() {
  const { navigate, addToCart, products } = useApp();
  const [size, setSize] = useState<"trio" | "grand">("trio");
  const [boxStyle, setBoxStyle] = useState("rustic");
  const [selectedSpices, setSelectedSpices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const maxSlots = size === "trio" ? 3 : 5;
  const bundlePrice = size === "trio" ? 599 : 999;

  const boxStyles = [
    { id: "rustic", label: "Rustic Wooden Crate", desc: "Hand-finished cedar crate with branding burns.", bg: "bg-[#F5EAD4]" },
    { id: "silk", label: "Royal Silk Envelope", desc: "Traditional luxury velvet cover wrap.", bg: "bg-[#E6D4E6]" },
    { id: "kraft", label: "Eco Kraft Box", desc: "Recycled sturdy brown box with dry flowers.", bg: "bg-[#E3DAC9]" },
  ];

  function toggleSpice(prod: any) {
    if (selectedSpices.some(s => s.id === prod.id)) {
      setSelectedSpices(prev => prev.filter(s => s.id !== prod.id));
    } else {
      if (selectedSpices.length < maxSlots) {
        setSelectedSpices(prev => [...prev, prod]);
      }
    }
  }

  function handleAddBundle() {
    if (selectedSpices.length < maxSlots) return;
    setLoading(true);
    setTimeout(() => {
      const bundleProduct = {
        id: Math.floor(Math.random() * 1000000 + 10000),
        name: `Custom ${size === "trio" ? "Trio" : "Grand"} Spice Box`,
        subtitle: `Gift Bundle · ${boxStyles.find(b => b.id === boxStyle)?.label}`,
        price: bundlePrice,
        originalPrice: size === "trio" ? 699 : 1199,
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&fit=crop",
        origin: "Custom Curated Selection",
        description: `Custom curated spice box containing: ${selectedSpices.map(s => s.name).join(", ")}. Gift wrap style: ${boxStyles.find(b => b.id === boxStyle)?.label}.`,
        nutritionPer100g: {},
        ingredients: selectedSpices.map(s => s.name),
        storage: "Keep in box till first use. Store in dry shelves.",
        tags: ["custom", "gift-bundle", "selection"],
      };

      addToCart(bundleProduct as any, "1 Set", bundlePrice);
      setLoading(false);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setSelectedSpices([]);
        navigate("cart");
      }, 1500);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20">
      <div className="bg-[#2A4A3C] py-10 px-4 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-white/55 text-sm mb-2">
            <button onClick={() => navigate("home")} className="hover:text-white transition-colors">Home</button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Bundle Builder</span>
          </div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Bodoni Moda', serif" }}>Build Your Custom Spice Box</h1>
          <p className="text-white/60 text-sm mt-1">Curate a premium personalized gift set. Select slot counts, wraps, and spice varieties.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8 text-left">
            <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Step 1: Choose Box Size</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: "trio", title: "The Trio Crate", count: 3, price: "₹599", desc: "Select 3 spices. Perfect starter gift set." },
                  { id: "grand", title: "The Grand Crate", count: 5, price: "₹999", desc: "Select 5 spices. Ultimate chef curation." },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => { setSize(opt.id as any); setSelectedSpices([]); }}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${size === opt.id ? "border-[#2A4A3C] bg-[#2A4A3C]/4 shadow-md" : "border-[#1A1714]/12 bg-white hover:border-[#2A4A3C]/40"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[#1A1714]">{opt.title}</span>
                      <span className="text-[#2A4A3C] font-bold text-sm">{opt.price}</span>
                    </div>
                    <p className="text-xs text-[#7A7064] leading-relaxed">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Step 2: Select Wrap Style</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {boxStyles.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBoxStyle(b.id)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all ${boxStyle === b.id ? "border-[#2A4A3C] bg-[#2A4A3C]/4 shadow-md" : "border-[#1A1714]/12 bg-white hover:border-[#2A4A3C]/40"}`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${b.bg} mb-3 border border-[#1A1714]/10`} />
                    <span className="font-semibold text-sm text-[#1A1714] block mb-1">{b.label}</span>
                    <p className="text-[11px] text-[#7A7064] leading-relaxed">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1714] mb-1" style={{ fontFamily: "'Bodoni Moda', serif" }}>Step 3: Select Your Spices</h3>
              <p className="text-xs text-[#7A7064] mb-6">Select exactly {maxSlots} spices below to fill your box slots ({selectedSpices.length} of {maxSlots} filled).</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {products.map((p: any) => {
                  const isSelected = selectedSpices.some(s => s.id === p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleSpice(p)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer relative ${isSelected ? "border-[#2A4A3C] bg-[#2A4A3C]/6 shadow-sm" : "border-[#1A1714]/12 bg-white hover:border-[#2A4A3C]/30"}`}
                    >
                      <div className="w-full rounded-xl overflow-hidden mb-3 aspect-square">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-semibold text-[#1A1714] block line-clamp-1">{p.name}</span>
                      <span className="text-[10px] text-[#7A7064] mt-0.5 block">{p.origin.split(",")[0]}</span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#2A4A3C] text-white flex items-center justify-center border-2 border-white">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 sticky top-24 text-left">
            <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 shadow-sm text-center">
              <h3 className="text-lg font-bold text-[#1A1714] mb-4" style={{ fontFamily: "'Bodoni Moda', serif" }}>Box Preview</h3>
              
              <div className={`aspect-video w-full rounded-2xl flex flex-col justify-between p-4 mb-6 shadow-inner ${boxStyles.find(b => b.id === boxStyle)?.bg}`}>
                <div className="flex justify-between items-start">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#2A4A3C]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#1A1714]/40 font-mono">Spiceora Gift Box</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#1A1714]/60 font-mono">{size === "trio" ? "3 slots" : "5 slots"}</span>
                </div>
                <div className="flex gap-3 justify-center py-2 flex-wrap">
                  {Array.from({ length: maxSlots }).map((_, idx) => {
                    const selected = selectedSpices[idx];
                    return (
                      <div key={idx} className="w-10 h-10 rounded-full border-2 border-dashed border-[#1A1714]/20 flex items-center justify-center overflow-hidden bg-white/70 shadow-sm">
                        {selected ? (
                          <img src={selected.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-[#7A7064]/40 font-bold">{idx + 1}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="text-[9px] text-[#7A7064] font-medium text-center truncate">
                  Style: {boxStyles.find(b => b.id === boxStyle)?.label}
                </div>
              </div>

              <div className="border-t border-[#1A1714]/8 pt-5 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-[#7A7064] font-medium">Curated Spice Crate</span>
                  <span className="text-2xl font-bold text-[#1A1714]">₹{bundlePrice}</span>
                </div>
                <Btn
                  disabled={selectedSpices.length < maxSlots}
                  onClick={handleAddBundle}
                  loading={loading}
                  className={`w-full py-3.5 ${added ? "!bg-[#2A7A55]" : ""}`}
                >
                  {added ? <><Check className="w-4 h-4" /> Added to Cart!</> : `Add Bundle to Cart`}
                </Btn>
                {selectedSpices.length < maxSlots && (
                  <p className="text-[10px] text-orange-600 font-medium">Please select {maxSlots - selectedSpices.length} more spices to fill the box.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ─── WHOLESALE PAGE ──────────────────────────────────────────────────────────

function WholesalePage() {
  const { navigate, wholesaleData, logAnalyticsEvent, products } = useApp();
  useSEO("Wholesale & Bulk Spice Sourcing", "Direct farm-to-warehouse trade, certified organic quality, bulk packaging (5kg–25kg) for restaurants, hotels, and distributors.");
  
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    productInterest: wholesaleData?.product || "",
    volume: wholesaleData?.volume || "",
    message: ""
  });
  
  const [errors, setErrors] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic CMS configurations loaded via localStorage
  const [cmsContact, setCmsContact] = useState({
    whatsapp: "",
    phone: "",
    email: "",
    address: "",
    website: "",
    hours: ""
  });

  const [cmsProducts, setCmsProducts] = useState<any[]>([]);

  const [pdfTemplate, setPdfTemplate] = useState({
    headerVisible: true,
    footerVisible: true,
    watermark: "",
    primaryColor: [42, 74, 60],
    secondaryColor: [201, 146, 10],
    terms: ""
  });

  useEffect(() => {
    try {
      const storedContact = localStorage.getItem("spiceora_contact_settings");
      if (storedContact) {
        setCmsContact(JSON.parse(storedContact));
      }
      
      const storedProducts = localStorage.getItem("spiceora_pdf_products");
      if (storedProducts) {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((p: any) => ({
            name: p.name,
            p100: p.retailSizes?.p100 ? `₹${p.retailSizes.p100}` : "N/A",
            p250: p.retailSizes?.p250 ? `₹${p.retailSizes.p250}` : "N/A",
            p500: p.retailSizes?.p500 ? `₹${p.retailSizes.p500}` : "N/A",
            p1000: p.retailSizes?.p1000 ? `₹${p.retailSizes.p1000}` : "Available"
          }));
          setCmsProducts(formatted);
        }
      }

      const storedTemplate = localStorage.getItem("spiceora_pdf_template");
      if (storedTemplate) {
        const parsed = JSON.parse(storedTemplate);
        
        const colorMap: Record<string, number[]> = {
          green: [42, 74, 60],
          gold: [201, 146, 10],
          red: [180, 40, 40],
          blue: [25, 80, 150]
        };

        setPdfTemplate({
          headerVisible: parsed.headerVisible !== false,
          footerVisible: parsed.footerVisible !== false,
          watermark: parsed.watermark || "",
          primaryColor: colorMap[parsed.primaryColor] || [42, 74, 60],
          secondaryColor: colorMap[parsed.secondaryColor] || [201, 146, 10],
          terms: parsed.terms || ""
        });
      }
    } catch (e) {
      console.error("Error loading CMS settings in storefront:", e);
    }
  }, []);

  useEffect(() => {
    if (wholesaleData) {
      setFormData(prev => ({
        ...prev,
        productInterest: wholesaleData.product || "",
        volume: wholesaleData.volume || ""
      }));
    }
  }, [wholesaleData]);

  useEffect(() => {
    if (!wholesaleData && products.length > 0) {
      setFormData(prev => ({
        ...prev,
        productInterest: prev.productInterest || products[0].name || ""
      }));
    }
  }, [products, wholesaleData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev: any) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleValidation = () => {
    const newErrors: any = {};
    if (!formData.businessName.trim()) newErrors.businessName = "Business / Company name is required.";
    if (!formData.contactName.trim()) newErrors.contactName = "Contact person name is required.";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid business email.";
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = "Valid contact number is required.";
    return newErrors;
  };

  const triggerPDFDownload = () => {
    try {
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primary = pdfTemplate.primaryColor;
      const secondary = pdfTemplate.secondaryColor;

      // ─── PAGE 1: COVER PAGE ───
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
      doc.text(formData.businessName || "Valued B2B Partner", 30, cardY);
      cardY += 12;

      doc.setFontSize(11);
      
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(26, 23, 20);
      doc.text("Business Name:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(formData.businessName || "N/A", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Contact Name:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(formData.contactName || "N/A", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Business Email:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(formData.email || "N/A", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Mobile Number:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text("+91 " + (formData.phone || "N/A"), 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Selected Product:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(formData.productInterest || "Mixed Order / All Spices", 75, cardY);
      cardY += 10;

      doc.setFont("Helvetica", "normal");
      doc.text("Sourcing Volume:", 30, cardY);
      doc.setFont("Helvetica", "bold");
      doc.text(formData.volume || "Mixed Bulk", 75, cardY);
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
      const splitMsg = doc.splitTextToSize(formData.message || "No specific milling or scheduling requests added.", 110);
      doc.text(splitMsg, 75, cardY);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 1 of 2", 100, 280);

      // Add watermark if present
      if (pdfTemplate.watermark) {
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(36);
        doc.setTextColor(200, 200, 200, 0.12);
        doc.text(pdfTemplate.watermark, 30, 250, null, 45);
      }

      // ─── PAGE 2: CATALOG CONTENT ───
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
      cmsProducts.forEach((row, idx) => {
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

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(26, 23, 20);
      doc.text(`WhatsApp/Call Support: +91 ${cmsContact.whatsapp}`, 25, rowY + 13);
      doc.text(`Official Email: ${cmsContact.email}`, 25, rowY + 19);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(122, 112, 100);
      doc.text("Page 2 of 2", 100, 280);

      const cleanBusinessName = (formData.businessName || "Partner").trim().replace(/\s+/g, "_");
      const filename = `SPICEORA_Wholesale_Catalog_${cleanBusinessName}.pdf`;
      doc.save(filename);

      logAnalyticsEvent("Catalog Download Completed", { filename });
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = handleValidation();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      logAnalyticsEvent("Wholesale Inquiry Error", { errorsCount: Object.keys(validationErrors).length });
      return;
    }

    logAnalyticsEvent("Wholesale Inquiry Submitted", {
      businessName: formData.businessName,
      contactName: formData.contactName,
      productInterest: formData.productInterest,
      volume: formData.volume
    });

    const newInquiry = {
      id: "INQ-" + Math.floor(Math.random() * 90000 + 10000),
      date: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      businessName: formData.businessName,
      contactName: formData.contactName,
      email: formData.email,
      phone: formData.phone,
      productInterest: formData.productInterest,
      volume: formData.volume,
      message: formData.message || "",
      status: "pending", // pending, contacted, quotation_sent, converted, rejected
      assignedExecutive: "Unassigned",
      notes: [] as string[],
      followUps: [] as { date: string; note: string }[]
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem("spiceora_wholesale_inquiries");
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(newInquiry);
      localStorage.setItem("spiceora_wholesale_inquiries", JSON.stringify(list));
      
      // Also trigger browser notification for admin
      const storedLogs = localStorage.getItem("spiceora_audit_logs");
      const logs = storedLogs ? JSON.parse(storedLogs) : [];
      logs.unshift({
        time: new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        action: "Inquiry Created",
        user: "Customer Portal",
        details: `New wholesale request submitted by ${formData.businessName}`
      });
      localStorage.setItem("spiceora_audit_logs", JSON.stringify(logs));
    } catch (e) {
      console.error("Local storage sync error:", e);
    }

    // Auto trigger personalized PDF download
    triggerPDFDownload();

    setSubmitted(true);
  };

  const handleCatalogDownload = () => {
    const validationErrors = handleValidation();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      logAnalyticsEvent("Catalog Download Blocked", { reason: "Missing lead info" });
      const firstError = Object.values(validationErrors)[0] as string;
      alert(`Please fill in your business details first: ${firstError}`);
      return;
    }

    setDownloading(true);
    logAnalyticsEvent("Catalog Download Attempt", { email: formData.email });
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      triggerPDFDownload();
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] pt-20 text-left">
      {/* Sourcing Banner */}
      <section className="bg-[#2A4A3C] text-white py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(201,146,10,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-[#C9920A] text-xs font-bold tracking-[0.2em] uppercase block mb-3">Spiceora Global B2B</span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>
              Direct Farm Sourcing & Bulk Spice Supply
            </h1>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              We source directly from sustainable organic farms in Kerala, Rajasthan, and Ceylon. 
              Custom milling, graded quality batches, and container-ready bulk packaging built for 
              premium restaurants, five-star kitchens, food manufacturers, and boutique distributors.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#quote-form" className="px-6 py-3 bg-[#C9920A] hover:bg-[#A87800] text-white font-semibold rounded-xl shadow transition-all">
                Request Bulk Quote
              </a>
              <button onClick={handleCatalogDownload} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4" /> Download Product Catalog
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges & Channels */}
      <section className="py-12 bg-white border-b border-[#1A1714]/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAF8F3] border border-[#1A1714]/6">
              <div className="w-10 h-10 rounded-xl bg-[#2A4A3C]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#2A4A3C]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1A1714] mb-1">Certified Batch Quality</h4>
                <p className="text-xs text-[#7A7064] leading-relaxed">Third-party lab tested, zero adulteration, and guaranteed curcumin & volatile oil levels.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAF8F3] border border-[#1A1714]/6">
              <div className="w-10 h-10 rounded-xl bg-[#2A4A3C]/10 flex items-center justify-center flex-shrink-0">
                <Leaf className="w-5 h-5 text-[#2A4A3C]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1A1714] mb-1">Direct Farm Trade</h4>
                <p className="text-xs text-[#7A7064] leading-relaxed">Ethically harvested directly from farmers with 100% trace origin transparency.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-[#FAF8F3] border border-[#1A1714]/6">
              <div className="w-10 h-10 rounded-xl bg-[#2A4A3C]/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-[#2A4A3C]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[#1A1714] mb-1">Pan-India Freight Logistics</h4>
                <p className="text-xs text-[#7A7064] leading-relaxed">Commercial freight partners offering rapid warehouse delivery across metros.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Sourcing Form & Sales Cards */}
      <section className="py-16 lg:py-24" id="quote-form">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* Direct Channels Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 lg:p-8">
                <h3 className="font-bold text-[#1A1714] text-lg mb-6" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                  Connect with Sales Desk
                </h3>
                <p className="text-sm text-[#7A7064] mb-6 leading-relaxed">
                  Need custom packaging, mill sizing, or specific shipping schedules? Talk directly to our wholesale account executives.
                </p>
                
                <div className="space-y-4">
                  {/* WhatsApp Support */}
                  <a href={`https://wa.me/91${cmsContact.whatsapp}?text=Hello%2C%20I%20am%20interested%20in%20sourcing%20spices%20in%20bulk.`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#25D366]/20 bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors w-full">
                    <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-[#25D366] tracking-wider block">Fastest Response</span>
                      <span className="font-bold text-[#1A1714] text-sm">WhatsApp Chat Support</span>
                    </div>
                  </a>

                  {/* Call Sales */}
                  <a href={`tel:+91${cmsContact.phone}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#2A4A3C]/20 bg-[#2A4A3C]/5 hover:bg-[#2A4A3C]/10 transition-colors w-full">
                    <div className="w-10 h-10 rounded-lg bg-[#2A4A3C] text-white flex items-center justify-center flex-shrink-0">
                      <Phone className="w-4 h-4 fill-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-[#2A4A3C] tracking-wider block">{cmsContact.hours}</span>
                      <span className="font-bold text-[#1A1714] text-sm">+91 {cmsContact.phone}</span>
                    </div>
                  </a>

                  {/* Email Desk */}
                  <a href={`mailto:${cmsContact.email}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[#C9920A]/20 bg-[#C9920A]/5 hover:bg-[#C9920A]/10 transition-colors w-full">
                    <div className="w-10 h-10 rounded-lg bg-[#C9920A] text-white flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] uppercase font-bold text-[#C9920A] tracking-wider block">Logistics & Quotes Desk</span>
                      <span className="font-bold text-[#1A1714] text-sm">{cmsContact.email}</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* B2B Sourcing Certs banner */}
              <div className="bg-[#2A4A3C]/5 rounded-3xl border border-[#2A4A3C]/10 p-6 text-center">
                <span className="text-[10px] font-bold text-[#2A4A3C] uppercase tracking-widest block mb-2">Accreditations</span>
                <div className="flex justify-center items-center gap-4 opacity-75">
                  <span className="font-serif font-bold text-sm text-[#2A4A3C]">FSSAI</span>
                  <div className="h-4 w-px bg-[#2A4A3C]/20" />
                  <span className="font-serif font-bold text-sm text-[#2A4A3C]">APEDA</span>
                  <div className="h-4 w-px bg-[#2A4A3C]/20" />
                  <span className="font-serif font-bold text-sm text-[#2A4A3C]">USDA ORGANIC</span>
                </div>
              </div>
            </div>

            {/* Sourcing Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-3xl border border-[#1A1714]/8 p-6 lg:p-8 shadow-sm">
                
                {submitted ? (
                  <div className="py-12 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-full bg-[#2A4A3C]/10 text-[#2A4A3C] flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A1714] mb-3" style={{ fontFamily: "'Bodoni Moda', serif" }}>Inquiry Submitted!</h3>
                    <p className="text-sm text-[#7A7064] mb-8 leading-relaxed">
                      Thank you! Your wholesale inquiry has been submitted successfully.
                      <br /><br />
                      Your personalized product catalog has been downloaded. Our sales team will contact you shortly.
                    </p>
                    <div className="space-y-3">
                      <button onClick={triggerPDFDownload} className="w-full py-3 bg-[#2A4A3C] hover:bg-[#1E352B] text-white font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer">
                        <FileText className="w-4 h-4" /> Download Again
                      </button>
                      <a href={`https://wa.me/91${cmsContact.whatsapp}?text=Hello%2C%20I%20am%20interested%20in%20sourcing%20spices%20in%20bulk.`} target="_blank" rel="noreferrer"
                        className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-semibold rounded-xl shadow transition-colors flex items-center justify-center gap-2 text-sm">
                        <Zap className="w-4 h-4 fill-white" /> Chat on WhatsApp
                      </a>
                      <button onClick={() => setSubmitted(false)} className="w-full py-3 bg-[#FAF8F3] hover:bg-[#EEE9E0] text-[#7A7064] font-semibold rounded-xl transition-colors text-sm border border-[#1A1714]/12 cursor-pointer mt-4">
                        Submit Another Inquiry
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="font-bold text-[#1A1714] text-xl mb-2" style={{ fontFamily: "'Bodoni Moda', serif" }}>
                      Wholesale Sourcing Form
                    </h3>
                    <p className="text-xs text-[#7A7064] mb-6">
                      Please enter your contact details and spice supply quantities below to retrieve our commercial pricing index.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Business / Organization *</label>
                        <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Grand Taj Palace Hotel"
                          className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.businessName ? "border-red-400" : "border-[#1A1714]/12"}`} />
                        {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Contact Person Name *</label>
                        <input name="contactName" value={formData.contactName} onChange={handleChange} placeholder="e.g. Ramesh Kumar"
                          className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.contactName ? "border-red-400" : "border-[#1A1714]/12"}`} />
                        {errors.contactName && <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Business Email *</label>
                        <input name="email" value={formData.email} onChange={handleChange} placeholder="e.g. purchasing@hotel.com"
                          className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.email ? "border-red-400" : "border-[#1A1714]/12"}`} />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Mobile / Phone Number *</label>
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91 98765 43210"
                          className={`w-full bg-[#FAF8F3] border rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all ${errors.phone ? "border-red-400" : "border-[#1A1714]/12"}`} />
                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Primary Product Interest</label>
                        <select name="productInterest" value={formData.productInterest} onChange={handleChange}
                          className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all cursor-pointer">
                          {products.map((p: any) => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                          <option value="All Spices / Mixed Order">All Spices / Mixed Order</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Estimated Sourcing Volume</label>
                        <select name="volume" value={formData.volume} onChange={handleChange}
                          className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all cursor-pointer">
                          <option value="5kg Bulk Crate">5kg Bulk Crate</option>
                          <option value="10kg Bulk Sack">10kg Bulk Sack</option>
                          <option value="15kg Bulk Crate">15kg Bulk Crate</option>
                          <option value="25kg Bulk Supply">25kg Bulk Supply</option>
                          <option value="100kg - 500kg commercial">100kg - 500kg commercial</option>
                          <option value="500kg - 1 Ton industrial">500kg - 1 Ton industrial</option>
                          <option value="1 Ton+ export supply">1 Ton+ export supply</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Sourcing Specifications & Message</label>
                      <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Specify packaging details, grinding mesh size, delivery schedules, or special quality certificates needed."
                        className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2A4A3C] transition-all resize-none" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#1A1714]/8 pt-6">
                      <button type="button" onClick={handleCatalogDownload} disabled={downloading}
                        className="text-xs font-semibold text-[#2A4A3C] hover:underline flex items-center gap-1.5 py-2 cursor-pointer disabled:opacity-50">
                        {downloading ? "Generating PDF Catalog..." : downloadSuccess ? "Downloaded! Check downloads folder" : <><FileText className="w-4 h-4" /> Download Pricing Catalog directly</>}
                      </button>
                      <Btn size="md" type="submit" className="bg-[#2A4A3C] hover:bg-[#1E352B]">
                        Submit Sourcing Request <ArrowRight className="w-4 h-4" />
                      </Btn>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

// ─── TELEMETRY DRAWER ──────────────────────────────────────────────────────────

function TelemetryDrawer() {
  const { analyticsEvents } = useApp();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-80 max-w-sm h-[450px] bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-[#1A1714]/12 flex flex-col overflow-hidden text-left font-sans"
          >
            <div className="p-4 border-b border-[#1A1714]/8 bg-[#FAF8F3] flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-[#1A1714] uppercase tracking-wider">Telemetry Logs</h3>
                <p className="text-[9px] text-[#7A7064]">Ctrl + Shift + A to toggle</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-[#1A1714]/5 hover:bg-[#1A1714]/10 flex items-center justify-center text-[#7A7064] transition-colors"
                aria-label="Close telemetry console"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[10px] bg-[#FAF8F3]/50">
              {analyticsEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-[#7A7064] py-8">
                  <span className="text-lg mb-2">📡</span>
                  <p className="text-[10px] max-w-[180px] font-sans">No telemetry events recorded yet. Try clicking cards, searching, or adding items to cart!</p>
                </div>
              ) : (
                analyticsEvents.map((evt: any, i: number) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i < 5 ? i * 0.05 : 0 }}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      i === 0
                        ? "bg-[#2A4A3C]/5 border-[#2A4A3C]/20 shadow-[0_2px_8px_rgba(42,74,60,0.06)]"
                        : "bg-white border-[#1A1714]/6 text-opacity-80"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#2A4A3C] uppercase tracking-wide text-[9px]">
                        {evt.name}
                      </span>
                      <span className="text-[8px] text-[#7A7064]">{evt.timestamp}</span>
                    </div>
                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <pre className="mt-1 bg-black/5 p-1.5 rounded overflow-x-auto text-[8px] text-[#7A7064] max-h-24">
                        {JSON.stringify(evt.metadata, null, 2)}
                      </pre>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── APP ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [products, setProducts] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid = parsed.filter((p: any) => p.price !== 12.5 && !String(p.id).startsWith("P00"));
        if (valid.length > 0) return valid;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_categories");
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid = parsed.filter((c: any) => c.image && !c.image.startsWith("/images/"));
        if (valid.length > 0) return valid;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [recipes, setRecipes] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_recipes");
      if (stored) {
        const parsed = JSON.parse(stored);
        const valid = parsed.filter((r: any) => r.image && !r.image.startsWith("/images/"));
        if (valid.length > 0) return valid;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [testimonials, setTestimonials] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("spiceora_testimonials");
      if (stored) return JSON.parse(stored);
      return [];
    } catch {
      return [];
    }
  });

  const [cmsSettings, setCmsSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("spiceora_homepage_cms");
      return stored ? JSON.parse(stored) : {
        hero: { headline: "", subheadline: "", buttonText: "", buttonLink: "", image: "" },
        cta: { headline: "", description: "", buttonText: "", buttonLink: "", image: "" },
        about: { founderStory: "", mission: "", vision: "", trustText: "" },
        announcement: "",
        newsletterText: ""
      };
    } catch {
      return {
        hero: { headline: "", subheadline: "", buttonText: "", buttonLink: "", image: "" },
        cta: { headline: "", description: "", buttonText: "", buttonLink: "", image: "" },
        about: { founderStory: "", mission: "", vision: "", trustText: "" },
        announcement: "",
        newsletterText: ""
      };
    }
  });

  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [shopCategory, setShopCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState(new Set<number>());
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<any[]>([]);
  const [wholesaleData, setWholesaleData] = useState<any>(null);

  function logAnalyticsEvent(eventName: string, metadata: any = {}) {
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      name: eventName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      metadata
    };
    setAnalyticsEvents(prev => [newEvent, ...prev].slice(0, 50));
  }

  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState<'login' | 'signup' | 'forgot' | 'closed'>('closed');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const resP = await fetch("http://localhost:4000/api/products");
        if (resP.ok) {
          const jsonP = await resP.json();
          const dataP = jsonP.data || jsonP;
          if (Array.isArray(dataP)) {
            setProducts(dataP);
          }
        }
        const resC = await fetch("http://localhost:4000/api/categories");
        if (resC.ok) {
          const jsonC = await resC.json();
          const dataC = jsonC.data || jsonC;
          if (Array.isArray(dataC)) {
            setCategories([
              { id: "all", name: "All Spices", count: 0 },
              ...dataC.map((c: any) => ({
                id: c.slug || String(c.id),
                name: c.name,
                count: 0,
                description: c.description || ""
              }))
            ]);
          }
        }
      } catch (err) {
        console.warn("User app API connection failed, using local state:", err);
      }
    };
    fetchApiData();

    const saved = localStorage.getItem("spiceora_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("spiceora_user");
      }
    }

    const stored = localStorage.getItem("spiceora_recently_viewed");
    if (stored) {
      try { setRecentlyViewed(JSON.parse(stored)); } catch (e) {}
    }
  }, []);


  function trackProductView(id: number) {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(x => x !== id);
      const updated = [id, ...filtered].slice(0, 4);
      localStorage.setItem("spiceora_recently_viewed", JSON.stringify(updated));
      return updated;
    });
  }

  async function login(email: string, password: string, rememberMe: boolean) {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data?.token) {
      throw new Error((json && json.message) || 'Invalid credentials');
    }
    const u = json.data.user;
    const token = json.data.token;
    const userData = {
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      role: u.role,
      token,
      isLoggedIn: true
    };
    setUser(userData);
    if (rememberMe) {
      localStorage.setItem("spiceora_user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("spiceora_user", JSON.stringify(userData));
    }
    setAuthModalOpen('closed');
    if (redirectAfterLogin) {
      setCurrentPage(redirectAfterLogin as Page);
      setRedirectAfterLogin(null);
    }
  }

  async function signup(name: string, email: string, password: string) {
    const parts = name.trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ') || '';
    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, password })
    });
    const json = await res.json();
    if (!res.ok || !json.success || !json.data?.token) {
      throw new Error((json && json.message) || 'Signup failed');
    }
    const u = json.data.user;
    const token = json.data.token;
    const userData = {
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      email: u.email,
      role: u.role,
      token,
      isLoggedIn: true
    };
    setUser(userData);
    localStorage.setItem("spiceora_user", JSON.stringify(userData));
    setAuthModalOpen('closed');
    if (redirectAfterLogin) {
      setCurrentPage(redirectAfterLogin as Page);
      setRedirectAfterLogin(null);
    }
  }

  function forgotPassword(email: string) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          resolve();
        } else {
          reject(new Error("No account found with this email."));
        }
      }, 1000);
    });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("spiceora_user");
    sessionStorage.removeItem("spiceora_user");
    setCurrentPage("home");
  }

  function navigate(page: string, data?: any) {
    if (page === "profile" && !user) {
      setRedirectAfterLogin("profile");
      setAuthModalOpen("login");
      return;
    }
    if (page === "checkout" && !user) {
      setRedirectAfterLogin("checkout");
      setAuthModalOpen("login");
      return;
    }

    if (page === "product" && data) {
      setSelectedProduct(data);
      trackProductView(data.id);
      logAnalyticsEvent("View Product", { productId: data.id, name: data.name });
      setCurrentPage("product");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "recipe" && data) {
      setSelectedRecipe(data);
      logAnalyticsEvent("Recipe View", { recipeId: data.id, title: data.title });
      setCurrentPage("recipe");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "shop") {
      setShopCategory(data?.category || "all");
      logAnalyticsEvent("Navigate to Shop", { category: data?.category || "all" });
      setCurrentPage("shop");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (["home", "cart", "checkout", "profile", "recipes", "founder", "bundle", "wholesale"].includes(page)) {
      logAnalyticsEvent(`Navigate to ${page.toUpperCase()}`, {});
      setCurrentPage(page as Page);
      if (page === "wholesale") {
        setWholesaleData(data || null);
      }
      if (data?.anchor) {
        setTimeout(() => {
          const el = document.getElementById(data.anchor);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setCurrentPage("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function addToCart(product: Product, selectedWeight?: string, price?: number) {
    const weight = selectedWeight || "100g Standard";
    const itemPrice = price !== undefined ? price : product.price;
    logAnalyticsEvent("Add Cart", { productId: product.id, name: product.name, weight, price: itemPrice });

    setCart(prev => {
      const exIdx = prev.findIndex(i => i.product.id === product.id && i.selectedWeight === weight);
      if (exIdx > -1) {
        return prev.map((item, idx) => idx === exIdx ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1, selectedWeight: weight, price: itemPrice }];
    });
  }

  function updateCartItem(productId: number, selectedWeight: string, quantity: number) {
    setCart(prev => prev.map(i => i.product.id === productId && i.selectedWeight === selectedWeight ? { ...i, quantity } : i));
  }

  function removeFromCart(productId: number, selectedWeight: string) {
    setCart(prev => prev.filter(i => !(i.product.id === productId && i.selectedWeight === selectedWeight)));
  }

  function toggleWishlist(productId: number) {
    setWishlist(prev => {
      const n = new Set(prev);
      n.has(productId) ? n.delete(productId) : n.add(productId);
      return n;
    });
  }

  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");

  const ctx = {
    currentPage, navigate, cart, addToCart, updateCartItem, removeFromCart, wishlist, toggleWishlist,
    user, authModalOpen, setAuthModalOpen, login, signup, logout, forgotPassword, recentlyViewed,
    analyticsEvents, logAnalyticsEvent, wholesaleData, setWholesaleData,
    discount, setDiscount, couponCode, setCouponCode,
    products, setProducts, categories, setCategories, recipes, setRecipes,
    testimonials, setTestimonials, cmsSettings, setCmsSettings
  };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="min-h-screen bg-[#FAF8F3]">
        <Header />
        <AnimatePresence mode="wait">
          <motion.main
            key={currentPage + (selectedProduct?.id || "") + (selectedRecipe?.id || "")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {currentPage === "home" && <HomePage />}
            {currentPage === "shop" && <ShopPage initCategory={shopCategory} />}
            {currentPage === "product" && selectedProduct && <ProductPage product={selectedProduct} />}
            {currentPage === "cart" && <CartPage />}
            {currentPage === "checkout" && <CheckoutPage />}
            {currentPage === "profile" && <ProfilePage />}
            {currentPage === "recipes" && <RecipesPage />}
            {currentPage === "recipe" && selectedRecipe && <RecipeDetailPage recipe={selectedRecipe} />}
            {currentPage === "founder" && <FounderPage />}
            {currentPage === "bundle" && <BundleBuilderPage />}
            {currentPage === "wholesale" && <WholesalePage />}
          </motion.main>
        </AnimatePresence>
        <AnimatePresence>
          {authModalOpen !== "closed" && <AuthModal />}
        </AnimatePresence>
        <TelemetryDrawer />
      </div>
    </AppCtx.Provider>
  );
}

function AuthModal() {
  const { authModalOpen, setAuthModalOpen, login, signup, forgotPassword } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  
  useEffect(() => {
    if (authModalOpen && authModalOpen !== 'closed') {
      setMode(authModalOpen);
    }
  }, [authModalOpen]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (authModalOpen === 'closed') return null;

  function handleClose() {
    setAuthModalOpen('closed');
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === 'login') {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }
      setLoading(true);
      try {
        await login(email, password, rememberMe);
      } catch (err: any) {
        setError(err.message || "Login failed.");
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setLoading(true);
      try {
        await signup(name, email, password);
      } catch (err: any) {
        setError(err.message || "Signup failed.");
      } finally {
        setLoading(false);
      }
    } else if (mode === 'forgot') {
      if (!email) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        await forgotPassword(email);
        setSuccess("Password reset instructions have been sent to your email.");
      } catch (err: any) {
        setError(err.message || "Password recovery failed.");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-[#1A1714]/60 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-[#1A1714]/12 shadow-2xl overflow-hidden z-10 p-6 sm:p-8 text-left"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#FAF8F3] hover:bg-[#EEE9E0] flex items-center justify-center text-[#7A7064] transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-full bg-[#2A4A3C] flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-[#C9920A]" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: "'Bodoni Moda', serif" }}>Spiceora</span>
        </div>

        <h2 className="text-2xl font-bold text-[#1A1714] mb-2" style={{ fontFamily: "'Bodoni Moda', serif" }}>
          {mode === 'login' && "Welcome Back"}
          {mode === 'signup' && "Create Account"}
          {mode === 'forgot' && "Reset Password"}
        </h2>
        <p className="text-xs text-[#7A7064] mb-6 font-medium">
          {mode === 'login' && "Sign in to access your orders, wishlist, and seamless checkout."}
          {mode === 'signup' && "Join Spiceora to track orders and save your favorite premium spices."}
          {mode === 'forgot' && "Enter your email address and we'll send you recovery details."}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-100 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-xs flex items-center gap-2 border border-green-100 font-medium">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ananya Krishnan"
                required
                className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ananya@email.com"
              required
              className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest block">Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-[#2A4A3C] hover:underline font-medium cursor-pointer">
                    Forgot?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all"
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-[10px] font-semibold text-[#7A7064] uppercase tracking-widest mb-1.5 block">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#FAF8F3] border border-[#1A1714]/12 rounded-xl px-4 py-3 text-sm text-[#1A1714] placeholder-[#7A7064] outline-none focus:border-[#2A4A3C] focus:ring-2 focus:ring-[#2A4A3C]/10 transition-all"
              />
            </div>
          )}

          {mode === 'login' && (
            <label className="flex items-center gap-2 py-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-[#1A1714]/12 text-[#2A4A3C] focus:ring-[#2A4A3C]"
              />
              <span className="text-xs text-[#7A7064]">Remember me for next sign-in</span>
            </label>
          )}

          <Btn type="submit" size="md" loading={loading} className="w-full mt-2">
            {mode === 'login' && "Sign In"}
            {mode === 'signup' && "Register"}
            {mode === 'forgot' && "Send Reset Link"}
          </Btn>
        </form>

        <div className="mt-6 pt-5 border-t border-[#1A1714]/8 text-center text-xs text-[#7A7064]">
          {mode === 'login' ? (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setMode('signup')} className="text-[#2A4A3C] font-semibold hover:underline cursor-pointer">
                Sign up
              </button>
            </p>
          ) : mode === 'signup' ? (
            <p>
              Already have an account?{" "}
              <button onClick={() => setMode('login')} className="text-[#2A4A3C] font-semibold hover:underline cursor-pointer">
                Sign in
              </button>
            </p>
          ) : (
            <button onClick={() => setMode('login')} className="text-[#2A4A3C] font-semibold hover:underline cursor-pointer">
              Back to Sign In
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
