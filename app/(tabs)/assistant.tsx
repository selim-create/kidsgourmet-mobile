import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { COLORS } from '../../src/lib/constants';
import { TOOLS } from '../../src/lib/tools';
import type { ToolSlug } from '../../src/lib/tools';

export default function AssistantScreen() {
  const handlePress = (route: string | null, slug: ToolSlug) => {
    if (route) {
      router.push(route as never);
    } else {
      router.push({ pathname: '/akilli-asistan/[slug]', params: { slug } });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Akıllı Asistan</Text>
        <Text style={styles.intro}>
          Bebek beslenmesi yolculuğunu interaktif araçlarımız ile kolaylaştırıyoruz.
        </Text>

        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.slug}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handlePress(tool.route, tool.slug)}
          >
            <View style={[styles.cardIcon, { backgroundColor: tool.bg }]}>
              <Ionicons name={tool.icon} size={30} color={tool.color} />
            </View>
            <View style={styles.cardText}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={2}>{tool.title}</Text>
                {tool.requiresAuth && (
                  <View style={styles.authBadge}>
                    <Text style={styles.authBadgeText}>Üyelik Gerekli</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardDesc} numberOfLines={2}>{tool.description}</Text>
              <View style={styles.cardFooter}>
                {tool.route === null && (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonBadgeText}>Yakında</Text>
                  </View>
                )}
                <Text style={[styles.ctaText, { color: tool.color }]}>Başla →</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray[300]} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 6,
  },
  intro: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    flexShrink: 1,
  },
  authBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  authBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  soonBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  soonBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 'auto',
  },
});
