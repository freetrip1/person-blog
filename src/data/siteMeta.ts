// 站点元数据单一真源（single source of truth）。
// 全站 <head>（title / description / Open Graph / canonical / Person JSON-LD）、
// BottomNav 社交链接、首页与 about 的 spine 标语，统统派生自此文件。
// 改元数据只需改这一处。

export interface SocialLink {
  /** 显示名 / aria-label，如 "GitHub" / "WorldQuant BRAIN" / "电子邮件" */
  label: string;
  /** 完整 URL 或 mailto: */
  href: string;
  /** 是否纳入 JSON-LD sameAs（邮箱通常为 false，避免把 mailto: 当成同一身份的外链） */
  sameAs: boolean;
}

export interface SiteMeta {
  /** 品牌 / 站名，如 "Freetrip" */
  siteName: string;
  /** 站主名，如 "夜 / siyuan" */
  brandName: string;
  /** 生产域名，必须与 astro.config.mjs 的 site 字段保持一致 */
  url: string;
  /** 默认 meta description */
  description: string;
  /** 长版中文 spine 标语（about 用） */
  spineTaglineCN: string;
  /** 长版英文 spine 标语（about 可选副行） */
  spineTaglineEN: string;
  /** 首页短版标语，串起四顶帽子 */
  spineTaglineShort: string;
  /** 默认 OG 图，缺省回退 favicon.svg（注意：多数社交平台不渲染 SVG，后续可换 PNG） */
  ogImage?: string;
  /** BCP/OG locale，如 "zh_CN" */
  locale: string;
  author: {
    /** schema.org Person.name */
    name: string;
    /** 别名，如 "夜 / Freetrip" */
    alternateName: string;
    /** 四顶帽子（英文） */
    jobTitle: string[];
  };
  social: SocialLink[];
}

export const siteMeta: SiteMeta = {
  siteName: "Freetrip",
  brandName: "夜 / siyuan",
  // TODO(站主拍板): 确认生产域名。当前用 Vercel 默认占位，确定后须与 astro.config.mjs 的 site 同步修改。
  url: "https://person-blog.vercel.app",
  description: "夜 / siyuan 的个人博客 — AI 训练师、量化研究员、Flutter 开发者，也写字。",
  // TODO(站主拍板): 确认 CN / EN spine 长标语最终文案。
  spineTaglineCN: "训练模型，研究因子，写代码，也写字。",
  spineTaglineEN: "Training models, researching factors, writing code — and writing.",
  spineTaglineShort: "AI 训练师 · 量化研究员 · Flutter 开发者 · 创作者",
  ogImage: "/favicon.svg",
  locale: "zh_CN",
  author: {
    // TODO(站主拍板): Person.name 用英文 "Freetrip" 还是拼音；alternateName 措辞。
    name: "Freetrip",
    alternateName: "夜 / siyuan",
    jobTitle: ["AI Trainer", "Quant Researcher", "Flutter Developer", "Writer"],
  },
  social: [
    {
      label: "电子邮件",
      // TODO(站主拍板): 邮箱用 QQ 还是 MEMORY 里的 gmail（qinsiyuan8@gmail.com）。沿用 BottomNav 现值。
      href: "mailto:2281745673@qq.com",
      sameAs: false, // mailto: 不进 sameAs，应作 Person.email 或省略
    },
    {
      label: "GitHub",
      // 去掉 ?tab=repositories，sameAs 用规范个人主页 URL
      href: "https://github.com/freetrip1",
      sameAs: true,
    },
    {
      label: "Twitter",
      // TODO(站主拍板): handle "freetirp" 疑似拼写错误，误进 sameAs 会关联错误账号，需确认。
      href: "https://x.com/freetirp",
      sameAs: true,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/siyuan9159/",
      sameAs: true,
    },
    {
      label: "WorldQuant BRAIN",
      // TODO(站主拍板): WorldQuant 个人页是否公开、最终 URL。占位指向平台首页。
      href: "https://platform.worldquantbrain.com/",
      sameAs: true,
    },
  ],
};

/**
 * 构建 schema.org Person JSON-LD。
 * @param siteUrl 绝对站点 URL（通常传 siteMeta.url 或 Astro.site）
 */
export function buildPersonJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteMeta.author.name,
    alternateName: siteMeta.author.alternateName,
    url: siteUrl,
    jobTitle: siteMeta.author.jobTitle,
    sameAs: siteMeta.social
      .filter((s) => s.sameAs)
      .map((s) => s.href),
  };
}
