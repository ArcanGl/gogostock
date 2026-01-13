"use client";

import { useEffect, useMemo, useState } from "react";
import { Currency, Product } from "@/lib/types";

type Mode = "create" | "edit";

type Props = {
  open: boolean;
  mode: Mode;
  initial?: Product | null;
  onClose: () => void;
  onSubmit: (product: Product) => void;
};

export default function ProductFormModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [images, setImages] = useState<string[]>([]);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [barcode, setBarcode] = useState("");

  const [stock, setStock] = useState<string>("");
  const [arrivalDate, setArrivalDate] = useState<string>("");

  const [chinaBuyPrice, setChinaBuyPrice] = useState<string>("");
  const [chinaBuyCurrency, setChinaBuyCurrency] = useState<Currency>("USD");

  const [trPrice, setTrPrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [freightPrice, setFreightPrice] = useState<string>("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      setImages(initial.images ?? []);
      setType(initial.productType ?? "");
      setName(initial.productName ?? "");
      setCode(initial.productCode ?? "");
      setBarcode(initial.barcode ?? "");
      setStock(String(initial.stockQuantity ?? 0));
      setArrivalDate(initial.arrivalDate ?? "");
      setChinaBuyPrice(String(initial.chinaBuyPrice ?? ""));
      setChinaBuyCurrency(initial.chinaBuyCurrency ?? "USD");
      setTrPrice(initial.trPrice != null ? String(initial.trPrice) : "");
      setSalePrice(initial.salePrice != null ? String(initial.salePrice) : "");
      setFreightPrice(initial.freightPrice != null ? String(initial.freightPrice) : "");
    } else {
      setImages([]);
      setType("");
      setName("");
      setCode("");
      setBarcode("");
      setStock("");
      setArrivalDate("");
      setChinaBuyPrice("");
      setChinaBuyCurrency("USD");
      setTrPrice("");
      setSalePrice("");
      setFreightPrice("");
    }
  }, [open, mode, initial]);

  const requiredOk = useMemo(() => {
    const stockNum = Number(stock);
    const buyNum = Number(chinaBuyPrice);

    return (
      type.trim().length > 0 &&
      name.trim().length > 0 &&
      code.trim().length > 0 &&
      Number.isFinite(stockNum) &&
      stockNum >= 0 &&
      arrivalDate.trim().length > 0 &&
      Number.isFinite(buyNum) &&
      buyNum >= 0
    );
  }, [type, name, code, stock, arrivalDate, chinaBuyPrice]);

  if (!open) return null;

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files);

    const results: string[] = [];
    for (const f of list) {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("file read error"));
        reader.readAsDataURL(f);
      });
      results.push(dataUrl);
    }

    setImages((prev) => [...prev, ...results]);
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function toOptNumber(v: string): number | undefined {
    if (v.trim() === "") return undefined;
    const n = Number(v);
    if (!Number.isFinite(n)) return undefined;
    return n;
  }

  function submit() {
    if (!requiredOk) return;

    const now = Date.now();

    const p: Product = {
      id: mode === "edit" && initial?.id ? initial.id : crypto.randomUUID(),
      images,

      productType: type.trim(),
      productName: name.trim(),
      productCode: code.trim(),
      barcode: barcode.trim() ? barcode.trim() : undefined,

      stockQuantity: Math.max(0, Math.floor(Number(stock))),
      arrivalDate,

      chinaBuyPrice: Number(chinaBuyPrice),
      chinaBuyCurrency,

      trPrice: toOptNumber(trPrice),
      salePrice: toOptNumber(salePrice),
      freightPrice: toOptNumber(freightPrice),

      createdAt: mode === "edit" && initial?.createdAt ? initial.createdAt : now,
    };

    onSubmit(p);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl max-h-[85vh] overflow-hidden">
        {/* Header sticky */}
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">
            {mode === "create" ? "Ürün Ekle" : "Ürünü Düzenle"}
          </h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 hover:bg-gray-100">
            ✕
          </button>
        </div>

        {/* Body scroll */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(85vh-150px)]">
          {/* Images */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Ürün Görseli (çoklu)</label>

            <input
              id="product-images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              <label
                htmlFor="product-images"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
              >
                Görsel Seç
              </label>
              <span className="text-xs text-gray-500">
                {images.length > 0 ? `${images.length} görsel seçildi` : "Henüz görsel seçilmedi"}
              </span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-auto rounded-xl border p-2">
                {images.map((src, idx) => (
                  <div key={idx} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="product" className="h-20 w-20 rounded-xl object-cover border" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 rounded-full bg-black text-white text-xs w-6 h-6"
                      title="Sil"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Field label="Ürün Cinsi *" value={type} setValue={setType} placeholder="Örn: Oyuncak" />
          <Field label="Ürün Adı *" value={name} setValue={setName} placeholder="Örn: Dinozor Set" />
          <Field label="Ürün Kodu *" value={code} setValue={setCode} placeholder="Örn: GOGO-001" />
          <Field label="Ürün Barkodu" value={barcode} setValue={setBarcode} placeholder="Opsiyonel" />

          <Field label="Stok Adedi *" value={stock} setValue={setStock} placeholder="Örn: 50" inputMode="numeric" />
          <div className="space-y-1">
            <label className="text-sm font-medium">Stoğa Giriş Tarihi *</label>
            <input
              type="date"
              value={arrivalDate}
              onChange={(e) => setArrivalDate(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <Field
            label="Çin Alış Fiyatı *"
            value={chinaBuyPrice}
            setValue={setChinaBuyPrice}
            placeholder="Örn: 3.25"
            inputMode="decimal"
          />

          <div className="space-y-1">
            <label className="text-sm font-medium">Para Birimi *</label>
            <select
              value={chinaBuyCurrency}
              onChange={(e) => setChinaBuyCurrency(e.target.value as Currency)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            >
              <option value="USD">Dolar (USD)</option>
              <option value="CNY">Yuan (CNY)</option>
            </select>
          </div>

          <Field label="TR Fiyatı" value={trPrice} setValue={setTrPrice} placeholder="Opsiyonel" inputMode="decimal" />
          <Field label="Satış Fiyatı" value={salePrice} setValue={setSalePrice} placeholder="Opsiyonel" inputMode="decimal" />
          <Field label="Navlun Fiyatı" value={freightPrice} setValue={setFreightPrice} placeholder="Opsiyonel" inputMode="decimal" />
        </div>

        {/* Footer sticky */}
        <div className="p-5 flex items-center justify-between border-t sticky bottom-0 bg-white z-10">
          <p className="text-xs text-gray-500">* zorunlu alanlar</p>

          <div className="flex gap-3">
            <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50" type="button">
              İptal
            </button>
            <button
              disabled={!requiredOk}
              onClick={submit}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 disabled:opacity-40"
              type="button"
            >
              {mode === "create" ? "Ekle" : "Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  setValue,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
      />
    </div>
  );
}
