import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBackButton } from "@/components/PageBackButton";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-muted/60 to-background px-4 py-16">
      <p className="text-8xl font-bold tabular-nums text-muted-foreground/40 select-none">
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
        页面找不到了
      </h1>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        链接可能有误，或页面已被移动。你可以返回上一页，或回到首页继续浏览。
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <PageBackButton fallback="/" />
        <Button asChild className="gap-2">
          <Link to="/">
            <Home className="h-4 w-4" />
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
