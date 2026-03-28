import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PagePagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3 py-6",
        className
      )}
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一页
      </Button>
      <span className="text-sm text-muted-foreground tabular-nums">
        第 {page} / {totalPages} 页 · 共 {total} 条
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        下一页
      </Button>
    </div>
  );
}
