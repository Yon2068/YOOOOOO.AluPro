import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Sparkles, ChevronLeft, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: Date;
};

export default function AiChat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load
  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    } else {
      // Welcome message
      setMessages([
        {
          id: "welcome",
          role: "ai",
          content: "你好！我是你的 AI 助手。有什么我可以帮你的吗？你可以问我关于铝型材设计、模型制作或者其他任何问题。",
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: `收到你的问题：“${text}”。\n\n这是一个模拟的 AI 回复。在实际应用中，这里会连接到后端的大模型接口，为您提供专业的铝型材行业解答、设计建议或模型生成服务。\n\n目前你可以尝试问我更多关于 AluPro 平台的问题！`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center px-4 h-14 border-b shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h1 className="font-semibold text-lg">AI 智能助手</h1>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%] md:max-w-[70%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <Avatar className={cn("h-8 w-8 shrink-0", msg.role === "ai" ? "bg-primary/10" : "bg-muted")}>
                {msg.role === "ai" ? (
                  <div className="flex items-center justify-center w-full h-full text-primary">
                    <Bot className="h-5 w-5" />
                  </div>
                ) : (
                  <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                )}
              </Avatar>
              
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-card border border-border rounded-tl-sm"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 max-w-[85%]"
          >
            <Avatar className="h-8 w-8 shrink-0 bg-primary/10">
              <div className="flex items-center justify-center w-full h-full text-primary">
                <Bot className="h-5 w-5" />
              </div>
            </Avatar>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 h-[46px]">
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-muted/50 rounded-3xl border border-input focus-within:ring-1 focus-within:ring-ring focus-within:border-primary transition-all p-2 pl-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你想问的问题..."
            className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[24px] py-3 text-sm scrollbar-hide outline-none"
            rows={1}
            style={{ height: "auto", minHeight: "44px" }}
          />
          <Button 
            size="icon" 
            className={cn(
              "rounded-full h-10 w-10 shrink-0 transition-all", 
              input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30"
            )}
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
          >
            {isTyping ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5 ml-0.5" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          AI 生成的内容可能包含错误，请注意甄别。
        </p>
      </div>
    </div>
  );
}