import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User, Lock, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageBackButton } from "@/components/PageBackButton";
import { API_BASE } from "@/lib/api";

function LoginPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${API_BASE}/admin/login`, {
          credentials: "include",
        });
        if (cancelled || !response.ok) return;
        navigate("/dashboard", { replace: true });
      } catch {
        /* 未登录，留在本页 */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("请输入用户名或邮箱");
      return;
    }
    if (!password) {
      toast.error("请输入密码");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          remember,
        }),
        credentials: "include",
      });

      const text = await response.text();
      let body = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { message: text };
      }

      if (response.ok) {
        toast.success("登录成功");
        navigate("/dashboard", { replace: true });
      } else {
        toast.error(body.message || "账号或密码错误");
      }
    } catch {
      toast.error("网络请求失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/70 via-background to-background">
        <p className="text-sm text-muted-foreground">检查登录状态…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted/70 via-background to-background p-4">
      <div className="mb-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageBackButton fallback="/" variant="ghost" className="-ml-2 w-fit" />
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" asChild>
          <Link to="/">
            <Command className="h-4 w-4" />
            回到首页
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-md border-border/60 shadow-xl">
        <CardHeader className="space-y-1 text-center pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tight">
            管理员登录
          </CardTitle>
          <CardDescription>
            登录后可管理商品、分类与扫码入库。如需账号请联系系统管理员。
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  className="pl-9 h-11"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-9 h-11"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(v) => setRemember(v === true)}
              />
              <Label htmlFor="remember" className="font-normal cursor-pointer text-sm">
                在此设备上保持登录状态
              </Label>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "登录中…" : "登录"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
