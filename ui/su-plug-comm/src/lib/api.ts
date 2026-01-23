const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type RequestOptions = {
  method?: string
  headers?: HeadersInit
  body?: unknown
  toastOnError?: boolean
}

const buildUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`

const withAuth = (headers: HeadersInit = {}) => {
  const token = localStorage.getItem("token")
  const h: Record<string, string> = { ...(headers as Record<string, string>) }
  if (token) {
    h["Authorization"] = `Bearer ${token}`
  }
  return h
}

type ToastDetail = { type: "error" | "success" | "info"; message: string }
const emitToast = (detail: ToastDetail) => {
  try {
    window.dispatchEvent(new CustomEvent<ToastDetail>("app:toast", { detail }))
  } catch {}
}

const parseErrorMessage = async (response: Response) => {
  let msg = "请求失败"
  const ct = response.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    try {
      const j = await response.json()
      msg = j.detail || j.message || j.title || msg
      return msg
    } catch {}
  }
  try {
    const t = await response.text()
    if (t) {
      try {
        const j = JSON.parse(t)
        msg = j.detail || j.message || j.title || msg
      } catch {
        msg = t
      }
    }
  } catch {}
  return msg
}

export const apiRequest = async <T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const method = options.method || "GET"
  const headers = withAuth(options.headers)
  let bodyInit: BodyInit | undefined
  if (options.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json"
    bodyInit =
      headers["Content-Type"] === "application/json"
        ? JSON.stringify(options.body)
        : (options.body as BodyInit)
  }
  const res = await fetch(buildUrl(path), { method, headers, body: bodyInit })
  if (!res.ok) {
    const msg = await parseErrorMessage(res)
    if (options.toastOnError !== false) {
      emitToast({ type: "error", message: msg })
    }
    throw new Error(msg)
  }
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    return (await res.json()) as T
  }
  return (await res.text()) as T
}

export const apiGet = async <T = unknown>(path: string) =>
  apiRequest<T>(path, { method: "GET" })

export const apiPost = async <T = unknown>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: "POST", body })

export const showToast = (message: string, type: "error" | "success" | "info" = "info") =>
  emitToast({ type, message })
