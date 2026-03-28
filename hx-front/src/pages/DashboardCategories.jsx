import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Plus, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { API_BASE, postAdminLogout } from "@/lib/api";

function DashboardCategories() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const auth = await fetch(`${API_BASE}/admin/login`, {
        credentials: "include",
      });
      if (!auth.ok) {
        if (auth.status === 403) {
          navigate("/login", { replace: true });
          return;
        }
        throw new Error("无权访问");
      }
      const r = await fetch(`${API_BASE}/admin/categories`, {
        credentials: "include",
      });
      if (!r.ok) throw new Error("加载失败");
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e.message || "加载分类失败");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    try {
      await postAdminLogout();
      toast.success("已退出登录");
      navigate("/login", { replace: true });
    } catch {
      toast.error("退出失败，请重试");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) {
      toast.error("请输入分类名称");
      return;
    }
    setCreating(true);
    try {
      const r = await fetch(`${API_BASE}/admin/categories`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(body.message || "创建失败");
        return;
      }
      toast.success("已新增分类");
      setNewName("");
      await load();
    } catch {
      toast.error("请求失败");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setEditName(row.name ?? "");
  };

  const handleSaveEdit = async () => {
    if (!editRow) return;
    const name = editName.trim();
    if (!name) {
      toast.error("名称不能为空");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`${API_BASE}/admin/categories/${editRow.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(body.message || "保存失败");
        return;
      }
      toast.success("已更新");
      setEditRow(null);
      await load();
    } catch {
      toast.error("请求失败");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    const id = deleteId;
    setDeleteId(null);
    try {
      const r = await fetch(`${API_BASE}/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        toast.error(body.message || "删除失败");
        return;
      }
      toast.success("已删除");
      await load();
    } catch {
      toast.error("请求失败");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="gap-1">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              返回仪表盘
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">分类管理</h1>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </Button>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
      >
        <div className="space-y-2 flex-1">
          <Label htmlFor="new-cat-name">新增分类</Label>
          <Input
            id="new-cat-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称"
            maxLength={255}
          />
        </div>
        <Button type="submit" disabled={creating} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          添加
        </Button>
      </form>

      <div className="rounded-md border bg-card">
        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="text-right w-40">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-muted-foreground py-10"
                  >
                    暂无分类，请先添加。
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.id}</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => openEdit(row)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={editRow != null} onOpenChange={(o) => !o && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="edit-cat-name">名称</Label>
            <Input
              id="edit-cat-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              maxLength={255}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditRow(null)}
            >
              取消
            </Button>
            <Button type="button" onClick={handleSaveEdit} disabled={saving}>
              {saving ? "保存中…" : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除分类</AlertDialogTitle>
            <AlertDialogDescription>
              若该分类下仍有商品，将无法删除。确定要删除吗？
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
    </div>
  );
}

export default DashboardCategories;
