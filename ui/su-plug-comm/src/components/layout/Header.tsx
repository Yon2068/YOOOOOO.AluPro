import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { Home, Box, FileText, User, Search, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppSelector } from "@/store"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const path = location.pathname
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const [q, setQ] = useState(searchParams.get("q") || "")

  useEffect(() => {
    if (location.pathname === "/search") {
      setQ(searchParams.get("q") || "")
    } else {
      setQ("")
    }
  }, [location.pathname, searchParams])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    }
  }

  const navItems = [
    { name: "首页", icon: Home, path: "/" },
    { name: "模型库", icon: Box, path: "/models" },
    { name: "内容中心", icon: FileText, path: "/content" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Box className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">3D Hub</span>
            </Link>
            
            <nav className="flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    path === item.path ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-[200px] lg:max-w-[300px] hidden md:block">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="搜索模型..."
                className="w-full bg-muted pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Bell className="h-5 w-5" />
                </Button>
                <Link to="/profile">
                  <Avatar className="h-8 w-8 border hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.nickname[0]}</AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  登录
                </Button>
                <Button size="sm" onClick={() => navigate("/register")}>
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
