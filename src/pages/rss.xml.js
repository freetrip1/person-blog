// seo-foundation: blog 集合的 RSS 2.0 feed（构建期静态生成 /rss.xml）。
// site（context.site）来自 astro.config.mjs 的 site 字段，缺它会报错。
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { siteMeta } from "../data/siteMeta";

export async function GET(context) {
  // 与 blog/index.astro 一致：按 date 降序；date 可选，缺省以 0 兜底排序。
  const posts = (await getCollection("blog")).sort(
    (a, b) => (b.data.date?.getTime() ?? 0) - (a.data.date?.getTime() ?? 0)
  );

  return rss({
    title: siteMeta.siteName,
    description: siteMeta.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? "",
      // date 可能为 undefined，@astrojs/rss 会跳过该字段不报错。
      pubDate: post.data.date,
      link: `/blog/${post.id}`,
    })),
  });
}
