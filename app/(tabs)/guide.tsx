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

interface GuideCard {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
  route: string;
}

const GUIDE_CARDS: GuideCard[] = [
  {
    title: 'Ek Gıda Rehberi',
    description: 'Hangi besini ne zaman vermeye başlayacağınızı öğrenin',
    icon: 'leaf-outline',
    color: '#7CB342',
    bg: '#F0FDF4',
    route: '/food-guide',
  },
  {
    title: 'Büyüme Takibi',
    description: 'Bebeğinizin boy ve kilo gelişimini takip edin',
    icon: 'trending-up-outline',
    color: '#0EA5E9',
    bg: '#E0F2FE',
    route: '/growth',
  },
  {
    title: 'Aşı Takvimi',
    description: 'Aşı takviminizi ve hatırlatmaları yönetin',
    icon: 'medical-outline',
    color: '#EF4444',
    bg: '#FEF2F2',
    route: '/vaccines',
  },
  {
    title: 'Beslenme Rehberi',
    description: 'Besin değerleri ve alerji bilgilerine göz atın',
    icon: 'nutrition-outline',
    color: '#FF8A65',
    bg: '#FFF3EE',
    route: '/ingredient',
  },
];

export default function GuideScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Bebeğinizin sağlıklı gelişimi için kapsamlı rehberler
        </Text>

        {GUIDE_CARDS.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(card.route as never)}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.bg }]}>
              <Ionicons name={card.icon} size={32} color={card.color} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDesc}>{card.description}</Text>
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
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
