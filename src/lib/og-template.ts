// og-cards：动态书页式 OG 分享卡渲染器。
// satori 把 VNode 排版成 SVG，再用 @resvg/resvg-js 把 SVG 光栅化成 1200×630 PNG。
// 整张卡的设计令牌（颜色 / 字号 / 间距 / 折角）集中在本文件，调样式只改这里。
//
// 版式复刻博客「翻页书」视觉（对齐 src/styles/global.css 与 BottomNav 的 .volume-label）：
//   左上 kicker「Freetrip · 第一卷」(Serif, letter-spacing 宽)
//   右上 大号罗马数字页码（斜体淡 muted）
//   中央 ❧ 花饰 + 标题(Serif 700) + 副标题(Sans 400)
//   右下 翻起折角 dog-ear（绝对定位三角 + 阴影）
//   外层 书页内边距 + 细 hairline 模拟书脊
//
// OG 卡固定走日间纸色，规避暗色分享图在社交平台里偏暗（见规格待定问题，默认一套日间）。

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { getOgFonts } from "./og-fonts";

// —— 设计令牌（对齐 global.css 日间配色）——
const BG = "#f5f0e8"; // 纸色底
const INK = "#2c2c2c"; // 主文字
const ACCENT = "#8b7355"; // 强调（kicker / hairline / 花饰）
const MUTED = "#a89a86"; // 淡色（罗马数字页码 / 副标题）
const HAIRLINE = "#d8cdbb"; // 书脊细线 / 边框
const DOGEAR = "#e8dfcf"; // 折角翻起面

const WIDTH = 1200;
const HEIGHT = 630;

export interface OgRenderOpts {
  title: string;
  subtitle?: string;
  /** 罗马数字页码，可空 */
  page?: string;
  /** 左上页眉文案，默认「Freetrip · 第一卷」 */
  kicker?: string;
}

// satori 不自动截断，超长文本会溢出版面：标题 / 副标题硬截断 + 省略号。
function clamp(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

// 标题字数越多字号越小，避免单行溢出（satori 单行不换行时会撑破）。
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 6) return 96;
  if (len <= 10) return 78;
  if (len <= 16) return 60;
  return 48;
}

/**
 * 渲染一张 OG PNG。
 * @returns 1200×630 PNG 的 Uint8Array
 */
export async function renderOgPng(opts: OgRenderOpts): Promise<Uint8Array> {
  const kicker = opts.kicker ?? "Freetrip · 第一卷";
  const title = clamp(opts.title, 22);
  const subtitle = opts.subtitle ? clamp(opts.subtitle, 48) : "";
  const page = opts.page ?? "";
  const tSize = titleFontSize(title);

  // satori VNode（React-element 形状的纯对象，无需 JSX/React 运行时）。
  const vnode = {
    type: "div",
    props: {
      style: {
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        backgroundColor: BG,
        // 书页内边距
        padding: "64px 80px",
        fontFamily: "Noto Serif SC",
        color: INK,
        overflow: "hidden",
      },
      children: [
        // 书脊细线（左侧 hairline）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0px",
              left: "40px",
              bottom: "0px",
              width: "2px",
              backgroundColor: HAIRLINE,
            },
          },
        },
        // 外框 hairline（书页边界）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "28px",
              left: "28px",
              right: "28px",
              bottom: "28px",
              border: `1px solid ${HAIRLINE}`,
            },
          },
        },
        // 顶部行：kicker（左） + 罗马数字页码（右）
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "30px",
                    fontWeight: 600,
                    color: ACCENT,
                    letterSpacing: "0.15em",
                  },
                  children: kicker,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: "64px",
                    fontWeight: 600,
                    color: MUTED,
                    fontStyle: "italic",
                    lineHeight: 1,
                  },
                  children: page,
                },
              },
            ],
          },
        },
        // 中央内容区：❧ + 标题 + 副标题，垂直居中
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "flex-start",
            },
            children: [
              // ❧ 花饰：用内联 SVG 绘制，不依赖字体 glyph。
              // Noto CJK 子集不含 U+2767(❧)，直接当文本会渲染成方块（tofu），
              // 故改画一个对齐 accent 色的小花饰：中心菱形 + 两侧卷叶。
              {
                type: "svg",
                props: {
                  width: 64,
                  height: 40,
                  viewBox: "0 0 64 40",
                  style: { marginBottom: "14px" },
                  children: [
                    {
                      type: "path",
                      props: {
                        d: "M32 6 L40 20 L32 34 L24 20 Z",
                        fill: ACCENT,
                      },
                    },
                    {
                      type: "path",
                      props: {
                        d: "M22 20 C12 20 6 14 2 20 C6 26 12 20 22 20 Z",
                        fill: ACCENT,
                      },
                    },
                    {
                      type: "path",
                      props: {
                        d: "M42 20 C52 20 58 14 62 20 C58 26 52 20 42 20 Z",
                        fill: ACCENT,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: `${tSize}px`,
                    fontWeight: 700,
                    color: INK,
                    lineHeight: 1.15,
                    letterSpacing: "0.02em",
                  },
                  children: title,
                },
              },
              subtitle
                ? {
                    type: "div",
                    props: {
                      style: {
                        marginTop: "24px",
                        fontSize: "32px",
                        fontWeight: 400,
                        fontFamily: "Noto Sans SC",
                        color: MUTED,
                        lineHeight: 1.4,
                      },
                      children: subtitle,
                    },
                  }
                : null,
            ],
          },
        },
        // 右下翻起折角 dog-ear：阴影 + 翻起三角面
        // 阴影（折角投在书页上的暗影）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: "28px",
              bottom: "28px",
              width: "0px",
              height: "0px",
              borderLeft: "72px solid transparent",
              borderBottom: `72px solid rgba(0,0,0,0.10)`,
            },
          },
        },
        // 翻起的折角面（纸背色）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              right: "28px",
              bottom: "28px",
              width: "0px",
              height: "0px",
              borderLeft: "64px solid transparent",
              borderBottom: `64px solid ${DOGEAR}`,
            },
          },
        },
      ],
    },
  };

  const svg = await satori(vnode as any, {
    width: WIDTH,
    height: HEIGHT,
    fonts: getOgFonts().map((f) => ({
      name: f.name,
      data: f.data,
      weight: f.weight,
      style: f.style,
    })),
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  });
  const png = resvg.render().asPng();
  return new Uint8Array(png);
}
