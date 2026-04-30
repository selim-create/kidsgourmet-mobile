import React, { useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveChild } from '../../contexts/ActiveChildContext';
import { calculateAgeInMonths } from '../../utils/ageCalculator';
import { Avatar } from './Avatar';
import { COLORS } from '../../lib/constants';
import type { Child } from '../../lib/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.min(340, SCREEN_HEIGHT * 0.5);
/** Delay (ms) to wait for the sheet close animation before navigating. */
const NAVIGATION_DELAY_MS = 240;

/** Gradient colors per age group. */
function getAgeGradient(ageMonths: number): [string, string] {
  if (ageMonths < 6)  return ['#DBEAFE', '#BAE6FD'];   // blue
  if (ageMonths < 12) return ['#DCFCE7', '#BBF7D0'];   // green
  if (ageMonths < 24) return ['#FFF0E8', '#FFD8C2'];   // orange
  return ['#EDE9FE', '#DDD6FE'];                        // purple
}

interface ChildSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface ChildCardProps {
  child: Child;
  isActive: boolean;
  onSelect: () => void;
}

function ChildCard({ child, isActive, onSelect }: ChildCardProps) {
  const ageMonths = calculateAgeInMonths(child.birth_date);
  const gradientColors = getAgeGradient(ageMonths);
  const allergyCount = child.allergies?.length ?? 0;

  return (
    <TouchableOpacity
      style={[styles.card, isActive && styles.cardActive]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        {isActive && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
        <Avatar uri={child.avatar_url} name={child.name} size={60} />
        <Text style={styles.cardName} numberOfLines={1}>
          {child.name.split(' ')[0]}
        </Text>
        <Text style={styles.cardAge}>{ageMonths} ay</Text>
        {allergyCount > 0 && (
          <View style={styles.allergyBadge}>
            <Text style={styles.allergyText}>{allergyCount} alerjen</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export function ChildSwitcherSheet({ visible, onClose }: ChildSwitcherSheetProps) {
  const insets = useSafeAreaInsets();
  const { children, activeChild, setActiveChild } = useActiveChild();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up pending navigation timers on unmount
  useEffect(() => {
    return () => {
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SHEET_HEIGHT);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.45,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 230,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 230,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [slideAnim, fadeAnim, onClose]);

  const handleSelect = useCallback((child: Child) => {
    setActiveChild(child);
    handleClose();
  }, [setActiveChild, handleClose]);

  const handleAddChild = useCallback(() => {
    handleClose();
    // TODO: replace with dedicated child-add screen when available
    navTimerRef.current = setTimeout(() => router.push('/(tabs)/profile'), NAVIGATION_DELAY_MS);
  }, [handleClose]);

  const handleManage = useCallback(() => {
    handleClose();
    navTimerRef.current = setTimeout(() => router.push('/(tabs)/profile'), NAVIGATION_DELAY_MS);
  }, [handleClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 12, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Çocuk Seç</Text>

          {/* Child cards — horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContent}
            style={styles.cardsScroll}
          >
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                isActive={activeChild?.id === child.id}
                onSelect={() => handleSelect(child)}
              />
            ))}

            {/* Add child card */}
            <TouchableOpacity style={styles.addCard} onPress={handleAddChild} activeOpacity={0.75}>
              <View style={styles.addIcon}>
                <Ionicons name="add" size={28} color={COLORS.gray[400]} />
              </View>
              <Text style={styles.addLabel}>Çocuk Ekle</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Manage link */}
          <TouchableOpacity style={styles.manageRow} onPress={handleManage} activeOpacity={0.75}>
            <Text style={styles.manageLink}>Tüm çocukları yönet →</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
    minHeight: SHEET_HEIGHT,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 10,
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
    paddingVertical: 12,
  },
  cardsScroll: {
    flexGrow: 0,
  },
  cardsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 160,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: COLORS.primary,
  },
  cardGradient: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 180,
    justifyContent: 'center',
    gap: 6,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    marginTop: 8,
  },
  cardAge: {
    fontSize: 12,
    color: COLORS.gray[500],
  },
  allergyBadge: {
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  allergyText: {
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: '600',
  },
  addCard: {
    width: 120,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 180,
    backgroundColor: '#F9FAFB',
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    fontSize: 13,
    color: COLORS.gray[500],
    fontWeight: '500',
  },
  manageRow: {
    alignItems: 'center',
    paddingTop: 14,
  },
  manageLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
