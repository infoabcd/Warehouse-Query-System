import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, ScanBarcode, Camera, FolderTree, LogOut } from "lucide-react";
import { BarcodeCameraDialog } from "@/components/BarcodeCameraDialog";
import { BarcodeFieldHelp } from "@/components/BarcodeFieldHelp";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PagePagination } from "@/components/PagePagination";
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE, postAdminLogout } from "@/lib/api";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [productToDelete, setProductToDelete] = useState(null);
  const [stockInBarcode, setStockInBarcode] = useState("");
  const [stockInQty, setStockInQty] = useState("1");
  const [stockInLoading, setStockInLoading] = useState(false);
  const [stockInCameraOpen, setStockInCameraOpen] = useState(false);
  const stockInBarcodeRef = useRef(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async (page, limit) => {
    setLoading(true);
    try {
      const authResponse = await fetch(`${API_BASE}/admin/login`, {
        credentials: "include",
      });

      if (!authResponse.ok) {
        if (authResponse.status === 403) {
          setLoading(false);
          navigate("/login", { replace: true });
          return;
        }
        throw new Error("未找到此页面");
      }

      const response = await fetch(
        `${API_BASE}/?page=${page}&limit=${limit}`,
        { credentials: "include" }
      );
      const json = await response.json();
      setData(json.rows ?? []);
      setTotalItems(json.count ?? 0);
      setError(null);
    } catch (e) {
      setError(e.message);
      toast.error("获取数据失败");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize, fetchData]);

  const confirmDelete = async () => {
    if (productToDelete == null) return;
    const id = productToDelete;
    setProductToDelete(null);
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const t = await response.text();
        throw new Error(t);
      }
      toast.success("删除成功");
      await fetchData(currentPage, pageSize);
    } catch (err) {
      toast.error("删除失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await postAdminLogout();
      toast.success("已退出登录");
      navigate("/login", { replace: true });
    } catch {
      toast.error("退出失败，请重试");
    }
  };

  const handleStockIn = async (e) => {
    e.preventDefault();
    const code = stockInBarcode.trim();
    const qty = parseInt(stockInQty, 10);
    if (!code) {
      toast.error("请扫描或输入条形码");
      return;
    }
    if (Number.isNaN(qty) || qty < 1) {
      toast.error("入库数量须为正整数");
      return;
    }
    setStockInLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/stock-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ barcode: code, quantity: qty }),
      });
      const text = await response.text();
      let body = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
      if (!response.ok) {
        toast.error(body.message || "入库失败");
        return;
      }
      toast.success(`${body.title ?? "商品"} 已入库 +${body.added ?? qty}，当前库存 ${body.stock}`);
      setStockInBarcode("");
      setStockInQty("1");
      stockInBarcodeRef.current?.focus();
      await fetchData(currentPage, pageSize);
    } catch (err) {
      toast.error("入库请求失败");
      console.error(err);
    } finally {
      setStockInLoading(false);
    }
  };

  if (error && !data.length && !loading) {
    return (
      <div className="p-8 text-center text-destructive">错误: {error}</div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">仪表盘</h1>
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link to="/">回到前台</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="gap-2 w-fit">
              <Link to="/dashboard/categories">
                <FolderTree className="h-4 w-4" />
                分类管理
              </Link>
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/dashboard/add-product")}
              className="gap-2 w-fit"
            >
              <Plus className="h-4 w-4" />
              新增商品
            </Button>
            <Button
              type="button"
              variant="outline"
              className="gap-2 w-fit text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              退出登录
            </Button>
          </div>
        </div>

        <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.04] to-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScanBarcode className="h-5 w-5 text-primary" />
              扫码入库
            </CardTitle>
            <CardDescription>
              按条码增加库存：支持手动输入、USB 扫码枪或手机相机扫码（见下方说明）。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BarcodeFieldHelp />
            <form
              onSubmit={handleStockIn}
              className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
            >
              <div className="space-y-2 flex-1 min-w-[200px]">
                <Label htmlFor="stock-in-barcode">条形码</Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <Input
                    ref={stockInBarcodeRef}
                    id="stock-in-barcode"
                    autoComplete="off"
                    value={stockInBarcode}
                    onChange={(e) => setStockInBarcode(e.target.value)}
                    placeholder="输入 / 粘贴 / 扫码枪（先点此框）"
                    className="font-mono sm:flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="shrink-0 gap-2"
                    onClick={() => setStockInCameraOpen(true)}
                  >
                    <Camera className="h-4 w-4" />
                    相机扫码
                  </Button>
                </div>
              </div>
              <div className="space-y-2 w-full sm:w-28">
                <Label htmlFor="stock-in-qty">数量</Label>
                <Input
                  id="stock-in-qty"
                  type="number"
                  min={1}
                  step={1}
                  value={stockInQty}
                  onChange={(e) => setStockInQty(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={stockInLoading} className="w-full sm:w-auto">
                {stockInLoading ? "提交中…" : "确认入库"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <BarcodeCameraDialog
          open={stockInCameraOpen}
          onOpenChange={setStockInCameraOpen}
          onDecoded={(t) => {
            setStockInBarcode(t);
            stockInBarcodeRef.current?.focus();
          }}
        />

        <div className="rounded-md border bg-card">
          {loading && !data.length ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品标题</TableHead>
                  <TableHead className="max-w-[200px]">描述</TableHead>
                  <TableHead>价格 (¥)</TableHead>
                  <TableHead>库存</TableHead>
                  <TableHead className="hidden md:table-cell whitespace-nowrap">
                    条码
                  </TableHead>
                  <TableHead>促销</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>创建日期</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                      {row.description ?? "—"}
                    </TableCell>
                    <TableCell>¥ {row.price}</TableCell>
                    <TableCell>{row.stock}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[120px]">
                      <span className="font-mono text-xs truncate block" title={row.barcode || ""}>
                        {row.barcode ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          row.is_on_promotion
                            ? "border-green-600/40 bg-green-50 text-green-800 font-medium dark:border-green-600/50 dark:bg-green-950/50 dark:text-green-400"
                            : "text-muted-foreground border-muted-foreground/25"
                        }
                      >
                        {row.is_on_promotion ? "是" : "否"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[140px]">
                        {row.categories?.map((c) => (
                          <Badge key={c.id} variant="outline" className="text-xs">
                            {c.name}
                          </Badge>
                        )) ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() =>
                            navigate(`/dashboard/edit-product/${row.id}`)
                          }
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={() => setProductToDelete(row.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        <PagePagination
          page={currentPage}
          pageSize={pageSize}
          total={totalItems}
          onPageChange={setCurrentPage}
        />
      </div>

      <AlertDialog
        open={productToDelete != null}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除这条商品吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">取消</AlertDialogCancel>
            <AlertDialogAction type="button" onClick={confirmDelete}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default Dashboard;
