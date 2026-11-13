"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type SiteAyari = {
  id: string;
  site_adi: string | null;
  telefon: string | null;
  whatsapp: string | null;
  hesap_sahibi?: string | null;
  iban?: string | null;
};

export default function SiteAyarlariSayfasi() {
  const router = useRouter();

  const [ayarId, setAyarId] = useState("");
  const [siteAdi, setSiteAdi] = useState("");
  const [telefon, setTelefon] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [hesapSahibi, setHesapSahibi] = useState("");
  const [iban, setIban] = useState("");

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
      .from("site_ayarlari")
      .select("hesap_sahibi, iban")
      .eq("id", ayar.id)
      .maybeSingle();

    if (bankaData) {
      setHesapSahibi(bankaData.hesap_sahibi || "");
      setIban(bankaData.iban || "");
    }

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

    const { error: bankaHatasi } = await supabase
      .from("site_ayarlari")
      .update({
        hesap_sahibi: hesapSahibi.trim(),
        iban: iban.replace(/\s+/g, "").toUpperCase(),
      })
      .eq("id", ayarId);

    if (bankaHatasi) {
      setMesaj(
        "Temel ayarlar kaydedildi ancak Havale/EFT bilgileri kaydedilemedi."
      );
      setKaydediliyor(false);
      return;
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