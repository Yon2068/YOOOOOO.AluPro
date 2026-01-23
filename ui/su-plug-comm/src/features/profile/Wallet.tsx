import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, CreditCard, History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function WalletPage() {
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
            <h1 className="font-semibold text-lg">我的钱包</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
            明细
          </Button>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="h-32 w-32" />
          </div>
          <div className="relative z-10 space-y-1">
            <p className="text-primary-foreground/80 text-sm font-medium">账户余额</p>
            <h2 className="text-4xl font-bold tracking-tight">¥ 1,280.00</h2>
          </div>
          <div className="relative z-10 mt-6 flex gap-3">
            <Button variant="secondary" className="rounded-full px-6 font-semibold bg-white text-primary hover:bg-white/90 border-0">
              <Plus className="h-4 w-4 mr-2" /> 充值
            </Button>
            <Button variant="outline" className="rounded-full px-6 font-semibold bg-transparent border-white/30 text-white hover:bg-white/10">
              提现
            </Button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">支付方式</h3>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">支付宝</div>
                  <div className="text-xs text-muted-foreground">已绑定 138****8888</div>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">已连接</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">微信支付</div>
                  <div className="text-xs text-muted-foreground">未绑定</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">绑定</Button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">最近交易</h3>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {i === 1 ? <Plus className="h-5 w-5 text-green-500" /> : <History className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{i === 1 ? "账户充值" : `购买模型资源 #${20240320 + i}`}</div>
                    <div className="text-xs text-muted-foreground">2024-03-2{i} 14:30</div>
                  </div>
                </div>
                <div className={`font-semibold text-sm ${i === 1 ? "text-green-600" : ""}`}>
                  {i === 1 ? "+ ¥500.00" : "- ¥68.00"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
