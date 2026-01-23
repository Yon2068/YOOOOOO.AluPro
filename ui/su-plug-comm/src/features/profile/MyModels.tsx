import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Clock, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock data for authorized models
const authorizedModels = Array.from({ length: 8 }).map((_, i) => ({
  id: `auth-${i}`,
  title: `已授权模型示例 ${i + 1}`,
  cover: `https://picsum.photos/400/300?random=${i + 100}`,
  author: {
    name: `设计师 ${String.fromCharCode(65 + i)}`,
  },
  downloadDate: "2024-03-20",
  size: "128 MB",
  license: "商业授权",
  format: "FBX, OBJ",
}));

export default function MyModels() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-secondary/50 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">我的模型</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-4">
          {authorizedModels.map((model) => (
            <div 
              key={model.id}
              className="group relative flex gap-4 p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/models/${model.id}`)}
            >
              {/* Thumbnail */}
              <div className="w-28 h-20 shrink-0 rounded-lg bg-muted overflow-hidden border border-border/30">
                <img 
                  src={model.cover} 
                  alt={model.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-sm truncate pr-2 group-hover:text-primary transition-colors">
                      {model.title}
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
                        navigate("/author/1");
                      }}
                    >
                      {model.author.name}
                    </span>
                    <span>•</span>
                    <span>{model.size}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-border/50 font-normal bg-secondary/30">
                    {model.license}
                  </Badge>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{model.downloadDate}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
