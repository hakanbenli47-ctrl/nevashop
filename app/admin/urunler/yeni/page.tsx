"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Kategori = {
  id: string;
  ad: string;
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

export default function YeniUrunEkleSayfasi() {
  const router = useRouter();

  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);

  const [ad, setAd] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [stok, setStok] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [kampanyaMetni, setKampanyaMetni] = useState("");
  const [oneCikan, setOneCikan] = useState(false);
  const [aktif, setAktif] = useState(true);

  const [fotograflar, setFotograflar] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const [fotografOnizlemeleri, setFotografOnizlemeleri] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    kategorileriGetir();
  }, []);

  const kategorileriGetir = async () => {
    const { data } = await supabase
      .from("kategoriler")
      .select("id, ad")
      .eq("aktif", true)
      .order("ad", { ascending: true });

    setKategoriler(data || []);
  };

  const fotografSec = (index: number, dosya: File | null) => {
    if (!dosya) return;

    const yeniFotograflar = [...fotograflar];
    yeniFotograflar[index] = dosya;
    setFotograflar(yeniFotograflar);

    const yeniOnizlemeler = [...fotografOnizlemeleri];
    yeniOnizlemeler[index] = URL.createObjectURL(dosya);
    setFotografOnizlemeleri(yeniOnizlemeler);
  };

  const fotografKaldir = (index: number) => {
    const yeniFotograflar = [...fotograflar];
    yeniFotograflar[index] = null;
    setFotograflar(yeniFotograflar);

    const yeniOnizlemeler = [...fotografOnizlemeleri];
    yeniOnizlemeler[index] = "";
    setFotografOnizlemeleri(yeniOnizlemeler);
  };

  const urunEkle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesaj("");
    setYukleniyor(true);

    const secilenFotograflar = fotograflar.filter(
      (fotograf): fotograf is File => fotograf !== null
    );

    if (secilenFotograflar.length === 0) {
      setMesaj("Lütfen en az 1 ürün fotoğrafı seç.");
      setYukleniyor(false);
      return;
    }

    const slug = `${slugOlustur(ad)}-${Date.now()}`;

    const { data: yeniUrun, error: urunHatasi } = await supabase
      .from("urunler")
      .insert({
        ad,
        slug,
        fiyat: Number(fiyat),
        stok: Number(stok),
        kategori_id: kategoriId || null,
        aciklama,
        kampanya_metni: kampanyaMetni || null,
        one_cikan: oneCikan,
        aktif,
      })
      .select()
      .single();

    if (urunHatasi || !yeniUrun) {
      setMesaj("Ürün eklenirken hata oluştu.");
      setYukleniyor(false);
      return;
    }

    for (let i = 0; i < secilenFotograflar.length; i++) {
      const dosya = secilenFotograflar[i];
      const dosyaUzantisi = dosya.name.split(".").pop();
      const dosyaAdi = `${yeniUrun.id}/${Date.now()}-${i}.${dosyaUzantisi}`;

      const { error: yuklemeHatasi } = await supabase.storage
        .from("urun-gorselleri")
        .upload(dosyaAdi, dosya);

      if (!yuklemeHatasi) {
        const { data } = supabase.storage
          .from("urun-gorselleri")
          .getPublicUrl(dosyaAdi);

        await supabase.from("urun_fotograflari").insert({
          urun_id: yeniUrun.id,
          fotograf_url: data.publicUrl,
          sira: i,
        });
      }
    }

    setAd("");
    setFiyat("");
    setStok("");
    setKategoriId("");
    setAciklama("");
    setKampanyaMetni("");
    setOneCikan(false);
    setAktif(true);
    setFotograflar([null, null, null, null]);
    setFotografOnizlemeleri(["", "", "", ""]);

    setMesaj("Ürün başarıyla eklendi.");
    setYukleniyor(false);
  };

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Yeni Ürün Ekle
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Ürün bilgilerini, stok miktarını, kampanya yazısını ve görselleri
              buradan ekle.
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
              onClick={() => router.push("/admin/urunler")}
              className="rounded-2xl bg-[#b68b5b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9f7448]"
            >
              Ürünleri Yönet
            </button>
          </div>
        </div>

        <form
          onSubmit={urunEkle}
          className="rounded-3xl bg-white p-5 shadow-lg sm:p-6"
        >
          <h2 className="mb-5 text-xl font-bold">Ürün Bilgileri</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={ad}
              onChange={(e) => setAd(e.target.value)}
              placeholder="Ürün adı"
              required
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <input
              value={fiyat}
              onChange={(e) => setFiyat(e.target.value)}
              placeholder="Fiyat"
              type="number"
              required
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <input
              value={stok}
              onChange={(e) => setStok(e.target.value)}
              placeholder="Stok"
              type="number"
              required
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <select
              value={kategoriId}
              onChange={(e) => setKategoriId(e.target.value)}
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            >
              <option value="">Kategori seç</option>
              {kategoriler.map((kategori) => (
                <option key={kategori.id} value={kategori.id}>
                  {kategori.ad}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={aciklama}
            onChange={(e) => setAciklama(e.target.value)}
            placeholder="Ürün açıklaması"
            className="mt-4 min-h-28 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <input
            value={kampanyaMetni}
            onChange={(e) => setKampanyaMetni(e.target.value)}
            placeholder="Kampanya yazısı örn: Yeni sezon / %10 indirim"
            className="mt-4 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <div className="mt-6">
            <label className="mb-3 block text-sm font-semibold text-zinc-700">
              Ürün Fotoğrafları
            </label>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-zinc-200 bg-white p-3"
                >
                  <p className="mb-2 text-sm font-semibold text-zinc-700">
                    {index + 1}. Görsel
                  </p>

                  {fotografOnizlemeleri[index] ? (
                    <div className="overflow-hidden rounded-xl border border-zinc-100">
                      <img
                        src={fotografOnizlemeleri[index]}
                        alt={`${index + 1}. ürün görseli`}
                        className="h-40 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400">
                      Görsel seçilmedi
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      fotografSec(
                        index,
                        e.target.files ? e.target.files[0] : null
                      )
                    }
                    className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                  />

                  {fotografOnizlemeleri[index] && (
                    <button
                      type="button"
                      onClick={() => fotografKaldir(index)}
                      className="mt-3 w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      Görseli Kaldır
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Her ürün için en fazla 4 görsel ekleyebilirsin. 1. görsel ana
              ürün görseli olarak kullanılacak.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={oneCikan}
                onChange={(e) => setOneCikan(e.target.checked)}
              />
              Öne çıkan ürün
            </label>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={aktif}
                onChange={(e) => setAktif(e.target.checked)}
              />
              Ürün aktif
            </label>
          </div>

          {mesaj && (
            <p className="mt-4 rounded-2xl bg-[#f8f3ec] px-4 py-3 text-sm font-semibold text-zinc-900">
              {mesaj}
            </p>
          )}

          <button
            disabled={yukleniyor}
            className="mt-6 rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {yukleniyor ? "Ekleniyor..." : "Ürünü Ekle"}
          </button>
        </form>
      </div>
    </main>
  );
}