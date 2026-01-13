"use client";

import { useEffect, useMemo, useState } from "react";
import { Product } from "@/lib/types";

type Props = {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onConfirm: (sellQty: number) => void;
};

export default function SellModal({ open, product, onClose, onConfirm }: Props) {
  const [qty, setQty] = useState<string>("");

  useEffect(() => {
    if (open) setQty("");
  }, [open]);

  const max = useMemo(() => product?.stockQuantity ?? 0, [product]);

  if (!open || !product) return null;

  const parsed = Number(qty);
  const valid =
    Number.isFinite(parsed) && parsed > 0 && Number.isInteger(parsed) && parsed <= max;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold">Satış</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 hover:bg-gray-100">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-2">
          <div className="text-sm text-gray-700">
            <div className="font-medium">{product.productName}</div>
            <div className="text-xs text-gray-500">Mevcut stok: {product.stockQuantity}</div>
          </div>

          <label className="text-sm font-medium">Satış Adedi</label>
          <input
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            inputMode="numeric"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Örn: 3"
          />

          {!valid && qty !== "" && (
            <p className="text-xs text-red-600">1 ile {max} arasında tam sayı giriniz.</p>
          )}
        </div>

        <div className="p-5 pt-0 flex gap-3 justify-end">
          <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
            İptal
          </button>
          <button
            disabled={!valid}
            onClick={() => onConfirm(parsed)}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90 disabled:opacity-40"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
