import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import FloatBtn from "../components/FloatBtn";
import { ProductCard } from "../components/ProductCard";
import { PagePagination } from "../components/PagePagination";
import { BarcodeCameraDialog } from "@/components/BarcodeCameraDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE } from "@/lib/api";
import { Package, ScanBarcode, Camera, Loader2 } from "lucide-react";

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeLookupLoading, setBarcodeLookupLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const response = await fetch(
          `${API_BASE}/?page=${currentPage}&limit=${pageSize}`
        );
        if (!response.ok) throw new Error("网络请求失败");
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts({ rows: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentPage, pageSize]);

  const rows = products.rows ?? [];
  const total = products.count ?? 0;

  const goToProductByBarcode = async (rawCode) => {
    const code = String(rawCode ?? barcodeInput).trim();
    if (!code) {
      toast.warning("请输入或扫描条形码");
      return;
    }
    setBarcodeLookupLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/products/by-barcode?code=${encodeURIComponent(code)}`
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        toast.error(data.message || "未找到该条码对应的商品");
        return;
      }
      if (data.id != null) {
        toast.success(data.title ? `已找到：${data.title}` : "正在打开商品");
        navigate(`/product/${data.id}`);
      }
    } catch {
      toast.error("查询失败，请稍后重试");
    } finally {
      setBarcodeLookupLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden border-b bg-gradient-to-br from-primary/[0.07] via-background to-muted/50">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-muted-foreground/[0.06] blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/15">
            <Package className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            仓库精选
          </h1>
          <p className="mt-3 max-w-lg mx-auto text-sm text-muted-foreground sm:text-base leading-relaxed">
            浏览在售商品，按分类筛选或搜索心仪好物。
          </p>

          <div className="mx-auto mt-8 max-w-xl space-y-2 text-left">
            <label
              htmlFor="home-barcode"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
            >
              <ScanBarcode className="h-3.5 w-3.5" aria-hidden />
              条形码直达
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              输入或扫描商品条码，将直接打开对应详情页（商品需已绑定条码）。
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <Input
                id="home-barcode"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void goToProductByBarcode();
                }}
                placeholder="输入条码，或先聚焦此处再用扫码枪"
                autoComplete="off"
                className="font-mono sm:flex-1"
                disabled={barcodeLookupLoading}
              />
              <div className="flex gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  className="gap-1.5 flex-1 sm:flex-initial"
                  disabled={barcodeLookupLoading}
                  onClick={() => setCameraOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                  相机
                </Button>
                <Button
                  type="button"
                  className="gap-1.5 flex-1 sm:flex-initial"
                  disabled={barcodeLookupLoading}
                  onClick={() => void goToProductByBarcode()}
                >
                  {barcodeLookupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ScanBarcode className="h-4 w-4" />
                  )}
                  打开商品
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 justify-items-center sm:justify-items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[300px] w-full max-w-[280px] rounded-2xl"
              />
            ))}
          </div>
        ) : rows.length > 0 ? (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 sm:gap-8 justify-items-center sm:justify-items-stretch">
              {rows.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <PagePagination
              page={currentPage}
              pageSize={pageSize}
              total={total}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <p className="text-center text-muted-foreground py-16 text-sm">
            没有找到相关商品。
          </p>
        )}
      </main>
      <FloatBtn />
      <BarcodeCameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onDecoded={(t) => {
          setBarcodeInput(t);
          void goToProductByBarcode(t);
        }}
      />
    </>
  );
}

export default Home;
