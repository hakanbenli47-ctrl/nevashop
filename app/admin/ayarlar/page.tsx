"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SiteAyari = {
  id: string;
  site_adi: string | null;
  telefon: string | null;
  whatsapp: string | null;
};

const ODEME_AYAR_SLUG = "neva-odeme-ayarlari-sistem";

const YASAL_SLUGLAR = {
  unvan: "neva-sistem-yasal-unvan",
  adres: "neva-sistem-yasal-adres",
  email: "neva-sistem-yasal-email",
  mersis: "neva-sistem-yasal-mersis",
  vergi: "neva-sistem-yasal-vergi",
  kargo: "neva-sistem-yasal-kargo-ucreti",
  iadeKargo: "neva-sistem-yasal-iade-kargo",
} as const;

export default function SiteAyarlariSayfasi() {
  const router = useRouter();

  const [ayarId, setAyarId] = useState("");
  const [siteAdi, setSiteAdi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hesapSahibi, setHesapSahibi] = useState("");
  const [iban, setIban] = useState("");
  const [saticiUnvan, setSaticiUnvan] = useState("");
  const [saticiAdres, setSaticiAdres] = useState("");
  const [saticiEmail, setSaticiEmail] = useState("");
  const [mersisNo, setMersisNo] = useState("");
  const [vergiNo, setVergiNo] = useState("");
  const [kargoUcreti, setKargoUcreti] = useState("");
  const [iadeKargo, setIadeKargo] = useState("");

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
      .select("id, site_adi, telefon, whatsapp")
      .limit(1)
      .single();

    if (error || !data) {
      setMesaj("Site ayarları alınamadı.");
      setSayfaYukleniyor(false);
      return;
    }

    const ayar = data as SiteAyari;

    setAyarId(ayar.id);
    setSiteAdi(ayar.site_adi || "");
    setTelefon(ayar.telefon || "");
    setWhatsapp(ayar.whatsapp || "");

    const { data: bankaData } = await supabase
      .from("kategoriler")
      .select("id, ad")
      .eq("slug", ODEME_AYAR_SLUG)
      .maybeSingle();

    if (bankaData?.ad) {
      try {
        const bankaBilgisi = JSON.parse(bankaData.ad) as {
          hesap_sahibi?: string;
          iban?: string;
        };

        setHesapSahibi(bankaBilgisi.hesap_sahibi || "");
        setIban(bankaBilgisi.iban || "");
      } catch {
        setHesapSahibi("");
        setIban("");
      }
    }

    const { data: yasalKayitlar } = await supabase
      .from("kategoriler")
      .select("slug, ad")
      .in("slug", Object.values(YASAL_SLUGLAR));

    const yasalDeger = (slug: string) =>
      yasalKayitlar?.find((kayit) => kayit.slug === slug)?.ad || "";

    setSaticiUnvan(yasalDeger(YASAL_SLUGLAR.unvan));
    setSaticiAdres(yasalDeger(YASAL_SLUGLAR.adres));
    setSaticiEmail(yasalDeger(YASAL_SLUGLAR.email));
    setMersisNo(yasalDeger(YASAL_SLUGLAR.mersis));
    setVergiNo(yasalDeger(YASAL_SLUGLAR.vergi));
    setKargoUcreti(yasalDeger(YASAL_SLUGLAR.kargo));
    setIadeKargo(yasalDeger(YASAL_SLUGLAR.iadeKargo));

    setSayfaYukleniyor(false);
  };

  const ayarlariKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setMesaj("");
    setKaydediliyor(true);

    const { error } = await supabase
      .from("site_ayarlari")
      .update({
        site_adi: siteAdi,
        telefon,
        whatsapp,
      })
      .eq("id", ayarId);

    if (error) {
      setMesaj("Ayarlar kaydedilirken hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    const bankaKaydi = JSON.stringify({
      hesap_sahibi: hesapSahibi.trim(),
      iban: iban.replace(/\s+/g, "").toUpperCase(),
    });

    const { data: mevcutBankaKaydi } = await supabase
      .from("kategoriler")
      .select("id")
      .eq("slug", ODEME_AYAR_SLUG)
      .maybeSingle();

    const bankaIslemi = mevcutBankaKaydi?.id
      ? supabase
          .from("kategoriler")
          .update({ ad: bankaKaydi, aktif: true })
          .eq("id", mevcutBankaKaydi.id)
      : supabase.from("kategoriler").insert({
          ad: bankaKaydi,
          slug: ODEME_AYAR_SLUG,
          aktif: true,
        });

    const { error: bankaHatasi } = await bankaIslemi;

    if (bankaHatasi) {
      setMesaj(
        "Temel ayarlar kaydedildi ancak Havale/EFT bilgileri kaydedilemedi."
      );
      setKaydediliyor(false);
      return;
    }

    const yasalAyarlar = [
      [YASAL_SLUGLAR.unvan, saticiUnvan.trim()],
      [YASAL_SLUGLAR.adres, saticiAdres.trim()],
      [YASAL_SLUGLAR.email, saticiEmail.trim()],
      [YASAL_SLUGLAR.mersis, mersisNo.trim()],
      [YASAL_SLUGLAR.vergi, vergiNo.trim()],
      [YASAL_SLUGLAR.kargo, kargoUcreti.trim()],
      [YASAL_SLUGLAR.iadeKargo, iadeKargo.trim()],
    ] as const;

    for (const [slug, deger] of yasalAyarlar) {
      const { data: mevcut } = await supabase
        .from("kategoriler")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();

      const { error: yasalHata } = mevcut?.id
        ? await supabase
            .from("kategoriler")
            .update({ ad: deger || "-", aktif: true })
            .eq("id", mevcut.id)
        : await supabase.from("kategoriler").insert({
            ad: deger || "-",
            slug,
            aktif: true,
          });

      if (yasalHata) {
        setMesaj(
          "Temel ayarlar kaydedildi ancak yasal/satıcı bilgileri kaydedilemedi."
        );
        setKaydediliyor(false);
        return;
      }
    }

    setMesaj("Site ayarları başarıyla kaydedildi.");
    setKaydediliyor(false);
  };

  if (sayfaYukleniyor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f3ec] text-zinc-900">
        Site ayarları yükleniyor...
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
              Site Ayarları
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Site adı, telefon ve WhatsApp numarası gibi temel bilgileri buradan yönet.
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
          onSubmit={ayarlariKaydet}
          className="rounded-3xl bg-white p-5 shadow-lg sm:p-6"
        >
          <h2 className="mb-5 text-xl font-bold">Temel Bilgiler</h2>

          <label className="mb-2 block text-sm font-semibold text-zinc-700">
            Site Adı
          </label>
          <input
            value={siteAdi}
            onChange={(e) => setSiteAdi(e.target.value)}
            placeholder="Neva Shop"
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <label className="mb-2 mt-4 block text-sm font-semibold text-zinc-700">
            Telefon Numarası
          </label>
          <input
            value={telefon}
            onChange={(e) => setTelefon(e.target.value)}
            placeholder="05010370655"
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <label className="mb-2 mt-4 block text-sm font-semibold text-zinc-700">
            WhatsApp Numarası
          </label>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="905010370655"
            className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
          />

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-[#fcfaf7] p-5">
            <h2 className="text-lg font-bold text-zinc-900">
              Havale / EFT Bilgileri
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Müşteriye gösterilecek hesap sahibi ve IBAN bilgilerini buradan
              değiştirebilirsin.
            </p>

            <label className="mb-2 mt-4 block text-sm font-semibold text-zinc-700">
              Hesap Sahibi
            </label>
            <input
              value={hesapSahibi}
              onChange={(e) => setHesapSahibi(e.target.value)}
              placeholder="Ad Soyad / Firma Adı"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <label className="mb-2 mt-4 block text-sm font-semibold text-zinc-700">
              IBAN
            </label>
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              placeholder="TR00 0000 0000 0000 0000 0000 00"
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 font-mono text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Banka veya hesap değiştiğinde sadece bu alanları güncellemen
              yeterli. Sepette müşteriye yeni bilgiler gösterilir.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-5">
            <h2 className="text-lg font-bold text-zinc-900">
              Yasal ve Satıcı Bilgileri
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              KVKK, ön bilgilendirme ve mesafeli satış metinlerinde kullanılacak
              bilgileri eksiksiz doldur.
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                value={saticiUnvan}
                onChange={(e) => setSaticiUnvan(e.target.value)}
                placeholder="Satıcı adı / ticari unvan"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
              />
              <input
                type="email"
                value={saticiEmail}
                onChange={(e) => setSaticiEmail(e.target.value)}
                placeholder="E-posta"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
              />
              <input
                value={mersisNo}
                onChange={(e) => setMersisNo(e.target.value)}
                placeholder="MERSİS No (varsa)"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
              />
              <input
                value={vergiNo}
                onChange={(e) => setVergiNo(e.target.value)}
                placeholder="Vergi No (varsa)"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={kargoUcreti}
                onChange={(e) => setKargoUcreti(e.target.value)}
                placeholder="Kargo / teslimat ücreti (TL)"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
              />
              <input
                value={iadeKargo}
                onChange={(e) => setIadeKargo(e.target.value)}
                placeholder="İade için taşıyıcı/kargo firması"
                className="rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
              />
            </div>

            <textarea
              value={saticiAdres}
              onChange={(e) => setSaticiAdres(e.target.value)}
              placeholder="Satıcının açık adresi / iade adresi"
              className="mt-4 min-h-24 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-zinc-900 outline-none focus:border-[#b68b5b]"
            />

            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Havale/EFT ile ödeme için satıcı adı, açık adres, e-posta ve kargo
              ücretinin girilmesi gerekir. Ücretsiz teslimat için kargo ücretine
              0 yaz.
            </p>
          </div>

          <div className="mt-6 rounded-3xl bg-[#f8f3ec] p-5">
            <p className="text-sm font-semibold text-[#b68b5b]">
              Bilgilendirme
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-600">
              WhatsApp numarası başında ülke koduyla yazılmalı. Türkiye için
              örnek doğru format: <strong>905010370655</strong>
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
            {kaydediliyor ? "Kaydediliyor..." : "Ayarları Kaydet"}
          </button>
        </form>
      </div>
    </main>
  );
}