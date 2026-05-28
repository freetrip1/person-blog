---
alphaId: "VkXk8geV"
title: "分析师 EPS 一致预期反应因子"
date: 2026-05-28
featured: true
order: 1
tags: ["分析师预期", "EPS", "MEA", "Delay-1"]
problem: "中东与非洲（MEA）市场分析师覆盖稀薄、数据噪声大，单日分析师高位 EPS 一致预期常常跳变、缺失，难以直接当信号用。能否把这个本来「脏」的分析师预期序列，加工成一个稳定、可持有、换手又低的横截面 alpha？"
intuition: "分析师对一只股票的盈利预期上修，本质上是「专业资金尚未完全定价的乐观信息」的代理。预期被持续上调的公司，往往在随后的窗口里跑赢——这是经典的盈利预期漂移（earnings expectation drift）。把高位 EPS 一致预期在向量维度求均值、并在长窗口上做时序回填与缩放后，提取的就是这股「被低估的乐观」。"
method: "ts_scale(winsorize(ts_backfill(vec_avg(analyst_consensus_high_eps), 120), std=4), 66)。先 vec_avg 把多分析师的高位 EPS 预期压成单值；ts_backfill 120 天回填缺失（MEA 数据稀疏的关键一步）；winsorize std=4 削峰去极端值；最后 ts_scale 66 个交易日做时序归一，得到一个换手温和（约 7.7%）的横截面信号。区域 MEA、宇宙 TOP300、delay-1、子行业中性化（SUBINDUSTRY）。"
biasMitigation: "三层防过拟合：(1) winsorize 抑制少数极端预期主导信号，降低 outlier 驱动的虚高 Sharpe；(2) 子行业中性化剥离行业 beta，确保 alpha 来自个股选择而非押注某行业；(3) delay-1 用滞后一日数据，杜绝用当日未来信息的前视偏差。换手刻意压到 ~7.7%，避免靠高频交易刷出的、扣费后不成立的纸面收益。"
takeaway: "这条 alpha 最诚实的一课写在 2016：当年 Sharpe 只有 0.07、回撤拉到 12.8%（也是整条曲线的最大回撤），分析师预期信号那一年几乎失灵。但因为换手低、做过中性化，它没有崩盘式亏损，而是「平到接近零」后在 2017、2021、2023 重新跑出 2+ 乃至 3.31 的年度 Sharpe。结论：稀疏市场里的分析师预期因子有效，但有明确的「失灵年」，靠的是低换手 + 中性化撑过去，而不是靠它每年都灵。"
---

## 备注

PnL 曲线、年度统计与下方风险指标均来自 WorldQuant BRAIN 的真实回测（alphaId `VkXk8geV`，OS 阶段），构建期由 `src/data/alphas.json` join 进本页。

> 数据为某次 Agent 会话从 BRAIN 烘焙的快照（见 `alphas.json` 的 `fetchedAt`）。BRAIN 实时 API 仅在 Agent 会话可用，CI / Vercel 构建无凭证，故采用「缓存快照」模式。
