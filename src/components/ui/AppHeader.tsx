/**
 * FlavorBar — KidsGourmet'in çocuk-merkezli, bağlam-duyarlı, collapsible header'ı.
 *
 * Backward-compatible: <AppHeader /> parametresiz çağrı önceki davranışla uyumludur.
 *
 * Props (hepsi opsiyonel):
 *   variant          – 'full' | 'compact' | 'detail'  (default: 'full')
 *   showChildSwitcher – bottom row'u göster/gizle       (default: true, auth ise)
 *   showGreeting      – greeting bandını göster          (default: false)
 *   showSearchPill    – SmartSearchPill'i göster         (default: true)
 *   scrollY           – Reanimated SharedValue; verilirse bottom row collapsible olur
 *   title             – 'detail' variant için başlık
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import Animated from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveChild } from '../../contexts/ActiveChildContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Avatar } from './Avatar';
import { DrawerMenu } from './DrawerMenu';
import { NotificationDot } from './NotificationDot';
import { SmartSearchPill } from './SmartSearchPill';
import { ChildSwitcherPill } from './ChildSwitcherPill';
import { ChildSwitcherSheet } from './ChildSwitcherSheet';
import { HeaderGreeting } from './HeaderGreeting';
import { useBottomRowStyle } from '../../hooks/use-collapsible-header';
import { COLORS } from '../../lib/constants';

export interface AppHeaderProps {
  variant?: 'full' | 'compact' | 'detail';
  showChildSwitcher?: boolean;
  showGreeting?: boolean;
  showSearchPill?: boolean;
  scrollY?: SharedValue<number>;
  title?: string;
}

/**
 * Logo tap counter for Quiet Mode easter egg.
 * 3 taps within 1 second → toggle dark/light header background.
 * TODO: persist with AsyncStorage for cross-session memory.
 */
function useLogoTapEasterEgg() {
  const tapCount = useRef(0);
  const lastTap = useRef(0);
  const [quietMode, setQuietMode] = useState(false);

  const onLogoPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 1000) {
      tapCount.current += 1;
    } else {
      tapCount.current = 1;
    }
    lastTap.current = now;
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setQuietMode((prev) => !prev);
    }
  }, []);

  return { quietMode, onLogoPress };
}

export function AppHeader({
  variant = 'full',
  showChildSwitcher = true,
  showGreeting = false,
  showSearchPill = true,
  scrollY,
  title,
}: AppHeaderProps = {}) {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuth();
  const { children } = useActiveChild();
  const { favorites } = useFavorites();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [childSheetVisible, setChildSheetVisible] = useState(false);
  const { quietMode, onLogoPress } = useLogoTapEasterEgg();

  // ── Quiet-mode theming ──────────────────────────────────────────────────────
  const bgColor = quietMode ? COLORS.dark : '#FFFFFF';
  const iconColor = quietMode ? '#FFFFFF' : COLORS.dark;

  // ── Avatar / child press handling ───────────────────────────────────────────
  const handleAvatarPress = () => {
    if (isAuthenticated) {
      setChildSheetVisible(true);
    } else {
      router.push('/(auth)/login');
    }
  };

  const handleAvatarLongPress = () => {
    if (isAuthenticated) {
      router.push('/(tabs)/profile');
    } else {
      router.push('/(auth)/login');
    }
  };

  // ── Bottom row: show when auth and has children (or "add child" pill) ───────
  const showBottomRow = isAuthenticated && showChildSwitcher;

  // ── Collapsible bottom row animated style (via shared hook to avoid duplication) ──
  const animatedBottomRowStyle = useBottomRowStyle(scrollY);

  // ── Detail variant: simple back-arrow header ─────────────────────────────────
  if (variant === 'detail') {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 4, backgroundColor: bgColor }]}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary, COLORS.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientStripe}
        />
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.7}>
            <Ionicons name="arrow-back-outline" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text style={[styles.detailTitle, { color: iconColor }]} numberOfLines={1}>
            {title ?? ''}
          </Text>
          <View style={styles.iconButton} />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + 4, backgroundColor: bgColor }]}>
        {/* ── 2px gradient stripe at top ────────────────────────────────────── */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary, COLORS.blue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientStripe}
        />

        {/* ── Top row (always visible, ~56px) ──────────────────────────────── */}
        <View style={styles.topRow}>
          {/* Hamburger + notification dot */}
          <View style={styles.hamburgerWrap}>
            <TouchableOpacity
              onPress={() => setDrawerVisible(true)}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <Ionicons name="menu-outline" size={26} color={iconColor} />
            </TouchableOpacity>
            {/* Show notification dot when there's relevant activity (currently hidden; TODO: wire to real notifications) */}
            <View style={styles.dotPositioned}>
              <NotificationDot size={7} visible={false} />
            </View>
          </View>

          {/* Logo (left-center) — tappable for quiet-mode easter egg */}
          <TouchableOpacity onPress={onLogoPress} activeOpacity={0.9} style={styles.logoButton}>
            {quietMode ? (
              <Text style={styles.quietLogoText}>KG</Text>
            ) : (
              <Image
                source={require('../../../assets/images/kg-logo-full-dark.png')}
                style={styles.logo}
                contentFit="contain"
              />
            )}
          </TouchableOpacity>

          {/* Smart search pill (flexible width) */}
          {showSearchPill && variant !== 'compact' && <SmartSearchPill />}

          {/* Notification bell */}
          <View style={styles.bellWrap}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={22} color={iconColor} />
            </TouchableOpacity>
            <View style={styles.dotPositioned}>
              <NotificationDot size={7} visible={false} />
            </View>
          </View>

          {/* Child / user avatar button */}
          <TouchableOpacity
            style={styles.avatarButton}
            activeOpacity={0.75}
            onPress={handleAvatarPress}
            onLongPress={handleAvatarLongPress}
            delayLongPress={500}
          >
            {isAuthenticated && user ? (
              <Avatar uri={user.avatar_url} name={user.name} size={30} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person-outline" size={18} color={COLORS.gray[400]} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Bottom row (collapsible, ~48px) ─────────────────────────────── */}
        {showBottomRow && (
          <Animated.View style={[styles.bottomRow, animatedBottomRowStyle as any]}>
            {children.length > 0 ? (
              <ChildSwitcherPill />
            ) : (
              /* No children yet — show "+ Çocuk ekle" pill */
              <TouchableOpacity
                style={styles.addChildPill}
                activeOpacity={0.75}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Ionicons name="add-circle-outline" size={16} color={COLORS.primary} />
                <Text style={styles.addChildText}>Çocuk ekle</Text>
              </TouchableOpacity>
            )}

            {/* Favorites count */}
            <View style={styles.favWrap}>
              <TouchableOpacity
                style={styles.favButton}
                activeOpacity={0.75}
                onPress={() => router.push('/(tabs)/favorites')}
              >
                <Ionicons name="heart-outline" size={20} color={COLORS.primary} />
                {favorites.length > 0 && (
                  <View style={styles.favBadge}>
                    <Text style={styles.favBadgeText}>
                      {favorites.length > 99 ? '99+' : favorites.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      {/* ── Greeting band (only on home) ─────────────────────────────────── */}
      {showGreeting && <HeaderGreeting />}

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
      <ChildSwitcherSheet visible={childSheetVisible} onClose={() => setChildSheetVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  gradientStripe: {
    height: 2,
    marginHorizontal: -16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    overflow: 'hidden',
  },
  hamburgerWrap: {
    position: 'relative',
  },
  bellWrap: {
    position: 'relative',
  },
  dotPositioned: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  iconButton: {
    padding: 6,
  },
  logoButton: {
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  logo: {
    width: 100,
    height: 26,
  },
  quietLogoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  avatarButton: {
    marginLeft: 4,
  },
  avatarPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addChildPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#FFF0E8',
  },
  addChildText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  favWrap: {
    marginLeft: 'auto',
  },
  favButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    position: 'relative',
  },
  favBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  favBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  detailTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.dark,
  },
});
