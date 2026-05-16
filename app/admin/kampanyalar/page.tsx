"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SiteAyari = {
  id: string;
  site_adi: string | null;
  telefon: string | null;
  whatsapp: string | null;
  kampanya_baslik: string | null;
  kampanya_aciklama: string | null;
};

export default function KampanyalarSayfasi() {
  const router = useRouter();

  const [ayarId, setAyarId] = useState("");
  const [kampanyaBaslik, setKampanyaBaslik] = useState("");
  const [kampanyaAciklama, setKampanyaAciklama] = useState("");

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    ayarlariGetir();
  }, []);

  const ayarlariGetir = async () => {
    setSayfaYukleniyor(true);

    const { data, error } = await supabase
      .from("site_ayarlari")
      .select("id, site_adi, telefon, whatsapp, kampanya_baslik, kampanya_aciklama")
      .limit(1)
      .single();

    if (error || !data) {
      setMesaj("Site ayarları alınamadı.");
      setSayfaYukleniyor(false);
      return;
    }

    const ayar = data as SiteAyari;

    setAyarId(ayar.id);
    setKampanyaBaslik(ayar.kampanya_baslik || "");
    setKampanyaAciklama(ayar.kampanya_aciklama || "");
    setSayfaYukleniyor(false);
  };

  const kampanyaGuncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesaj("");
    setKaydediliyor(true);

    const { error } = await supabase
      .from("site_ayarlari")
      .update({
        kampanya_baslik: kampanyaBaslik,
        kampanya_aciklama: kampanyaAciklama,
      })
      .eq("id", ayarId);

    if (error) {
      setMesaj("Kampanya güncellenirken hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    setMesaj("Kampanya başarıyla güncellendi.");
    setKaydediliyor(false);
  };

  if (sayfaYukleniyor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ec] text-zinc-900">
        Kampanya bilgileri yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Kampanya Yönetimi
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Anasayfada görünecek kampanya başlığını ve açıklamasını buradan düzenle.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:flex">
            <button
              type="button"
              onClick={() => router.push("/admin/panel")}
              className="rounded-2xl bg-zinc-100 px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
            >
              Panele Dön
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/urunler/yeni")}
              className="rounded-2xl bg-[#b68b5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f7448]"
            >
              Yeni Ürün Ekle
            </button>
          </div>
        </div>

        <form
          onSubmit={kampanyaGuncelle}
          className="rounded-3xl bg-white p-5 shadow-lg sm:p-6"
        >
          <h2 className="mb-5 text-xl font-bold">Kampanya Bilgileri</h2>

          <input
            value={kampanyaBaslik}
            onChange={(e) => setKampanyaBaslik(e.target.value)}
            placeholder="Kampanya başlığı"
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <textarea
            value={kampanyaAciklama}
            onChange={(e) => setKampanyaAciklama(e.target.value)}
            placeholder="Kampanya açıklaması"
            className="mt-4 min-h-32 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <div className="mt-6 rounded-3xl bg-[#f8f3ec] p-5">
            <p className="text-sm font-semibold text-[#b68b5b]">
              Anasayfa Önizleme
            </p>

            <h3 className="mt-2 text-2xl font-bold text-zinc-900">
              {kampanyaBaslik || "Kampanya başlığı burada görünecek"}
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {kampanyaAciklama || "Kampanya açıklaması burada görünecek."}
            </p>
          </div>

          {mesaj && (
            <p className="mt-4 rounded-2xl bg-[#f8f3ec] px-4 py-3 text-sm font-semibold text-zinc-900">
              {mesaj}
            </p>
          )}

          <button
            disabled={kaydediliyor}
            className="mt-6 rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {kaydediliyor ? "Kaydediliyor..." : "Kampanyayı Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}