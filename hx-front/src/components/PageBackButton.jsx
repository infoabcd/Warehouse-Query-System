import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 优先浏览器历史返回；无可用历史时跳转 fallback（如新标签直达）。
 */
export function PageBackButton({
  fallback = "/",
  className,
  variant = "outline",
  size = "sm",
  label = "返回上一页",
}) {
  const navigate = useNavigate();

  const goBack = () => {
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={goBack}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  );
}
