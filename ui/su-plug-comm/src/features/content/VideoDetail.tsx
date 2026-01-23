import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Heart, MessageCircle, Share2, MoreHorizontal, Music2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ContentStats = {
  likes: number;
  views: number;
  comments: number;
};

type VideoDetailData = {
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
  videoUrl?: string | null;
  duration?: string | null;
};

export default function VideoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<VideoDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleDoubleClick = () => {
    setIsLiked(true);
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 800);
  };

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
          throw new Error("Failed to load video");
        }
        const json = await response.json();
        const data: VideoDetailData = json.data || json;
        setVideo(data.type === "video" ? data : null);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setVideo(null);
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
      <div className="relative h-screen bg-black text-white flex items-center justify-center text-sm text-gray-300">
        正在加载视频...
      </div>
    );
  }

  if (!video) {
    return (
      <div className="relative h-screen bg-black text-white flex items-center justify-center text-sm text-gray-300">
        未找到视频内容
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black text-white overflow-hidden">
      <div 
        ref={videoRef}
        className="absolute inset-0 bg-zinc-900"
        onDoubleClick={handleDoubleClick}
      >
        {video.videoUrl ? (
          <video
            src={video.videoUrl}
            className="w-full h-full object-cover"
            autoPlay
            loop
            playsInline
            poster={video.cover}
          />
        ) : (
          <img 
            src={video.cover} 
            alt={video.title} 
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Heart 
            className={cn(
              "h-24 w-24 text-red-500 fill-red-500 transition-all duration-300 transform",
              showHeart ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )} 
          />
        </div>
      </div>

      {/* Top Nav */}
      <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="flex gap-4 text-sm font-semibold">
          <span className="opacity-50">关注</span>
          <span className="border-b-2 border-white">推荐</span>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Share2 className="h-6 w-6" />
        </Button>
      </div>

      {/* Right Actions */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6 z-10">
        <div 
          className="flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-110"
          onClick={() => navigate(`/author/${video.authorId}`)}
        >
          <Avatar className="h-12 w-12 border-2 border-white">
            <AvatarImage src={video.authorAvatar} />
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/20 hover:bg-black/40 h-12 w-12"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn("h-8 w-8", isLiked ? "fill-red-500 text-red-500" : "text-white")} />
          </Button>
          <span className="text-xs">{video.stats.likes}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 h-12 w-12">
            <MessageCircle className="h-8 w-8 text-white" />
          </Button>
          <span className="text-xs">{video.stats.comments}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 hover:bg-black/40 h-12 w-12">
            <Share2 className="h-8 w-8 text-white" />
          </Button>
          <span className="text-xs">分享</span>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 z-10 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-[80%] space-y-2">
          <div 
            className="font-bold text-lg cursor-pointer hover:underline"
            onClick={() => navigate(`/author/${video.authorId}`)}
          >
            @{video.authorName}
          </div>
          <p className="text-sm line-clamp-2">
            {video.body}
          </p>
          <div className="flex items-center gap-2 text-xs">
            <Music2 className="h-3 w-3 animate-spin" />
            <span>原声 - 创作者 Alex</span>
          </div>
        </div>
      </div>
    </div>
  );
}
