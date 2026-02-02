import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Heart, MessageCircle, Share2, MoreHorizontal, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShareDrawer } from "@/components/ui/ShareDrawer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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

type Comment = {
  id: number;
  user: string;
  avatar: string;
  content: string;
  likes: number;
  time: string;
};

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // New States
  const [commentText, setCommentText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "用户User1", avatar: "https://i.pravatar.cc/150?u=11", content: "这篇文章写得太好了，受益匪浅！期待更多分享。", likes: 12, time: "2小时前" },
    { id: 2, user: "用户User2", avatar: "https://i.pravatar.cc/150?u=12", content: "非常有用的信息，感谢作者。", likes: 5, time: "5小时前" },
  ]);

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

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now(),
      user: "我",
      avatar: "https://github.com/shadcn.png", // Placeholder for current user
      content: commentText,
      likes: 0,
      time: "刚刚",
    };
    
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

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

      {/* Comments Section */}
      <section className="p-4 border-t">
        <h3 className="font-bold mb-4">评论 ({comments.length})</h3>
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.avatar} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{comment.user}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                     <Heart className="h-3 w-3" />
                     <span className="text-xs">{comment.likes > 0 ? comment.likes : ""}</span>
                  </div>
                </div>
                <p className="text-sm leading-normal">{comment.content}</p>
                <div className="text-xs text-muted-foreground pt-1">{comment.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t flex items-center justify-between gap-4 z-40 pb-safe">
         <div className="flex-1 relative">
           <Input 
             className="rounded-full bg-muted border-none pl-4 pr-10 h-10 text-sm focus-visible:ring-1"
             placeholder="说点什么..."
             value={commentText}
             onChange={(e) => setCommentText(e.target.value)}
             onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
           />
           {commentText && (
             <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-transparent"
                onClick={handleSendComment}
             >
               <Send className="h-4 w-4" />
             </Button>
           )}
         </div>
         
         <div className="flex items-center gap-5 pr-2">
           <div 
             className="flex flex-col items-center gap-0.5 cursor-pointer"
             onClick={toggleFavorite}
           >
             <Heart 
               className={cn("h-6 w-6 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-foreground")} 
             />
             <span className="text-[10px] text-muted-foreground">{isFavorite ? article.stats.likes + 1 : article.stats.likes}</span>
           </div>
           
           <div className="flex flex-col items-center gap-0.5 cursor-pointer">
             <MessageCircle className="h-6 w-6 text-foreground" />
             <span className="text-[10px] text-muted-foreground">{comments.length}</span>
           </div>
           
           <div 
             className="flex flex-col items-center gap-0.5 cursor-pointer"
             onClick={() => setIsShareOpen(true)}
           >
             <Share2 className="h-6 w-6 text-foreground" />
             <span className="text-[10px] text-muted-foreground">分享</span>
           </div>
         </div>
      </div>

      {/* Share Drawer */}
      <ShareDrawer isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </div>
  );
}
