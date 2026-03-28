import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import FloatBtn from "../components/FloatBtn";
import Navbar from "@/components/Navbar";
import { PageBackButton } from "@/components/PageBackButton";
import { BarcodeCameraDialog } from "@/components/BarcodeCameraDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PagePagination } from "@/components/PagePagination";
import { mediaImageUrl, API_BASE } from "@/lib/api";
import { productListThumbClass } from "@/components/ProductCard";

function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize] = useState(15);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const lastHandledQRef = useRef("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const runSearch = useCallback(async (page, qRaw) => {
    const q = qRaw.trim();
    if (!q) {
      toast.warning("请输入商品名称或条形码");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/search/q?q=${encodeURIComponent(q)}&page=${page}&limit=${pageSize}`
      );
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "网络请求失败");
      }
      const data = await response.json();

      if (data.message === "未找到对应的商品.") {
        setResults([]);
        setTotalItems(0);
        setCurrentPage(1);
        return;
      }

      if (data.rows?.length > 0) {
        setResults(data.rows);
        setTotalItems(data.count ?? 0);
        setCurrentPage(page);
      } else {
        setResults([]);
        setTotalItems(0);
      }
    } catch (error) {
      toast.error(`搜索失败：${error.message}`);
      setResults([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  const applyQuerySearch = useCallback(
    (raw, page = 1) => {
      const t = (raw ?? "").trim();
      if (!t) {
        toast.warning("请输入商品名称或条形码");
        return;
      }
      setKeyword(t);
      lastHandledQRef.current = t;
      setSearchParams({ q: t });
      runSearch(page, t);
    },
    [runSearch, setSearchParams]
  );

  const qParam = (searchParams.get("q") ?? "").trim();

  useEffect(() => {
    if (!qParam) {
      lastHandledQRef.current = "";
      return;
    }
    if (qParam === lastHandledQRef.current) return;
    lastHandledQRef.current = qParam;
    setKeyword(qParam);
    runSearch(1, qParam);
  }, [qParam, runSearch]);

  const submit = (page = 1) => {
    applyQuerySearch(keyword, page);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") submit(1);
  };

  const renderResults = () => {
    if (loading && results === null) {
      return (
        <div className="flex justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          加载中…
        </div>
      );
    }

    if (results === null) {
      return (
        <p className="text-center text-muted-foreground py-12">
          输入名称关键字或完整条形码进行搜索。
        </p>
      );
    }

    if (results.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-12">
          未找到对应的商品。
        </p>
      );
    }

    return (
      <div className="space-y-6">
        <Separator />
        <h3 className="text-sm font-medium text-muted-foreground">搜索结果</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/product/${item.id}`)}
              className="text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow max-w-[17.5rem] mx-auto w-full sm:max-w-none sm:mx-0">
                <div className={productListThumbClass}>
                  <img
                    src={mediaImageUrl(item.image_url)}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="font-medium text-sm line-clamp-2">{item.title}</p>
                  <div className="text-sm">
                    {item.is_on_promotion ? (
                      <span className="space-x-2">
                        <span className="line-through text-muted-foreground">
                          ¥{item.price}
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          ¥{item.promotion_price}
                        </span>
                      </span>
                    ) : (
                      <span className="font-semibold">¥{item.price}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    库存：{item.stock}
                  </p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
        <PagePagination
          page={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={(p) => submit(p)}
        />
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-6rem)] bg-gradient-to-b from-muted/30 to-background">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <PageBackButton fallback="/" />
          </div>
          <h1 className="text-2xl font-semibold text-center tracking-tight sm:text-3xl">
            商品搜索
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            支持名称关键字或完整条形码；也可使用相机扫描条码。
          </p>
          <div className="mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-stretch">
            <Input
              placeholder="商品名称或条形码…"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-11 font-mono sm:flex-1 sm:font-sans"
              aria-label="搜索关键词"
            />
            <div className="flex gap-2 justify-stretch sm:w-auto sm:shrink-0">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 gap-2 sm:flex-initial"
                onClick={() => setCameraOpen(true)}
                aria-label="相机扫描条形码"
              >
                <Camera className="h-4 w-4" />
                扫码
              </Button>
              <Button
                type="button"
                onClick={() => submit(1)}
                disabled={loading}
                className="flex-1 gap-2 sm:px-6"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="h-4 w-4" />
                )}
                搜索
              </Button>
            </div>
          </div>
          <div className="mt-10">{renderResults()}</div>
        </div>
      </main>
      <BarcodeCameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onDecoded={(text) => {
          applyQuerySearch(text, 1);
          setCameraOpen(false);
        }}
      />
      <FloatBtn />
    </>
  );
}

export default SearchPage;
