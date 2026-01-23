import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">
        Welcome to React + Shadcn/ui
      </h1>
      <Button onClick={() => alert("Hello Shadcn!")}>Click me</Button>
    </div>
  )
}

export default App
