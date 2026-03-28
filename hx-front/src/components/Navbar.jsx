import { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Command,
  Tag,
  User,
  LayoutGrid,
  Menu,
  Search,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchPublicCategories, API_BASE, postAdminLogout } from "@/lib/api";

const INLINE_MAX = 6;

const linkClass =
  "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground";

function CategoryLinks({ items, onNavigate, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      <NavLink
        to="/"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            linkClass,
            isActive && "bg-accent text-accent-foreground shadow-sm"
          )
        }
      >
        <LayoutGrid className="h-3.5 w-3.5 opacity-70" aria-hidden />
        所有商品
      </NavLink>
      {items.map((cat) => (
        <NavLink
          key={cat.id}
          to={`/category/${cat.id}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              linkClass,
              isActive && "bg-accent text-accent-foreground shadow-sm"
            )
          }
        >
          <Tag className="h-3.5 w-3.5 opacity-70" aria-hidden />
          {cat.name}
        </NavLink>
      ))}
    </div>
  );
}

function NavbarSearch({ compact, onSubmit }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const go = (e) => {
    e?.preventDefault();
    const t = q.trim();
    if (!t) return;
    navigate(`/search?q=${encodeURIComponent(t)}`);
    onSubmit?.();
  };

  return (
    <form
      onSubmit={go}
      className={cn(
        "flex items-center gap-1.5",
        compact ? "w-full" : "min-w-[200px] max-w-sm flex-1"
      )}
      role="search"
    >
      <Input
        type="search"
        placeholder="名称或条形码…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className={cn("h-9", compact ? "flex-1" : "")}
        aria-label="搜索商品或条形码"
      />
      <Button type="submit" size="sm" variant="secondary" className="shrink-0 gap-1">
        <Search className="h-3.5 w-3.5" />
        {!compact && <span className="hidden sm:inline">搜索</span>}
      </Button>
    </form>
  );
}

function AdminAuthActions({ variant = "desktop", sheetClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminOk, setAdminOk] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/admin/login`, { credentials: "include" })
      .then((r) => {
        if (!cancelled) setAdminOk(r.ok);
      })
      .catch(() => {
        if (!cancelled) setAdminOk(false);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  const afterAuthAction = () => {
    sheetClose?.();
    onNavigate?.();
  };

  const handleLogout = async () => {
    try {
      await postAdminLogout();
      setAdminOk(false);
      toast.success("已退出登录");
      afterAuthAction();
      if (location.pathname.startsWith("/dashboard")) {
        navigate("/login", { replace: true });
      }
    } catch {
      toast.error("退出失败");
    }
  };

  if (adminOk === null) {
    return (
      <div
        className={
          variant === "desktop"
            ? "flex h-9 w-28 animate-pulse rounded-md bg-muted"
            : "h-10 w-full animate-pulse rounded-md bg-muted"
        }
        aria-hidden
      />
    );
  }

  if (adminOk) {
    if (variant === "sheet") {
      return (
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full justify-start gap-2" asChild>
            <NavLink to="/dashboard" onClick={afterAuthAction}>
              <LayoutDashboard className="h-4 w-4" />
              后台仪表盘
            </NavLink>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1">
        <Button variant="outline" size="sm" asChild>
          <NavLink to="/dashboard" className="gap-1.5">
            <LayoutDashboard className="h-3.5 w-3.5" />
            后台
          </NavLink>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground gap-1.5"
          onClick={handleLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          退出
        </Button>
      </div>
    );
  }

  if (variant === "sheet") {
    return (
      <Button variant="outline" className="w-full gap-2" asChild>
        <NavLink to="/login" onClick={afterAuthAction}>
          <User className="h-4 w-4" />
          管理员登录
        </NavLink>
      </Button>
    );
  }
  return (
    <Button variant="outline" size="sm" asChild>
      <NavLink to="/login" className="gap-1.5">
        <User className="h-3.5 w-3.5" />
        会员登录
      </NavLink>
    </Button>
  );
}

function Navbar() {
  const [categories, setCategories] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchPublicCategories();
      if (!cancelled) setCategories(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const inlineCats = useMemo(
    () => (expanded ? categories : categories.slice(0, INLINE_MAX)),
    [categories, expanded]
  );
  const hasMore = categories.length > INLINE_MAX;

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  aria-label="打开菜单"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw-2rem,20rem)]">
                <SheetHeader>
                  <SheetTitle>导航</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <NavbarSearch
                    compact
                    onSubmit={() => setSheetOpen(false)}
                  />
                  <Separator />
                  <nav aria-label="商品分类">
                    <CategoryLinks
                      items={categories}
                      onNavigate={() => setSheetOpen(false)}
                    />
                  </nav>
                  <Separator />
                  <AdminAuthActions
                    variant="sheet"
                    sheetClose={() => setSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <NavLink
              to="/"
              className="flex min-w-0 items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <Command className="h-5 w-5 shrink-0" />
              <span className="truncate">仓库查询</span>
            </NavLink>
          </div>

          <div className="hidden min-w-0 flex-1 basis-full sm:basis-[280px] lg:flex lg:max-w-md lg:basis-auto lg:justify-center">
            <NavbarSearch />
          </div>

          <div className="hidden items-center gap-1 lg:flex">
            <Separator orientation="vertical" className="mx-1 h-6" />
            <AdminAuthActions variant="desktop" />
          </div>
        </div>

        <div className="flex lg:hidden">
          <NavbarSearch />
        </div>

        <nav
          className="hidden flex-col gap-2 lg:flex"
          aria-label="商品分类"
        >
          <div className="flex flex-wrap items-end gap-2">
            <CategoryLinks items={inlineCats} />
            {hasMore && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 shrink-0 gap-1 text-muted-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    收起分类
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    更多分类 ({categories.length - INLINE_MAX})
                  </>
                )}
              </Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
