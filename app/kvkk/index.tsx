import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
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
  LegalDivider,
} from '../../src/components/legal/LegalPage';
import { COLORS } from '../../src/lib/constants';

export default function KVKKScreen() {
  return (
    <LegalPage
      title="KVKK Aydınlatma Metni"
      breadcrumb="KVKK"
      date="Ocak 2025"
      subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında hazırlanmış aydınlatma metnidir."
    >
      {/* 1. Veri Sorumlusu */}
      <LegalH2>1. Veri Sorumlusunun Kimliği</LegalH2>
      <LegalInfoBox variant="info">
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 6 }}>KidsGourmet A.Ş.</Text>
        <Text style={{ fontSize: 13, color: '#1E40AF', lineHeight: 20 }}>
          Adres: Levent Mah. Beşyol Sk. No:1, 34330 Beşiktaş/İstanbul{'\n'}
          E-posta: kvkk@kidsgourmet.com.tr{'\n'}
          Tel: +90 (212) 000 00 00{'\n'}
          Web: www.kidsgourmet.com.tr
        </Text>
      </LegalInfoBox>

      {/* 2. İşlenen Kişisel Veriler */}
      <LegalH2>2. İşlenen Kişisel Veriler</LegalH2>
      <LegalTable>
        <LegalTableRow col1="Kategori" col2="İçerik" isHeader />
        <LegalTableRow col1="Kimlik" col2="Ad, soyad, T.C. kimlik no (isteğe bağlı)" />
        <LegalTableRow col1="İletişim" col2="E-posta adresi, telefon numarası" />
        <LegalTableRow col1="Çocuk Bilgileri" col2="Ad, doğum tarihi, cinsiyet, beslenme tercihleri, alerji bilgileri" />
        <LegalTableRow col1="Sağlık" col2="Çocuğa ait büyüme verileri, BLW hazırlık sonuçları, aşı takip bilgileri" />
        <LegalTableRow col1="Kullanım" col2="Uygulama içi hareketler, tercihler, arama geçmişi" />
        <LegalTableRow col1="Teknik" col2="IP adresi, cihaz bilgisi, çerez verileri" />
      </LegalTable>

      {/* 3. İşlenme Amaçları */}
      <LegalH2>3. Kişisel Verilerin İşlenme Amaçları</LegalH2>

      <LegalH3>3.1. Hizmet Sunumu</LegalH3>
      <LegalBullet>Yaşa ve çocuğun özelliklerine göre tarif önerileri sunmak</LegalBullet>
      <LegalBullet>Haftalık öğün planı oluşturmak ve beslenme takibi yapmak</LegalBullet>
      <LegalBullet>Aşı takvimine uyarı ve hatırlatma göndermek</LegalBullet>
      <LegalBullet>Büyüme verilerini analiz etmek ve persentil hesabı yapmak</LegalBullet>

      <LegalH3>3.2. Platform İyileştirme</LegalH3>
      <LegalBullet>Kullanıcı deneyimini geliştirmek ve uygulama hatalarını düzeltmek</LegalBullet>
      <LegalBullet>Güvenlik açıklarını tespit etmek ve önlem almak</LegalBullet>
      <LegalBullet>İstatistiksel analizler yapmak</LegalBullet>

      <LegalH3>3.3. Pazarlama (Onayınıza Bağlı)</LegalH3>
      <LegalBullet>Yeni ürün, tarif ve içerik bildirimleri göndermek</LegalBullet>
      <LegalBullet>Kişiselleştirilmiş kampanya ve teklifler sunmak</LegalBullet>

      {/* 4. Toplanma Yöntemi */}
      <LegalH2>4. Toplanma Yöntemi ve Hukuki Sebebi</LegalH2>
      <LegalNumbered num={1}>Açık rıza (KVKK Md. 5/1) – Pazarlama ve hassas veri işleme için</LegalNumbered>
      <LegalNumbered num={2}>Sözleşmenin ifası (KVKK Md. 5/2-c) – Temel hizmet sunumu için</LegalNumbered>
      <LegalNumbered num={3}>Meşru menfaat (KVKK Md. 5/2-f) – Güvenlik ve dolandırıcılık önleme için</LegalNumbered>
      <LegalNumbered num={4}>Hukuki yükümlülük (KVKK Md. 5/2-ç) – Yasal saklama yükümlülükleri için</LegalNumbered>

      {/* 5. Aktarılma */}
      <LegalH2>5. Kişisel Verilerin Aktarılması</LegalH2>
      <LegalP>
        Kişisel verileriniz yalnızca aşağıdaki taraflara ve belirtilen amaçlarla aktarılmaktadır:
      </LegalP>
      <LegalBullet>Bulut hizmet sağlayıcılarına (hosting, depolama, e-posta gönderimi)</LegalBullet>
      <LegalBullet>Analitik araç sağlayıcılarına (anonim kullanım istatistikleri)</LegalBullet>
      <LegalBullet>Ödeme altyapı sağlayıcılarına (abonelik yönetimi)</LegalBullet>
      <LegalBullet>Yetkili kamu kurum ve kuruluşlarına (yasal yükümlülük kapsamında)</LegalBullet>

      <LegalH3>Yurt Dışı Aktarım</LegalH3>
      <LegalP>
        Bazı bulut hizmetleri Türkiye dışındaki sunucularda çalıştırılmaktadır. Bu aktarımlar KVKK Md. 9
        kapsamında yeterli korumayı sağlayan veya standart sözleşme hükümleri uygulanan ülkeler/altyapılar
        aracılığıyla gerçekleştirilmektedir.
      </LegalP>

      {/* 6. Veri Sahibi Hakları */}
      <LegalH2>6. Veri Sahibi Olarak Haklarınız</LegalH2>
      <LegalP>KVKK Md. 11 kapsamında aşağıdaki haklara sahipsiniz:</LegalP>
      <LegalNumbered num={1}>Kişisel verilerinizin işlenip işlenmediğini öğrenme</LegalNumbered>
      <LegalNumbered num={2}>İşlenmişse buna ilişkin bilgi talep etme</LegalNumbered>
      <LegalNumbered num={3}>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</LegalNumbered>
      <LegalNumbered num={4}>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</LegalNumbered>
      <LegalNumbered num={5}>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</LegalNumbered>
      <LegalNumbered num={6}>İşlenme şartları ortadan kalkmışsa silinmesini veya yok edilmesini isteme</LegalNumbered>
      <LegalNumbered num={7}>İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analiz edilmesi suretiyle aleyhine sonuç doğurmasına itiraz etme</LegalNumbered>
      <LegalNumbered num={8}>Kanuna aykırı işlenmesi nedeniyle zarara uğraması hâlinde zararın giderilmesini talep etme</LegalNumbered>

      <LegalDivider />

      {/* Başvuru */}
      <LegalInfoBox variant="warning">
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C2D12', marginBottom: 6 }}>
          📮 Başvuru Yöntemi
        </Text>
        <Text style={{ fontSize: 13, color: '#7C2D12', lineHeight: 20, marginBottom: 10 }}>
          Haklarınızı kullanmak için yazılı başvuru formumuzu doldurabilir, kvkk@kidsgourmet.com.tr adresine
          e-posta gönderebilir veya kayıtlı elektronik posta (KEP) yoluyla tarafımıza iletebilirsiniz.
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/basvuru-formu')}
          style={{ backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
            Yazılı Başvuru Formuna Git →
          </Text>
        </TouchableOpacity>
      </LegalInfoBox>
    </LegalPage>
  );
}
