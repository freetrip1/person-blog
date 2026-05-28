// og-cards：satori 字体加载器。
// satori 无法用 CSS @font-face，必须把原始字体字节（TTF/OTF）传给它，
// 因此这里在构建期用 fs 读本地 public/fonts/ 下的静态字体文件成 Buffer 并缓存。
//
// 用的是静态权重的 OTF（NotoSerifSC-Bold/SemiBold、NotoSansSC-Regular），
// 不能用可变字体（VF.ttf）——satori 不支持 variable fonts，会渲染失败或回退方块。
//
// TODO(字体子集)：当前为全量中文 OTF（每个约 8–12MB），构建期读入内存不影响产物，
//   但仓库体积偏大。后续可用 fonttools/pyftsubset 按站内实际用字做子集压缩，
//   或换成 satori 接受的 TTF 子集，文件名与 weight 映射保持不变即可。

import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 600 | 700;
  style: "normal";
}

// 用 process.cwd()（= 项目根，astro build 的工作目录）拼出 public/fonts/。
// 不能用相对 import.meta.url：构建期本模块会被打包进 dist/.prerender/chunks/，
// 相对路径会指向 dist 内不存在的位置（实测 ENOENT）。cwd 才稳定指向源仓库根。
function fontPath(file: string): string {
  return join(process.cwd(), "public", "fonts", file);
}

// 模块级缓存：getStaticPaths 会为每条路由调用 renderOgPng，字体只需读一次。
let cached: OgFont[] | null = null;

/**
 * 返回 satori 所需的字体数组。
 * - Noto Serif SC 700：OG 卡标题（kicker / 大标题 / 罗马数字页码）。
 * - Noto Serif SC 600：备用半粗（satori 会就近匹配 weight）。
 * - Noto Sans SC 400：副标题 / 描述正文。
 *
 * 字体名统一用 "Noto Serif SC" / "Noto Sans SC"，与 og-template 里
 * fontFamily 引用保持一致。
 */
export function getOgFonts(): OgFont[] {
  if (cached) return cached;

  cached = [
    {
      name: "Noto Serif SC",
      data: readFileSync(fontPath("NotoSerifSC-Bold.otf")),
      weight: 700,
      style: "normal",
    },
    {
      name: "Noto Serif SC",
      data: readFileSync(fontPath("NotoSerifSC-SemiBold.otf")),
      weight: 600,
      style: "normal",
    },
    {
      name: "Noto Sans SC",
      data: readFileSync(fontPath("NotoSansSC-Regular.otf")),
      weight: 400,
      style: "normal",
    },
  ];

  return cached;
}
