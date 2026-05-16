"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Urun = {
  id: string;
  ad: string;
  fiyat: number;
  stok: number;
  aktif: boolean;
  one_cikan: boolean;
  kampanya_metni: string | null;
  created_at: string;
};

export default function AdminUrunlerListeSayfasi() {
  const router = useRouter();
  const [urunler, setUrunler] = useState<Urun[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    urunleriGetir();
  }, []);

  const urunleriGetir = async () => {
    setYukleniyor(true);

    const { data, error } = await supabase
      .from("urunler")
      .select("id, ad, fiyat, stok, aktif, one_cikan, kampanya_metni, created_at")
      .order("created_at", { ascending: false });

    if (!error) {
      setUrunler(data || []);
    }

    setYukleniyor(false);
  };

  const urunSil = async (id: string) => {
    const onay = confirm("Bu ürünü silmek istediğine emin misin?");
    if (!onay) return;

    await supabase.from("urunler").delete().eq("id", id);
    urunleriGetir();
  };

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Ürünleri Yönet
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Eklenen ürünleri buradan görüntüle, düzenle veya sil.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:flex">
            <button
              onClick={() => router.push("/admin/panel")}
              className="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-900"
            >
              Panele Dön
            </button>

            <button
              onClick={() => router.push("/admin/urunler/yeni")}
              className="rounded-2xl bg-[#b68b5b] px-5 py-3 text-sm font-semibold text-white"
            >
              + Yeni Ürün
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
          {yukleniyor ? (
            <p className="text-sm text-zinc-500">Ürünler yükleniyor...</p>
          ) : urunler.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <h2 className="text-xl font-bold">Henüz ürün yok</h2>
              <p className="mt-2 text-sm text-zinc-500">
                İlk ürünü ekleyerek Neva Shop kataloğunu oluşturmaya başlayabilirsin.
              </p>

              <button
                onClick={() => router.push("/admin/urunler/yeni")}
                className="mt-5 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
              >
                İlk Ürünü Ekle
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {urunler.map((urun) => (
                <div
                  key={urun.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-zinc-900">{urun.ad}</h2>

                      {urun.one_cikan && (
                        <span className="rounded-full bg-[#f8f3ec] px-3 py-1 text-xs font-semibold text-[#b68b5b]">
                          Öne Çıkan
                        </span>
                      )}

                      {!urun.aktif && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Pasif
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">
                      {urun.fiyat} TL · Stok: {urun.stok}
                    </p>

                    {urun.kampanya_metni && (
                      <p className="mt-1 text-sm font-medium text-[#b68b5b]">
                        {urun.kampanya_metni}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      onClick={() =>
                        router.push(`/admin/urunler/duzenle/${urun.id}`)
                      }
                      className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900"
                    >
                      Düzenle
                    </button>

                    <button
                      onClick={() => urunSil(urun.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}