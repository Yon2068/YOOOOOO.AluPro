import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"
import { Header } from "./Header"

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
