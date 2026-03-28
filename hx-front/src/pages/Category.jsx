import { useState, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { PageBackButton } from "@/components/PageBackButton";
import FloatBtn from "../components/FloatBtn";
import { ProductCard } from "../components/ProductCard";
import { PagePagination } from "@/components/PagePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE, fetchPublicCategories } from "@/lib/api";

function Category() {
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [catLabels, setCatLabels] = useState([]);
  const { key } = useParams();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchPublicCategories();
      if (!cancelled) setCatLabels(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sectionTitle = useMemo(() => {
    if (key === "0" || key === undefined) return "所有商品";
    const cat = catLabels.find((c) => String(c.id) === String(key));
    return cat?.name ?? `分类 ${key}`;
  }, [key, catLabels]);

  useEffect(() => {
    if (key === "0") return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const response = await fetch(
          `${API_BASE}/search/assort/${key}?page=${currentPage}&limit=${pageSize}`
        );
        if (!response.ok) throw new Error("网络请求失败");
        const data = await response.json();
        if (!cancelled) setProducts(data);
      } catch (e) {
        console.error("获取数据时出错:", e);
        if (!cancelled) setProducts({ rows: [], count: 0 });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, currentPage, pageSize]);

  if (key === "0") {
    return <Navigate to="/" replace />;
  }

  const rows = products.rows ?? products.searchData ?? [];
  const total = products.count ?? products.totalCommodities ?? 0;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <header className="mb-6 sm:mb-8 border-b border-border/60 pb-4">
          <div className="mb-4">
            <PageBackButton fallback="/" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {sectionTitle}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground min-h-[1.25rem]">
            {!loading && (
              <>
                共 {total} 件商品
                {total > pageSize ? `，第 ${currentPage} 页` : ""}
              </>
            )}
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6 justify-items-center sm:justify-items-stretch">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[260px] w-full max-w-[17.5rem] rounded-2xl sm:max-w-none"
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
          <p className="text-center text-muted-foreground py-12 text-sm">
            没有找到相关商品。
          </p>
        )}
      </main>
      <FloatBtn />
    </>
  );
}

export default Category;
