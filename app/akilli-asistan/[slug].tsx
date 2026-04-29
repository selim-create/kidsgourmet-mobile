import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TOOLS } from '../../src/lib/tools';
import type { ToolSlug } from '../../src/lib/tools';
import { COLORS } from '../../src/lib/constants';

export default function ToolPlaceholderScreen() {
  const { slug } = useLocalSearchParams<{ slug: ToolSlug }>();
  const tool = TOOLS.find((t) => t.slug === slug);

  if (!tool) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Araç bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnPrimary}>
          <Text style={styles.btnPrimaryText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: tool.title, headerBackTitle: 'Asistan' }} />
      <View style={[styles.iconWrap, { backgroundColor: tool.bg }]}>
        <Ionicons name={tool.icon} size={48} color={tool.color} />
      </View>

      <Text style={styles.title}>{tool.title}</Text>
      <Text style={styles.desc}>{tool.description}</Text>

      <View style={styles.soonBadge}>
        <Ionicons name="time-outline" size={14} color="#92400E" />
        <Text style={styles.soonText}>Mobilde Yakında</Text>
      </View>

      <Text style={styles.body}>
        {"Bu araç şu anda yalnızca web sürümünde mevcut. Şimdi web'de açabilir, mobil sürüm hazırlandığında uygulamadan kullanabilirsin."}
      </Text>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: tool.color }]}
        activeOpacity={0.85}
        onPress={() => Linking.openURL(tool.webUrl)}
      >
        <Ionicons name="open-outline" size={18} color="#fff" />
        <Text style={styles.btnPrimaryText}>{"Web'de Aç"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnSecondary} onPress={() => router.back()}>
        <Text style={styles.btnSecondaryText}>← Asistana Dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center', backgroundColor: '#FFFBE6', flexGrow: 1 },
  iconWrap: { width: 96, height: 96, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 32, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.dark, textAlign: 'center', marginBottom: 8 },
  desc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 16, paddingHorizontal: 8 },
  soonBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginBottom: 24 },
  soonText: { fontSize: 12, fontWeight: '700', color: '#92400E' },
  body: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 22, marginBottom: 24, paddingHorizontal: 8 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginBottom: 12 },
  btnPrimaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  btnSecondary: { paddingVertical: 10 },
  btnSecondaryText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },
});
