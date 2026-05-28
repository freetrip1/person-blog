import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// refresh-alphas.js — 本地/CI 自检脚本：校验 src/data/alphas.json 每条记录
// 的 schema 完整、PnL 非空。缺失只 console.warn 报警，**绝不清空 / 改写文件**。
//
// 注意：本脚本【不调用 BRAIN】。BRAIN 实时 API（get_user_alphas /
// get_alpha_pnl / get_alpha_yearly_stats / get_alpha_details）只在 Claude Code
// / Agent 会话可用，GitHub Actions 与 Vercel 构建环境无凭证。真实数据刷新流程：
//
//   TODO[BRAIN]: 在能访问 BRAIN MCP 的 Agent 会话里执行——
//     1. get_user_alphas(stage="OS", order="-dateSubmitted") 选旗舰 alphaId
//     2. 对每个 id：get_alpha_details（取 is.sharpe/turnover/drawdown/
//        fitness/returns/margin）、get_alpha_yearly_stats、get_alpha_pnl
//     3. 按下方 schema 落盘覆盖 src/data/alphas.json，提交 PR
//   本脚本仅在那之后做一致性校验，不替代抓取。

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "..", "src", "data", "alphas.json");

function fail(msg) {
  console.warn(`[refresh-alphas] ⚠ ${msg}`);
}

let raw;
try {
  raw = fs.readFileSync(dataPath, "utf-8");
} catch (e) {
  fail(`无法读取 ${dataPath}: ${e.message}`);
  process.exit(0); // 不阻断 CI；缺文件由构建期 import 报错兜底
}

let alphas;
try {
  alphas = JSON.parse(raw);
} catch (e) {
  fail(`alphas.json 不是合法 JSON: ${e.message}`);
  process.exit(1); // 非法 JSON 会让 Astro 构建直接失败，提前拦下
}

if (!Array.isArray(alphas)) {
  fail("alphas.json 顶层应为数组");
  process.exit(1);
}

let warnings = 0;
const STAT_KEYS = ["sharpe", "turnover", "maxDrawdown", "fitness", "returns"];

alphas.forEach((a, i) => {
  const tag = a.alphaId ? `alphaId=${a.alphaId}` : `index ${i}`;
  if (!a.alphaId) {
    fail(`第 ${i} 条缺 alphaId`);
    warnings++;
  }
  if (!a.stats || typeof a.stats !== "object") {
    fail(`${tag} 缺 stats 对象`);
    warnings++;
  } else {
    STAT_KEYS.forEach((k) => {
      if (a.stats[k] == null) {
        fail(`${tag} stats.${k} 缺失或为 null`);
        warnings++;
      }
    });
  }
  if (!Array.isArray(a.pnl) || a.pnl.length === 0) {
    fail(`${tag} pnl 为空——PnL 图将渲染占位条`);
    warnings++;
  }
  if (!Array.isArray(a.yearly) || a.yearly.length === 0) {
    fail(`${tag} yearly 为空——年度表将不渲染`);
    warnings++;
  }
  if (!a.fetchedAt) {
    fail(`${tag} 缺 fetchedAt 时间戳`);
    warnings++;
  }
});

if (warnings === 0) {
  console.log(
    `[refresh-alphas] ✓ 校验通过：${alphas.length} 条 alpha 记录 schema 完整。`,
  );
} else {
  console.log(
    `[refresh-alphas] 完成校验：${alphas.length} 条记录，${warnings} 处警告（文件未改动）。`,
  );
}
