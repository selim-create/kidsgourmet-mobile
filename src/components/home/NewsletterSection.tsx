import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../lib/constants';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) return;
    // In a real implementation, call the newsletter API here
    setSubscribed(true);
  };

  return (
    <View style={styles.card}>
      {/* Icon */}
      <View style={styles.iconWrap}>
        <Ionicons name="mail-outline" size={28} color={COLORS.primary} />
      </View>

      {/* Title */}
      <Text style={styles.title}>K&G Bülten</Text>

      {/* Description */}
      <Text style={styles.desc}>
        K&G Bülten'e abone ol, yeni tarifler, beslenme ipuçları ve özel içerikler
        e-postana gelsin!
      </Text>

      {subscribed ? (
        <View style={styles.successRow}>
          <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
          <Text style={styles.successText}>
            Abone oldunuz! Teşekkür ederiz 🎉
          </Text>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="E-posta adresiniz"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={handleSubscribe}
          />
          <TouchableOpacity
            onPress={handleSubscribe}
            activeOpacity={0.85}
            style={styles.subscribeBtn}
          >
            <Text style={styles.subscribeBtnText}>Abone Ol</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#FFF3EE',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0D0',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#FF8A65',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 8,
  },
  desc: {
    fontSize: 13,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.dark,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subscribeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    justifyContent: 'center',
  },
  subscribeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600',
  },
});
