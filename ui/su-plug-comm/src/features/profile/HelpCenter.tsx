import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, HelpCircle, FileText, MessageCircle, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqItems = [
    {
      q: "如何下载已购买的模型？",
      a: "购买成功后，您可以前往「个人中心」-「我的模型」中查看并下载您购买的所有资源。我们也支持在该页面查看授权证书。"
    },
    {
      q: "支持哪些支付方式？",
      a: "目前我们支持支付宝和微信支付。如果是企业用户，可以联系客服进行对公转账。"
    },
    {
      q: "购买的模型可以用于商业项目吗？",
      a: "这取决于模型的授权类型。大多数付费模型都包含标准商业授权。请在购买前查看商品详情页的授权说明。"
    },
    {
      q: "如何发布自己的作品？",
      a: "点击顶部导航栏的「发布」按钮，或在「个人中心」-「内容管理」中选择发布。发布前请确保您拥有作品的完整版权。"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="-ml-2 hover:bg-secondary/50 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">帮助中心</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 space-y-8">
        {/* Search */}
        <div className="relative">
          <h2 className="text-2xl font-bold mb-4">你好，需要什么帮助？</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="搜索问题..." 
              className="pl-9 h-12 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary transition-all rounded-xl"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-colors cursor-pointer space-y-2">
            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
            <div className="font-medium">使用指南</div>
            <div className="text-xs text-muted-foreground">新手入门教程与文档</div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-card hover:bg-secondary/30 transition-colors cursor-pointer space-y-2">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="font-medium">在线客服</div>
            <div className="text-xs text-muted-foreground">人工客服在线解答</div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">常见问题</h3>
          <div className="space-y-2">
            {faqItems.map((item, i) => (
              <div key={i} className="border-b border-border/50 last:border-0 pb-2">
                <button 
                  className="flex items-center justify-between w-full py-3 text-left font-medium hover:text-primary transition-colors"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  {item.q}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === i ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed pr-8">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Footer */}
        <div className="pt-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">没找到答案？</p>
          <Button variant="outline" className="rounded-full">
            联系我们
          </Button>
        </div>
      </div>
    </div>
  );
}
