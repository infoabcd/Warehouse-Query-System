import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Upload,
  ArrowLeft,
  ScanBarcode,
  Package,
  ImageIcon,
  Tag,
  Camera,
} from "lucide-react";
import { BarcodeCameraDialog } from "@/components/BarcodeCameraDialog";
import { BarcodeFieldHelp } from "@/components/BarcodeFieldHelp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { API_BASE, mediaImageUrl, fetchPublicCategories } from "@/lib/api";
import { cn } from "@/lib/utils";

function SectionLabel({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {children}
    </div>
  );
}

function AddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const barcodeInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFileName, setImageFileName] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("");
  const [isPromo, setIsPromo] = useState(false);
  const [promotionPrice, setPromotionPrice] = useState("");
  const [categoryIds, setCategoryIds] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await fetchPublicCategories();
      if (!cancelled) setCategoryOptions(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    const formData = new FormData();
    formData.append("image", file);
    setImageLoading(true);
    try {
      const response = await fetch(`${API_BASE}/media/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t);
      }
      const data = await response.json();
      toast.success("图片上传成功");
      setImageFileName(data.fileName);
      setImageUrl(mediaImageUrl(data.fileName));
    } catch (e) {
      toast.error("图片上传失败");
      console.error(e);
    } finally {
      setImageLoading(false);
    }
  };

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("请输入商品名称");
      return;
    }
    if (!imageFileName) {
      toast.error("请先上传商品图片");
      return;
    }
    if (!categoryIds.length) {
      toast.error("请选择至少一个分类");
      return;
    }
    const p = Number(price);
    const op = Number(originalPrice);
    const st = parseInt(String(stock).trim(), 10);
    if (Number.isNaN(p) || p < 0) {
      toast.error("请输入有效的售卖价格");
      return;
    }
    if (Number.isNaN(op) || op < 0) {
      toast.error("请输入有效的进货价格");
      return;
    }
    if (Number.isNaN(st) || st < 0) {
      toast.error("请输入有效的库存（非负整数）");
      return;
    }
    let promo = null;
    if (isPromo) {
      const pp = Number(promotionPrice);
      if (Number.isNaN(pp) || pp < 0) {
        toast.error("请输入有效的促销价格");
        return;
      }
      promo = pp;
    }

    const barcodeTrim = barcode.trim();
    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      price: p,
      original_price: op,
      stock: st,
      is_on_promotion: isPromo,
      promotion_price: promo,
      categories: categoryIds,
      imagePath: imageFileName,
      barcode: barcodeTrim || null,
    };

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const text = await response.text();
      let body = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = { message: text };
      }

      if (!response.ok) {
        if (response.status === 409) {
          toast.error(body.message || "条形码已被使用");
          return;
        }
        throw new Error(body.message || text || "创建失败");
      }
      toast.success("商品创建成功");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "创建商品失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/60 via-background to-background">
      <div className="mx-auto max-w-5xl px-4 py-8 lg:py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              返回仪表盘
            </Link>
          </Button>
        </div>

        <Card className="border-border/60 shadow-xl overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-6 space-y-1">
            <CardTitle className="text-2xl">新增商品</CardTitle>
            <CardDescription>
              填写基本信息与价格；条形码可选，便于之后在仪表盘「扫码入库」。
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-[1fr_340px]">
              <div className="space-y-8 p-6 lg:p-8 lg:border-r">
                <div className="space-y-4">
                  <SectionLabel icon={Package}>基本信息</SectionLabel>
                  <div className="space-y-2">
                    <Label htmlFor="title">商品名称</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例如：不锈钢炒锅"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">商品描述</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="规格、材质、使用说明等"
                      className="resize-y min-h-[100px]"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <SectionLabel icon={ScanBarcode}>条形码</SectionLabel>
                  <BarcodeFieldHelp />
                  <div className="space-y-2">
                    <Label htmlFor="barcode">商品条码（可选）</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                      <Input
                        ref={barcodeInputRef}
                        id="barcode"
                        inputMode="text"
                        autoComplete="off"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="手动输入、粘贴，或先点此框再用扫码枪"
                        className="font-mono text-base tracking-wide sm:flex-1"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="shrink-0 gap-2 sm:w-auto"
                        onClick={() => setCameraOpen(true)}
                      >
                        <Camera className="h-4 w-4" />
                        相机扫码
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <SectionLabel>价格与库存</SectionLabel>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">售卖价格 (¥)</Label>
                      <Input
                        id="price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="original_price">进货价格 (¥)</Label>
                      <Input
                        id="original_price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border bg-card/50 px-4 py-3">
                    <Label htmlFor="promo" className="cursor-pointer">
                      是否促销
                    </Label>
                    <Switch
                      id="promo"
                      checked={isPromo}
                      onCheckedChange={setIsPromo}
                    />
                  </div>
                  {isPromo && (
                    <div className="space-y-2">
                      <Label htmlFor="promotion_price">促销价格 (¥)</Label>
                      <Input
                        id="promotion_price"
                        type="number"
                        min={0}
                        step="0.01"
                        value={promotionPrice}
                        onChange={(e) => setPromotionPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="stock">库存</Label>
                    <Input
                      id="stock"
                      type="number"
                      min={0}
                      step={1}
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <Separator className="lg:hidden" />

                <div className="space-y-4 lg:hidden">
                  <SectionLabel icon={Tag}>分类</SectionLabel>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-3">
                    {categoryOptions.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={categoryIds.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button type="submit" disabled={loading || imageLoading}>
                    {loading ? "提交中…" : "创建商品"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                  >
                    取消
                  </Button>
                </div>
              </div>

              <div className="space-y-6 bg-muted/20 p-6 lg:p-8">
                <div className="space-y-4">
                  <SectionLabel icon={ImageIcon}>商品图片</SectionLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadFile(f);
                      e.target.value = "";
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current?.click();
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const f = e.dataTransfer.files?.[0];
                      if (f) uploadFile(f);
                    }}
                    className={cn(
                      "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-background/80 p-6 text-center text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-background",
                      imageLoading && "pointer-events-none opacity-60"
                    )}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="预览"
                        className="max-h-52 w-full rounded-md object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="mb-3 h-10 w-10 opacity-40" />
                        <p className="font-medium text-foreground">点击或拖拽上传</p>
                        <p className="mt-1 text-xs">支持 JPG、PNG、WebP 等</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="hidden lg:block space-y-4">
                  <SectionLabel icon={Tag}>分类（可多选）</SectionLabel>
                  <div className="grid grid-cols-1 gap-2 rounded-lg border bg-background p-3">
                    {categoryOptions.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/80"
                      >
                        <Checkbox
                          checked={categoryIds.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => barcodeInputRef.current?.focus()}
                >
                  <ScanBarcode className="h-4 w-4" />
                  聚焦条码框（准备扫码）
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <BarcodeCameraDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onDecoded={(t) => setBarcode(t)}
      />
    </div>
  );
}

export default AddProduct;
