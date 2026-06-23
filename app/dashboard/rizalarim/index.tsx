import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConsents, useConsentHistory } from '../../../src/hooks/useConsents';
import { useAuth } from '../../../src/contexts/AuthContext';
import { EmptyState } from '../../../src/components/ui/EmptyState';
import { LoadingSpinner } from '../../../src/components/ui/LoadingSpinner';
import { COLORS } from '../../../src/lib/constants';
import type { ConsentType, UserConsent } from '../../../src/lib/types';
import Toast from 'react-native-toast-message';

// ─── Consent metadata ─────────────────────────────────────────────────────────

interface ConsentMeta {
  type: ConsentType;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  canToggle: boolean;
}

const CONSENT_META: ConsentMeta[] = [
  {
    type: 'terms_accepted',
    label: 'Kullanım Koşulları',
    description: 'KidsGourmet kullanım koşullarını ve hizmet şartlarını kabul ettiğinizi gösterir.',
    icon: 'reader-outline',
    canToggle: false,
  },
  {
    type: 'marketing_consent',
    label: 'Pazarlama İzni',
    description: 'Yeni tarifler, öneriler ve kampanyalar hakkında e-posta ve bildirim almak istediğinizi gösterir.',
    icon: 'mail-outline',
    canToggle: true,
  },
  {
    type: 'sensitive_data_consent',
    label: 'Hassas Veri İzni',
    description: 'Sağlık ve beslenme bilgilerinizin kişiselleştirilmiş öneriler için işlenmesine izin verdiğinizi gösterir.',
    icon: 'medical-outline',
    canToggle: true,
  },
  {
    type: 'guardian_declaration',
    label: 'Veli Beyanı',
    description: 'Çocuk adına giriş yapan veli veya yasal temsilci olduğunuzu beyan ettiğinizi gösterir.',
    icon: 'people-outline',
    canToggle: false,
  },
  {
    type: 'cookie_pazarlama',
    label: 'Pazarlama Çerezleri',
    description: 'Reklamların kişiselleştirilmesi ve platformların arası takip için çerez kullanımına izin verdiğinizi gösterir.',
    icon: 'analytics-outline',
    canToggle: true,
  },
  {
    type: 'cookie_analitik',
    label: 'Analitik Çerezler',
    description: 'Uygulama kullanımınızın analiz edilmesi ve iyileştirilmesi için çerez kullanımına izin verdiğinizi gösterir.',
    icon: 'bar-chart-outline',
    canToggle: true,
  },
];

// ─── History section ─────────────────────────────────────────────────────────

function ConsentHistorySection() {
  const { history, isLoading } = useConsentHistory();

  if (isLoading) return <LoadingSpinner size="small" />;
  if (history.length === 0) {
    return (
      <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 }}>
        Henüz değişiklik geçmişi yok.
      </Text>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      {history.slice(0, 10).map((entry, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            borderRadius: 10,
            padding: 10,
          }}
        >
          <Ionicons
            name={entry.value ? 'checkmark-circle-outline' : 'close-circle-outline'}
            size={16}
            color={entry.value ? '#16A34A' : '#DC2626'}
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151' }}>
              {CONSENT_META.find((m) => m.type === entry.type)?.label ?? entry.type}
            </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
              {entry.value ? 'Onaylandı' : 'İptal edildi'} · {new Date(entry.changed_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RizalarimScreen() {
  const { isAuthenticated } = useAuth();
  const { consents, isLoading, toggle, getConsentValue } = useConsents();
  const [toggling, setToggling] = useState<ConsentType | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: COLORS.primary }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Rızalarım</Text>
        </View>
        <EmptyState
          icon="lock-closed-outline"
          title="Giriş gerekli"
          description="Rızalarınızı yönetmek için giriş yapın."
          actionLabel="Giriş Yap"
          onAction={() => router.push('/(auth)/login')}
        />
      </SafeAreaView>
    );
  }

  const handleToggle = async (type: ConsentType, value: boolean) => {
    setToggling(type);
    try {
      await toggle(type, value);
      Toast.show({ type: 'success', text1: 'Rıza güncellendi.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Güncelleme başarısız.' });
    } finally {
      setToggling(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Rızalarım</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 1 }}>
              Veri işleme tercihleriniz
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Info Card */}
        <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <Ionicons name="information-circle-outline" size={20} color="#2563EB" style={{ marginTop: 1 }} />
          <Text style={{ fontSize: 13, color: '#1E40AF', lineHeight: 19, flex: 1 }}>
            KVKK kapsamında verdiğiniz rızaları buradan yönetebilirsiniz. Kısıtlanamayan bazı işlemler gri gösterilir.
          </Text>
        </View>

        {/* Consent Items */}
        {isLoading ? (
          <LoadingSpinner label="Rızalar yükleniyor..." />
        ) : (
          <View style={{ gap: 10, marginBottom: 24 }}>
            {CONSENT_META.map((meta) => {
              const value = getConsentValue(meta.type);
              const isToggling = toggling === meta.type;

              return (
                <View
                  key={meta.type}
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 14,
                    padding: 14,
                    elevation: 1,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                      <Ionicons name={meta.icon} size={18} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
                        {meta.label}
                      </Text>
                    </View>
                    {isToggling ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : meta.canToggle ? (
                      <Switch
                        value={value}
                        onValueChange={(v) => handleToggle(meta.type, v)}
                        trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
                        thumbColor="#fff"
                      />
                    ) : (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: value ? '#DCFCE7' : '#FEE2E2', borderRadius: 20 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: value ? '#166534' : '#991B1B' }}>
                          {value ? 'Onaylı' : 'Onaysız'}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 12, color: '#6B7280', lineHeight: 17, marginTop: 8, marginLeft: 46 }}>
                    {meta.description}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* KVKK Link */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/kvkk')}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA' }}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#7C2D12' }}>
              KVKK Aydınlatma Metni
            </Text>
            <Text style={{ fontSize: 11, color: '#C2410C', marginTop: 1 }}>
              Verilerinizin nasıl işlendiğini öğrenin
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Consent History Toggle */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowHistory((v) => !v)}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 }}
        >
          <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 }}>Değişiklik Geçmişi</Text>
          <Ionicons name={showHistory ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
        </TouchableOpacity>

        {showHistory && (
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 24 }}>
            <ConsentHistorySection />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
