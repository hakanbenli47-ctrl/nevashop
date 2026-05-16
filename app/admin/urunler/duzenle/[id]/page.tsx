"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Kategori = {
  id: string;
  ad: string;
};

type UrunFotografi = {
  id: string;
  fotograf_url: string;
  sira: number;
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

export default function UrunDuzenleSayfasi() {
  const router = useRouter();
  const params = useParams();
  const urunId = params.id as string;

  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [mevcutFotograflar, setMevcutFotograflar] = useState<
    (UrunFotografi | null)[]
  >([null, null, null, null]);

  const [yeniFotograflar, setYeniFotograflar] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const [yeniOnizlemeler, setYeniOnizlemeler] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);

  const [ad, setAd] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [stok, setStok] = useState("");
  const [kategoriId, setKategoriId] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [kampanyaMetni, setKampanyaMetni] = useState("");
  const [oneCikan, setOneCikan] = useState(false);
  const [aktif, setAktif] = useState(true);

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    kategorileriGetir();
    urunuGetir();
    fotograflariGetir();
  }, []);

  const kategorileriGetir = async () => {
    const { data } = await supabase
      .from("kategoriler")
      .select("id, ad")
      .eq("aktif", true)
      .order("ad", { ascending: true });

    setKategoriler(data || []);
  };

  const urunuGetir = async () => {
    const { data, error } = await supabase
      .from("urunler")
      .select(
        "ad, fiyat, stok, kategori_id, aciklama, kampanya_metni, one_cikan, aktif"
      )
      .eq("id", urunId)
      .single();

    if (error || !data) {
      setMesaj("Ürün bilgisi alınamadı.");
      setSayfaYukleniyor(false);
      return;
    }

    setAd(data.ad || "");
    setFiyat(String(data.fiyat || ""));
    setStok(String(data.stok || ""));
    setKategoriId(data.kategori_id || "");
    setAciklama(data.aciklama || "");
    setKampanyaMetni(data.kampanya_metni || "");
    setOneCikan(Boolean(data.one_cikan));
    setAktif(Boolean(data.aktif));

    setSayfaYukleniyor(false);
  };

  const fotograflariGetir = async () => {
    const { data } = await supabase
      .from("urun_fotograflari")
      .select("id, fotograf_url, sira")
      .eq("urun_id", urunId)
      .order("sira", { ascending: true });

    const siraliFotograflar: (UrunFotografi | null)[] = [
      null,
      null,
      null,
      null,
    ];

    (data || []).slice(0, 4).forEach((fotograf, index) => {
      siraliFotograflar[index] = fotograf;
    });

    setMevcutFotograflar(siraliFotograflar);
  };

  const yeniFotografSec = (index: number, dosya: File | null) => {
    if (!dosya) return;

    const yeniDosyalar = [...yeniFotograflar];
    yeniDosyalar[index] = dosya;
    setYeniFotograflar(yeniDosyalar);

    const onizlemeler = [...yeniOnizlemeler];
    onizlemeler[index] = URL.createObjectURL(dosya);
    setYeniOnizlemeler(onizlemeler);
  };

  const yeniFotografKaldir = (index: number) => {
    const yeniDosyalar = [...yeniFotograflar];
    yeniDosyalar[index] = null;
    setYeniFotograflar(yeniDosyalar);

    const onizlemeler = [...yeniOnizlemeler];
    onizlemeler[index] = "";
    setYeniOnizlemeler(onizlemeler);
  };

  const mevcutFotografSil = async (fotografId: string) => {
    const onay = confirm("Bu fotoğrafı silmek istediğine emin misin?");
    if (!onay) return;

    await supabase.from("urun_fotograflari").delete().eq("id", fotografId);

    await fotograflariGetir();
    setMesaj("Fotoğraf silindi.");
  };

  const urunuGuncelle = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesaj("");
    setKaydediliyor(true);

    const slug = `${slugOlustur(ad)}-${Date.now()}`;

    const { error } = await supabase
      .from("urunler")
      .update({
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
      .eq("id", urunId);

    if (error) {
      setMesaj("Ürün güncellenirken hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    for (let i = 0; i < yeniFotograflar.length; i++) {
      const dosya = yeniFotograflar[i];

      if (!dosya) continue;

      const dosyaUzantisi = dosya.name.split(".").pop();
      const dosyaAdi = `${urunId}/${Date.now()}-${i}.${dosyaUzantisi}`;

      const { error: yuklemeHatasi } = await supabase.storage
        .from("urun-gorselleri")
        .upload(dosyaAdi, dosya);

      if (!yuklemeHatasi) {
        const { data } = supabase.storage
          .from("urun-gorselleri")
          .getPublicUrl(dosyaAdi);

        if (mevcutFotograflar[i]) {
          await supabase
            .from("urun_fotograflari")
            .update({
              fotograf_url: data.publicUrl,
              sira: i,
            })
            .eq("id", mevcutFotograflar[i]?.id);
        } else {
          await supabase.from("urun_fotograflari").insert({
            urun_id: urunId,
            fotograf_url: data.publicUrl,
            sira: i,
          });
        }
      }
    }

    setYeniFotograflar([null, null, null, null]);
    setYeniOnizlemeler(["", "", "", ""]);

    await fotograflariGetir();

    setMesaj("Ürün başarıyla güncellendi.");
    setKaydediliyor(false);
  };

  if (sayfaYukleniyor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ec] text-zinc-900">
        Ürün bilgileri yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Ürün Düzenle
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Ürün bilgilerini, stok durumunu, kampanya metnini ve görselleri buradan güncelle.
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
          onSubmit={urunuGuncelle}
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
              {[0, 1, 2, 3].map((index) => {
                const mevcut = mevcutFotograflar[index];
                const yeniOnizleme = yeniOnizlemeler[index];

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-zinc-200 bg-white p-3"
                  >
                    <p className="mb-2 text-sm font-semibold text-zinc-700">
                      {index + 1}. Görsel
                    </p>

                    {yeniOnizleme ? (
                      <div className="overflow-hidden rounded-xl border border-zinc-100">
                        <img
                          src={yeniOnizleme}
                          alt={`${index + 1}. yeni ürün görseli`}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : mevcut ? (
                      <div className="overflow-hidden rounded-xl border border-zinc-100">
                        <img
                          src={mevcut.fotograf_url}
                          alt={`${index + 1}. mevcut ürün görseli`}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 text-sm text-zinc-400">
                        Görsel yok
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        yeniFotografSec(
                          index,
                          e.target.files ? e.target.files[0] : null
                        )
                      }
                      className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900"
                    />

                    {yeniOnizleme && (
                      <button
                        type="button"
                        onClick={() => yeniFotografKaldir(index)}
                        className="mt-3 w-full rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        Yeni Görseli Kaldır
                      </button>
                    )}

                    {mevcut && !yeniOnizleme && (
                      <button
                        type="button"
                        onClick={() => mevcutFotografSil(mevcut.id)}
                        className="mt-3 w-full rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                      >
                        Mevcut Görseli Sil
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-zinc-500">
              Her ürün için en fazla 4 görsel kullanılabilir. 1. görsel ana ürün görseli olarak kullanılacak.
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
            disabled={kaydediliyor}
            className="mt-6 rounded-2xl bg-zinc-900 px-6 py-3 font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-60"
          >
            {kaydediliyor ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}