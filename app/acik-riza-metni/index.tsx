import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalP,
  LegalBullet,
  LegalNumbered,
  LegalInfoBox,
} from '../../src/components/legal/LegalPage';

export default function AcikRizaMetniScreen() {
  return (
    <LegalPage
      title="Açık Rıza Metni"
      breadcrumb="Açık Rıza Metni"
      date="Ocak 2025"
      subtitle="Kişisel verilerinizin işlenmesine ilişkin açık rıza metnidir."
    >
      <LegalH2>Açık Rıza Beyanı</LegalH2>
      <LegalP>
        KidsGourmet A.Ş. tarafından sunulan hizmetleri kullanmak amacıyla aşağıda belirtilen
        kişisel verilerimin işlenmesine açık rızamı veriyorum:
      </LegalP>

      <LegalH2>Rıza Verilen Veri ve İşlemler</LegalH2>

      <LegalH2>1. Hassas Sağlık Verileri</LegalH2>
      <LegalP>
        Çocuğuma ait büyüme verileri (boy, kilo, baş çevresi), alerji bilgileri, beslenme tercihleri,
        BLW hazırlık test sonuçları ve aşı takip verilerinin aşağıdaki amaçlarla işlenmesine rıza veriyorum:
      </LegalP>
      <LegalBullet>Kişiselleştirilmiş tarif ve beslenme önerileri sunulması</LegalBullet>
      <LegalBullet>Büyüme eğrisi ve persentil analizi yapılması</LegalBullet>
      <LegalBullet>Aşı hatırlatmaları gönderilmesi</LegalBullet>
      <LegalBullet>Platform hizmetlerinin iyileştirilmesi (anonim istatistik)</LegalBullet>

      <LegalH2>2. Pazarlama İletişimi</LegalH2>
      <LegalP>
        E-posta adresim ve telefon numaram aracılığıyla yeni tarifler, beslenme ipuçları, kampanyalar
        ve özel teklifler hakkında ticari elektronik ileti almayı kabul ediyorum.
      </LegalP>

      <LegalH2>3. Üçüncü Taraf Paylaşımı</LegalH2>
      <LegalP>
        Anonim hâle getirilmiş kullanım verilerimin platformu iyileştirme amacıyla analitik hizmet
        sağlayıcılarıyla paylaşılmasına onay veriyorum.
      </LegalP>

      <LegalInfoBox variant="warning">
        <LegalP>
          ⚠️ Bu rızaları istediğiniz zaman geri alabilirsiniz. Rızalarınızı Rızalarım sayfasından 
          yönetebilirsiniz. Rızanın geri alınması, geri alma tarihinden önceki işlemlerin 
          hukuka uygunluğunu etkilemez.
        </LegalP>
      </LegalInfoBox>

      <LegalH2>İletişim</LegalH2>
      <LegalInfoBox>
        <LegalP>
          Açık rıza metniyle ilgili sorularınız için: kvkk@kidsgourmet.com.tr
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
