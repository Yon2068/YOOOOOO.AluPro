import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "@/store";
import { logout } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  ShoppingBag, 
  Heart, 
  LogOut, 
  Crown,
  Box,
  FileText,
  User,
  HelpCircle,
  Bell,
  Wallet,
  History,
  ChevronRight
} from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="relative h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <User className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">探索无限创意</h1>
            <p className="text-muted-foreground max-w-xs mx-auto">
              加入我们，发现、下载并分享精彩的 3D 模型与创意内容
            </p>
          </div>
          <div className="w-full max-w-xs space-y-3">
            <Button size="lg" className="w-full rounded-full h-12 text-base" onClick={() => navigate("/login")}>
              立即登录
            </Button>
            <Button size="lg" variant="ghost" className="w-full rounded-full h-12 text-base" onClick={() => navigate("/register")}>
              注册新账号
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Compact Service Icon Component
  const ServiceIcon = ({ icon: Icon, label, onClick, badge }: any) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-1 transition-opacity hover:opacity-80 active:scale-95 relative group"
    >
      <div className="h-12 w-12 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Icon className="h-5 w-5 text-foreground/70 group-hover:text-primary" />
      </div>
      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">{label}</span>
      {badge && (
        <span className="absolute top-0 right-3 h-2 w-2 rounded-full bg-red-500"></span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8 pt-12 md:pt-8">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Profile Info */}
          <div className="md:col-span-5 lg:col-span-4 space-y-8">
            {/* User Info - Simplified */}
            <div className="flex items-center gap-5 md:flex-col md:text-center md:bg-muted/30 md:p-8 md:rounded-3xl md:border md:border-border/50">
              <Avatar className="h-20 w-20 md:h-32 md:w-32 border border-border shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.nickname[0]}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2 md:justify-center">
                  <h2 className="text-xl md:text-2xl font-bold truncate tracking-tight">{user.nickname}</h2>
                  {user.vipLevel > 0 && (
                    <Badge variant="secondary" className="px-1.5 h-5 text-[10px] bg-foreground text-background">PRO</Badge>
                  )}
                </div>
                
                {/* Stats - Minimal */}
                <div className="flex items-center gap-5 mt-4 md:justify-center md:w-full md:pt-4">
                  <div className="flex flex-col md:items-center">
                    <span className="text-base font-bold md:text-lg">{user.balance}</span>
                    <span className="text-[10px] text-muted-foreground">余额</span>
                  </div>
                  <div className="flex flex-col md:items-center">
                    <span className="text-base font-bold md:text-lg">128</span>
                    <span className="text-[10px] text-muted-foreground">关注</span>
                  </div>
                  <div className="flex flex-col md:items-center">
                    <span className="text-base font-bold md:text-lg">2.4k</span>
                    <span className="text-[10px] text-muted-foreground">粉丝</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Only Menu */}
            <div className="hidden md:block">
              <nav className="space-y-1">
                 <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                   <User className="h-4 w-4 mr-3" /> 个人资料
                 </Button>
                 <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => navigate("/profile/settings")}>
                   <Settings className="h-4 w-4 mr-3" /> 账户设置
                 </Button>
                 <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
                   <LogOut className="h-4 w-4 mr-3" /> 退出登录
                 </Button>
              </nav>
            </div>
          </div>

          {/* Right Column: Content & Services */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            {/* VIP Banner - Ultra Minimal */}
            <div className="bg-foreground text-background rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                 <Crown className="h-5 w-5 text-yellow-400" />
                 <div>
                   <div className="font-bold text-sm">升级 Pro 会员</div>
                   <div className="text-[10px] opacity-70">解锁无限下载权限</div>
                 </div>
              </div>
              <Button size="sm" variant="secondary" className="h-7 text-[10px] px-3 rounded-full font-semibold bg-background text-foreground hover:bg-background/90">
                查看详情
              </Button>
            </div>

            {/* Services Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-base tracking-tight">我的服务</h3>
              </div>
              
              <div className="grid grid-cols-4 gap-y-8">
                <ServiceIcon 
                  icon={Box} 
                  label="我的模型" 
                  onClick={() => navigate("/profile/my-models")} 
                />
                <ServiceIcon 
                  icon={FileText} 
                  label="内容管理" 
                  onClick={() => navigate("/profile/my-content")} 
                />
                <ServiceIcon 
                  icon={ShoppingBag} 
                  label="购买记录" 
                  onClick={() => navigate("/profile/purchases")} 
                />
                <ServiceIcon 
                  icon={Heart} 
                  label="收藏夹" 
                  onClick={() => navigate("/profile/favorites")} 
                />
                <ServiceIcon 
                  icon={Wallet} 
                  label="钱包充值" 
                  onClick={() => navigate("/profile/wallet")} 
                  badge
                />
                <ServiceIcon 
                  icon={History} 
                  label="浏览足迹" 
                  onClick={() => navigate("/profile/history")} 
                />
                 <ServiceIcon 
                  icon={HelpCircle} 
                  label="帮助中心" 
                  onClick={() => navigate("/profile/help")} 
                />
                <ServiceIcon 
                  icon={Settings} 
                  label="更多设置" 
                  onClick={() => navigate("/profile/settings")} 
                />
              </div>
            </div>

            {/* Mobile Logout - Subtle */}
            <div className="md:hidden pt-4">
              <Button 
                variant="ghost" 
                className="w-full text-muted-foreground hover:text-red-500 hover:bg-red-50 h-12 rounded-xl border border-border/50"
                onClick={handleLogout}
              >
                退出登录
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
