import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, PlayCircle, FileText, ArrowRight, Sparkles, Bot, Send } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Input } from "@/components/ui/input";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type HomeModelAuthor = {
  id: string;
  name: string;
  avatar: string;
};

type HomeModel = {
  id: string;
  title: string;
  cover: string;
  author: HomeModelAuthor;
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

type HomeContent = {
  id: string;
  type: string;
  title: string;
  cover: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  stats: ContentStats;
  summary?: string | null;
  duration?: string | null;
};

export default function Home() {
  const navigate = useNavigate();
  const [hotModels, setHotModels] = useState<HomeModel[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<HomeContent[]>([]);
  const [featuredVideo, setFeaturedVideo] = useState<HomeContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInput, setAiInput] = useState("");

  const handleAiSearch = () => {
    navigate(`/ai-chat?q=${encodeURIComponent(aiInput)}`);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [modelsRes, contentRes] = await Promise.all([
          fetch(`${API_BASE_URL}/models`),
          fetch(`${API_BASE_URL}/contents`),
        ]);

        if (!modelsRes.ok || !contentRes.ok) {
          throw new Error("Failed to load home data");
        }

        const models: HomeModel[] = await modelsRes.json();
        const content: HomeContent[] = await contentRes.json();

        const hot = models.filter((m) => m.isHot).slice(0, 4);
        setHotModels(hot.length > 0 ? hot : models.slice(0, 4));

        const articles = content.filter((c) => c.type === "article");
        const videos = content.filter((c) => c.type === "video");

        setFeaturedArticles(articles.slice(0, 2));
        setFeaturedVideo(videos[0] ?? null);
      } catch {
        setHotModels([]);
        setFeaturedArticles([]);
        setFeaturedVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="container mx-auto px-4 pt-8 md:pt-12 md:py-8 space-y-12 pb-24">
      {/* Hero Section - AI Focus */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center space-y-8 py-16 md:py-24"
      >
        <Badge variant="secondary" className="px-4 py-1.5 rounded-full text-sm font-normal bg-secondary/50 backdrop-blur-sm border-0">
          <Sparkles className="mr-2 h-3 w-3 text-primary" />
          AluPro 智能助手全新上线
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent max-w-4xl leading-tight">
          有什么可以帮您的？
        </h1>
        
        <div className="w-full max-w-2xl relative z-10">
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 rounded-2xl blur opacity-20 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            
            {/* Input Container */}
            <div className="relative flex items-center bg-background/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl transition-all focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/20">
              <div className="pl-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300">
                <Bot className="h-5 w-5" />
              </div>
              <Input 
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAiSearch();
                  }
                }}
                placeholder="询问关于铝型材设计、模型制作的任何问题..." 
                className="border-0 bg-transparent h-14 text-base px-3 focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/40"
              />
              <Button 
                size="icon" 
                className="mr-1.5 h-10 w-10 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
                onClick={handleAiSearch}
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6 text-sm">
            <span className="text-xs self-center text-muted-foreground mr-1">试着问：</span>
            {[
              "如何设计工业铝型材连接件？",
              "推荐几款热门的欧标型材",
              "生成一个工作台模型"
            ].map((text) => (
              <button 
                key={text}
                onClick={() => setAiInput(text)} 
                className="group relative px-3 py-1.5 rounded-full text-xs bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-all hover:shadow-sm border border-transparent hover:border-primary/20"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 热门模型推荐 */}
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">热门模型</h2>
            <p className="text-sm text-muted-foreground">本周最受欢迎的 3D 资产</p>
          </div>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground group" onClick={() => navigate("/models")}>
            全部
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {isLoading && hotModels.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            正在加载热门模型...
          </div>
        )}
        {!isLoading && hotModels.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            暂无热门模型
          </div>
        )}
        {!isLoading && hotModels.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {hotModels.map((model) => (
              <motion.div
                key={model.id}
                variants={itemVariants}
                className="group cursor-pointer space-y-3"
                onClick={() => navigate(`/models/${model.id}`)}
              >
                <div className="aspect-[4/3] rounded-xl bg-muted relative overflow-hidden border border-border/50">
                  <img
                    src={model.cover}
                    alt={model.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {model.isHot && (
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-0 text-xs font-medium shadow-sm">
                        HOT
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 px-1">
                  <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {model.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/author/${model.author.id}`);
                      }}
                    >
                      <Avatar className="h-5 w-5 border border-border">
                        <AvatarImage src={model.author.avatar} />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{model.author.name}</span>
                    </div>
                    {model.isFree && <span className="text-xs font-medium">Free</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* 混合内容推荐 (文章 + 视频) */}
      <section>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">精选内容</h2>
            <p className="text-sm text-muted-foreground">深度文章与教学视频</p>
          </div>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground group" onClick={() => navigate("/content")}>
            更多
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>

        {(featuredArticles.length > 0 || featuredVideo) && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {featuredArticles.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                onClick={() => navigate(`/content/article/${item.id}`)}
              >
                <div className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center text-primary font-medium">
                          <FileText className="mr-1 h-3 w-3" /> 文章
                        </span>
                        <span>•</span>
                        <span>精选推荐</span>
                      </div>
                      <h3 className="font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.authorName}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {featuredVideo && (
              <motion.div
                variants={itemVariants}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-black md:col-span-2 lg:col-span-1 aspect-video lg:aspect-auto"
                onClick={() => navigate(`/content/video/${featuredVideo.id}`)}
              >
                <img
                  src={featuredVideo.cover}
                  alt={featuredVideo.title}
                  className="h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-50"
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-0">
                      <PlayCircle className="mr-1 h-3 w-3" /> 视频教程
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{featuredVideo.title}</h3>
                  <p className="text-sm text-gray-300 line-clamp-1">
                    {featuredVideo.summary ?? "精选视频教程"}
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <PlayCircle className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </section>
    </div>
  );
}
