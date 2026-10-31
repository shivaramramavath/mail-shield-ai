const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export type Prediction = {
  label: "spam" | "ham";
  spamProbability: number;
  hamProbability: number;
  durationMs: number;
  modelVersion?: string | null;
};
export type Overview = { total: number; spam: number; ham: number; avgDurationMs: number };
export type RecentAnalysis = {
  id: string; label: "spam" | "ham"; spamProbability: number; durationMs: number; createdAt: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api/v1/${path}`, {
      ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store",
    });
  } catch {
    throw new Error(`Cannot reach the MailShield API at ${API_BASE_URL}. Check that NestJS is running and the URL is correct.`);
  }
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null
      ? (Array.isArray(payload.message) ? payload.message.join(", ") : payload.message || payload.error)
      : payload;
    throw new Error(String(message || `Request failed with HTTP ${response.status}`));
  }
  return payload as T;
}
function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}
export const mailshieldApi = {
  analyze: (text: string) => post<Prediction>("email/analyze", { text }),
  generate: (prompt: string, tone: string, length: string) => post<{ content: string }>("email/generate", { prompt, tone, length }),
  improve: (text: string) => post<{ content: string }>("email/improve", { text }),
  securityScan: (text: string) => post<{ report: string }>("email/security-scan", { text }),
  batchAnalyze: (emails: string[]) => post<{ total: number; results: Array<(Prediction & { index: number }) | { index: number; error: string }> }>("email/batch-analyze", { emails }),
  overview: () => request<Overview>("analytics/overview"),
  recent: () => request<RecentAnalysis[]>("analytics/recent"),
};
