import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalP,
  LegalBullet,
  LegalInfoBox,
} from '../../src/components/legal/LegalPage';

export default function HassasVeriIslemeIzniScreen() {
  return (
    <LegalPage
      title="Hassas Veri İşleme İzni"
      breadcrumb="Hassas Veri İzni"
      date="Ocak 2025"
      subtitle="Sağlık ve beslenme gibi özel nitelikli kişisel verilerin işlenmesine ilişkin açık rıza metni."
    >
      <LegalH2>İşlenecek Veriler</LegalH2>
      <LegalBullet>Alerji ve beslenme tercihleri</LegalBullet>
      <LegalBullet>Büyüme ve gelişim kayıtları</LegalBullet>
      <LegalBullet>Aşı ve sağlık takibi bilgileri</LegalBullet>

      <LegalH2>İşleme Amaçları</LegalH2>
      <LegalP>
        Bu veriler yalnızca kişiselleştirilmiş öneri sunmak, gelişim takibi yapmak ve çocuk için daha
        güvenli beslenme rehberliği sağlamak amacıyla işlenir.
      </LegalP>

      <LegalInfoBox variant="warning">
        <LegalP>
          Hassas veri işleme iznini dilediğiniz zaman Rızalarım sayfasından geri çekebilirsiniz.
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
