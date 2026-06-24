import React from 'react';
import {
  LegalPage,
  LegalH2,
  LegalP,
  LegalBullet,
  LegalInfoBox,
} from '../../src/components/legal/LegalPage';

export default function VeliBeyaniScreen() {
  return (
    <LegalPage
      title="Veli Beyanı"
      breadcrumb="Veli Beyanı"
      date="Ocak 2025"
      subtitle="Çocuk adına işlem yapan kullanıcıların veli veya yasal temsilci sıfatına ilişkin beyan metni."
    >
      <LegalH2>Beyan</LegalH2>
      <LegalP>
        KidsGourmet üzerinde çocuk profili oluşturan ve çocuğa ilişkin veri paylaşan kişi olarak,
        ilgili çocuk adına işlem yapmaya yetkili veli, vasi veya yasal temsilci olduğumu beyan ederim.
      </LegalP>

      <LegalH2>Kapsam</LegalH2>
      <LegalBullet>Çocuk profili oluşturma ve güncelleme</LegalBullet>
      <LegalBullet>Beslenme, alerji ve gelişim verilerinin işlenmesi</LegalBullet>
      <LegalBullet>Yasal başvurular ve rıza yönetimi işlemleri</LegalBullet>

      <LegalInfoBox variant="warning">
        <LegalP>
          Yanlış veya yetkisiz beyan verilmesi hâlinde doğabilecek hukuki sorumluluk beyanı veren kullanıcıya aittir.
        </LegalP>
      </LegalInfoBox>
    </LegalPage>
  );
}
