// 从 GitHub Discussions（Mutual Links category）抓取友链申请，写入 src/data/links.json
// 期望评论格式：
//   名称：xxx
//   地址：https://xxx
//   描述：xxx
// 由 .github/workflows/check-friends.yml 调用，每日凌晨执行

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const linksFilePath = path.resolve(__dirname, "../src/data/links.json");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "freetrip1";
const REPO_NAME = "person-blog";
const CATEGORY_NAME = "Mutual Links";

if (!GITHUB_TOKEN) {
  console.error("缺少 GITHUB_TOKEN 环境变量");
  process.exit(1);
}

async function gql(query, variables) {
  const resp = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "freetrip-friends-sync",
    },
    body: JSON.stringify({ query, variables }),
  });
  const data = await resp.json();
  if (data.errors) {
    throw new Error("GraphQL 错误: " + JSON.stringify(data.errors));
  }
  return data.data;
}

async function getCategoryId() {
  const data = await gql(
    `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        discussionCategories(first: 25) {
          nodes { id name }
        }
      }
    }`,
    { owner: REPO_OWNER, name: REPO_NAME }
  );
  const cat = data.repository.discussionCategories.nodes.find(
    (c) => c.name === CATEGORY_NAME
  );
  if (!cat) throw new Error(`未找到分类 "${CATEGORY_NAME}"`);
  return cat.id;
}

async function fetchDiscussions(categoryId) {
  const data = await gql(
    `query($owner: String!, $name: String!, $categoryId: ID!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 50, categoryId: $categoryId, orderBy: {field: CREATED_AT, direction: DESC}) {
          nodes {
            id
            title
            body
            url
            createdAt
            author { login }
            comments(first: 100) {
              nodes {
                id
                body
                createdAt
                author { login }
              }
            }
          }
        }
      }
    }`,
    { owner: REPO_OWNER, name: REPO_NAME, categoryId }
  );
  return data.repository.discussions.nodes;
}

function parseApplication(text) {
  if (!text) return null;
  const nameMatch = text.match(/名称\s*[：:]\s*(.+)/);
  const urlMatch = text.match(/地址\s*[：:]\s*(\S+)/);
  const descMatch = text.match(/描述\s*[：:]\s*(.+)/);
  if (!nameMatch || !urlMatch || !descMatch) return null;
  const url = urlMatch[1].trim().replace(/[\s,，;。]+$/, "");
  if (!/^https?:\/\//i.test(url)) return null;
  return {
    name: nameMatch[1].trim(),
    url,
    desc: descMatch[1].trim(),
  };
}

function normalizeUrl(url) {
  return url.replace(/\/+$/, "").toLowerCase();
}

async function detectLinkPage(baseUrl) {
  const candidates = ["/friends", "/links", "/friend", "/blogroll", "/friendship"];
  for (const p of candidates) {
    try {
      const u = new URL(p, baseUrl).toString();
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const resp = await fetch(u, {
        headers: { "User-Agent": "freetrip-friends-sync/1.0" },
        signal: ctrl.signal,
        redirect: "follow",
      });
      clearTimeout(t);
      if (resp.ok) {
        console.log(`  友链页探测到: ${u}`);
        return u;
      }
    } catch {}
  }
  console.log(`  没找到友链页，回退到首页: ${baseUrl}`);
  return baseUrl;
}

async function main() {
  const linksData = JSON.parse(fs.readFileSync(linksFilePath, "utf-8"));
  const existingUrls = new Set(linksData.map((l) => normalizeUrl(l.url)));

  console.log(`已有 ${linksData.length} 条友链`);

  const categoryId = await getCategoryId();
  const discussions = await fetchDiscussions(categoryId);
  console.log(`抓到 ${discussions.length} 条 Discussion`);

  let added = 0;

  for (const disc of discussions) {
    // 1. 检查 Discussion body
    const bodyApp = parseApplication(disc.body);
    if (bodyApp && !existingUrls.has(normalizeUrl(bodyApp.url))) {
      console.log(`新申请（body）: ${bodyApp.name} <${bodyApp.url}>`);
      const linkPage = await detectLinkPage(bodyApp.url);
      linksData.push({
        ...bodyApp,
        linkPage,
        status: "pending",
        author: disc.author?.login || "",
        sourceUrl: disc.url,
        addedAt: new Date().toISOString().slice(0, 10),
      });
      existingUrls.add(normalizeUrl(bodyApp.url));
      added++;
    }

    // 2. 检查每条评论
    for (const c of disc.comments.nodes) {
      const app = parseApplication(c.body);
      if (!app) continue;
      if (existingUrls.has(normalizeUrl(app.url))) continue;
      console.log(`新申请（评论 by @${c.author?.login}）: ${app.name} <${app.url}>`);
      const linkPage = await detectLinkPage(app.url);
      linksData.push({
        ...app,
        linkPage,
        status: "pending",
        author: c.author?.login || "",
        sourceUrl: disc.url,
        addedAt: new Date().toISOString().slice(0, 10),
      });
      existingUrls.add(normalizeUrl(app.url));
      added++;
    }
  }

  if (added > 0) {
    fs.writeFileSync(linksFilePath, JSON.stringify(linksData, null, 2) + "\n");
    console.log(`新增 ${added} 条友链申请，已写入 links.json`);
  } else {
    console.log("没有新的友链申请");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
