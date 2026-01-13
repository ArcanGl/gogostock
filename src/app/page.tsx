"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkCredentials } from "@/lib/auth";
import { storage } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = storage.getAuth();
    if (auth?.remember && auth.username) {
      router.push("/stock");
    }
  }, [router]);

  async function submit(e: React.FormEvent) {
  e.preventDefault();
  setError(null);

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username.trim(), password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    setError(data?.message ?? "Giriş başarısız.");
    return;
  }

  const data = await res.json();
  storage.setAuth({ username: data.username, remember });
  router.push("/stock");
}

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border p-6">
        <h1 className="text-2xl font-semibold">GOGO Stok Takip</h1>
        <p className="text-sm text-gray-600 mt-1">Giriş yaparak devam edin.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">User Name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Kullanıcı adı"
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <div className="flex gap-2">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Şifre"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="shrink-0 rounded-xl border px-3 text-sm hover:bg-gray-50"
              >
                {showPass ? "Gizle" : "Göster"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4"
            />
            Beni Hatırla
          </label>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button className="w-full rounded-xl bg-black py-2.5 text-sm text-white hover:bg-black/90">
            Giriş Yap
          </button>
        </form>
      </div>
    </div>
  );
}
