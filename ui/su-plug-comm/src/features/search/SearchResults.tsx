import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Download, FileText, PlayCircle, Box } from "lucide-react";
import { cn } from "@/lib/utils";

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

type ContentStats = {
  likes: number;
  views: number;
  comments: number;
};

type ContentItem = {
  id: string;
  type: string;
  title: string;
  cover: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  stats: ContentStats;
  summary?: string;
  duration?: string;
};

type UnifiedItem = {
  type: "model" | "article" | "video";
  originalData: ModelCard | ContentItem;
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const navigate = useNavigate();
  
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!q) return;

    const load = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(q)}`);
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const data = await response.json();
        const models: ModelCard[] = data.models || [];
        const contents: ContentItem[] = data.contents || [];

        const unifiedModels: UnifiedItem[] = models.map(m => ({
          type: "model",
          originalData: m
        }));

        const unifiedContents: UnifiedItem[] = contents.map(c => ({
          type: c.type as "article" | "video",
          originalData: c
        }));

        // Combine and shuffle slightly to mix them, or just interleave
        // Simple concatenation for now, but in real world maybe sort by relevance or date
        // Let's interleave them for better "mix" feeling
        const combined: UnifiedItem[] = [];
        const maxLength = Math.max(unifiedModels.length, unifiedContents.length);
        for (let i = 0; i < maxLength; i++) {
          if (i < unifiedModels.length) combined.push(unifiedModels[i]);
          if (i < unifiedContents.length) combined.push(unifiedContents[i]);
        }
        
        setItems(combined);
      } catch (error) {
        console.error(error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [q]);

  const handleItemClick = (item: UnifiedItem) => {
    if (item.type === "model") {
      navigate(`/models/${(item.originalData as ModelCard).id}`);
    } else if (item.type === "video") {
      navigate(`/content/video/${(item.originalData as ContentItem).id}`);
    } else {
      navigate(`/content/article/${(item.originalData as ContentItem).id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        正在搜索...
      </div>
    );
  }

  if (!q) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        请输入搜索关键词
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
        未找到相关内容
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-24">
      <h1 className="text-2xl font-bold">搜索结果: "{q}" ({items.length})</h1>

      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 md:gap-6 space-y-4 md:space-y-6">
        {items.map((item, index) => {
          const data = item.originalData;
          const isModel = item.type === "model";
          
          // Normalized fields
          const title = data.title;
          const cover = data.cover;
          const authorName = isModel ? (data as ModelCard).author.name : (data as ContentItem).authorName;
          const authorAvatar = isModel ? (data as ModelCard).author.avatar : (data as ContentItem).authorAvatar;
          
          return (
            <div key={`${item.type}-${data.id}-${index}`} className="break-inside-avoid pb-4 md:pb-0">
              <div 
                className="group cursor-pointer space-y-3"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted">
                  <img
                    src={cover}
                    alt={title}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ aspectRatio: item.type === "video" ? "9/16" : "4/3" }}
                  />
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-0 text-xs font-medium shadow-sm flex items-center gap-1">
                      {item.type === "model" ? <Box className="h-3 w-3" /> : 
                       item.type === "video" ? <PlayCircle className="h-3 w-3" /> : 
                       <FileText className="h-3 w-3" />}
                      {item.type === "model" ? "模型" : 
                       item.type === "video" ? "视频" : "文章"}
                    </Badge>
                    
                    {isModel && (data as ModelCard).isHot && (
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-0 text-xs font-medium shadow-sm text-orange-500">
                        HOT
                      </Badge>
                    )}
                  </div>

                  {item.type === "video" && (data as ContentItem).duration && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded font-mono">
                      {(data as ContentItem).duration}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2 px-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                      {title}
                    </h3>
                    {isModel && (data as ModelCard).isFree && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-green-200 text-green-700 bg-green-50 shrink-0">
                        FREE
                      </Badge>
                    )}
                  </div>
                  
                  {!isModel && item.type === "article" && (data as ContentItem).summary && (
                    <p className="text-xs text-muted-foreground line-clamp-2 hidden md:block">
                      {(data as ContentItem).summary}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5 border border-border">
                        <AvatarImage src={authorAvatar} />
                        <AvatarFallback className="text-[9px]">
                          {authorName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                        {authorName}
                      </span>
                    </div>
                    
                    {isModel && (
                      <span className="flex items-center text-xs text-muted-foreground">
                        <Download className="h-3 w-3 mr-1" /> 1.2k
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
