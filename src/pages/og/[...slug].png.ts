// og-cards：构建期静态 OG 图 endpoint。
// 产出 /og/<slug>.png：
//   - 固定页：home / about / work / blog / wander / archive / friends（来自 STATIC_OG_ROUTES）
//   - 集合详情：blog/<id> / projects/<id> / wander/<id>
// .png.ts 后缀让 Astro 把它识别为静态资源路径 /og/<slug>.png。
//
// 纯构建期生成（getStaticPaths 预渲染全部），零运行时成本，契合 Vercel 静态部署。

import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { renderOgPng } from "../../lib/og-template";
import { STATIC_OG_ROUTES } from "../../lib/og-routes";

type OgProps = {
  title: string;
  subtitle?: string;
  page: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  // 1) 固定页
  const staticPaths = STATIC_OG_ROUTES.map((r) => ({
    params: { slug: r.slug },
    props: { title: r.title, subtitle: r.subtitle, page: r.page } satisfies OgProps,
  }));

  // 2) 集合详情卡。沿用所属卷的罗马数字页码（方案 A）：blog=iii、projects=ii、wander=iv。
  //    subtitle 用记录的 description；缺省则不渲染（不能传 undefined 文本）。
  const blog = await getCollection("blog");
  const blogPaths = blog.map((post) => ({
    // 注意嵌套子目录：post.id 可能形如 "foo/bar"，slug 需保留层级。
    params: { slug: `blog/${post.id}` },
    props: {
      title: post.data.title,
      subtitle: post.data.description,
      page: "iii",
    } satisfies OgProps,
  }));

  const projects = await getCollection("projects");
  const projectPaths = projects.map((p) => ({
    params: { slug: `projects/${p.id}` },
    props: {
      title: p.data.title,
      subtitle: p.data.description,
      page: "ii",
    } satisfies OgProps,
  }));

  const wander = await getCollection("wander");
  const wanderPaths = wander.map((w) => ({
    params: { slug: `wander/${w.id}` },
    props: {
      title: w.data.title,
      subtitle: w.data.description,
      page: "iv",
    } satisfies OgProps,
  }));

  return [...staticPaths, ...blogPaths, ...projectPaths, ...wanderPaths];
};

export const GET: APIRoute = async ({ props }) => {
  const { title, subtitle, page } = props as OgProps;
  const png = await renderOgPng({ title, subtitle, page });

  return new Response(png as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      // 内容随构建不可变，长缓存。
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
