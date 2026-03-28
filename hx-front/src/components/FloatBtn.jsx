import { Search, Home, ArrowUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function FloatBtn() {
  const navigate = useNavigate();

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="h-11 w-11 rounded-full shadow-md"
        onClick={() => navigate("/search")}
        aria-label="搜索"
      >
        <Search className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="h-11 w-11 rounded-full shadow-md"
        onClick={() => navigate("/")}
        aria-label="首页"
      >
        <Home className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-11 w-11 rounded-full shadow-md bg-background"
        onClick={scrollTop}
        aria-label="回到顶部"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default FloatBtn;
