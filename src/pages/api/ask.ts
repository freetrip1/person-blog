import type { APIRoute } from "astro";
import { systemPrompt } from "../../data/aboutContext";

// 服务端按需路由（非预渲染）——其余页面仍是静态。
export const prerender = false;

// DeepSeek 模型串：站主确认后改这一行即可。
// 注意：DeepSeek 官方常见有效名是 deepseek-chat / deepseek-reasoner；
// 若 "deepseek-v4-pro" 被接口拒绝，换成官方文档里的准确名。
const MODEL = "deepseek-chat";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MAX_Q_LEN = 500;

// 极简内存限流（best-effort）：同实例每 IP 8 秒最多 1 次。
// serverless 多实例不共享内存，严谨限流需 KV（Upstash 等），留作后续。
const lastHit = new Map<string, number>();

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const key =
    import.meta.env.DEEPSEEK_API_KEY ?? process.env.DEEPSEEK_API_KEY;
  if (!key) return json({ error: "服务未配置（缺少 API key）" }, 500);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "请求格式错误" }, 400);
  }
  const raw = (body as { question?: unknown })?.question;
  const question = typeof raw === "string" ? raw.trim() : "";
  if (!question) return json({ error: "请输入一个问题" }, 400);
  if (question.length > MAX_Q_LEN) return json({ error: "问题太长了" }, 400);

  // best-effort 限流
  const ip = clientAddress ?? "unknown";
  const now = Date.now();
  if (now - (lastHit.get(ip) ?? 0) < 8_000) {
    return json({ error: "问得太快啦，喘口气再问。" }, 429);
  }
  lastHit.set(ip, now);

  let upstream: Response;
  try {
    upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.6,
        max_tokens: 600,
        stream: true,
      }),
    });
  } catch {
    return json({ error: "请求模型失败，稍后再试。" }, 502);
  }

  if (!upstream.ok || !upstream.body) {
    const detail = upstream.ok ? "" : (await upstream.text()).slice(0, 200);
    return json({ error: "模型服务出错", detail }, 502);
  }

  // 把 DeepSeek 的 SSE 流解析成「纯文本增量」转发给前端，
  // 前端只需读纯文本、无需再解析 SSE。
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = upstream.body.getReader();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);
        if (!line.startsWith("data:")) continue;
        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          controller.close();
          return;
        }
        try {
          const obj = JSON.parse(data);
          const delta: string | undefined = obj?.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          /* 忽略心跳/非 JSON 行 */
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
