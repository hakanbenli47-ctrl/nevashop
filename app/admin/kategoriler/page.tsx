"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Kategori = {
  id: string;
  ad: string;
  slug: string;
  aktif: boolean;
};

function slugOlustur(metin: string) {
  return metin
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function KategorilerSayfasi() {
  const router = useRouter();

  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [kategoriAdi, setKategoriAdi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    kategorileriGetir();
  }, []);

  const kategorileriGetir = async () => {
    const { data } = await supabase
      .from("kategoriler")
      .select("id, ad, slug, aktif")
      .order("ad", { ascending: true });

    setKategoriler(data || []);
  };

  const kategoriEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesaj("");
    setYukleniyor(true);

    const temizAd = kategoriAdi.trim();

    if (!temizAd) {
      setMesaj("Kategori adı boş olamaz.");
      setYukleniyor(false);
      return;
    }

    const slug = `${slugOlustur(temizAd)}-${Date.now()}`;

    const { error } = await supabase.from("kategoriler").insert({
      ad: temizAd,
      slug,
      aktif: true,
    });

    if (error) {
      setMesaj("Kategori eklenirken hata oluştu.");
      setYukleniyor(false);
      return;
    }

    setKategoriAdi("");
    setMesaj("Kategori başarıyla eklendi.");
    setYukleniyor(false);
    kategorileriGetir();
  };

  const kategoriDurumDegistir = async (kategori: Kategori) => {
    await supabase
      .from("kategoriler")
      .update({ aktif: !kategori.aktif })
      .eq("id", kategori.id);

    kategorileriGetir();
  };

  const kategoriSil = async (id: string) => {
    const onay = confirm(
      "Bu kategoriyi silmek istediğine emin misin? Bu kategoriye bağlı ürünler kategorisiz kalabilir."
    );

    if (!onay) return;

    await supabase.from("kategoriler").delete().eq("id", id);
    kategorileriGetir();
  };

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Kategori Yönetimi
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Saten buket, hediyelik ve özel tasarım gibi ürün kategorilerini buradan yönet.
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
          onSubmit={kategoriEkle}
          className="mb-8 rounded-3xl bg-white p-5 shadow-lg sm:p-6"
        >
          <h2 className="mb-5 text-xl font-bold">Yeni Kategori Ekle</h2>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={kategoriAdi}
              onChange={(e) => setKategoriAdi(e.target.value)}
              placeholder="Kategori adı örn: Saten Buket"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <button
              disabled={yukleniyor}
              className="rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
            >
              {yukleniyor ? "Ekleniyor..." : "Kategori Ekle"}
            </button>
          </div>

          {mesaj && (
            <p className="mt-4 rounded-2xl bg-[#f8f3ec] px-4 py-3 text-sm font-semibold text-zinc-900">
              {mesaj}
            </p>
          )}
        </form>

        <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
          <h2 className="mb-5 text-xl font-bold">Kategoriler</h2>

          {kategoriler.length === 0 ? (
            <p className="text-sm text-zinc-500">Henüz kategori eklenmedi.</p>
          ) : (
            <div className="space-y-4">
              {kategoriler.map((kategori) => (
                <div
                  key={kategori.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-zinc-900">
                        {kategori.ad}
                      </h3>

                      {kategori.aktif ? (
                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Pasif
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-zinc-500">
                      Slug: {kategori.slug}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() => kategoriDurumDegistir(kategori)}
                      className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900"
                    >
                      {kategori.aktif ? "Pasif Yap" : "Aktif Yap"}
                    </button>

                    <button
                      type="button"
                      onClick={() => kategoriSil(kategori.id)}
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