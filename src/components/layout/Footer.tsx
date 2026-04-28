import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

type FontAwesomeIconName = React.ComponentProps<typeof FontAwesome>['name'];

interface SocialLink {
  name: string;
  icon: FontAwesomeIconName;
  url: string;
  color: string;
}

interface FooterColumn {
  title: string;
  links: { label: string; route?: string; url?: string }[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SOCIAL_LINKS: SocialLink[] = [
  { name: 'Instagram', icon: 'instagram', url: 'https://www.instagram.com/kidsgourmet', color: '#E1306C' },
  { name: 'Facebook', icon: 'facebook', url: 'https://www.facebook.com/kidsgourmet', color: '#1877F2' },
  { name: 'YouTube', icon: 'youtube-play', url: 'https://www.youtube.com/@kidsgourmet', color: '#FF0000' },
  { name: 'Twitter/X', icon: 'twitter', url: 'https://twitter.com/kidsgourmet', color: '#1DA1F2' },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Tarifler',
    links: [
      { label: 'Bebek Tarifleri', route: '/(tabs)/recipes' },
      { label: 'Çocuk Tarifleri', route: '/(tabs)/recipes' },
      { label: 'Öğün Fikirleri', route: '/(tabs)/recipes' },
      { label: 'Atıştırmalıklar', route: '/(tabs)/recipes' },
      { label: 'Özel Günler', route: '/(tabs)/recipes' },
    ],
  },
  {
    title: 'Beslenme',
    links: [
      { label: 'Beslenme Rehberi', route: '/blog' },
      { label: 'Yaş Grupları', route: '/blog' },
      { label: 'Alerji & Diyet', route: '/blog' },
      { label: 'Vitamin & Mineral', route: '/blog' },
      { label: 'Sağlıklı Büyüme', route: '/blog' },
    ],
  },
  {
    title: 'Araçlar',
    links: [
      { label: 'Akıllı Asistan', route: '/(tabs)/assistant' },
      { label: 'Yemek Planı', route: '/(tabs)/meal-plan' },
      { label: 'Porsiyon Hesaplama', route: '/(tabs)/assistant' },
      { label: 'Alışveriş Listesi', route: '/(tabs)/assistant' },
    ],
  },
  {
    title: 'Hakkımızda',
    links: [
      { label: 'Biz Kimiz?', url: 'https://kidsgourmet.com.tr/hakkimizda' },
      { label: 'Uzmanlarımız', url: 'https://kidsgourmet.com.tr/uzmanlar' },
      { label: 'Kariyer', url: 'https://kidsgourmet.com.tr/kariyer' },
      { label: 'İletişim', url: 'https://kidsgourmet.com.tr/iletisim' },
      { label: 'Blog', route: '/blog' },
    ],
  },
];

const LEGAL_LINKS = [
  { label: 'KVKK', url: 'https://kidsgourmet.com.tr/kvkk' },
  { label: 'Gizlilik Politikası', url: 'https://kidsgourmet.com.tr/gizlilik' },
  { label: 'Çerez Politikası', url: 'https://kidsgourmet.com.tr/cerez' },
  { label: 'Kullanım Koşulları', url: 'https://kidsgourmet.com.tr/kullanim-kosullari' },
];

// ─── Newsletter Form ──────────────────────────────────────────────────────────

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    // Placeholder: replace with real API call when newsletter endpoint is ready
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>
          Abone oldunuz! Teşekkür ederiz 🎉
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={email}
          onChangeText={(text) => { setEmail(text); setEmailError(false); }}
          placeholder="E-posta adresiniz"
          placeholderTextColor="rgba(255,255,255,0.6)"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={handleSubscribe}
          accessibilityLabel="E-posta adresi"
          accessibilityHint="Bültene abone olmak için e-posta adresinizi girin"
          style={{
            flex: 1,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 14,
            color: '#fff',
            borderWidth: 1,
            borderColor: emailError ? '#FF4444' : 'rgba(255,255,255,0.35)',
          }}
        />
        <TouchableOpacity
          onPress={handleSubscribe}
          activeOpacity={0.85}
          accessibilityLabel="Abone ol"
          accessibilityRole="button"
          style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 11,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: COLORS.primary, fontSize: 14, fontWeight: '700' }}>
            Abone Ol
          </Text>
        </TouchableOpacity>
      </View>
      {emailError && (
        <Text style={{ color: '#FFD0D0', fontSize: 12, marginTop: 6 }}>
          Lütfen geçerli bir e-posta adresi girin.
        </Text>
      )}
    </View>
  );
}

// ─── Footer Column ────────────────────────────────────────────────────────────

function FooterColumnBlock({ column }: { column: FooterColumn }) {
  const handlePress = (link: { route?: string; url?: string }) => {
    if (link.url) {
      Linking.openURL(link.url).catch(() => {});
    } else if (link.route) {
      router.push(link.route as Parameters<typeof router.push>[0]);
    }
  };

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{
        color: '#1E293B',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>
        {column.title}
      </Text>
      <View style={{ gap: 8 }}>
        {column.links.map((link) => (
          <TouchableOpacity
            key={link.label}
            onPress={() => handlePress(link)}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#64748B', fontSize: 14, lineHeight: 20 }}>
              {link.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Footer Component ─────────────────────────────────────────────────────────

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleSocialPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleLegalPress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View>
      {/* ── 1. Newsletter Section ────────────────────────────────────── */}
      <LinearGradient
        colors={['#FF8C42', '#FFBA00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 24 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <View style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.25)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons name="mail-outline" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', lineHeight: 22 }}>
              K&G Bülten
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginTop: 2 }}>
              Yeni tarifler, beslenme ipuçları ve özel içerikler e-postana gelsin!
            </Text>
          </View>
        </View>
        <NewsletterForm />
      </LinearGradient>

      {/* ── 2. Main Footer Content ───────────────────────────────────── */}
      <View style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 8 }}>
        {/* Brand Column */}
        <View style={{ marginBottom: 28 }}>
          <Image
            source={require('../../../assets/images/kg-logo-full-dark.png')}
            style={{ width: 140, height: 36, marginBottom: 12 }}
            contentFit="contain"
          />
          <Text style={{ color: '#64748B', fontSize: 13, lineHeight: 20, marginBottom: 16, maxWidth: 280 }}>
            Bebeğinizden büyüyen çocuğunuza kadar her yaşa özel beslenme rehberi, uzman onaylı tarifler ve sağlıklı büyüme takibi.
          </Text>
          {/* Social Media Icons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {SOCIAL_LINKS.map((social) => (
              <TouchableOpacity
                key={social.name}
                onPress={() => handleSocialPress(social.url)}
                activeOpacity={0.75}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
                accessibilityLabel={social.name}
              >
                <FontAwesome name={social.icon} size={17} color={social.color} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 24 }} />

        {/* Link Columns */}
        {FOOTER_COLUMNS.map((column) => (
          <FooterColumnBlock key={column.title} column={column} />
        ))}
      </View>

      {/* ── 3. Bottom Bar ────────────────────────────────────────────── */}
      <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 24, paddingVertical: 16 }}>
        <Text style={{ color: '#94A3B8', fontSize: 12, textAlign: 'center', marginBottom: 10 }}>
          © {currentYear} KidsGourmet. Tüm hakları saklıdır.
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 4 }}>
          {LEGAL_LINKS.map((link, index) => (
            <React.Fragment key={link.label}>
              <TouchableOpacity onPress={() => handleLegalPress(link.url)} activeOpacity={0.7}>
                <Text style={{ color: '#64748B', fontSize: 11 }}>{link.label}</Text>
              </TouchableOpacity>
              {index < LEGAL_LINKS.length - 1 && (
                <Text style={{ color: '#CBD5E1', fontSize: 11 }}>·</Text>
              )}
            </React.Fragment>
          ))}
        </View>
      </View>
    </View>
  );
}

