"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type SiteAyari = {
  id: string;
  site_adi: string | null;
  telefon: string | null;
  whatsapp: string | null;
  kampanya_baslik: string | null;
  kampanya_aciklama: string | null;
};

type Kategori = {
  id: string;
  ad: string;
  slug: string;
};

type Urun = {
  id: string;
  kategori_id: string | null;
  ad: string;
  slug: string;
  aciklama: string | null;
  fiyat: number;
  stok: number;
  aktif: boolean;
  one_cikan: boolean;
  kampanya_metni: string | null;
};

type UrunFotografi = {
  id: string;
  urun_id: string;
  fotograf_url: string;
  sira: number;
};

type UrunKart = Urun & {
  fotograflar: UrunFotografi[];
};

export default function AnaSayfa() {
  const [siteAyari, setSiteAyari] = useState<SiteAyari | null>(null);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [urunler, setUrunler] = useState<UrunKart[]>([]);
  const [seciliKategori, setSeciliKategori] = useState("tum");
  const [arama, setArama] = useState("");
  const [seciliUrun, setSeciliUrun] = useState<UrunKart | null>(null);
  const [aktifGorsel, setAktifGorsel] = useState("");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [siparisOlusturuluyor, setSiparisOlusturuluyor] = useState("");

  useEffect(() => {
    verileriGetir();
  }, []);

  const verileriGetir = async () => {
    setYukleniyor(true);

    const { data: ayarData } = await supabase
      .from("site_ayarlari")
      .select(
        "id, site_adi, telefon, whatsapp, kampanya_baslik, kampanya_aciklama"
      )
      .limit(1)
      .single();

    const { data: kategoriData } = await supabase
      .from("kategoriler")
      .select("id, ad, slug")
      .eq("aktif", true)
      .order("ad", { ascending: true });

    const { data: urunData } = await supabase
      .from("urunler")
      .select(
        "id, kategori_id, ad, slug, aciklama, fiyat, stok, aktif, one_cikan, kampanya_metni"
      )
      .eq("aktif", true)
      .order("created_at", { ascending: false });

    const { data: fotografData } = await supabase
      .from("urun_fotograflari")
      .select("id, urun_id, fotograf_url, sira")
      .order("sira", { ascending: true });

    const urunlerFotograflarla: UrunKart[] = (urunData || []).map((urun) => ({
      ...urun,
      fotograflar: (fotografData || []).filter(
        (fotograf) => fotograf.urun_id === urun.id
      ),
    }));

    setSiteAyari(ayarData || null);
    setKategoriler(kategoriData || []);
    setUrunler(urunlerFotograflarla);
    setYukleniyor(false);
  };

  const fiyatFormatla = (fiyat: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(fiyat);
  };

  const siteAdi = siteAyari?.site_adi || "Neva Shop";
  const telefonNumarasi = siteAyari?.telefon || "05010370655";
  const whatsappNumarasi = siteAyari?.whatsapp || "905010370655";

  const filtreliUrunler = useMemo(() => {
    let liste = [...urunler];

    if (seciliKategori !== "tum") {
      liste = liste.filter((urun) => urun.kategori_id === seciliKategori);
    }

    if (arama.trim()) {
      const aranan = arama.toLowerCase();

      liste = liste.filter(
        (urun) =>
          urun.ad.toLowerCase().includes(aranan) ||
          (urun.aciklama || "").toLowerCase().includes(aranan)
      );
    }

    return liste;
  }, [urunler, seciliKategori, arama]);

  const oneCikanUrunler = useMemo(() => {
    return urunler.filter((urun) => urun.one_cikan).slice(0, 8);
  }, [urunler]);

  const heroUrunler =
    oneCikanUrunler.length > 0 ? oneCikanUrunler : urunler.slice(0, 4);

  const urunDetayAc = (urun: UrunKart) => {
    setSeciliUrun(urun);
    setAktifGorsel(urun.fotograflar[0]?.fotograf_url || "");
  };

  const siparisOlusturVeWhatsAppAc = async (urun: UrunKart) => {
    if (urun.stok <= 0) {
      alert("Bu ürün şu anda stokta yok.");
      return;
    }

    setSiparisOlusturuluyor(urun.id);

    const urunLinki =
      typeof window !== "undefined"
        ? `${window.location.origin}/?urun=${urun.slug}`
        : "";

    const mesaj = `Merhaba ${siteAdi}, bu ürünü sipariş vermek istiyorum.

Ürün: ${urun.ad}
Fiyat: ${fiyatFormatla(urun.fiyat)}
Adet: 1
Ürün Linki: ${urunLinki}`;

    await supabase.from("siparisler").insert({
      urun_id: urun.id,
      urun_adi: urun.ad,
      adet: 1,
      durum: "bekliyor",
      whatsapp_mesaji: mesaj,
    });

    const whatsappLink = `https://wa.me/${whatsappNumarasi}?text=${encodeURIComponent(
      mesaj
    )}`;

    setSiparisOlusturuluyor("");
    window.open(whatsappLink, "_blank");
  };

  if (yukleniyor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7f2] text-zinc-900">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm font-bold text-[#ff5c35]">{siteAdi}</p>
          <p className="mt-2 text-base font-semibold">Ürünler yükleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7f2] text-zinc-900">
      <header className="sticky top-0 z-40 border-b border-[#ffd3c4] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="shrink-0 text-left"
            >
              <p className="text-xl font-black tracking-tight text-[#ff5c35]">
                {siteAdi}
              </p>
              <p className="hidden text-xs font-medium text-zinc-500 sm:block">
                Saten Buket & Hediyelik
              </p>
            </button>

            <div className="relative flex-1">
              <input
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Ürün, kategori veya hediye ara..."
                className="h-11 w-full rounded-xl border border-[#ffd3c4] bg-[#fff7f2] px-4 pr-24 text-sm font-medium text-zinc-900 outline-none transition focus:border-[#ff5c35] focus:bg-white"
              />

              <button
                type="button"
                onClick={() => {
                  const alan = document.getElementById("urunler");
                  alan?.scrollIntoView({ behavior: "smooth" });
                }}
                className="absolute right-1 top-1 h-9 rounded-lg bg-[#ff5c35] px-4 text-sm font-bold text-white transition hover:bg-[#e64a28]"
              >
                Ara
              </button>
            </div>

            <a
              href={`https://wa.me/${whatsappNumarasi}`}
              target="_blank"
              className="hidden h-11 items-center rounded-xl bg-[#ff5c35] px-4 text-sm font-bold text-white transition hover:bg-[#e64a28] sm:flex"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-[#ffe1d6]">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 sm:px-6">
            <button
              type="button"
              onClick={() => setSeciliKategori("tum")}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                seciliKategori === "tum"
                  ? "bg-[#ff5c35] text-white shadow-sm"
                  : "border border-[#ffd3c4] bg-white text-zinc-700 hover:bg-[#fff0e8]"
              }`}
            >
              Tüm Ürünler
            </button>

            {kategoriler.map((kategori) => (
              <button
                type="button"
                key={kategori.id}
                onClick={() => setSeciliKategori(kategori.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  seciliKategori === kategori.id
                    ? "bg-[#ff5c35] text-white shadow-sm"
                    : "border border-[#ffd3c4] bg-white text-zinc-700 hover:bg-[#fff0e8]"
                }`}
              >
                {kategori.ad}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="px-4 py-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#fff0e8] via-white to-[#ffe1d6] shadow-sm">
            <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-[#ff5c35] shadow-sm">
                  WhatsApp siparişli online mağaza
                </p>

                <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  Saten buket ve hediyelik ürünlerde zarif seçimler
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-600 sm:text-base">
                  Beğendiğin ürünü incele, stok durumunu gör ve WhatsApp
                  üzerinden hızlıca sipariş oluştur.
                </p>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <a
                    href="#urunler"
                    className="rounded-xl bg-[#ff5c35] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#e64a28]"
                  >
                    Ürünleri İncele
                  </a>

                  <a
                    href={`tel:${telefonNumarasi}`}
                    className="rounded-xl border border-[#ffd3c4] bg-white px-5 py-3 text-center text-sm font-bold text-zinc-900 shadow-sm transition hover:bg-[#fff7f2]"
                  >
                    Hemen Ara
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {heroUrunler.slice(0, 4).map((urun) => (
                  <button
                    type="button"
                    key={urun.id}
                    onClick={() => urunDetayAc(urun)}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="aspect-square bg-[#fff7f2]">
                      {urun.fotograflar[0]?.fotograf_url ? (
                        <img
                          src={urun.fotograflar[0].fotograf_url}
                          alt={urun.ad}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                          Görsel yok
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5c35]">
                Kolay Sipariş
              </p>
              <h2 className="mt-2 text-xl font-black">
                WhatsApp ile hızlı iletişim
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Ürün seç, mesaj otomatik hazırlansın, siparişini kolayca ilet.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-lg font-black text-[#ff5c35]">
                  {urunler.length}
                </p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  Aktif Ürün
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-lg font-black text-[#ff5c35]">
                  {kategoriler.length}
                </p>
                <p className="mt-1 text-xs font-semibold text-zinc-500">
                  Kategori
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#ffe6dc] p-5 shadow-sm">
              <p className="text-sm font-black text-[#8a3a26]">
                Hediye seçmek artık daha kolay
              </p>
              <p className="mt-2 text-sm leading-6 text-[#8a3a26]/80">
                Ürün detayına gir, görselleri incele ve direkt WhatsApp’tan
                sipariş oluştur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {(siteAyari?.kampanya_baslik || siteAyari?.kampanya_aciklama) && (
        <section className="px-4 pb-4 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-r from-[#ff5c35] to-[#ff8a65] px-5 py-4 text-white shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-xs font-black text-white/80">
                Güncel Kampanya
              </p>
              <h2 className="mt-1 text-lg font-black">
                {siteAyari?.kampanya_baslik}
              </h2>
            </div>

            <p className="mt-2 text-sm leading-6 text-white/90 sm:mt-0 sm:max-w-2xl">
              {siteAyari?.kampanya_aciklama}
            </p>
          </div>
        </section>
      )}

      {oneCikanUrunler.length > 0 && (
        <section className="px-4 pb-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <BolumBasligi
              etiket="Öne Çıkanlar"
              baslik="Popüler ürünler"
              aciklama="En çok öne çıkarılan ürünleri hızlıca incele."
            />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {oneCikanUrunler.map((urun) => (
                <UrunKarti
                  key={urun.id}
                  urun={urun}
                  fiyatFormatla={fiyatFormatla}
                  urunDetayAc={urunDetayAc}
                  siparisOlusturVeWhatsAppAc={siparisOlusturVeWhatsAppAc}
                  siparisOlusturuluyor={siparisOlusturuluyor}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="urunler" className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <BolumBasligi
            etiket="Mağaza"
            baslik="Tüm ürünler"
            aciklama={`${filtreliUrunler.length} ürün listeleniyor`}
          />

          {filtreliUrunler.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#ffd3c4] bg-white p-10 text-center shadow-sm">
              <h3 className="text-lg font-black">Ürün bulunamadı</h3>
              <p className="mt-2 text-sm text-zinc-500">
                Arama veya kategori filtresini değiştirerek tekrar dene.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtreliUrunler.map((urun) => (
                <UrunKarti
                  key={urun.id}
                  urun={urun}
                  fiyatFormatla={fiyatFormatla}
                  urunDetayAc={urunDetayAc}
                  siparisOlusturVeWhatsAppAc={siparisOlusturVeWhatsAppAc}
                  siparisOlusturuluyor={siparisOlusturuluyor}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-[#ffd3c4] bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-black text-[#ff5c35]">{siteAdi}</p>
            <p className="text-sm text-zinc-500">
              Saten buket ve hediyelik ürünler
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={`tel:${telefonNumarasi}`}
              className="rounded-xl border border-[#ffd3c4] bg-[#fff7f2] px-4 py-2 text-center text-sm font-bold text-zinc-900"
            >
              {telefonNumarasi}
            </a>

            <a
              href={`https://wa.me/${whatsappNumarasi}`}
              target="_blank"
              className="rounded-xl bg-[#ff5c35] px-4 py-2 text-center text-sm font-bold text-white transition hover:bg-[#e64a28]"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>

      <a
        href={`https://wa.me/${whatsappNumarasi}`}
        target="_blank"
        className="fixed bottom-4 right-4 z-40 rounded-full bg-[#25D366] px-5 py-4 text-sm font-black text-white shadow-2xl"
      >
        WhatsApp
      </a>

      {seciliUrun && (
        <UrunDetayModal
          urun={seciliUrun}
          aktifGorsel={aktifGorsel}
          setAktifGorsel={setAktifGorsel}
          kapat={() => setSeciliUrun(null)}
          fiyatFormatla={fiyatFormatla}
          siparisOlusturVeWhatsAppAc={siparisOlusturVeWhatsAppAc}
          siparisOlusturuluyor={siparisOlusturuluyor}
        />
      )}
    </main>
  );
}

function BolumBasligi({
  etiket,
  baslik,
  aciklama,
}: {
  etiket: string;
  baslik: string;
  aciklama: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff5c35]">
          {etiket}
        </p>
        <h2 className="mt-1 text-2xl font-black text-zinc-950">{baslik}</h2>
        <p className="mt-1 text-sm text-zinc-500">{aciklama}</p>
      </div>
    </div>
  );
}

function UrunKarti({
  urun,
  fiyatFormatla,
  urunDetayAc,
  siparisOlusturVeWhatsAppAc,
  siparisOlusturuluyor,
}: {
  urun: UrunKart;
  fiyatFormatla: (fiyat: number) => string;
  urunDetayAc: (urun: UrunKart) => void;
  siparisOlusturVeWhatsAppAc: (urun: UrunKart) => void;
  siparisOlusturuluyor: string;
}) {
  const anaGorsel = urun.fotograflar[0]?.fotograf_url;

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#ffe1d6] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button
        type="button"
        onClick={() => urunDetayAc(urun)}
        className="block w-full text-left"
      >
        <div className="relative aspect-[3/4] bg-[#fff7f2]">
          {anaGorsel ? (
            <img
              src={anaGorsel}
              alt={urun.ad}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
              Görsel yok
            </div>
          )}

          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {urun.kampanya_metni && (
              <span className="rounded-md bg-[#ff5c35] px-2 py-1 text-[10px] font-black text-white shadow-sm">
                {urun.kampanya_metni}
              </span>
            )}

            {urun.stok <= 0 && (
              <span className="rounded-md bg-red-600 px-2 py-1 text-[10px] font-black text-white shadow-sm">
                Stok Yok
              </span>
            )}
          </div>
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-bold leading-5 text-zinc-900">
            {urun.ad}
          </h3>

          <p className="mt-2 line-clamp-2 min-h-[36px] text-xs leading-5 text-zinc-500">
            {urun.aciklama || "Ürün detayını görmek için incele."}
          </p>

          <div className="mt-3">
            <p className="text-lg font-black text-[#ff5c35]">
              {fiyatFormatla(urun.fiyat)}
            </p>

            <p className="mt-1 text-[11px] font-bold text-zinc-400">
              Stok: {urun.stok}
            </p>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <button
          type="button"
          onClick={() => urunDetayAc(urun)}
          className="rounded-xl bg-[#fff0e8] px-3 py-2 text-xs font-black text-[#8a3a26] transition hover:bg-[#ffe1d6]"
        >
          İncele
        </button>

        <button
          type="button"
          onClick={() => siparisOlusturVeWhatsAppAc(urun)}
          disabled={urun.stok <= 0 || siparisOlusturuluyor === urun.id}
          className="rounded-xl bg-[#ff5c35] px-3 py-2 text-xs font-black text-white transition hover:bg-[#e64a28] disabled:opacity-50"
        >
          {urun.stok <= 0
            ? "Yok"
            : siparisOlusturuluyor === urun.id
            ? "Açılıyor"
            : "Sipariş"}
        </button>
      </div>
    </article>
  );
}

function UrunDetayModal({
  urun,
  aktifGorsel,
  setAktifGorsel,
  kapat,
  fiyatFormatla,
  siparisOlusturVeWhatsAppAc,
  siparisOlusturuluyor,
}: {
  urun: UrunKart;
  aktifGorsel: string;
  setAktifGorsel: (url: string) => void;
  kapat: () => void;
  fiyatFormatla: (fiyat: number) => string;
  siparisOlusturVeWhatsAppAc: (urun: UrunKart) => void;
  siparisOlusturuluyor: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-3 py-5">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ffe1d6] bg-white px-4 py-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff5c35]">
              Ürün Detayı
            </p>
            <h2 className="mt-1 line-clamp-1 text-lg font-black text-zinc-950">
              {urun.ad}
            </h2>
          </div>

          <button
            type="button"
            onClick={kapat}
            className="rounded-xl bg-[#fff0e8] px-4 py-2 text-sm font-black text-[#8a3a26]"
          >
            Kapat
          </button>
        </div>

        <div className="grid gap-6 p-4 lg:grid-cols-[1fr_0.85fr] lg:p-6">
          <div>
            <div className="overflow-hidden rounded-2xl bg-[#fff7f2]">
              {aktifGorsel ? (
                <img
                  src={aktifGorsel}
                  alt={urun.ad}
                  className="h-[360px] w-full object-cover sm:h-[560px]"
                />
              ) : (
                <div className="flex h-[360px] items-center justify-center text-sm text-zinc-400">
                  Görsel yok
                </div>
              )}
            </div>

            {urun.fotograflar.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {urun.fotograflar.slice(0, 4).map((fotograf) => (
                  <button
                    type="button"
                    key={fotograf.id}
                    onClick={() => setAktifGorsel(fotograf.fotograf_url)}
                    className={`overflow-hidden rounded-xl border ${
                      aktifGorsel === fotograf.fotograf_url
                        ? "border-[#ff5c35]"
                        : "border-[#ffe1d6]"
                    }`}
                  >
                    <img
                      src={fotograf.fotograf_url}
                      alt={urun.ad}
                      className="h-20 w-full object-cover sm:h-28"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="rounded-2xl border border-[#ffe1d6] bg-white p-5 shadow-sm">
              {urun.kampanya_metni && (
                <p className="mb-3 inline-flex rounded-md bg-[#ffe6dc] px-3 py-1 text-xs font-black text-[#8a3a26]">
                  {urun.kampanya_metni}
                </p>
              )}

              <h3 className="text-3xl font-black text-[#ff5c35]">
                {fiyatFormatla(urun.fiyat)}
              </h3>

              <p className="mt-2 text-sm font-bold text-zinc-500">
                Stok: {urun.stok}
              </p>

              <div className="mt-5 rounded-2xl bg-[#fff7f2] p-4">
                <p className="text-sm font-black text-zinc-900">
                  Ürün Açıklaması
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-zinc-600">
                  {urun.aciklama || "Bu ürün için açıklama eklenmemiş."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => siparisOlusturVeWhatsAppAc(urun)}
                disabled={
                  urun.stok <= 0 || siparisOlusturuluyor === urun.id
                }
                className="mt-5 w-full rounded-xl bg-[#ff5c35] px-6 py-4 text-sm font-black text-white transition hover:bg-[#e64a28] disabled:opacity-50"
              >
                {urun.stok <= 0
                  ? "Stokta Yok"
                  : siparisOlusturuluyor === urun.id
                  ? "WhatsApp Açılıyor..."
                  : "WhatsApp’tan Sipariş Ver"}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
                Sipariş WhatsApp üzerinden tamamlanır. Stok, işletme onayından
                sonra otomatik güncellenir.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#fff0e8] p-4">
                <p className="text-sm font-black text-[#8a3a26]">
                  Hızlı iletişim
                </p>
                <p className="mt-1 text-xs leading-5 text-[#8a3a26]/80">
                  Sipariş WhatsApp ile alınır.
                </p>
              </div>

              <div className="rounded-2xl bg-[#fff0e8] p-4">
                <p className="text-sm font-black text-[#8a3a26]">
                  Stok kontrolü
                </p>
                <p className="mt-1 text-xs leading-5 text-[#8a3a26]/80">
                  Onay sonrası stok düşer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}