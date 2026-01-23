import { Link, useLocation } from "react-router-dom"
import { Home, Box, FileText, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const location = useLocation()
  const path = location.pathname

  const navItems = [
    { name: "首页", icon: Home, path: "/" },
    { name: "模型", icon: Box, path: "/models" },
    { name: "内容", icon: FileText, path: "/content" },
    { name: "我的", icon: User, path: "/profile" },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-4rem)] max-w-xs">
      <div className="flex items-center justify-between bg-background/80 backdrop-blur-xl border border-border/50 rounded-full px-4 py-1.5 shadow-2xl ring-1 ring-black/5">
        {navItems.map((item) => {
          const isActive = path === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "fill-current" : "")} />
              {isActive && (
                <span className="absolute -bottom-8 text-[10px] font-bold text-primary opacity-0 pointer-events-none transition-opacity duration-300">
                  {item.name}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
