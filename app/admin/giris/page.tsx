"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminGirisSayfasi() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata("");
    setYukleniyor(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: sifre,
    });

    setYukleniyor(false);

    if (error) {
      setHata("E-posta veya şifre hatalı.");
      return;
    }

    router.push("/admin/panel");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f3ec] px-4">
      <form
        onSubmit={girisYap}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
      >
        <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>

        <h1 className="mt-2 text-3xl font-bold text-zinc-900">
          Admin Girişi
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Ürünleri, siparişleri ve stokları yönetmek için giriş yapın.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-black placeholder:text-zinc-400 outline-none transition focus:border-[#b68b5b]"
            required
          />

          <input
            type="password"
            placeholder="Şifre"
            value={sifre}
            onChange={(e) => setSifre(e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-black placeholder:text-zinc-400 outline-none transition focus:border-[#b68b5b]"
            required
          />
        </div>

        {hata && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {hata}
          </p>
        )}

        <button
          type="submit"
          disabled={yukleniyor}
          className="mt-6 w-full rounded-2xl bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:bg-[#b68b5b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}