import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { mediaImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/** 列表缩略图统一高度，避免窄屏下整屏被一张图占满 */
export const productListThumbClass =
  "relative h-36 w-full overflow-hidden bg-muted/80 sm:h-40 md:h-44";

export function ProductCard({ product, className }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className={cn(
        "block w-full max-w-[17.5rem] mx-auto sm:max-w-none sm:mx-0 shrink-0 transition-[transform,box-shadow] hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl",
        className
      )}
    >
      <Card className="h-full overflow-hidden border-border/60 shadow-sm hover:shadow-lg hover:border-border transition-all duration-300">
        <div className={productListThumbClass}>
          <img
            src={mediaImageUrl(product.image_url)}
            alt={product.title || "商品"}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <CardContent className="p-3 sm:p-4 space-y-1.5">
          <p className="font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
            {product.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {product.is_on_promotion ? (
              <>
                促销{" "}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {product.promotion_price}¥
                </span>
              </>
            ) : (
              <>
                售价{" "}
                <span className="font-semibold text-foreground">
                  {product.price}¥
                </span>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
