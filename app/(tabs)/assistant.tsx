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

interface AssistantCard {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  bg: string;
  route: string;
}

const CARDS: AssistantCard[] = [
  {
    title: 'Bu Gıda Verilir Mi?',
    description: 'Bir besini bebeğinize vermek güvenli mi öğrenin',
    icon: 'shield-checkmark-outline',
    color: '#16A34A',
    bg: '#DCFCE7',
    route: '/safety-check',
  },
  {
    title: 'BLW Hazırlık Testi',
    description: 'Bebeğiniz parmak maması için hazır mı?',
    icon: 'checkmark-circle-outline',
    color: '#7C3AED',
    bg: '#EDE9FE',
    route: '/blw-test',
  },
  {
    title: 'Ne Pişirsem?',
    description: 'Yaşa ve beslenme ihtiyacına göre tarif önerileri',
    icon: 'restaurant-outline',
    color: '#FF8A65',
    bg: '#FFF3EE',
    route: '/(tabs)/recipes',
  },
  {
    title: 'Haftalık Plan Oluştur',
    description: 'Çocuğunuz için haftalık beslenme planı yap',
    icon: 'calendar-outline',
    color: '#0EA5E9',
    bg: '#E0F2FE',
    route: '/(tabs)/meal-plan',
  },
];

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Bebeğinizin beslenmesi için akıllı araçlar
        </Text>

        {CARDS.map((card) => (
          <TouchableOpacity
            key={card.title}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => router.push(card.route as never)}
          >
            <View style={[styles.cardIcon, { backgroundColor: card.bg }]}>
              <Ionicons name={card.icon} size={30} color={card.color} />
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
  cardTitle: {
    fontSize: 15,
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
