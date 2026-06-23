import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalH3,
  LegalP,
  LegalBullet,
  LegalInfoBox,
  LegalTable,
  LegalTableRow,
} from '../../src/components/legal/LegalPage';

export default function CerezPolitikasiScreen() {
  return (
    <LegalPage
      title="Çerez Politikası"
      breadcrumb="Çerez Politikası"
      date="Ocak 2025"
      subtitle="KidsGourmet'in çerez ve benzeri teknolojileri nasıl kullandığına dair bilgi için bu sayfayı okuyun."
    >
      <LegalH2>1. Çerez Nedir?</LegalH2>
      <LegalP>
        Çerezler, bir web sitesi veya uygulamayı ziyaret ettiğinizde cihazınıza yerleştirilen küçük metin
        dosyalarıdır. Cihazınızı tanımak, tercihlerinizi hatırlamak ve deneyiminizi kişiselleştirmek için
        kullanılır.
      </LegalP>

      <LegalH2>2. Kullandığımız Çerez Türleri</LegalH2>
      <LegalTable>
        <LegalTableRow col1="Tür" col2="Açıklama" isHeader />
        <LegalTableRow col1="Zorunlu" col2="Hizmetin çalışması için gereken teknik çerezler. Reddedilemez." />
        <LegalTableRow col1="Analitik" col2="Uygulama kullanımını ölçmek için (anonim). İzin gerektirir." />
        <LegalTableRow col1="Pazarlama" col2="Kişiselleştirilmiş reklam ve içerik için. İzin gerektirir." />
        <LegalTableRow col1="Tercih" col2="Dil, tema gibi tercihlerinizi hatırlamak için." />
      </LegalTable>

      <LegalH2>3. Zorunlu Çerezler</LegalH2>
      <LegalBullet>Oturum yönetimi (login durumu)</LegalBullet>
      <LegalBullet>Güvenlik token'ları (CSRF koruması)</LegalBullet>
      <LegalBullet>Yük dengeleme</LegalBullet>

      <LegalH2>4. Analitik Çerezler</LegalH2>
      <LegalP>
        Uygulama kullanım verilerini anonim olarak analiz etmek için analitik araçlar kullanıyoruz. Bu
        çerezler, hangi özelliklerin ne sıklıkla kullanıldığını ve hataların nerede oluştuğunu anlamamıza
        yardımcı olur.
      </LegalP>
      <LegalInfoBox variant="info">
        <LegalP>
          Analitik çerezler için onayınızı Rızalarım sayfasından yönetebilirsiniz.
        </LegalP>
      </LegalInfoBox>

      <LegalH2>5. Pazarlama Çerezleri</LegalH2>
      <LegalP>
        Kişiselleştirilmiş içerik ve reklam sunmak için pazarlama çerezleri kullanıyoruz. Bu çerezler
        ilgi alanlarınızı anlamak ve size daha uygun içerikler göstermek için kullanılır.
      </LegalP>

      <LegalH2>6. Çerez Tercihlerinizi Nasıl Yönetirsiniz?</LegalH2>
      <LegalBullet>Uygulama ayarlarından Rızalarım bölümünü ziyaret edin</LegalBullet>
      <LegalBullet>Cihaz ayarlarından uygulamanın depolama izinlerini düzenleyin</LegalBullet>
      <LegalBullet>Hesabınızı silerek tüm kayıtlı verilerinizi kaldırabilirsiniz</LegalBullet>

      <LegalH2>7. Üçüncü Taraf Çerezleri</LegalH2>
      <LegalP>
        Bazı analitik ve reklam hizmetleri (Firebase Analytics, Google Ads vb.) kendi çerezlerini kullanabilir.
        Bu çerezler ilgili sağlayıcıların gizlilik politikaları kapsamındadır.
      </LegalP>

      <LegalH2>8. Değişiklikler</LegalH2>
      <LegalP>
        Bu politikayı zaman zaman güncelleyebiliriz. Önemli değişlikler yapıldığında sizi uygulama içi
        bildirim veya e-posta ile bilgilendireceğiz.
      </LegalP>

      <LegalInfoBox>
        <LegalP>
          Çerez politikamız hakkında sorularınız için: privacy@kidsgourmet.com.tr
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
