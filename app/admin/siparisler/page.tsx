"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Siparis = {
  id: string;
  urun_id: string | null;
  urun_adi: string;
  adet: number;
  musteri_ad: string | null;
  musteri_telefon: string | null;
  durum: string;
  whatsapp_mesaji: string | null;
  created_at: string;
};

type Urun = {
  id: string;
  stok: number;
};

export default function SiparislerSayfasi() {
  const router = useRouter();

  const [siparisler, setSiparisler] = useState<Siparis[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islemYapiliyor, setIslemYapiliyor] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    siparisleriGetir();
  }, []);

  const siparisleriGetir = async () => {
    setYukleniyor(true);

    const { data, error } = await supabase
      .from("siparisler")
      .select(
        "id, urun_id, urun_adi, adet, musteri_ad, musteri_telefon, durum, whatsapp_mesaji, created_at"
      )
      .order("created_at", { ascending: false });

    if (!error) {
      setSiparisler(data || []);
    }

    setYukleniyor(false);
  };

  const siparisOnayla = async (siparis: Siparis) => {
    setMesaj("");

    if (siparis.durum === "onaylandi") {
      setMesaj("Bu sipariş zaten onaylanmış.");
      return;
    }

    if (!siparis.urun_id) {
      setMesaj("Bu siparişe bağlı ürün bulunamadı.");
      return;
    }

    const onay = confirm(
      "Bu siparişi onaylamak istiyor musun? Onaylanınca ürün stoğu otomatik düşecek."
    );

    if (!onay) return;

    setIslemYapiliyor(siparis.id);

    const { data: urun, error: urunHatasi } = await supabase
      .from("urunler")
      .select("id, stok")
      .eq("id", siparis.urun_id)
      .single();

    if (urunHatasi || !urun) {
      setMesaj("Ürün bilgisi alınamadı.");
      setIslemYapiliyor("");
      return;
    }

    const mevcutUrun = urun as Urun;
    const yeniStok = mevcutUrun.stok - siparis.adet;

    if (yeniStok < 0) {
      setMesaj("Stok yetersiz. Bu siparişi onaylayamazsın.");
      setIslemYapiliyor("");
      return;
    }

    const { error: stokHatasi } = await supabase
      .from("urunler")
      .update({
        stok: yeniStok,
      })
      .eq("id", siparis.urun_id);

    if (stokHatasi) {
      setMesaj("Stok güncellenirken hata oluştu.");
      setIslemYapiliyor("");
      return;
    }

    const { error: siparisHatasi } = await supabase
      .from("siparisler")
      .update({
        durum: "onaylandi",
      })
      .eq("id", siparis.id);

    if (siparisHatasi) {
      setMesaj("Sipariş durumu güncellenirken hata oluştu.");
      setIslemYapiliyor("");
      return;
    }

    setMesaj("Sipariş onaylandı ve stok güncellendi.");
    setIslemYapiliyor("");
    siparisleriGetir();
  };

  const siparisIptalEt = async (siparis: Siparis) => {
    setMesaj("");

    if (siparis.durum === "iptal") {
      setMesaj("Bu sipariş zaten iptal edilmiş.");
      return;
    }

    const onay = confirm("Bu siparişi iptal etmek istiyor musun?");
    if (!onay) return;

    setIslemYapiliyor(siparis.id);

    const { error } = await supabase
      .from("siparisler")
      .update({
        durum: "iptal",
      })
      .eq("id", siparis.id);

    if (error) {
      setMesaj("Sipariş iptal edilirken hata oluştu.");
      setIslemYapiliyor("");
      return;
    }

    setMesaj("Sipariş iptal edildi.");
    setIslemYapiliyor("");
    siparisleriGetir();
  };

  const siparisSil = async (id: string) => {
    setMesaj("");

    const onay = confirm("Bu siparişi tamamen silmek istediğine emin misin?");
    if (!onay) return;

    setIslemYapiliyor(id);

    const { error } = await supabase.from("siparisler").delete().eq("id", id);

    if (error) {
      setMesaj("Sipariş silinirken hata oluştu.");
      setIslemYapiliyor("");
      return;
    }

    setMesaj("Sipariş silindi.");
    setIslemYapiliyor("");
    siparisleriGetir();
  };

  const durumEtiketi = (durum: string) => {
    if (durum === "onaylandi") {
      return (
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
          Onaylandı
        </span>
      );
    }

    if (durum === "iptal") {
      return (
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          İptal
        </span>
      );
    }

    return (
      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
        Bekliyor
      </span>
    );
  };

  const tarihFormatla = (tarih: string) => {
    return new Date(tarih).toLocaleString("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <main className="min-h-screen bg-[#f8f3ec] px-4 py-6 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#b68b5b]">Neva Shop</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Siparişler
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              WhatsApp’a yönlenen siparişleri buradan takip et, onayla ve stoktan düş.
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

        {mesaj && (
          <p className="mb-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow">
            {mesaj}
          </p>
        )}

        <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
          {yukleniyor ? (
            <p className="text-sm text-zinc-500">Siparişler yükleniyor...</p>
          ) : siparisler.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center">
              <h2 className="text-xl font-bold">Henüz sipariş yok</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Müşteriler ürünlerden WhatsApp siparişi oluşturduğunda burada görünecek.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {siparisler.map((siparis) => (
                <div
                  key={siparis.id}
                  className="rounded-2xl border border-zinc-100 p-4"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-zinc-900">
                          {siparis.urun_adi}
                        </h2>

                        {durumEtiketi(siparis.durum)}
                      </div>

                      <p className="mt-2 text-sm text-zinc-500">
                        Adet: <strong>{siparis.adet}</strong>
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        Tarih: {tarihFormatla(siparis.created_at)}
                      </p>

                      {siparis.musteri_ad && (
                        <p className="mt-1 text-sm text-zinc-500">
                          Müşteri: {siparis.musteri_ad}
                        </p>
                      )}

                      {siparis.musteri_telefon && (
                        <p className="mt-1 text-sm text-zinc-500">
                          Telefon: {siparis.musteri_telefon}
                        </p>
                      )}

                      {siparis.whatsapp_mesaji && (
                        <div className="mt-4 rounded-2xl bg-[#f8f3ec] p-4">
                          <p className="text-xs font-semibold text-[#b68b5b]">
                            WhatsApp Mesajı
                          </p>
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                            {siparis.whatsapp_mesaji}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:min-w-[360px]">
                      <button
                        type="button"
                        disabled={
                          islemYapiliyor === siparis.id ||
                          siparis.durum === "onaylandi" ||
                          siparis.durum === "iptal"
                        }
                        onClick={() => siparisOnayla(siparis)}
                        className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                      >
                        Onayla
                      </button>

                      <button
                        type="button"
                        disabled={
                          islemYapiliyor === siparis.id ||
                          siparis.durum === "onaylandi" ||
                          siparis.durum === "iptal"
                        }
                        onClick={() => siparisIptalEt(siparis)}
                        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
                      >
                        İptal Et
                      </button>

                      <button
                        type="button"
                        disabled={islemYapiliyor === siparis.id}
                        onClick={() => siparisSil(siparis.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </div>
                  </div>

                  {islemYapiliyor === siparis.id && (
                    <p className="mt-3 text-sm font-semibold text-[#b68b5b]">
                      İşlem yapılıyor...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}