import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const linksFilePath = path.resolve(__dirname, "../src/data/links.json");

// 你的博客域名（匹配这些都算有效）
const MY_DOMAINS = ["freetrip.vercel.app", "freetrip1.github.io"];

async function checkLinks() {
  const linksData = JSON.parse(fs.readFileSync(linksFilePath, "utf-8"));

  if (linksData.length === 0) {
    console.log("友链列表为空，跳过检测");
    return;
  }

  let hasChanges = false;

  for (const link of linksData) {
    if (!link.linkPage) continue;
    // 手工标记的友链跳过双向检测（对方不一定有友链系统）
    if (link.manual === true) {
      console.log(`[跳过] ${link.name}: 手工标记 (manual:true)`);
      continue;
    }

    try {
      console.log(`检测: ${link.name} (${link.linkPage})`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(link.linkPage, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; freetrip-bot/1.0; +https://freetrip.vercel.app)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const isLinked = MY_DOMAINS.some((domain) => html.includes(domain));

      const newStatus = isLinked ? "active" : "invalid";
      if (link.status !== newStatus) {
        link.status = newStatus;
        hasChanges = true;
        console.log(`  [变更] ${link.name} → ${newStatus}`);
      } else {
        console.log(`  [通过] ${link.name}`);
      }
    } catch (error) {
      // 请求失败不修改状态，避免临时宕机误判
      console.log(`  [跳过] ${link.name}: ${error.message}`);
    }
  }

  if (hasChanges) {
    fs.writeFileSync(linksFilePath, JSON.stringify(linksData, null, 2) + "\n");
    console.log("友链状态已更新");
  } else {
    console.log("所有友链状态无变化");
  }
}

checkLinks();
