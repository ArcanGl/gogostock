"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import { storage } from "@/lib/storage";

type UserRow = { id: string; username: string; createdAt: number };

export default function AdminUsersPage() {
  const router = useRouter();
  const [me, setMe] = useState("");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pwOpen, setPwOpen] = useState(false);
  const [pwUser, setPwUser] = useState<UserRow | null>(null);
  const [pwValue, setPwValue] = useState("");

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const [deleteAsk, setDeleteAsk] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

  useEffect(() => {
  (async () => {
    const res = await fetch("/api/me", { cache: "no-store" });

    if (!res.ok) {
      router.push("/");
      return;
    }

    const data = await res.json();
    if (data.username !== "admin") {
      router.push("/stock");
      return;
    }

    setMe(data.username);
    load();
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);


  async function load() {
    setLoading(true);
    const res = await fetch("/api/users", {
      headers: { "x-user": "admin" },
      cache: "no-store",
    });

    if (!res.ok) {
      setErr("Kullanıcılar alınamadı.");
      setLoading(false);
      return;
    }

    const data = (await res.json()) as UserRow[];
    setUsers(data);
    setLoading(false);
  }

  async function createUser() {
    setErr(null);
    setOkMsg(null);

    const u = newUsername.trim();
    const p = newPassword;

    if (!u || !p) {
      setErr("Kullanıcı adı ve şifre zorunlu.");
      return;
    }

    const res = await fetch("/api/users/create", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user": "admin" },
      body: JSON.stringify({ username: u, password: p }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.message ?? "Kullanıcı oluşturulamadı.");
      return;
    }

    const created = (await res.json()) as UserRow;
    setUsers((prev) => [created, ...prev]);
    setNewUsername("");
    setNewPassword("");
    setOkMsg(`Kullanıcı oluşturuldu: ${created.username}`);
  }

  function askDelete(u: UserRow) {
    setDeleteTarget(u);
    setDeleteAsk(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const res = await fetch(`/api/users/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "x-user": "admin" },
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setErr(d?.message ?? "Silinemedi.");
      setDeleteAsk(false);
      setDeleteTarget(null);
      return;
    }

    setUsers((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    setDeleteAsk(false);
    setDeleteTarget(null);
    setOkMsg("Kullanıcı silindi.");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Kullanıcı Yönetimi</h1>
            <p className="text-sm text-gray-600">Admin: {me}</p>
          </div>
          <button
            onClick={() => router.push("/stock")}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Stok Paneline Dön
          </button>
        </div>

        <div className="mt-6 rounded-2xl border bg-white p-4">
          <h2 className="text-lg font-semibold">Yeni Kullanıcı</h2>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Kullanıcı adı"
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Şifre"
              type="password"
              className="rounded-xl border px-3 py-2 text-sm"
            />
            <button
              onClick={createUser}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
            >
              Kullanıcı Ekle
            </button>
          </div>

          {err && <div className="mt-3 text-sm text-red-600">{err}</div>}
          {okMsg && <div className="mt-3 text-sm text-green-700">{okMsg}</div>}
        </div>

        <div className="mt-6 rounded-2xl border bg-white overflow-hidden">
          <div className="p-3 border-b text-sm text-gray-600">
            {loading ? "Yükleniyor..." : `${users.length} kullanıcı`}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="p-3">Kullanıcı</th>
                  <th className="p-3">Oluşturma</th>
                  <th className="p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="p-3 font-medium">{u.username}</td>
                    <td className="p-3">{new Date(u.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <button
                        onClick={() => { setPwUser(u); setPwValue(""); setPwOpen(true); }}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50"
                      >
                        Şifre Değiştir
                      </button>
                      <button
                        onClick={() => askDelete(u)}
                        className="rounded-lg border px-3 py-1.5 text-xs hover:bg-red-50 hover:border-red-200 hover:text-red-700 disabled:opacity-40"
                        disabled={u.username === "admin"}
                        title={u.username === "admin" ? "admin silinemez" : "Sil"}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={3} className="p-4 text-gray-500">
                      Kullanıcı yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={deleteAsk}
        title="Silme Onayı"
        message={`"${deleteTarget?.username ?? ""}" kullanıcısı silinsin mi?`}
        confirmText="Evet, Sil"
        cancelText="Hayır"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteAsk(false);
          setDeleteTarget(null);
        }}
      />
      {pwOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Şifre Değiştir</h3>
              <button
                onClick={() => setPwOpen(false)}
                className="rounded-lg px-2 text-xl leading-none hover:bg-gray-100"
                aria-label="Kapat"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Kullanıcı: <span className="font-medium">{pwUser?.username}</span>
            </p>

            <input
              type="password"
              value={pwValue}
              onChange={(e) => setPwValue(e.target.value)}
              placeholder="Yeni şifre (min 6)"
              className="mt-3 w-full rounded-xl border px-3 py-2 text-sm"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setPwOpen(false)}
                className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
              >
                İptal
              </button>

              <button
                onClick={async () => {
                  setErr(null);
                  setOkMsg(null);

                  if (!pwUser) return;
                  if (pwValue.trim().length < 6) {
                    setErr("Yeni şifre en az 6 karakter olmalı.");
                    return;
                  }

                  const res = await fetch(`/api/users/${pwUser.id}/password`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ newPassword: pwValue.trim() }),
                  });

                  if (!res.ok) {
                    const d = await res.json().catch(() => ({}));
                    setErr(d?.message ?? "Şifre değiştirilemedi.");
                    return;
                  }

                  setOkMsg("Şifre güncellendi.");
                  setPwOpen(false);
                  setPwUser(null);
                  setPwValue("");
                }}
                className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-black/90"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
        )}

    </div>
    
  );
  
}
