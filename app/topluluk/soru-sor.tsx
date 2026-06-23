import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useSWR from 'swr';
import Toast from 'react-native-toast-message';

import { EmptyState } from '../../src/components/ui/EmptyState';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS } from '../../src/lib/constants';
import { getCircles, createDiscussion } from '../../src/services/community-service';
import type { Circle } from '../../src/lib/types';

export default function SoruSorScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const params = useLocalSearchParams<{ konu?: string; circle?: string }>();

  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [circleError, setCircleError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Pre-fill title from `konu` query param (only on initial mount)
  const initialKonu = useRef(params.konu);
  const initialCircleId = useRef(params.circle);
  useEffect(() => {
    if (initialKonu.current) {
      setTitle(initialKonu.current);
    }
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: circles, isLoading: circlesLoading } = useSWR<Circle[]>(
    'community/circles',
    () => getCircles(),
  );

  useEffect(() => {
    const parsedCircleId = Number(initialCircleId.current);
    const hasMatchingCircle = Number.isFinite(parsedCircleId)
      && !!circles?.some((circle) => circle.id === parsedCircleId);
    if (!hasMatchingCircle || selectedCircleId) return;
    setSelectedCircleId(parsedCircleId);
  }, [circles, selectedCircleId]);

  // ── Validation ──────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    let valid = true;

    if (!selectedCircleId) {
      setCircleError('Lütfen bir ilgi odağı seçin.');
      valid = false;
    } else {
      setCircleError('');
    }

    if (title.trim().length < 10) {
      setTitleError('Başlık en az 10 karakter olmalıdır.');
      valid = false;
    } else {
      setTitleError('');
    }

    if (content.trim().length < 20) {
      setContentError('Detaylar en az 20 karakter olmalıdır.');
      valid = false;
    } else {
      setContentError('');
    }

    return valid;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        circle_id: selectedCircleId!,
      });

      Toast.show({
        type: 'success',
        text1: 'Sorunuz alındı!',
        text2: 'Sorunuz uzmanlarımız tarafından incelendikten sonra yayına alınacaktır.',
        visibilityTime: 5000,
      });

      router.replace('/topluluk' as never);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Soru gönderilirken bir hata oluştu.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not authenticated ──────────────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Soru Sor</Text>
          <View style={styles.backButton} />
        </View>

        <EmptyState
          icon="lock-closed-outline"
          title="Soru Sormak İçin Giriş Yapın"
          description="Toplulukta soru sorabilmek için hesabınıza giriş yapmanız gerekmektedir."
          actionLabel="Giriş Yap"
          onAction={() => router.push('/(auth)/login')}
        />
      </View>
    );
  }

  // ── Render form ─────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Soru Sor</Text>
          <View style={styles.backButton} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Circle Selection ─────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>
            İlgi Odağı <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>Sorunuzla ilgili en uygun odağı seçin.</Text>

          {circlesLoading ? (
            <View style={styles.circleLoadingRow}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.circleLoadingText}>Odaklar yükleniyor...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.circleChips}
            >
              {(circles ?? []).map((circle: Circle) => (
                <TouchableOpacity
                  key={circle.id}
                  style={[
                    styles.circleChip,
                    selectedCircleId === circle.id && styles.circleChipActive,
                    circle.color
                      ? { borderColor: circle.color }
                      : null,
                    selectedCircleId === circle.id && circle.color
                      ? { backgroundColor: circle.color, borderColor: circle.color }
                      : null,
                  ]}
                  onPress={() => {
                    setSelectedCircleId(circle.id === selectedCircleId ? null : circle.id);
                    setCircleError('');
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.circleChipText,
                      selectedCircleId === circle.id && styles.circleChipTextActive,
                    ]}
                  >
                    {circle.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          {circleError ? <Text style={styles.errorText}>{circleError}</Text> : null}
        </View>

        {/* ── Title ────────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Konu Başlığı <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>En az 10 karakter, açıklayıcı bir başlık yazın.</Text>
          <View style={[styles.inputContainer, titleError ? styles.inputError : null]}>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (titleError) setTitleError('');
              }}
              placeholder="Örn: 8 aylık bebeğim yoğurt yemek istemiyor, ne yapabilirim?"
              placeholderTextColor="#9CA3AF"
              maxLength={200}
              multiline={false}
              returnKeyType="next"
            />
          </View>
          <View style={styles.inputMeta}>
            {titleError ? (
              <Text style={styles.errorText}>{titleError}</Text>
            ) : (
              <Text style={styles.charCount}>{title.length}/200</Text>
            )}
          </View>
        </View>

        {/* ── Content ──────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Detaylar <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.hint}>Sorunuzu en az 20 karakter ile detaylandırın.</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer, contentError ? styles.inputError : null]}>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={content}
              onChangeText={(t) => {
                setContent(t);
                if (contentError) setContentError('');
              }}
              placeholder="Durumu ayrıntılı anlatın; bebeğinizin yaşı, mevcut beslenme düzeni ve sizi endişelendiren noktaları paylaşın..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
          <View style={styles.inputMeta}>
            {contentError ? (
              <Text style={styles.errorText}>{contentError}</Text>
            ) : (
              <Text style={styles.charCount}>{content.length} karakter</Text>
            )}
          </View>
        </View>

        {/* ── Submit error ──────────────────────────────────────────────────── */}
        {submitError ? (
          <View style={styles.submitErrorContainer}>
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text style={styles.submitErrorText}>{submitError}</Text>
          </View>
        ) : null}

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>İptal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>Soruyu Gönder</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Community Rules Info Card ─────────────────────────────────────── */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#3B82F6" />
            <Text style={styles.infoCardTitle}>Topluluk Kuralları</Text>
          </View>
          <Text style={styles.infoCardText}>
            Sorunuz uzmanlar ve topluluk üyeleri tarafından incelenecektir.
            Kişisel bilgi paylaşmaktan kaçının. Saygılı ve yapıcı bir dil kullanın.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/kullanim-kosullari' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.infoCardLink}>Kullanıcı Sözleşmesini Okuyun →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 36,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  required: {
    color: '#EF4444',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 10,
  },
  // Circle chips
  circleLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  circleLoadingText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  circleChips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  circleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  circleChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  circleChipTextActive: {
    color: '#fff',
  },
  // Input
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textAreaContainer: {
    minHeight: 140,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textInput: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  textArea: {
    minHeight: 116,
  },
  inputMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  // Submit error
  submitErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  submitErrorText: {
    fontSize: 13,
    color: '#B91C1C',
    flex: 1,
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  // Info card
  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoCardText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoCardLink: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
