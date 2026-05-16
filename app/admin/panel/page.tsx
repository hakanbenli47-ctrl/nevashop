"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminPanelSayfasi() {
  const router = useRouter();
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const kontrolEt = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/admin/giris");
        return;
      }

      setYukleniyor(false);
    };

    kontrolEt();
  }, [router]);

  const cikisYap = async () => {
    await supabase.auth.signOut();
    router.push("/admin/giris");
  };

  if (yukleniyor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ec] text-zinc-900">
        Yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
              Yönetim Paneli
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Ürünleri, stokları, kampanyaları ve siparişleri buradan yönet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:flex">
            <button
              onClick={() => router.push("/admin/urunler/yeni")}
              className="rounded-2xl bg-[#b68b5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f7448]"
            >
              + Yeni Ürün
            </button>

            <button
              onClick={() => router.push("/admin/siparisler")}
              className="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              Siparişler
            </button>

            <button
              onClick={cikisYap}
              className="rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => router.push("/admin/urunler")}
            className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3ec] text-xl">
              🛍️
            </div>
            <h2 className="text-xl font-bold text-zinc-900">
              Ürünleri Yönet
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Eklenen ürünleri listele, düzenle, sil ve stok durumlarını takip et.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/urunler/yeni")}
            className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3ec] text-xl">
              ➕
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Yeni Ürün Ekle</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Çoklu görsel, fiyat, stok, açıklama ve kampanya bilgisiyle ürün ekle.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/kategoriler")}
            className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3ec] text-xl">
              📂
            </div>
            <h2 className="text-xl font-bold text-zinc-900">
              Kategoriler
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Saten buket, hediyelik ve özel tasarım gibi kategorileri yönet.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/siparisler")}
            className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3ec] text-xl">
              📦
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Siparişler</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              WhatsApp’a yönlenen siparişleri gör, onayla ve stoktan düş.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/kampanyalar")}
            className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3ec] text-xl">
              🎁
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Kampanyalar</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Anasayfada görünecek kampanya başlığı ve açıklamasını düzenle.
            </p>
          </button>

          <button
            onClick={() => router.push("/admin/ayarlar")}
            className="rounded-3xl bg-white p-6 text-left shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3ec] text-xl">
              ⚙️
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Site Ayarları</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Telefon, WhatsApp numarası ve temel site bilgilerini yönet.
            </p>
          </button>
        </div>
      </div>
    </main>
  );
}