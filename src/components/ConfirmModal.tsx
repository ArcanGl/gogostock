"use client";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title = "Emin misiniz?",
  message,
  confirmText = "Evet",
  cancelText = "Hayır",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="p-5">
          <p className="text-sm text-gray-700">{message}</p>
        </div>

        <div className="p-5 pt-0 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
