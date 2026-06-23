import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalH3,
  LegalP,
  LegalBullet,
  LegalNumbered,
  LegalInfoBox,
  LegalDivider,
} from '../../src/components/legal/LegalPage';

export default function KullanimKosullariScreen() {
  return (
    <LegalPage
      title="Kullanım Koşulları"
      breadcrumb="Kullanım Koşulları"
      date="Ocak 2025"
      subtitle="KidsGourmet hizmetlerini kullanarak aşağıdaki kullanım koşullarını kabul etmiş sayılırsınız."
    >
      <LegalH2>1. Taraflar ve Kapsam</LegalH2>
      <LegalP>
        Bu kullanım koşulları, KidsGourmet A.Ş. ("KidsGourmet") ile KidsGourmet mobil uygulamasını ve
        web sitesini kullanan gerçek kişiler ("Kullanıcı") arasındaki ilişkiyi düzenler.
      </LegalP>

      <LegalH2>2. Hizmetin Tanımı</LegalH2>
      <LegalP>
        KidsGourmet; 0-12 yaş çocuklarına yönelik beslenme rehberi, tarif önerileri, haftalık öğün planlaması,
        büyüme takibi, aşı hatırlatıcısı ve çocuk sağlığı araçları sunan bir dijital platform hizmetidir.
      </LegalP>

      <LegalH2>3. Hesap Yükümlülükleri</LegalH2>
      <LegalBullet>Doğru ve güncel bilgi sağlamak</LegalBullet>
      <LegalBullet>Hesap güvenliğini korumak (şifre paylaşmamak)</LegalBullet>
      <LegalBullet>Hesabınızda gerçekleşen tüm işlemlerden sorumlu olmak</LegalBullet>
      <LegalBullet>18 yaş altı kullanıcılar için ebeveyn onayı almak</LegalBullet>

      <LegalH2>4. Kabul Edilemez Kullanım</LegalH2>
      <LegalBullet>Hizmetleri yasadışı amaçlarla kullanmak</LegalBullet>
      <LegalBullet>Platformu ve diğer kullanıcıları zarara uğratacak eylemler gerçekleştirmek</LegalBullet>
      <LegalBullet>Otomatik araçlarla (bot, scraper) içerik çekmek</LegalBullet>
      <LegalBullet>Telif hakkı korumalı içerikleri izinsiz kullanmak veya dağıtmak</LegalBullet>
      <LegalBullet>Başkasının kimliğine bürünmek</LegalBullet>

      <LegalH2>5. İçerik ve Fikri Mülkiyet</LegalH2>
      <LegalP>
        KidsGourmet platformundaki tüm içerikler (tarifler, makaleler, görseller, uygulama kodu) KidsGourmet
        A.Ş. veya lisans verenlere aittir ve telif hakkı yasalarıyla korunmaktadır.
      </LegalP>
      <LegalInfoBox variant="warning">
        <LegalP>
          Kullanıcılar yalnızca kişisel, ticari olmayan amaçlarla içeriklere erişebilir. İzinsiz çoğaltma, 
          dağıtım veya ticari kullanım yasaktır.
        </LegalP>
      </LegalInfoBox>

      <LegalH2>6. Tıbbi Sorumluluk Reddi</LegalH2>
      <LegalInfoBox variant="warning">
        <LegalP>
          ⚠️ KidsGourmet bir tıbbi platform değildir. Sunulan içerikler yalnızca genel bilgilendirme amaçlıdır ve 
          tıbbi tavsiye yerine geçmez. Çocuğunuzun sağlığına ilişkin her türlü karar için mutlaka bir sağlık 
          profesyoneliyle görüşün.
        </LegalP>
      </LegalInfoBox>

      <LegalH2>7. Hizmet Değişiklikleri</LegalH2>
      <LegalP>
        KidsGourmet, önceden bildirim yapmaksızın hizmet kapsamını, özelliklerini veya fiyatlandırmasını
        değiştirme hakkını saklı tutar. Önemli değişiklikler kullanıcılara 30 gün önceden bildirilir.
      </LegalP>

      <LegalH2>8. Sorumluluk Sınırlaması</LegalH2>
      <LegalP>
        KidsGourmet, kullanım koşullarının ihlali, doğal afet veya kendi kontrolü dışındaki olaylar
        nedeniyle oluşan dolaylı zararlardan sorumlu tutulamaz.
      </LegalP>

      <LegalH2>9. Uygulanacak Hukuk</LegalH2>
      <LegalP>
        Bu koşullar Türk Hukuku'na tabidir. Uyuşmazlıklarda İstanbul Merkez Mahkemeleri ve İcra Daireleri
        yetkilidir.
      </LegalP>

      <LegalH2>10. İletişim</LegalH2>
      <LegalInfoBox>
        <LegalP>
          Kullanım koşullarına ilişkin sorularınız için: legal@kidsgourmet.com.tr
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
