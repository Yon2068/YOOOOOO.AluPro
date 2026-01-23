import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Bell, Shield, Smartphone, Eye, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Simple Switch Component
const Switch = ({ defaultChecked }: { defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <button 
      className={`w-11 h-6 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}
      onClick={() => setChecked(!checked)}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? "left-6" : "left-1"}`} />
    </button>
  );
};

export default function SettingsPage() {
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
            <h1 className="font-semibold text-lg">设置</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* General */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">通用</h2>
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-muted-foreground" />
                <span>深色模式</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <span>语言</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                简体中文
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">通知</h2>
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span>推送通知</span>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <span>个性化推荐</span>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">隐私与安全</h2>
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
             <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>账号安全</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
             <div className="flex items-center justify-between p-4 border-b border-border/50 last:border-0 cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <span>设备管理</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <div className="pt-4">
           <Button variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
             退出登录
           </Button>
           <div className="text-center mt-4 text-xs text-muted-foreground">
             Version 1.0.2 (Build 20240320)
           </div>
        </div>
      </div>
    </div>
  );
}
