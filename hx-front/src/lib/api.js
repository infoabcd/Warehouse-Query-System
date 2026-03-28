import { PRODUCT_CATEGORIES } from "./categories";

const raw = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const API_BASE = String(raw).replace(/\/$/, "");

export function mediaImageUrl(fileName) {
  if (!fileName) return "";
  return `${API_BASE}/media/images/${fileName}`;
}

/** 公开分类：优先接口，失败则用本地常量 */
export async function postAdminLogout() {
  await fetch(`${API_BASE}/admin/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchPublicCategories() {
  try {
    const r = await fetch(`${API_BASE}/categories`);
    if (!r.ok) throw new Error("bad status");
    const data = await r.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((c) => ({ id: c.id, name: c.name }));
    }
  } catch {
    /* 使用下方 fallback */
  }
  return PRODUCT_CATEGORIES.map((c) => ({ id: c.id, name: c.name }));
}
