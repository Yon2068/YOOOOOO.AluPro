import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Heart, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAppSelector } from "@/store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type FavoriteItem = {
  id: string; // favorite record id
  targetId: string; // model/content id
  title: string;
  cover: string;
  author: string;
  folder: string;
  date: string;
  type: "model" | "article" | "video";
};

export default function Favorites() {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("model");
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        // Assuming the API returns all favorites and we filter client-side, 
        // or supports type filtering. Let's try fetching all for now.
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/users/me/favorites`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await response.json();
        console.log("Favorites API response:", data);
        
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data && Array.isArray(data.data)) {
          list = data.data; // Handle wrapped response
        } else if (data.items && Array.isArray(data.items)) {
          list = data.items; // Handle paginated response
        }

        // Map backend data to frontend structure
        const mappedData: FavoriteItem[] = list.map((item: any) => {
          let type: "model" | "article" | "video" = "model";
          // Handle various type formats (int enum, string, etc)
          const rawType = String(item.type || item.itemType || "model").toLowerCase();
          
          if (rawType.includes("article") || rawType.includes("news")) type = "article";
          else if (rawType.includes("video")) type = "video";
          // Default to model for other cases
          
          return {
            id: item.id,
            targetId: (() => {
              // Priority 1: Explicit target ID fields
              let tid = item.targetId || item.modelId || item.contentId;
              
              // Priority 2: If no explicit target ID, use item.id but clean it
              if (!tid) {
                tid = item.id;
              }

              // Always clean the ID to ensure it's a valid UUID if possible
              if (tid && typeof tid === 'string') {
                // Check if it contains a UUID
                const uuidMatch = tid.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
                if (uuidMatch) {
                  return uuidMatch[0]; // Return the raw UUID
                }
                // Fallback: strip known prefixes
                return tid.replace(/^(fav-model-|fav-article-|fav-video-|fav-)/, "");
              }
              return tid || "";
            })(),
            title: item.title || item.modelTitle || "未命名",
            cover: item.cover || item.modelCover || "",
            author: item.authorName || item.author || "Unknown",
            folder: item.folder || "默认收藏夹",
            date: item.createTime || item.date || "Unknown",
            type: type,
          };
        });
        
        setItems(mappedData);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError("无法加载收藏内容");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Filter items based on active tab
  const filteredItems = items.filter(item => {
    if (activeTab === "model") return item.type === "model";
    return item.type === "article" || item.type === "video";
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-secondary/50 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">收藏夹</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
            管理
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-4">
        <Tabs defaultValue="model" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 bg-muted/50 p-1 rounded-full">
            <TabsTrigger value="model" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">模型资源</TabsTrigger>
            <TabsTrigger value="content" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">文章视频</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">
            {error}
            <Button variant="link" onClick={() => window.location.reload()} className="block mx-auto mt-2">
              重试
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无收藏内容
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="group relative flex flex-col gap-2 p-2 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => navigate(item.type === "model" ? `/models/${item.targetId}` : `/content/${item.type}/${item.targetId}`)}
              >
                {/* Thumbnail */}
                <div className="aspect-[4/3] w-full rounded-lg bg-muted overflow-hidden border border-border/30 relative">
                  <img 
                    src={item.cover} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                     <div className="h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-red-500 shadow-sm">
                       <Heart className="h-3.5 w-3.5 fill-current" />
                     </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 px-1 pb-1">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span 
                      className="truncate max-w-[80px] cursor-pointer hover:text-foreground hover:underline transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // navigate("/author/1"); // TODO: Add author ID if available
                      }}
                    >
                      {item.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      {item.folder}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
