import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { subscribeNewsletter } from '../../services/newsletter-service';

interface NewsletterBannerProps {
  source: string;
}

export function NewsletterBanner({ source }: NewsletterBannerProps) {
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setMessage({ text: 'Lütfen e-posta adresinizi girin.', success: false });
      return;
    }
    if (!agreed) {
      setMessage({ text: 'Lütfen aydınlatma metnini onaylayın.', success: false });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const result = await subscribeNewsletter({ email: email.trim(), source });
      if (result.success) {
        setMessage({ text: 'Bültene başarıyla abone oldunuz! 🎉', success: true });
        setEmail('');
        setAgreed(false);
      } else {
        setMessage({ text: result.message || 'Bir hata oluştu.', success: false });
      }
    } catch {
      setMessage({ text: 'Bir hata oluştu. Lütfen tekrar deneyin.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#FFF7ED', '#FFFBEB', '#FFFFFF']}
      style={styles.card}
    >
      {/* Icon + Title */}
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="mail-outline" size={24} color="#F97316" />
        </View>
        <Text style={styles.title}>K&G Bülten</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        K&G Bülten&apos;e abone ol, yeni tarifler, beslenme ipuçları ve özel içerikler e-postana gelsin!
      </Text>

      {/* Email input */}
      <TextInput
        style={styles.input}
        placeholder="Mail Adresiniz"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      {/* Consent checkbox */}
      <TouchableOpacity
        style={styles.consentRow}
        onPress={() => setAgreed((v) => !v)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
        </View>
        <Text style={styles.consentText}>
          {'Bültene üye olarak '}
          <Text
            style={styles.consentLink}
            onPress={() =>
              Linking.openURL('https://kidsgourmet.com.tr/aydinlatma-metni')
            }
          >
            Aydınlatma Metni
          </Text>
          {"'ni okuyup anladığımı kabul ediyorum."}
        </Text>
      </TouchableOpacity>

      {/* Feedback message */}
      {message ? (
        <Text style={[styles.feedback, message.success ? styles.feedbackSuccess : styles.feedbackError]}>
          {message.text}
        </Text>
      ) : null}

      {/* Subscribe button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleSubscribe}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Abone Ol</Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: 24,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FED7AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 12,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  consentText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
    lineHeight: 17,
  },
  consentLink: {
    color: '#F97316',
    fontWeight: '600',
  },
  feedback: {
    fontSize: 13,
    marginBottom: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  feedbackSuccess: {
    color: '#16A34A',
  },
  feedbackError: {
    color: '#DC2626',
  },
  button: {
    backgroundColor: '#F97316',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
