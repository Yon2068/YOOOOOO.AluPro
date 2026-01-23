import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, PlayCircle, FileText, MessageCircle, Share2, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ContentStats = {
  likes: number;
  views: number;
  comments: number;
};

type ContentItem = {
  id: string;
  type: "article" | "video";
  title: string;
  cover: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  stats: ContentStats;
  summary?: string | null;
  duration?: string | null;
};

export default function Content() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (activeTab === "articles") {
          params.set("type", "article");
        } else if (activeTab === "videos") {
          params.set("type", "video");
        }
        if (search.trim()) {
          params.set("q", search.trim());
        }
        const query = params.toString();
        const response = await fetch(
          `${API_BASE_URL}/contents${query ? `?${query}` : ""}`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Failed to load content");
        }
        const data: ContentItem[] = await response.json();
        setItems(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setItems([]);
          showToast("内容加载失败，请稍后重试", "error");
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

  const handleItemClick = (item: ContentItem) => {
    if (item.type === "video") {
      navigate(`/content/video/${item.id}`);
    } else {
      navigate(`/content/article/${item.id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-8 md:pt-12 md:py-8 space-y-8 pb-24">
       {/* Header & Search */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">精选内容</h1>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input 
              placeholder="搜索内容..." 
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

       {/* Tabs */}
       <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0 no-scrollbar gap-2 h-auto">
          {["all", "articles", "videos", "tutorials", "news"].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="rounded-full px-5 py-2 border border-border bg-background data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:border-foreground transition-all duration-200"
            >
              {tab === "all" ? "全部" : 
               tab === "articles" ? "文章" :
               tab === "videos" ? "视频" :
               tab === "tutorials" ? "教程" : "资讯"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      {/* Masonry-like grid using columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
        {isLoading && items.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center text-sm text-muted-foreground py-8">
            正在加载内容...
          </div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="col-span-2 md:col-span-3 lg:col-span-4 text-center text-sm text-muted-foreground py-8">
            暂无内容
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid pb-4 md:pb-0">
            <div 
              className="group cursor-pointer space-y-3"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ aspectRatio: item.type === "video" ? "9/16" : "16/9" }}
                />
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-0 text-xs font-medium shadow-sm flex items-center gap-1">
                    {item.type === "video" ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {item.type === "video" ? "视频" : "文章"}
                  </Badge>
                </div>

                {/* Video Duration */}
                {item.type === "video" && (
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                    {item.duration}
                  </div>
                )}

                 {/* Hover Overlay (Desktop) */}
                 <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"></div>
              </div>
              
              <div className="space-y-2 px-1">
                <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                
                {item.type === "article" && (
                  <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">
                    {item.summary}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/author/${item.authorId}`);
                    }}
                  >
                    <Avatar className="h-5 w-5 border border-border">
                      <AvatarImage src={item.authorAvatar} />
                      <AvatarFallback className="text-[9px]">
                        {item.authorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                      {item.authorName}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1 text-xs">
                      <Heart className="h-3 w-3" />
                      <span>{item.stats.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
