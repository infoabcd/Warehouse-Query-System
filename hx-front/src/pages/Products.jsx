import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package } from "lucide-react";
import Navbar from "@/components/Navbar";
import { PageBackButton } from "@/components/PageBackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { mediaImageUrl, API_BASE } from "@/lib/api";

function Product() {
  const navigate = useNavigate();
  const { key } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/products/${key}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("网络请求失败");
        const data = await response.json();
        if (!cancelled) {
          setProductData(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const isAdminView =
    productData &&
    Object.prototype.hasOwnProperty.call(productData, "original_price");

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
          <Skeleton className="mb-6 h-9 w-28" />
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:gap-10 sm:p-8">
              <Skeleton className="aspect-square w-full max-w-[320px] rounded-xl mx-auto sm:mx-0" />
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4 max-w-md" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-10">
          <PageBackButton fallback="/" className="mb-6" />
          <Alert variant="destructive">
            <AlertTitle>加载失败</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </main>
      </>
    );
  }

  if (!productData || productData.message === "没有找到对应的商品.") {
    return (
      <>
        <Navbar />
        <main className="mx-auto max-w-lg px-4 py-10">
          <PageBackButton fallback="/" className="mb-6" />
          <Alert>
            <Package className="h-4 w-4" />
            <AlertTitle>未找到商品</AlertTitle>
            <AlertDescription>该商品不存在或已下架。</AlertDescription>
          </Alert>
          <Button className="mt-6" variant="outline" onClick={() => navigate("/")}>
            去首页逛逛
          </Button>
        </main>
      </>
    );
  }

  const description = productData.description || "";
  const descPreview =
    description.length > 160 && !descExpanded
      ? `${description.slice(0, 160)}…`
      : description;

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-muted/40 via-background to-background">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <PageBackButton fallback="/" />
          </div>

          <Card className="overflow-hidden border-border/60 shadow-lg">
            <CardContent className="p-0">
              <div className="flex flex-col lg:flex-row lg:items-stretch">
                <div className="flex justify-center bg-muted/30 p-4 sm:p-6 lg:w-[min(100%,400px)] lg:shrink-0 lg:items-center">
                  <div className="relative aspect-square w-full max-w-[min(100%,360px)] overflow-hidden rounded-2xl border bg-background shadow-sm lg:max-w-none lg:rounded-xl">
                    <img
                      width={640}
                      height={640}
                      alt={productData.title}
                      src={mediaImageUrl(productData.image_url)}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-5 p-6 sm:p-8">
                  <div>
                    <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                      {productData.title}
                    </h1>
                    {productData.categories?.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {productData.categories.map((category, index) => (
                          <Badge
                            key={category.id ?? category.name ?? index}
                            variant="secondary"
                            className="font-normal"
                          >
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <Separator />

                  <div className="flex flex-wrap items-end gap-4">
                    {productData.is_on_promotion ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          促销价
                        </p>
                        <p className="mt-1 flex flex-wrap items-baseline gap-2">
                          <span className="text-lg text-muted-foreground line-through">
                            ¥{productData.price}
                          </span>
                          <span className="text-3xl font-bold text-green-600 tabular-nums dark:text-green-400">
                            ¥{productData.promotion_price}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          售价
                        </p>
                        <p className="mt-1 text-3xl font-bold text-green-600 tabular-nums dark:text-green-400">
                          ¥{productData.price}
                        </p>
                      </div>
                    )}
                    {productData.stock != null && (
                      <Badge
                        variant="outline"
                        className="mb-1 ml-auto sm:ml-0 text-muted-foreground"
                      >
                        库存 {productData.stock}
                      </Badge>
                    )}
                  </div>

                  {productData.discount_amount != null &&
                    productData.discount_amount !== "" &&
                    productData.is_on_promotion && (
                      <p className="text-sm text-muted-foreground">
                        含立减 ¥{productData.discount_amount}
                      </p>
                    )}

                  {productData.barcode ? (
                    <div className="rounded-lg border bg-muted/20 px-3 py-2">
                      <p className="text-xs text-muted-foreground">条形码</p>
                      <p className="font-mono text-sm tracking-wide break-all">
                        {productData.barcode}
                      </p>
                    </div>
                  ) : null}

                  {isAdminView && productData.original_price != null && (
                    <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200/90">
                        管理员可见
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        进货价 <span className="font-medium text-foreground">¥{productData.original_price}</span>
                      </p>
                    </div>
                  )}

                  {description ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        商品描述
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                        {descPreview}
                      </p>
                      {description.length > 160 && (
                        <button
                          type="button"
                          className="text-sm font-medium text-primary hover:underline"
                          onClick={() => setDescExpanded((e) => !e)}
                        >
                          {descExpanded ? "收起" : "展开全文"}
                        </button>
                      )}
                    </div>
                  ) : null}

                  {isAdminView && (productData.created_at || productData.updated_at) ? (
                    <div className="mt-auto space-y-1 border-t pt-4 text-xs text-muted-foreground">
                      {productData.created_at ? (
                        <p>创建：{new Date(productData.created_at).toLocaleString()}</p>
                      ) : null}
                      {productData.updated_at ? (
                        <p>更新：{new Date(productData.updated_at).toLocaleString()}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default Product;
