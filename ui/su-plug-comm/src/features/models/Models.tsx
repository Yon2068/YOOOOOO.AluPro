import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Download, Clock, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store";
import { showToast } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthorSummary = {
  id: string;
  name: string;
  avatar: string;
};

type ModelCard = {
  id: string;
  title: string;
  cover: string;
  author: AuthorSummary;
  isHot: boolean;
  isFree: boolean;
  isCollected: boolean;
  uploadTime: string;
  category: string;
};

export default function Models() {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("all");
  const [models, setModels] = useState<ModelCard[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const toggleCollection = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    if (!token) {
      navigate("/login");
      return;
    }

    setModels((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isCollected: !m.isCollected } : m
      )
    );
    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      const response = await fetch(`${API_BASE_URL}/models/${id}/favorite`, {
        method: "POST",
        headers,
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error("Failed to toggle favorite");
      }
      
      const json = await response.json();
      const result = json.data || json;
      
      if (result && typeof result.value === 'boolean') {
        setModels((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, isCollected: result.value } : m
          )
        );
      }
    } catch (error) {
      console.error("Toggle favorite failed:", error);
      setModels((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, isCollected: !m.isCollected } : m
        )
      );
      showToast("收藏操作失败，请重试", "error");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (activeTab !== "all") {
          params.set("category", activeTab);
        }
        if (search.trim()) {
          params.set("q", search.trim());
        }
        const query = params.toString();
        const response = await fetch(
          `${API_BASE_URL}/models${query ? `?${query}` : ""}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to load models");
        }
        const data: ModelCard[] = await response.json();
        setModels(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setModels([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [activeTab, search]);

  return (
    <div className="container mx-auto px-4 pt-8 md:pt-12 md:py-8 space-y-8 pb-24">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">模型库</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input 
              placeholder="搜索模型..." 
              className="pl-9 h-10 rounded-full bg-secondary/30 border-transparent hover:bg-secondary/50 focus:bg-background focus:border-border focus:ring-0 focus:shadow-sm transition-all duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full shrink-0 bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all duration-300">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs - Minimalist Capsule Style */}
      <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 no-scrollbar gap-2 h-auto">
          {["all", "furniture", "office", "exhibition", "example"].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="rounded-full px-5 py-2 border border-border bg-background data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground transition-all duration-200"
            >
              {tab === "all" ? "全部" : 
               tab === "furniture" ? "家具" :
               tab === "office" ? "办公" :
               tab === "exhibition" ? "展陈" : "样板"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading && models.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center text-sm text-muted-foreground py-8">
            正在加载模型...
          </div>
        )}
        {!isLoading && models.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center text-sm text-muted-foreground py-8">
            暂无模型数据
          </div>
        )}
        {models.map((model) => (
          <div
            key={model.id}
            className="group cursor-pointer space-y-3"
            onClick={() => navigate(`/models/${model.id}`)}
          >
            {/* Image Container */}
            <div className="aspect-[4/3] rounded-xl bg-muted relative overflow-hidden border border-border/50">
              <img
                src={model.cover}
                alt={model.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {model.isHot && (
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-0 text-xs font-medium shadow-sm">
                    HOT
                  </Badge>
                )}
              </div>

              {/* Hover Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="h-8 w-8 rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:bg-background"
                  onClick={(e) => toggleCollection(e, model.id)}
                >
                  <Heart className={cn("h-4 w-4", model.isCollected ? "fill-red-500 text-red-500" : "text-foreground")} />
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-1 px-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors flex-1">
                  {model.title}
                </h3>
                {model.isFree && (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-200 text-green-700 bg-green-50">
                    FREE
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <div 
                  className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/author/1`); // Mock author ID
                  }}
                >
                  <Avatar className="h-4 w-4 border border-border">
                    <AvatarImage src={model.author.avatar} />
                    <AvatarFallback className="text-[9px]">{model.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-[80px]">{model.author.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center">
                    <Download className="h-3 w-3 mr-1" /> 1.2k
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
