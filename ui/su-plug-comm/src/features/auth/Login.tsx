import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { login, type User } from "@/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { apiPost } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthResult = {
  token: string;
  user: User;
};

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !password || isLoading) {
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const data = await apiPost<AuthResult>("/auth/login", { account, password });
      dispatch(
        login({
          user: {
            id: data.user.id,
            nickname: data.user.nickname,
            avatar: data.user.avatar,
            vipLevel: data.user.vipLevel,
            balance: Number(data.user.balance),
          },
          token: data.token
        })
      );
      navigate("/profile");
    } catch (e) {
      setError((e as Error).message || "网络异常，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30 relative">
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">登录账户</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            输入您的账号和密码以继续
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">账号 (邮箱/手机号)</Label>
              <Input 
                id="account" 
                placeholder="user@example.com" 
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  忘记密码?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            还没有账号?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
