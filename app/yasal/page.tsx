"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type SiteAyari = {
  site_adi: string | null;
  telefon: string | null;
  whatsapp: string | null;
};

type YasalAyarlar = {
  unvan: string;
  adres: string;
  email: string;
  mersis: string;
  vergi: string;
  kargo: string;
  iadeKargo: string;
};

const YASAL_SLUGLAR = {
  unvan: "neva-sistem-yasal-unvan",
  adres: "neva-sistem-yasal-adres",
  email: "neva-sistem-yasal-email",
  mersis: "neva-sistem-yasal-mersis",
  vergi: "neva-sistem-yasal-vergi",
  kargo: "neva-sistem-yasal-kargo-ucreti",
  iadeKargo: "neva-sistem-yasal-iade-kargo",
} as const;

const bosYasal: YasalAyarlar = {
  unvan: "",
  adres: "",
  email: "",
  mersis: "",
  vergi: "",
  kargo: "",
  iadeKargo: "",
};

function temiz(deger: string | null | undefined) {
  return deger && deger !== "-" ? deger : "";
}

export default function YasalSayfa() {
  const [site, setSite] = useState<SiteAyari | null>(null);
  const [yasal, setYasal] = useState<YasalAyarlar>(bosYasal);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const getir = async () => {
      const [{ data: siteData }, { data: yasalData }] = await Promise.all([
        supabase
          .from("site_ayarlari")
          .select("site_adi, telefon, whatsapp")
          .limit(1)
          .single(),
        supabase
          .from("kategoriler")
          .select("slug, ad")
          .in("slug", Object.values(YASAL_SLUGLAR)),
      ]);

      const deger = (slug: string) =>
        temiz(yasalData?.find((kayit) => kayit.slug === slug)?.ad);

      setSite(siteData || null);
      setYasal({
        unvan: deger(YASAL_SLUGLAR.unvan),
        adres: deger(YASAL_SLUGLAR.adres),
        email: deger(YASAL_SLUGLAR.email),
        mersis: deger(YASAL_SLUGLAR.mersis),
        vergi: deger(YASAL_SLUGLAR.vergi),
        kargo: deger(YASAL_SLUGLAR.kargo),
        iadeKargo: deger(YASAL_SLUGLAR.iadeKargo),
      });
      setYukleniyor(false);
    };

    getir();
  }, []);

  const siteAdi = site?.site_adi || "Neva Shop";
  const telefon = site?.telefon || "";
  const whatsapp = site?.whatsapp || "";

  const eksikBilgi = useMemo(
    () => !yasal.unvan || !yasal.adres || !yasal.email,
    [yasal]
  );

  if (yukleniyor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fff7f2] text-zinc-900">
        Yasal bilgiler yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff7f2] px-4 py-8 text-zinc-900 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#ff5c35]">{siteAdi}</p>
            <h1 className="mt-1 text-3xl font-black">Yasal Bilgilendirmeler</h1>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-[#ffd3c4] bg-white px-4 py-2 text-sm font-black"
          >
            Mağazaya Dön
          </Link>
        </div>

        {eksikBilgi && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            Satıcıya ait bazı zorunlu bilgiler henüz tamamlanmamış. Sipariş
            kurulmadan önce satıcı adı/unvanı, açık adresi ve iletişim
            bilgilerinin tüketiciye bildirilmesi gerekir.
          </div>
        )}

        <nav className="mb-6 grid gap-2 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2">
          <a href="#satici" className="text-sm font-bold text-[#8a3a26]">Satıcı Bilgileri</a>
          <a href="#on-bilgilendirme" className="text-sm font-bold text-[#8a3a26]">Ön Bilgilendirme</a>
          <a href="#mesafeli-satis" className="text-sm font-bold text-[#8a3a26]">Mesafeli Satış Sözleşmesi</a>
          <a href="#iade" className="text-sm font-bold text-[#8a3a26]">Cayma / İade</a>
          <a href="#kvkk" className="text-sm font-bold text-[#8a3a26]">KVKK Aydınlatma Metni</a>
          <a href="#cerez" className="text-sm font-bold text-[#8a3a26]">Çerez Politikası</a>
        </nav>

        <div className="space-y-6">
          <YasalBolum id="satici" baslik="Satıcı Bilgileri">
            <p><strong>Satıcı / Ticari Unvan:</strong> {yasal.unvan || "Henüz girilmedi"}</p>
            <p><strong>Açık Adres:</strong> {yasal.adres || "Henüz girilmedi"}</p>
            <p><strong>Telefon:</strong> {telefon || "Henüz girilmedi"}</p>
            <p><strong>E-posta:</strong> {yasal.email || "Henüz girilmedi"}</p>
            {yasal.mersis && <p><strong>MERSİS No:</strong> {yasal.mersis}</p>}
            {yasal.vergi && <p><strong>Vergi No:</strong> {yasal.vergi}</p>}
          </YasalBolum>

          <YasalBolum id="on-bilgilendirme" baslik="Ön Bilgilendirme Formu">
            <p>
              Tüketici, sipariş vermeden ve herhangi bir ödeme yapmadan önce
              ürünün temel nitelikleri, satıcının kimliği ve iletişim bilgileri,
              vergiler dahil ürün bedeli, varsa kargo/teslimat masrafı, ödeme ve
              teslimat koşulları, cayma hakkı ve başvuru yolları hakkında
              bilgilendirilir.
            </p>
            <p>
              Ürünlerin temel nitelikleri, fiyatları ve stok bilgileri ilgili
              ürün sayfasında; siparişe özel ürün adedi ve toplam bedel ise
              sepette gösterilir.
            </p>
            <p>
              <strong>Kargo / teslimat ücreti:</strong>{" "}
              {yasal.kargo !== ""
                ? Number(yasal.kargo) === 0
                  ? "Ücretsiz"
                  : `${yasal.kargo} TL`
                : "Sipariş tamamlanmadan önce ayrıca bildirilir."}
            </p>
            <p>
              Havale/EFT ile ödeme seçeneğinde ödeme yapılmadan önce sipariş
              özeti, satıcı bilgileri, kargo/teslimat ücreti ve toplam ödeme
              tutarı gösterilir.
            </p>
            <p>
              Tüketici uyuşmazlıklarında yürürlükteki parasal sınırlar dahilinde
              Tüketici Hakem Heyetine veya görevli Tüketici Mahkemesine
              başvurabilir.
            </p>
          </YasalBolum>

          <YasalBolum id="mesafeli-satis" baslik="Mesafeli Satış Sözleşmesi">
            <p>
              İşbu sözleşme, {yasal.unvan || siteAdi} ile internet sitesi veya
              WhatsApp üzerinden sipariş veren tüketici arasında, 6502 sayılı
              Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
              Yönetmeliği kapsamında kurulur.
            </p>
            <p>
              Sözleşmenin konusu, tüketicinin elektronik ortamda seçtiği ve
              sipariş özetinde nitelikleri, adedi ve satış bedeli gösterilen
              ürünlerin satışı ve teslimidir.
            </p>
            <p>
              Sipariş, satıcı tarafından onaylandığında işleme alınır. Havale/EFT
              seçeneğinde dekont yüklenmesi tek başına ödemenin doğrulandığı
              anlamına gelmez; satıcı banka hesabını kontrol ederek siparişi
              onaylar.
            </p>
            <p>
              Aksi ayrıca kararlaştırılmadıkça ürün teslimi yasal azami süreyi
              aşmayacak şekilde gerçekleştirilir. Kişiye özel hazırlanan
              ürünlerde tarafların ayrıca kararlaştırdığı teslim süresi
              uygulanabilir.
            </p>
          </YasalBolum>

          <YasalBolum id="iade" baslik="Cayma Hakkı ve İade">
            <p>
              Tüketici, kural olarak malı teslim aldığı tarihten itibaren 14 gün
              içinde gerekçe göstermeksizin cayma hakkını kullanabilir.
            </p>
            <p>
              Cayma bildirimi {yasal.email || "satıcının bildirdiği e-posta"}
              {" "}veya {telefon || "satıcının iletişim kanalı"} üzerinden
              iletilebilir. İade adresi: {yasal.adres || "satıcı tarafından bildirilecektir"}.
            </p>
            <p>
              İade için öngörülen taşıyıcı:{" "}
              {yasal.iadeKargo || "satıcı tarafından sipariş öncesinde bildirilir"}.
            </p>
            <p>
              Tüketicinin özel istek veya kişisel ihtiyaçları doğrultusunda
              hazırlanan ürünler ile mevzuatta sayılan diğer istisnalarda cayma
              hakkı kullanılamayabilir. Bu istisna, yalnızca ilgili ürün ve
              sipariş gerçekten mevzuattaki koşulları taşıyorsa uygulanır.
            </p>
          </YasalBolum>

          <YasalBolum id="kvkk" baslik="KVKK Aydınlatma Metni">
            <p>
              <strong>Veri sorumlusu:</strong> {yasal.unvan || siteAdi}.
            </p>
            <p>
              Sipariş sürecinde ad-soyad, telefon, sipariş içeriği, ödeme ve
              dekont bilgileri ile teslimat için gerekli iletişim bilgileri
              işlenebilir. Bu veriler siparişin kurulması ve ifası, ödeme
              kontrolü, müşteri iletişimi, teslimat, uyuşmazlıkların yönetimi ve
              yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenir.
            </p>
            <p>
              Kişisel veriler; sözleşmenin kurulması veya ifasıyla doğrudan
              ilgili olması, hukuki yükümlülüklerin yerine getirilmesi ve
              gerektiğinde veri sorumlusunun meşru menfaati gibi 6698 sayılı
              Kanun'daki hukuki sebeplere dayanılarak elektronik yöntemlerle
              toplanabilir.
            </p>
            <p>
              Veriler, siparişin yürütülmesi için gerekli olduğu ölçüde
              barındırma/veritabanı hizmet sağlayıcıları, tüketicinin WhatsApp
              iletişimini tercih etmesi halinde ilgili mesajlaşma hizmeti,
              teslimat firmaları ve kanunen yetkili kamu kurumlarıyla
              paylaşılabilir.
            </p>
            <p>
              İlgili kişiler 6698 sayılı Kanun'un 11. maddesindeki haklarına
              ilişkin taleplerini {yasal.email || "satıcının e-posta adresi"}{" "}
              üzerinden veya {yasal.adres || "satıcının açık adresine"} yazılı
              olarak iletebilir.
            </p>
          </YasalBolum>

          <YasalBolum id="cerez" baslik="Çerez Politikası">
            <p>
              Neva Shop'un mevcut mağaza uygulamasında reklam, yeniden
              pazarlama veya ziyaretçi davranışını ölçmek amacıyla Google
              Analytics, Meta Pixel benzeri isteğe bağlı takip araçları
              kullanılmamaktadır.
            </p>
            <p>
              Site ve yönetim panelinin güvenli ve teknik olarak çalışması için
              oturum veya güvenlik amacı taşıyan zorunlu teknik depolama
              mekanizmaları kullanılabilir. Bunlar hizmetin sunulması için
              gerekli olduklarından ayrıca pazarlama amacıyla kullanılmaz.
            </p>
            <p>
              İleride analitik, reklam veya pazarlama amaçlı zorunlu olmayan
              çerezler eklenirse, bunlar kullanıcı açıkça izin vermeden
              çalıştırılmayacak ve kabul/reddet/tercih seçenekleri sunulacaktır.
            </p>
          </YasalBolum>
        </div>

        <p className="mt-8 text-xs leading-5 text-zinc-400">
          Son güncelleme: 13 Kasım 2026
        </p>
      </div>
    </main>
  );
}

function YasalBolum({
  id,
  baslik,
  children,
}: {
  id: string;
  baslik: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-black text-zinc-950">{baslik}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-600">
        {children}
      </div>
    </section>
  );
}
