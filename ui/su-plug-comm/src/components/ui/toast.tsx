import { useEffect, useState } from "react"

type Toast = {
  id: number
  type: "error" | "success" | "info"
  message: string
}

type ToastDetail = { type: "error" | "success" | "info"; message: string }

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    let idSeq = 1
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail
      if (!detail) return
      const toast: Toast = { id: idSeq++, type: detail.type, message: detail.message }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }
    window.addEventListener("app:toast", handler as EventListener)
    return () => {
      window.removeEventListener("app:toast", handler as EventListener)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-md border px-4 py-3 shadow-sm bg-background ${
            t.type === "error"
              ? "border-red-300 text-red-700"
              : t.type === "success"
              ? "border-green-300 text-green-700"
              : "border-blue-300 text-blue-700"
          }`}
        >
          <div className="text-sm">{t.message}</div>
        </div>
      ))}
    </div>
  )
}
