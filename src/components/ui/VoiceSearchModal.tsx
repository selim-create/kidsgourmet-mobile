import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

interface VoiceSearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export function VoiceSearchModal({ visible, onClose }: VoiceSearchModalProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // Pulse animation for microphone button
  useEffect(() => {
    if (isListening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  // Auto-focus when modal opens
  useEffect(() => {
    if (visible) {
      setQuery('');
      setIsListening(false);
      const timer = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}` as never);
    setQuery('');
    onClose();
  };

  const handleMicPress = () => {
    setIsListening((prev) => !prev);
    // TODO: Integrate @react-native-voice/voice or expo-speech-recognition
    // when a native build is available. For now the field is focused for manual input.
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    setIsListening(false);
    setQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.title}>Sesli Arama</Text>
          <Text style={styles.subtitle}>
            {isListening ? 'Dinleniyor... Sorgunuzu yazın veya söyleyin.' : 'Aramak istediğinizi yazın ya da mikrofona basın.'}
          </Text>

          {/* Mic button */}
          <View style={styles.micWrap}>
            <Animated.View
              style={[
                styles.micPulseRing,
                { transform: [{ scale: pulseAnim }], opacity: isListening ? 0.3 : 0 },
              ]}
            />
            <TouchableOpacity
              onPress={handleMicPress}
              style={[styles.micButton, isListening && styles.micButtonActive]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isListening ? 'mic' : 'mic-outline'}
                size={32}
                color={isListening ? '#fff' : COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Text input */}
          <View style={styles.inputRow}>
            <Ionicons name="search-outline" size={20} color={COLORS.gray[400]} style={styles.inputIcon} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder="Arama sorgunuzu yazın..."
              placeholderTextColor={COLORS.gray[400]}
              style={styles.input}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              onFocus={() => setIsListening(false)}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={COLORS.gray[400]} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search button */}
          <TouchableOpacity
            onPress={handleSearch}
            disabled={!query.trim()}
            style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={18} color="#fff" />
            <Text style={styles.searchButtonText}>Ara</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  micWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    width: 96,
    height: 96,
  },
  micPulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  micButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    padding: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
