import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { COLORS } from '../../lib/constants';

import { AppIcon } from '../ui/AppIcon';
// ─── Types ────────────────────────────────────────────────────────────────────

interface LegalPageProps {
  title: string;
  subtitle?: string;
  breadcrumb: string;
  date?: string;
  children: React.ReactNode;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

export function LegalH1({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{ fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 10, marginTop: 4, lineHeight: 30 }}
    >
      {children}
    </Text>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8, marginTop: 20, lineHeight: 26 }}
    >
      {children}
    </Text>
  );
}

export function LegalH3({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{ fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 14, lineHeight: 22 }}
    >
      {children}
    </Text>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{ fontSize: 14, color: '#4B5563', lineHeight: 23, marginBottom: 10 }}
    >
      {children}
    </Text>
  );
}

export function LegalBullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
      <Text style={{ color: COLORS.primary, marginRight: 8, fontSize: 14, lineHeight: 23 }}>•</Text>
      <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 23, flex: 1 }}>{children}</Text>
    </View>
  );
}

export function LegalNumbered({ num, children }: { num: number; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
      <Text style={{ color: COLORS.primary, marginRight: 8, fontSize: 14, lineHeight: 23, minWidth: 20, fontWeight: '700' }}>
        {num}.
      </Text>
      <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 23, flex: 1 }}>{children}</Text>
    </View>
  );
}

export function LegalInfoBox({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'warning' | 'info' }) {
  const colors = {
    default: { bg: '#F9FAFB', border: '#E5E7EB' },
    warning: { bg: '#FFF7ED', border: '#FED7AA' },
    info: { bg: '#EFF6FF', border: '#BFDBFE' },
  };
  const c = colors[variant];
  return (
    <View style={{ backgroundColor: c.bg, borderWidth: 1, borderColor: c.border, borderRadius: 12, padding: 14, marginBottom: 14 }}>
      {children}
    </View>
  );
}

export function LegalTableRow({
  col1,
  col2,
  isHeader = false,
}: {
  col1: string;
  col2: string;
  isHeader?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
      <Text
        style={{
          flex: 1,
          paddingHorizontal: 10,
          paddingVertical: 8,
          fontSize: 13,
          fontWeight: isHeader ? '700' : '500',
          color: isHeader ? '#374151' : '#4B5563',
          backgroundColor: isHeader ? '#F9FAFB' : 'transparent',
        }}
      >
        {col1}
      </Text>
      <Text
        style={{
          flex: 2,
          paddingHorizontal: 10,
          paddingVertical: 8,
          fontSize: 13,
          fontWeight: isHeader ? '700' : '400',
          color: isHeader ? '#374151' : '#4B5563',
          backgroundColor: isHeader ? '#F9FAFB' : 'transparent',
        }}
      >
        {col2}
      </Text>
    </View>
  );
}

export function LegalTable({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      {children}
    </View>
  );
}

export function LegalDivider() {
  return <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 16 }} />;
}

// ─── Main LegalPage Component ─────────────────────────────────────────────────

export function LegalPage({ title, subtitle, breadcrumb, date, children }: LegalPageProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFBE6' }}>
      {/* Header */}
      <View style={{ backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <AppIcon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>
              {title}
            </Text>
            {/* Breadcrumb */}
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 }}>
              Ana Sayfa · {breadcrumb}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* White card */}
        <View style={{ backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 18, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 }}>
          {subtitle && (
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 14, lineHeight: 19 }}>
              {subtitle}
            </Text>
          )}
          {children}
          {date && (
            <>
              <LegalDivider />
              <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                Son güncelleme: {date}
              </Text>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
