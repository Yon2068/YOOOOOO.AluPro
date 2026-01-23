import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Link as LinkIcon, Calendar, UserPlus, Share2, Box, FileText, PlayCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Mock Data
const authorData = {
  id: "author-1",
  name: "Alex Design",
  avatar: "https://i.pravatar.cc/150?u=author-1",
  cover: "https://picsum.photos/1200/400?random=author-bg",
  bio: "专注 3D 建模与数字艺术设计 10 年。Blender / C4D / Unreal Engine 专家。",
  location: "Shanghai, China",
  website: "alex.design",
  joinDate: "2022-05",
  stats: {
    followers: "12.5k",
    following: "234",
    likes: "45.2k",
    views: "1.2m"
  },
  tags: ["3D Modeling", "Game Art", "Architecture", "Motion Design"]
};

const authorWorks = {
  models: Array.from({ length: 6 }).map((_, i) => ({
    id: `model-${i}`,
    title: `赛博朋克风格建筑模型 ${i + 1}`,
    cover: `https://picsum.photos/400/300?random=${i + 10}`,
    likes: 120 + i * 10,
    isFree: i % 2 === 0,
  })),
  content: Array.from({ length: 4 }).map((_, i) => ({
    id: `content-${i}`,
    type: i % 2 === 0 ? "video" : "article",
    title: i % 2 === 0 ? `Blender 渲染进阶教程 ${i}` : `设计美学：光影的艺术 ${i}`,
    cover: `https://picsum.photos/400/${i % 2 === 0 ? "225" : "300"}?random=${i + 50}`,
    views: 3000 + i * 100,
    duration: i % 2 === 0 ? "12:30" : undefined,
  }))
};

export default function AuthorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image */}
      <div className="h-48 md:h-64 w-full bg-muted relative overflow-hidden">
        <img src={authorData.cover} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background/80"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full bg-background/50 backdrop-blur-md hover:bg-background/80"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 relative -mt-16 z-20">
        {/* Profile Info Card */}
        <div className="flex flex-col md:flex-row gap-6 md:items-end mb-8">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={authorData.avatar} />
              <AvatarFallback>{authorData.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 border-4 border-background rounded-full"></div>
          </div>
          
          <div className="flex-1 space-y-2 pt-2 md:pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{authorData.name}</h1>
                <p className="text-muted-foreground mt-1 max-w-xl">{authorData.bio}</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  className={cn("rounded-full px-6 transition-all", isFollowing ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "")}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? "已关注" : <><UserPlus className="h-4 w-4 mr-2" /> 关注</>}
                </Button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {authorData.location}
              </div>
              <div className="flex items-center gap-1">
                <LinkIcon className="h-3.5 w-3.5" /> {authorData.website}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> 加入于 {authorData.joinDate}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8 border-y border-border/50 py-4">
          <div className="text-center">
            <div className="text-xl font-bold">{authorData.stats.followers}</div>
            <div className="text-xs text-muted-foreground">粉丝</div>
          </div>
          <div className="text-center border-l border-border/50">
            <div className="text-xl font-bold">{authorData.stats.following}</div>
            <div className="text-xs text-muted-foreground">关注</div>
          </div>
          <div className="text-center border-l border-border/50">
            <div className="text-xl font-bold">{authorData.stats.likes}</div>
            <div className="text-xs text-muted-foreground">获赞</div>
          </div>
          <div className="text-center border-l border-border/50">
            <div className="text-xl font-bold">{authorData.stats.views}</div>
            <div className="text-xs text-muted-foreground">浏览</div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="models" className="space-y-6">
          <TabsList className="bg-transparent p-0 gap-6 border-b border-border/50 w-full justify-start rounded-none h-auto pb-1">
            <TabsTrigger 
              value="models" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              模型作品 ({authorWorks.models.length})
            </TabsTrigger>
            <TabsTrigger 
              value="content" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              内容发布 ({authorWorks.content.length})
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-2 font-medium text-muted-foreground data-[state=active]:text-foreground transition-all"
            >
              关于
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {authorWorks.models.map((item) => (
                <div 
                  key={item.id} 
                  className="group cursor-pointer space-y-2"
                  onClick={() => navigate(`/models/${item.id}`)}
                >
                  <div className="aspect-[4/3] rounded-xl bg-muted relative overflow-hidden border border-border/50">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 left-2">
                       {item.isFree ? (
                         <Badge variant="outline" className="bg-green-50/90 text-green-700 border-green-200 backdrop-blur-sm text-[10px] h-5 px-1.5">FREE</Badge>
                       ) : (
                         <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] h-5 px-1.5">PAID</Badge>
                       )}
                    </div>
                  </div>
                  <div className="px-1">
                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Heart className="h-3 w-3 mr-1" /> {item.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {authorWorks.content.map((item) => (
                <div 
                  key={item.id} 
                  className="group cursor-pointer flex gap-4 md:block md:space-y-3 p-2 md:p-0 rounded-xl hover:bg-secondary/20 md:hover:bg-transparent transition-colors"
                  onClick={() => navigate(item.type === "video" ? `/content/video/${item.id}` : `/content/article/${item.id}`)}
                >
                  <div className="w-32 md:w-full aspect-video rounded-lg bg-muted relative overflow-hidden border border-border/50 shrink-0">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 left-2">
                       <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-0 text-[10px] h-5 px-1.5 flex items-center gap-1">
                         {item.type === "video" ? <PlayCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                         {item.type === "video" ? "视频" : "文章"}
                       </Badge>
                    </div>
                    {item.type === "video" && (
                      <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[9px] px-1 rounded font-mono">
                        {item.duration}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 md:px-1">
                    <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h3>
                    <div className="flex items-center text-xs text-muted-foreground mt-1.5 gap-3">
                      <span>{item.views} 次浏览</span>
                      <span>2 天前</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-3 space-y-6">
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">个人简介</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {authorData.bio}
                    <br /><br />
                    大家好，我是 Alex。我是一名热爱创造数字世界的设计师。在过去的十年里，我专注于 3D 建模、纹理绘制和场景渲染。我喜欢分享我的工作流程和技巧，希望能帮助更多人进入 3D 艺术的世界。
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-bold text-lg">专业技能</h3>
                  <div className="flex flex-wrap gap-2">
                    {authorData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="bg-secondary/50 text-secondary-foreground hover:bg-secondary">
                        {tag}
                      </Badge>
                    ))}
                    <Badge variant="secondary">Blender</Badge>
                    <Badge variant="secondary">ZBrush</Badge>
                    <Badge variant="secondary">Substance Painter</Badge>
                    <Badge variant="secondary">Unreal Engine 5</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
