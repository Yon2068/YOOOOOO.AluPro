import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ContentStats = {
  likes: number;
  views: number;
  comments: number;
};

type ArticleDetailData = {
  id: string;
  type: string;
  title: string;
  cover: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  stats: ContentStats;
  publishDate: string;
  tags: string[];
  body: string;
  duration?: string | null;
};

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/contents/${id}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load article");
        }
        const json = await response.json();
        const data: ArticleDetailData = json.data || json;
        setArticle(data.type === "article" ? data : null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setArticle(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto pb-20 min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        正在加载文章...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto pb-20 min-h-screen bg-background flex items-center justify-center text-sm text-muted-foreground">
        未找到文章
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-20 min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b px-4 h-14 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/author/1")}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={article.authorAvatar} />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{article.authorName}</span>
        </div>
        <Button variant="secondary" size="sm" className="h-7 text-xs">关注</Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-6 w-6" />
        </Button>
      </header>

      {/* Content */}
      <main className="p-4 space-y-6">
        <h1 className="text-2xl font-bold leading-tight">
          {article.title}
        </h1>
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{article.publishDate}</span>
          <span>阅读 {article.stats.views}</span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <img 
            src={article.cover}
            alt="Article Cover" 
            className="w-full rounded-lg my-4"
          />
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {article.body}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </main>

      {/* Comments Section Preview */}
      <section className="p-4 border-t">
        <h3 className="font-bold mb-4">评论 (34)</h3>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/150?u=${i+10}`} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">用户User{i}</span>
                  <Heart className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-sm">这篇文章写得太好了，受益匪浅！期待更多分享。</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t flex items-center justify-around z-50">
         <div className="flex items-center gap-1 bg-muted px-4 py-2 rounded-full flex-1 mr-4 text-muted-foreground text-sm">
           <MessageCircle className="h-4 w-4" />
           <span>说点什么...</span>
         </div>
         <div className="flex items-center gap-4">
           <div className="flex flex-col items-center">
             <Heart className="h-6 w-6" />
             <span className="text-[10px]">1.2k</span>
           </div>
           <div className="flex flex-col items-center">
             <MessageCircle className="h-6 w-6" />
             <span className="text-[10px]">342</span>
           </div>
           <div className="flex flex-col items-center">
             <Share2 className="h-6 w-6" />
             <span className="text-[10px]">分享</span>
           </div>
         </div>
      </div>
    </div>
  );
}
