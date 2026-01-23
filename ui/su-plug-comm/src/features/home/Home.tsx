import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, PlayCircle, FileText, ArrowRight, Sparkles } from "lucide-react";

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

  return (
    <div className="container mx-auto px-4 pt-8 md:pt-12 md:py-8 space-y-12 pb-24">
      {/* Hero Section - Ultra Minimalist */}
      <section className="relative py-8 md:py-16 text-center space-y-6">
        <Badge variant="outline" className="rounded-full px-4 py-1 text-sm font-medium border-border/50 text-muted-foreground">
          <Sparkles className="h-3 w-3 mr-2 text-foreground" />
          每周精选更新
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          探索未来的 <span className="text-muted-foreground">数字美学</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          汇集全球顶尖创作者的 铝型材 模型与设计资源，<br />为您的创意注入无限灵感。
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button size="lg" className="rounded-full h-12 px-8 text-base font-medium" onClick={() => navigate("/models")}>
            开始探索
          </Button>
          <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base font-medium border-border/50 hover:bg-muted" onClick={() => navigate("/content")}>
            阅读文章
          </Button>
        </div>
      </section>

      {/* 热门模型推荐 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">热门模型</h2>
            <p className="text-sm text-muted-foreground">本周最受欢迎的 3D 资产</p>
          </div>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground group" onClick={() => navigate("/models")}>
            全部
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading && hotModels.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-center text-sm text-muted-foreground py-8">
              正在加载热门模型...
            </div>
          )}
          {!isLoading && hotModels.length === 0 && (
            <div className="col-span-2 md:col-span-4 text-center text-sm text-muted-foreground py-8">
              暂无热门模型
            </div>
          )}
          {hotModels.map((model) => (
            <div
              key={model.id}
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
            </div>
          ))}
        </div>
      </section>

      {/* 混合内容推荐 (文章 + 视频) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">精选内容</h2>
            <p className="text-sm text-muted-foreground">深度文章与教学视频</p>
          </div>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground group" onClick={() => navigate("/content")}>
            更多
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredArticles.map((item) => (
            <div
              key={item.id}
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
            </div>
          ))}

          {featuredVideo && (
            <div
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
