export const TOKENS_PER_DESIGN = 10;
export const TOKENS_PER_ENHANCE = 5;
export const TOKENS_PER_VIDEO = 40;
export const TOKENS_PER_COMMERCIAL = 80;
export const TOKEN_VALUE_UGX = 200; // 1 token = UGX 200

export interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceUGX: number;
  designs: number;
  discount: number | null; // % saving vs base rate
  popular: boolean;
  accent: string;
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "starter",
    name: "Starter",
    tokens: 25,
    priceUGX: 5_000,
    designs: 2.5,
    discount: null,
    popular: false,
    accent: "from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-300",
  },
  {
    id: "hustler",
    name: "Hustler",
    tokens: 90,
    priceUGX: 15_000,
    designs: 9,
    discount: 17,
    popular: false,
    accent: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300",
  },
  {
    id: "creator",
    name: "Creator",
    tokens: 200,
    priceUGX: 30_000,
    designs: 20,
    discount: 25,
    popular: true,
    accent: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300",
  },
  {
    id: "business",
    name: "Business",
    tokens: 500,
    priceUGX: 50_000,
    designs: 50,
    discount: 50,
    popular: false,
    accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300",
  },
];

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString("en-UG")}`;
}
