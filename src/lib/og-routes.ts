// og-cards：固定路由 OG 清单单一事实源。
// endpoint（src/pages/og/[...slug].png.ts）用它生成静态页的 OG 卡，
// Base.astro 用 resolveOgRoute() 按当前路径反查应注入哪张 /og/*.png。
//
// ⚠️ GOTCHA（贯穿多组件）：下面的罗马数字 page 必须与
//   src/components/TableOfContents.astro 和 src/components/BottomNav.astro
//   的导航 items 顺序（i–vi）完全一致——这是项目里第三处手动重复的编号，
//   改导航顺序需三处同步，否则 OG 卡页码与站内 TOC 不符。

export type OgRoute = {
  /** 产物 slug，对应 /og/<slug>.png；'home' 映射站点根路径 / */
  slug: string;
  title: string;
  subtitle?: string;
  /** 罗马数字页码，对齐 TOC i–vi；首页留空 */
  page: string;
};

export const STATIC_OG_ROUTES: OgRoute[] = [
  { slug: "home", title: "Freetrip", subtitle: "开发者 / 创作者", page: "" },
  { slug: "about", title: "关于", page: "i" },
  { slug: "work", title: "作品集", page: "ii" },
  { slug: "blog", title: "想法", page: "iii" },
  { slug: "wander", title: "漫游", page: "iv" },
  { slug: "archive", title: "档案", page: "v" },
  { slug: "friends", title: "友链", page: "vi" },
];

// pathname -> OgRoute slug 的反查表。'/' 映射 home，'/about' 映射 about ……
const PATHNAME_TO_SLUG: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/work": "work",
  "/blog": "blog",
  "/wander": "wander",
  "/archive": "archive",
  "/friends": "friends",
};

/**
 * 按当前页面 pathname 反查应使用的 OG 图 slug。
 * - 命中固定路由：返回对应 slug（如 /about -> "about"）。
 * - 未命中（如集合详情页或 404）：由调用方自行决定（Base.astro 对 blog 详情
 *   传显式 ogImage；其余兜底到首页卡 home）。
 *
 * 注意：尾部斜杠归一化，'/about/' 与 '/about' 视为同一路由。
 */
export function resolveOgRoute(pathname: string): string | undefined {
  const normalized =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  return PATHNAME_TO_SLUG[normalized];
}
