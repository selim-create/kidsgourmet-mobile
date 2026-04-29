import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';
import { TOOLS, pickRandom, type ToolDefinition } from '../../lib/tools';

export function ToolsSection() {
  // Pick 4 random tools once per render (useMemo so it's stable during a session)
  const tools = useMemo<ToolDefinition[]>(() => pickRandom(TOOLS, 4), []);

  const handlePress = (tool: ToolDefinition) => {
    if (tool.route) {
      router.push(tool.route as never);
    } else if (tool.webUrl) {
      Linking.openURL(tool.webUrl);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            <Text style={{ color: COLORS.primary }}>Akıllı Asistan</Text>
            {' '}ile Yanınızdayız!
          </Text>
          <Text style={styles.subtitle}>
            Çocuğunuzun gelişimi ve güvenliği için veri odaklı çözümler.
          </Text>
        </View>
      </View>

      {/* Tools horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.slug}
            activeOpacity={0.85}
            onPress={() => handlePress(tool)}
            style={styles.toolCard}
          >
            {/* Icon */}
            <View style={[styles.iconWrap, { backgroundColor: tool.bg }]}>
              <Ionicons name={tool.icon} size={26} color={tool.color} />
            </View>
            {/* Name */}
            <Text style={styles.toolName} numberOfLines={2}>
              {tool.title}
            </Text>
            {/* Description */}
            <Text style={styles.toolDesc} numberOfLines={3}>
              {tool.description}
            </Text>
            {/* CTA */}
            <Text style={[styles.toolCta, { color: tool.color }]}>Keşfet →</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.gray[500],
    marginTop: 3,
    lineHeight: 18,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  toolCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toolName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: 6,
  },
  toolDesc: {
    fontSize: 11,
    color: COLORS.gray[500],
    lineHeight: 16,
    flex: 1,
  },
  toolCta: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
});
