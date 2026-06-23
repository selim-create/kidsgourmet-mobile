import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalH3,
  LegalP,
  LegalBullet,
  LegalNumbered,
  LegalInfoBox,
  LegalTable,
  LegalTableRow,
} from '../../src/components/legal/LegalPage';

export default function AydinlatmaMetniScreen() {
  return (
    <LegalPage
      title="Aydınlatma Metni"
      breadcrumb="Aydınlatma Metni"
      date="Ocak 2025"
      subtitle="6698 sayılı KVKK'nın 10. maddesi uyarınca hazırlanan aydınlatma metnidir."
    >
      <LegalH2>Veri Sorumlusu</LegalH2>
      <LegalInfoBox variant="info">
        <LegalP>
          KidsGourmet A.Ş. — kvkk@kidsgourmet.com.tr
        </LegalP>
      </LegalInfoBox>

      <LegalH2>İşlenen Kişisel Veriler ve Amaçları</LegalH2>
      <LegalTable>
        <LegalTableRow col1="Veri Türü" col2="İşlenme Amacı" isHeader />
        <LegalTableRow col1="Kimlik" col2="Hesap oluşturma, kimlik doğrulama" />
        <LegalTableRow col1="İletişim" col2="Bildirim gönderme, müşteri desteği" />
        <LegalTableRow col1="Çocuk Sağlık" col2="Kişiselleştirilmiş beslenme önerisi" />
        <LegalTableRow col1="Kullanım" col2="Hizmet iyileştirme, analitik" />
      </LegalTable>

      <LegalH2>Hukuki Dayanaklar</LegalH2>
      <LegalNumbered num={1}>Açık rıza (Md. 5/1)</LegalNumbered>
      <LegalNumbered num={2}>Sözleşmenin ifası (Md. 5/2-c)</LegalNumbered>
      <LegalNumbered num={3}>Meşru menfaat (Md. 5/2-f)</LegalNumbered>
      <LegalNumbered num={4}>Hukuki yükümlülük (Md. 5/2-ç)</LegalNumbered>

      <LegalH2>Veri Aktarımı</LegalH2>
      <LegalP>
        Verileriniz; teknik hizmet sağlayıcılar, analitik platformlar ve yasal zorunluluklar kapsamında
        yetkili kamu kuruluşlarıyla paylaşılabilir.
      </LegalP>

      <LegalH2>Saklama Süresi</LegalH2>
      <LegalP>
        Verileriniz, ilgili mevzuatta öngörülen süreler veya işleme amacının gerektirdiği süre boyunca
        saklanır. Hesabınızı silmeniz halinde kişisel verileriniz yasal saklama yükümlülükleri kapsamında
        belirtilen süreler sonunda silinir.
      </LegalP>

      <LegalH2>Haklarınız (KVKK Md. 11)</LegalH2>
      <LegalBullet>Verilerinizin işlenip işlenmediğini öğrenme</LegalBullet>
      <LegalBullet>İşlenmişse bilgi talep etme</LegalBullet>
      <LegalBullet>Düzeltme, silme veya yok etme talep etme</LegalBullet>
      <LegalBullet>İşleme itiraz etme</LegalBullet>
      <LegalBullet>Zararın giderilmesini talep etme</LegalBullet>

      <LegalInfoBox variant="warning">
        <LegalP>
          Başvurularınızı kvkk@kidsgourmet.com.tr adresine veya kayıtlı şirket adresimize yazılı olarak iletebilirsiniz.
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
