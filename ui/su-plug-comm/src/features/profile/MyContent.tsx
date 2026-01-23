import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, FileText, PlayCircle, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data for content
const myContent = Array.from({ length: 8 }).map((_, i) => {
  const type = i % 3 === 0 ? "video" : "article";
  return {
    id: `content-${i}`,
    type,
    title: type === "video" 
      ? `3D 建模进阶教程：材质与渲染 ${i + 1}` 
      : `设计趋势分析：2024年数字艺术展望 ${i + 1}`,
    cover: `https://picsum.photos/400/${type === "video" ? "225" : "300"}?random=${i + 200}`,
    author: {
      name: `创作者 ${String.fromCharCode(65 + i)}`,
    },
    publishDate: "2024-03-21",
    status: i === 0 ? "审核中" : "已发布",
    stats: {
      views: 1200 + i * 100,
      likes: 45 + i * 5,
    },
    duration: type === "video" ? "15:30" : undefined,
  };
});

export default function MyContent() {
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
            <h1 className="font-semibold text-lg">内容管理</h1>
          </div>
          <Button variant="default" size="sm" className="rounded-full px-4 h-8 text-xs" onClick={() => navigate("/profile/publish")}>
            发布内容
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-4">
          {myContent.map((item) => (
            <div 
              key={item.id}
              className="group relative flex gap-4 p-3 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-colors cursor-pointer"
              onClick={() => navigate(item.type === "video" ? `/content/video/${item.id}` : `/content/article/${item.id}`)}
            >
              {/* Thumbnail */}
              <div className="w-32 h-20 shrink-0 rounded-lg bg-muted overflow-hidden border border-border/30 relative">
                <img 
                  src={item.cover} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                
                {/* Type Icon Overlay */}
                <div className="absolute top-1.5 left-1.5 bg-black/40 backdrop-blur-sm rounded-md p-1">
                  {item.type === "video" ? (
                    <PlayCircle className="h-3 w-3 text-white" />
                  ) : (
                    <FileText className="h-3 w-3 text-white" />
                  )}
                </div>

                {/* Duration for video */}
                {item.type === "video" && (
                  <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1 rounded font-mono">
                    {item.duration}
                  </div>
                )}
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
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={item.status === "审核中" ? "text-yellow-600" : "text-green-600"}>
                      {item.status}
                    </span>
                    <span>{item.publishDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-3 w-3" /> {item.stats.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {item.stats.likes}
                    </span>
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
