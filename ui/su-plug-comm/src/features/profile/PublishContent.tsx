import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image as ImageIcon, Film, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function PublishContent() {
  const navigate = useNavigate();
  const [contentType, setContentType] = useState("article");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Mock upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCoverImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-secondary/50 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">发布内容</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>取消</Button>
            <Button size="sm" className="rounded-full px-6">发布</Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-3xl">
        <Tabs defaultValue="article" value={contentType} onValueChange={setContentType} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-full">
            <TabsTrigger value="article" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" /> 发布文章
            </TabsTrigger>
            <TabsTrigger value="video" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Film className="h-4 w-4 mr-2" /> 发布视频
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题</Label>
                <Input id="title" placeholder="请输入引人注目的标题" className="bg-secondary/30 border-transparent focus:bg-background transition-all" />
              </div>

              <div className="space-y-2">
                <Label>封面图</Label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-4 hover:bg-secondary/30 transition-colors relative group cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleImageUpload}
                  />
                  
                  {coverImage ? (
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-background">
                      <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        onClick={(e) => {
                          e.preventDefault();
                          setCoverImage(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium">点击上传封面</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">支持 JPG, PNG (建议 16:9)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">简介</Label>
                <Textarea 
                  id="description" 
                  placeholder="简要描述您的内容..." 
                  className="bg-secondary/30 border-transparent focus:bg-background transition-all min-h-[80px] resize-none" 
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            <TabsContent value="article" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <Label>正文内容</Label>
                <div className="min-h-[400px] rounded-xl border border-border/50 bg-background p-4 relative">
                  <Textarea 
                    placeholder="在此输入正文内容... (支持 Markdown)" 
                    className="w-full h-full min-h-[400px] border-0 focus-visible:ring-0 p-0 resize-none leading-relaxed" 
                  />
                  {/* Mock Toolbar */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 text-xs rounded-full">预览</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <Label>视频文件</Label>
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 hover:bg-secondary/30 transition-colors relative cursor-pointer flex flex-col items-center justify-center text-center">
                  <Input 
                    type="file" 
                    accept="video/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Upload className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold mb-1">拖拽或点击上传视频</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    支持 MP4, WebM 格式。建议分辨率 1080p 以上，大小不超过 2GB。
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-url">或输入视频链接</Label>
                <Input id="video-url" placeholder="https://..." className="bg-secondary/30 border-transparent focus:bg-background transition-all" />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
