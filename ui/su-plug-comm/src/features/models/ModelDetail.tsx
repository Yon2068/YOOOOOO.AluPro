import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Heart, Download, Share2, Info, ShoppingBag, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/store";
import { updateUser, type User } from "@/features/auth/authSlice";
import { apiGet, apiPost, showToast } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthorSummary = {
  id: string;
  name: string;
  avatar: string;
};

type ModelSpec = {
  label: string;
  value: string;
};

type ModelDetailData = {
  id: string;
  title: string;
  description: string;
  images: string[];
  author: AuthorSummary;
  specs: ModelSpec[];
  tags: string[];
  uploadTime: string;
  downloads: number;
  likes: number;
  size: string;
  isFree: boolean;
  price?: number;
  isPurchased?: boolean;
  isCollected?: boolean;
};

export default function ModelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);
  const [isCollected, setIsCollected] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [model, setModel] = useState<ModelDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await apiGet<ModelDetailData>(`/models/${id}`);
        setModel(data);
        // Explicitly set collected status based on API response, defaulting to false
        setIsCollected(!!data.isCollected);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setModel(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [id, token]);

  const handleToggleFavorite = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!id) return;
    
    // Optimistic update
    const previousState = isCollected;
    setIsCollected((prev) => !prev);
    
    try {
      const result = await apiPost<{ value: boolean }>(`/models/${id}/favorite`);
      if (result && typeof result.value === "boolean") {
        setIsCollected(result.value);
      }
    } catch (error) {
      console.error("Toggle favorite failed:", error);
      // Revert state on error
      setIsCollected(previousState);
      showToast("收藏操作失败，请稍后重试", "error");
    }
  };

  const handlePurchaseClick = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmPurchase = async () => {
    if (!id || !model) return;
    try {
      setIsPurchasing(true);
      await apiPost(`/models/${id}/purchase`);
      // Update local state to reflect purchase
      setModel({ ...model, isPurchased: true });
      setShowConfirm(false);

      // Refresh user profile to update balance
      try {
        const user = await apiGet<User>("/users/me");
        dispatch(updateUser({
          balance: Number(user.balance),
          vipLevel: user.vipLevel
        }));
      } catch (err) {
        console.error("Failed to refresh user profile:", err);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      showToast("购买失败，请稍后重试", "error");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDownload = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!id) return;
    try {
      const result = await apiPost<{ id: string; downloadUrl: string }>(`/models/${id}/download`);
      if (result && result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch {
      showToast("下载失败，请稍后重试", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto pb-20 bg-background min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        正在加载模型详情...
      </div>
    );
  }

  if (!model) {
    return (
      <div className="container mx-auto pb-20 bg-background min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        未找到模型详情
      </div>
    );
  }

  return (
    <div className="container mx-auto pb-20 bg-background min-h-screen">
      {/* Top Navigation */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-md border-b">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="font-semibold text-lg truncate max-w-[200px]">{model.title}</h1>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Image Carousel */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted relative">
            <img
              src={model.images[activeImage]}
              alt="Model Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {activeImage + 1} / {model.images.length}
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {model.images.map((img, idx) => (
              <button
                key={idx}
                className={cn(
                  "relative flex-shrink-0 w-20 h-16 rounded overflow-hidden border-2",
                  activeImage === idx ? "border-primary" : "border-transparent"
                )}
                onClick={() => setActiveImage(idx)}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold leading-tight">{model.title}</h2>
            <div className="flex flex-col items-end">
               {model.isFree && model.price && model.price > 0 ? (
                 <div className="flex flex-col items-end">
                   <div className="flex items-center gap-2">
                     <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">限时免费</Badge>
                     <span className="text-sm text-muted-foreground line-through">¥ {model.price}</span>
                   </div>
                   <span className="text-2xl font-bold text-green-600">Free</span>
                 </div>
               ) : model.isFree ? (
                 <span className="text-2xl font-bold text-green-600">Free</span>
               ) : (
                 <span className="text-2xl font-bold text-primary">¥ {model.price}</span>
               )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {model.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {model.description}
          </p>
        </div>

        {/* Author Info */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={model.author.avatar} />
              <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{model.author.name}</div>
                <div className="text-xs text-muted-foreground">
                  模型作者
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">关注</Button>
          </CardContent>
        </Card>

        {/* Specs */}
        <div className="space-y-2">
          <h3 className="font-semibold flex items-center">
            <Info className="h-4 w-4 mr-2" />
            规格参数
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {model.specs.map((spec) => (
              <div key={spec.label} className="flex justify-between p-2 bg-muted/50 rounded">
                <span className="text-muted-foreground">{spec.label}</span>
                <span className="font-medium">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Time */}
        <div className="text-xs text-muted-foreground text-center pt-4">
          上传于 {model.uploadTime} • {model.downloads} 次下载
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-4 z-50">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleToggleFavorite}
        >
          <Heart className={cn("h-4 w-4", isCollected && "fill-red-500 text-red-500")} />
          {isCollected ? "已收藏" : "收藏"}
        </Button>
        {model.isPurchased ? (
          <Button className="flex-[2] gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            立即下载 ({model.size})
          </Button>
        ) : (
          <Button 
            className="flex-[2] gap-2" 
            onClick={handlePurchaseClick}
            disabled={isPurchasing}
          >
            {isPurchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
            {model.isFree && model.price && model.price > 0 
              ? "限时免费获取" 
              : model.isFree 
                ? "免费获取" 
                : `购买 (¥ ${model.price || 0})`}
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-background rounded-xl shadow-lg max-w-sm w-full p-6 space-y-6 animate-in zoom-in-95 duration-200 border border-border">
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-bold tracking-tight">确认购买</h3>
              <p className="text-sm text-muted-foreground">
                {model.isFree 
                  ? "您确定要免费获取该模型吗？" 
                  : `您确定要支付 ¥ ${model.price} 购买该模型吗？`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                取消
              </Button>
              <Button className="flex-1" onClick={handleConfirmPurchase} disabled={isPurchasing}>
                {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
