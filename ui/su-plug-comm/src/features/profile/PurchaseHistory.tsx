import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type PurchaseRecord = {
  id: string;
  title: string;
  cover: string;
  author: string;
  price: string;
  date: string;
  type: string;
  modelId?: string;
};

export default function PurchaseHistory() {
  const navigate = useNavigate();
  const { token } = useAppSelector((state) => state.auth);
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoading(true);
        const headers: HeadersInit = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/users/me/purchases`, {
          headers
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch purchase history");
        }

        const data = await response.json();
        
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data.data && Array.isArray(data.data)) {
          list = data.data;
        } else if (data.items && Array.isArray(data.items)) {
          list = data.items;
        }

        const mappedData: PurchaseRecord[] = list.map((item: any) => ({
          id: item.id,
          title: item.modelTitle || item.title || "Unknown",
          cover: item.modelCover || item.cover || "",
          author: item.authorName || item.author || "Unknown",
          price: item.price !== undefined ? `¥${item.price}` : "免费",
          date: item.purchaseTime || item.createTime || item.date || "Unknown",
          type: item.fileType || item.type || "Model",
          modelId: item.modelId || item.targetId || item.id
        }));
        
        setPurchases(mappedData);
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setError("无法加载购买记录");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-secondary/50 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">购买记录</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
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
        ) : purchases.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            暂无购买记录
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((item) => (
              <div 
                key={item.id}
                className="group relative flex gap-4 p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
                onClick={() => item.modelId && navigate(`/models/${item.modelId}`)}
              >
                {/* Thumbnail */}
                <div className="w-24 h-24 shrink-0 rounded-lg bg-muted overflow-hidden border border-border/30">
                  <img 
                    src={item.cover} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-sm truncate pr-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span 
                        className="cursor-pointer hover:text-foreground hover:underline transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {item.author}
                      </span>
                      <span>•</span>
                      <span>{item.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-[10px] h-5 px-2 bg-secondary/50 text-muted-foreground font-normal">
                      {item.type}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 text-xs gap-1.5 rounded-full border-border/50 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.modelId) navigate(`/models/${item.modelId}`);
                      }}
                    >
                      <ShoppingBag className="h-3 w-3" />
                      再次购买
                    </Button>
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
