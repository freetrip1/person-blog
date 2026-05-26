# Freetrip · 个人博客

一本可以翻阅的"个人之书"。整站以翻页书（Flipbook）为隐喻：导航是目录，子页面是章节，每页有页码，底部有"第一卷"的卷标。

- 在线访问：<https://freetrip.vercel.app>
- 仓库：<https://github.com/freetrip1/person-blog>

## 设计概念

整体视觉以纸面手工排版为基础：

- **配色**：暖米黄 `#f5f0e8`（白天）/ 近黑 `#0a0908`（夜晚），点缀色 `#8b7355` / `#c4a87a`
- **字体**：Noto Serif SC（标题、卷标）、Noto Sans SC（正文）
- **纹理**：固定全屏的 SVG fractal noise + 细密斜纹，模拟纸张颗粒
- **目录**：罗马数字页码 + 点线 leader（来自传统书籍排版）
- **装饰符**：❧（rotated fleuron，传统书页装饰）

## 技术栈

| 层 | 工具 |
| --- | --- |
| 框架 | [Astro](https://astro.build/) 6.1.9 |
| 路由动画 | Astro `ClientRouter`（View Transitions） |
| 评论 / 友链申请 | [Giscus](https://giscus.app/)（基于 GitHub Discussions） |
| 音乐播放 | [APlayer](https://aplayer.js.org/) + Meting API（网易云） |
| 部署 | [Vercel](https://vercel.com/)（push 到 master 自动上线） |
| Node | ≥ 22.12.0 |

## 目录结构

```
src/
├── pages/
│   ├── index.astro            # 首页：名字 + 装饰符 + 目录 + 卷标
│   ├── about.astro            # 关于 (i)
│   ├── work.astro             # 作品集 (ii)
│   ├── blog/
│   │   ├── index.astro        # 想法目录 (iii)
│   │   └── [...slug].astro    # 博文动态路由
│   ├── wander.astro           # 漫游 (iv)
│   ├── archive.astro          # 档案 (v)
│   ├── friends.astro          # 友链 (vi)
│   └── 404.astro              # 撕页 404
├── layouts/
│   └── Base.astro             # 全局 layout：head + ClientRouter + 主题 + 黑胶播放器
├── components/
│   ├── TableOfContents.astro  # 首页目录（罗马数字 + 点线 + 入场动画）
│   ├── BottomNav.astro        # 子页面底部导航 + 社交链接
│   ├── ThemeToggle.astro      # ☀ / ☾ 切换按钮，日落月升动画
│   ├── VinylPlayer.astro      # 顶部下垂的黑胶唱片 + 控制条
│   └── Giscus.astro           # GitHub Discussions 评论嵌入
├── styles/
│   └── global.css             # 设计 token、入场动画、TOC、主题切换闪屏修复
└── data/
    └── links.json             # 友链列表（由 GitHub Action 维护状态）

public/
├── giscus-light.css           # Giscus 评论区白天主题（暖纸面色）
└── giscus-dark.css            # Giscus 评论区黑夜主题

.github/workflows/
└── check-friends.yml          # 每日 03:00（北京时间）双向检测友链状态

scripts/
└── check-links.js             # 友链检测脚本（被 workflow 调用）
```

## 主要特性

### 主题系统

- **三态切换**：用户选择（localStorage）→ 时段自动（早 6 - 晚 6 白天，其余黑夜）→ 默认
- **图标动画**：点切换按钮时，太阳向下沉、月亮升起来（或反向），0.65s `cubic-bezier(0.65, 0, 0.35, 1)`
- **抗闪屏机制**：
  - 切换瞬间在 `<html>` 加 `.theme-switching` 类，全局禁用 transition，避免颜色经过灰色帧
  - 但保留 `.icon-sun` / `.icon-moon` 的 transition，让日落月升动画能完整播完
  - `astro:before-swap` 给即将插入的新文档预先打上 `data-theme`，避免 ClientRouter 切页时白闪

### 入场动画（仅首页）

名字 → ❧ 装饰符 → 6 个目录项 → 卷标，依次淡入上浮，整体 ~0.8s 完成。子页面已去掉入场动画避免每次切页都"加载感"。

通过 `astro:after-swap` 在切页后手动移除并重新添加 `.page-enter` 类，强制 CSS 动画重新播放。

### TOC hover（翻书感）

- 文字向左滑 6px、变暖色
- 点线背景密度收紧（18px → 11px），有"拉伸"感
- 右侧页码同步亮起
- 子页面 BottomNav 也复用同一套样式（dots 用 8px 适配更小的 svg）

### 时辰问候

首页身份栏 `晨 / 午 / 暮 / 夜 ── 开发者 / 创作者`，根据访问时间动态显示对应字（5-11 晨 / 11-17 午 / 17-21 暮 / 其余 夜）。

### 名字交互

首页 `Freetrip` 标题 hover 时字距展开 0.06em、颜色转 accent。同时通过 CSS `:has()` 与黑胶唱片 hover 联动——hover 唱片区域时名字也展开，反之亦然。

### 黑胶唱片

- 顶部下垂 220px，桌面端 hover 显露唱片 + 出现控制条（播放、上下首、音量）
- 唱片状态（播放进度、音量、当前歌曲）通过 `window._vinylState` 在 ClientRouter 切页后持久化
- 切歌时新唱片从上方滑入、旧唱片淡出
- **点击穿透修复**：`.vinyl-wrap` 设 `pointer-events: none`，只让 `.vinyl-record` 和 `.vinyl-controls` 接收点击；子页面 `.page-top` 设 `z-index: 101` 高于唱片，确保"← 返回"始终可点
- **触屏适配**：`@media (hover: none)` 下唱片默认半透明可见、控制条常驻显示（不依赖 hover）
- **窄屏缩放**：`@media (max-width: 480px)` 唱片 `scale(0.6)` 避免溢出小屏

### 404 撕页

整页背景变成"桌面"色，中央漂浮一张带 SVG `feTurbulence` 扰动出有机撕痕的纸张，4 个边都是不规则裂口，带 drop-shadow。

### Giscus 自定义主题

`public/giscus-light.css` 和 `public/giscus-dark.css` 用站点 token 复刻 Giscus 的全套 GitHub Primer 变量，让评论区底色和你的纸面色一致：
- 主面板背景 = 站点 `--bg`
- 主按钮背景 = 站点 `--accent`（暖棕色，不是 GitHub 的绿色）
- 边框、按钮 hover、分段控件全套和谐到暖色调

主题切换时通过 `postMessage` 向 iframe 发送新 URL，Giscus 自动重新加载。

**dev 限制**：本地 HTTP 下 giscus.app（HTTPS） iframe 因 mixed content 无法加载自定义 CSS，组件自动回退到内置 `light` / `dark` 主题。**生产 HTTPS** 部署后自动启用自定义主题。

### 友链系统

- 访问者在 `/friends` 页面通过 Giscus 提交申请（写在 GitHub Discussion 里）
- 维护者 Approve → 手工添加到 `src/data/links.json`
- 每天凌晨 GitHub Action 跑 `scripts/check-links.js`，自动检测对方是否还挂着我方链接，更新状态字段

## 本地开发

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # 输出到 ./dist
npm run preview  # 预览 build 产物
```

## 部署

push 到 `master` 分支即触发 Vercel 自动部署。

新功能建议在 `feature/*` 分支开发，验证无误后合并到 master。

## 已知怪点

- **Vite HMR 偶尔卡 CSS 缓存**：改 CSS 看不到效果时，**重启 dev server + 浏览器硬刷新**通常解决
- **View Transitions 在 Safari 15.4 以下**退化为即时切换（无 cross-fade）
- **Giscus 自定义主题在 dev 下被 mixed content 拦截**：本地用内置主题，生产 HTTPS 用自定义
- **APlayer 依赖第三方 Meting API**（`api.injahow.cn` / `meting.qjqq.cn` / `api.i-meto.com`），三个公益接口可能同时挂掉，唱片会转但不发声；长期方案是自建 Meting API 到 Vercel serverless

## License

私人项目，未声明开源协议。如需借鉴代码或设计，请联系作者。
