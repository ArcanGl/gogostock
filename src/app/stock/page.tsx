"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { storage } from "@/lib/storage";
import { Filters, Product, SortOption } from "@/lib/types";
import ProductFormModal from "@/components/ProductFormModal";
import SellModal from "@/components/SellModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function StockPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Product | null>(null);

  const [sellOpen, setSellOpen] = useState(false);
  const [sellProduct, setSellProduct] = useState<Product | null>(null);

  const [logoutAsk, setLogoutAsk] = useState(false);

  const [deleteAsk, setDeleteAsk] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const [sort, setSort] = useState<SortOption>("arrival_new");
  const [filters, setFilters] = useState<Filters>({ status: "all", type: "all" });
  const [search, setSearch] = useState("");

  // auth + initial load
  useEffect(() => {
    const auth = storage.getAuth();
    if (!auth?.username) {
      router.push("/");
      return;
    }
    setUsername(auth.username);
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products", { cache: "no-store" });
    const data = (await res.json()) as Product[];
    setProducts(data);
    setLoading(false);
  }

  const productTypes = useMemo(() => {
    const uniq = Array.from(new Set(products.map((p) => p.productType))).filter(Boolean);
    return uniq.sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredSorted = useMemo(() => {
    let list = [...products];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = (p.productName ?? "").toLowerCase();
        const code = (p.productCode ?? "").toLowerCase();
        const barcode = (p.barcode ?? "").toLowerCase();
        return name.includes(q) || code.includes(q) || barcode.includes(q);
      });
    }

    if (filters.status !== "all") {
      list = list.filter((p) => {
        const active = p.stockQuantity > 0;
        return filters.status === "active" ? active : !active;
      });
    }

    if (filters.type !== "all") {
      list = list.filter((p) => p.productType === filters.type);
    }

    list.sort((a, b) => {
      if (sort === "stock_asc") return a.stockQuantity - b.stockQuantity;
      if (sort === "stock_desc") return b.stockQuantity - a.stockQuantity;
      if (sort === "arrival_new") return b.arrivalDate.localeCompare(a.arrivalDate);
      return a.arrivalDate.localeCompare(b.arrivalDate);
    });

    return list;
  }, [products, filters, sort, search]);

  function openCreate() {
    setFormMode("create");
    setEditing(null);
    setOpenForm(true);
  }

  function openEdit(p: Product) {
    setFormMode("edit");
    setEditing(p);
    setOpenForm(true);
  }

  async function upsertProduct(p: Product) {
    // create
    if (formMode === "create") {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const created = (await res.json()) as Product;
      setProducts((prev) => [created, ...prev]);
    } else {
      // update
      const res = await fetch(`/api/products/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      const updated = (await res.json()) as Product;
      setProducts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    }

    setOpenForm(false);
    setEditing(null);
  }

  function openSell(p: Product) {
    setSellProduct(p);
    setSellOpen(true);
  }

  // ✅ satış: DB + UI güncelle
  async function confirmSell(qty: number) {
    if (!sellProduct) return;

    const current = sellProduct;
    const newStock = Math.max(0, current.stockQuantity - qty);
    const updated: Product = { ...current, stockQuantity: newStock };

    const res = await fetch(`/api/products/${current.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    const saved = (await res.json()) as Product;
    setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));

    setSellOpen(false);
    setSellProduct(null);
  }

  function askDelete(p: Product) {
    setDeleteProduct(p);
    setDeleteAsk(true);
  }

  // ✅ silme: DB + UI güncelle
  async function confirmDelete() {
    if (!deleteProduct) return;

    await fetch(`/api/products/${deleteProduct.id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((x) => x.id !== deleteProduct.id));

    setDeleteAsk(false);
    setDeleteProduct(null);
  }

  function logout() {
    storage.clearAuth();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">{username} Hoşgeldiniz</h1>
            <p className="text-sm text-gray-600">Stok takip paneli</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            {username === "admin" && (
              <button
                onClick={() => router.push("/admin/users")}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                Kullanıcı Yönetimi
              </button>
            )}

            <button
              onClick={openCreate}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
            >
              Ürün Ekle
            </button>

            <div className="rounded-2xl border bg-white p-3 flex flex-col md:flex-row gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600">Arama</label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ürün adı / kod / barkod"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600">Sıralama</label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="stock_asc">Stok Adedine göre Artan</option>
                  <option value="stock_desc">Stok Adedine göre Azalan</option>
                  <option value="arrival_new">Geliş Tarihine Göre (Yeni Gelen)</option>
                  <option value="arrival_old">Geliş Tarihine Göre (Eski Gelen)</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600">Filtre: Aktif/Pasif</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, status: e.target.value as Filters["status"] }))
                  }
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="all">Hepsi</option>
                  <option value="active">Aktif</option>
                  <option value="passive">Pasif</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600">Filtre: Ürün Cinsi</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  className="rounded-xl border px-3 py-2 text-sm"
                >
                  <option value="all">Hepsi</option>
                  {productTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="mt-6 rounded-2xl border bg-white overflow-hidden">
          <div className="p-3 border-b text-sm text-gray-600">
            {loading ? "Yükleniyor..." : `${filteredSorted.length} ürün`}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Görseller</th>
                  <th className="p-3">Ürün Cinsi</th>
                  <th className="p-3">Ürün Adı</th>
                  <th className="p-3">Ürün Kodu</th>
                  <th className="p-3">Barkod</th>
                  <th className="p-3">Stok</th>
                  <th className="p-3">Giriş Tarihi</th>
                  <th className="p-3">Çin Alış</th>
                  <th className="p-3">TR Fiyatı</th>
                  <th className="p-3">Satış Fiyatı</th>
                  <th className="p-3">Navlun</th>
                  <th className="p-3">Aktif/Pasif</th>
                  <th className="p-3">Eylemler</th>
                </tr>
              </thead>

              <tbody>
                {filteredSorted.length === 0 ? (
                  <tr>
                    <td className="p-4 text-gray-500" colSpan={13}>
                      {loading ? "..." : "Henüz ürün yok."}
                    </td>
                  </tr>
                ) : (
                  filteredSorted.map((p) => {
                    const isActive = p.stockQuantity > 0;
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">
                          <div className="flex gap-2">
                            {p.images?.slice(0, 3).map((src, idx) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={idx}
                                src={src}
                                alt="img"
                                className="h-10 w-10 rounded-lg object-cover border"
                              />
                            ))}
                            {p.images?.length > 3 && (
                              <div className="h-10 w-10 rounded-lg border flex items-center justify-center text-xs text-gray-600">
                                +{p.images.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">{p.productType}</td>
                        <td className="p-3 font-medium">{p.productName}</td>
                        <td className="p-3">{p.productCode}</td>
                        <td className="p-3">{p.barcode ?? "-"}</td>
                        <td className="p-3">{p.stockQuantity}</td>
                        <td className="p-3">{p.arrivalDate}</td>
                        <td className="p-3">
                          {p.chinaBuyPrice} {p.chinaBuyCurrency}
                        </td>
                        <td className="p-3">{p.trPrice ?? "-"}</td>
                        <td className="p-3">{p.salePrice ?? "-"}</td>
                        <td className="p-3">{p.freightPrice ?? "-"}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openSell(p)}
                              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                            >
                              Satış
                            </button>
                            <button
                              onClick={() => openEdit(p)}
                              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                            >
                              Düzelt
                            </button>
                            <button
                              onClick={() => askDelete(p)}
                              className="rounded-lg border px-3 py-1.5 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom logout */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setLogoutAsk(true)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Çıkış
          </button>
        </div>
      </div>

      <ProductFormModal
        open={openForm}
        mode={formMode}
        initial={editing}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={upsertProduct}
      />

      <SellModal
        open={sellOpen}
        product={sellProduct}
        onClose={() => {
          setSellOpen(false);
          setSellProduct(null);
        }}
        onConfirm={confirmSell}
      />

      <ConfirmModal
        open={logoutAsk}
        message="Çıkış yapmak istediğinize emin misiniz?"
        onCancel={() => setLogoutAsk(false)}
        onConfirm={logout}
        confirmText="Evet"
        cancelText="Hayır"
      />

      <ConfirmModal
        open={deleteAsk}
        title="Silme Onayı"
        message={`"${deleteProduct?.productName ?? ""}" ürünü silinsin mi? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
        cancelText="Hayır"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteAsk(false);
          setDeleteProduct(null);
        }}
      />
    </div>
  );
}
