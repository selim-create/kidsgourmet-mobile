import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalH3,
  LegalP,
  LegalBullet,
  LegalInfoBox,
  LegalDivider,
} from '../../src/components/legal/LegalPage';

export default function GizlilikPolitikasiScreen() {
  return (
    <LegalPage
      title="Gizlilik Politikası"
      breadcrumb="Gizlilik Politikası"
      date="Ocak 2025"
      subtitle="KidsGourmet uygulaması ve web sitesinde kişisel verilerinizin gizliliğini nasıl koruduğumuza dair bilgi bulabilirsiniz."
    >
      <LegalH2>1. Genel Bakış</LegalH2>
      <LegalP>
        KidsGourmet olarak kullanıcılarımızın ve çocuklarının kişisel bilgilerinin gizliliğini en üst düzeyde
        korumayı taahhüt ediyoruz. Bu politika, hizmetlerimizi kullanırken topladığımız, işlediğimiz ve
        sakladığımız veriler hakkında sizi bilgilendirmek için hazırlanmıştır.
      </LegalP>

      <LegalH2>2. Topladığımız Bilgiler</LegalH2>

      <LegalH3>2.1. Doğrudan Sağladığınız Bilgiler</LegalH3>
      <LegalBullet>Hesap oluşturma sırasında verdiğiniz ad, soyad, e-posta adresi</LegalBullet>
      <LegalBullet>Çocuk profili bilgileri (ad, doğum tarihi, cinsiyet)</LegalBullet>
      <LegalBullet>Alerji ve beslenme tercihleri</LegalBullet>
      <LegalBullet>Büyüme ve sağlık takip verileri</LegalBullet>

      <LegalH3>2.2. Otomatik Olarak Toplanan Bilgiler</LegalH3>
      <LegalBullet>Uygulama kullanım istatistikleri (hangi özelliklerin ne sıklıkla kullanıldığı)</LegalBullet>
      <LegalBullet>Cihaz türü, işletim sistemi, uygulama sürümü</LegalBullet>
      <LegalBullet>Çerez ve benzeri takip teknolojileri aracılığıyla toplanan veriler</LegalBullet>

      <LegalH2>3. Bilgileri Nasıl Kullanıyoruz</LegalH2>
      <LegalBullet>Kişiselleştirilmiş tarif ve içerik önerileri sunmak</LegalBullet>
      <LegalBullet>Haftalık öğün planları oluşturmak</LegalBullet>
      <LegalBullet>Beslenme ve büyüme takibi sağlamak</LegalBullet>
      <LegalBullet>Güvenlik tehditlerini tespit etmek ve önlemek</LegalBullet>
      <LegalBullet>Hizmetlerimizi sürekli iyileştirmek</LegalBullet>
      <LegalBullet>Yasal yükümlülüklerimizi yerine getirmek</LegalBullet>

      <LegalH2>4. Bilgi Paylaşımı</LegalH2>
      <LegalP>
        Kişisel bilgilerinizi asla üçüncü taraflara satmıyoruz. Bilgilerinizi yalnızca aşağıdaki durumlarda
        paylaşabiliriz:
      </LegalP>
      <LegalBullet>Hizmet sağlayıcılarımızla (bulut depolama, e-posta servisi, analitik)</LegalBullet>
      <LegalBullet>Yasal zorunluluk nedeniyle resmi makamlarla</LegalBullet>
      <LegalBullet>Sizin açık rızanızla belirlediğiniz taraflarla</LegalBullet>

      <LegalH2>5. Veri Güvenliği</LegalH2>
      <LegalInfoBox variant="info">
        <LegalP>
          Verilerinizi korumak için endüstri standardı şifreleme (TLS/SSL), güvenli depolama ve düzenli
          güvenlik denetimleri uyguluyoruz. Şifreleriniz asla düz metin olarak saklanmaz.
        </LegalP>
      </LegalInfoBox>

      <LegalH2>6. Çocuk Mahremiyeti</LegalH2>
      <LegalP>
        13 yaş altı çocuklara ait veriler yalnızca ebeveyn veya yasal vasi onayıyla toplanır. Çocuğa ait
        sağlık ve büyüme verileri özellikle hassas kabul edilmekte ve ek güvenlik önlemleriyle korunmaktadır.
      </LegalP>

      <LegalH2>7. Veri Saklama Süresi</LegalH2>
      <LegalBullet>Hesap verileri: Hesap aktif olduğu sürece + 3 yıl</LegalBullet>
      <LegalBullet>Sağlık verileri: 5 yıl (yasal yükümlülük)</LegalBullet>
      <LegalBullet>Analitik veriler: 2 yıl (anonim olarak)</LegalBullet>
      <LegalBullet>İletişim kayıtları: 3 yıl</LegalBullet>

      <LegalH2>8. Haklarınız</LegalH2>
      <LegalP>
        Kişisel verileriniz üzerinde erişim, düzeltme, silme, itiraz ve kısıtlama haklarına sahipsiniz.
        Bu haklarınızı kullanmak için <LegalP>kvkk@kidsgourmet.com.tr</LegalP> adresine yazabilirsiniz.
      </LegalP>

      <LegalH2>9. İletişim</LegalH2>
      <LegalInfoBox>
        <LegalP>
          Gizlilik politikamız hakkında sorularınız için: privacy@kidsgourmet.com.tr
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
