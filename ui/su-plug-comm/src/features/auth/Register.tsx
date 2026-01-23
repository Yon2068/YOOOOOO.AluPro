import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import { apiPost } from "@/lib/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    account: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (formData.password.length < 6) {
      setError("密码长度不能少于6位");
      return;
    }

    setIsLoading(true);
    try {
      await apiPost("/auth/register", {
        account: formData.account,
        password: formData.password
      });
      // You might want to auto-login here or redirect to login
      // For now, redirect to login with a success message (could use toast)
      alert("注册成功，请登录");
      navigate("/login");
    } catch (e) {
      setError((e as Error).message || "网络异常，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30 relative">
      <div className="absolute top-4 left-4 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate("/login")}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>
      
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">创建账户</CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            注册以享受更多权益
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">手机号/邮箱</Label>
              <Input 
                id="account" 
                placeholder="user@example.com" 
                value={formData.account}
                onChange={(e) => setFormData({...formData, account: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "注册中..." : "注册"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            已有账号?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">
              直接登录
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
