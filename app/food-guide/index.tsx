import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useActiveChild } from '../../src/contexts/ActiveChildContext';
import { COLORS } from '../../src/lib/constants';
import { getAgeInMonths } from '../../src/hooks/useChildProfile';
import {
  AGE_RANGES,
  FOOD_GROUPS,
  AGE_RANGE_PLANS,
  TEXTURE_STAGES,
  ALLERGEN_SCHEDULE,
  AGE_RANGE_TIPS,
  FOOD_GUIDE_DISCLAIMER_TITLE,
  FOOD_GUIDE_DISCLAIMER_LINES,
  FOOD_GUIDE_REFERENCE_NOTE,
  TIP_COLORS,
  ALLERGEN_URGENCY_COLORS,
  getAgeRangeForMonths,
  type AgeRangeSlug,
  type FoodGroupSlug,
} from '../../src/lib/tools/food-guide';

// ─── Section IDs (for accordion expand/collapse) ──────────────────────────────
type Section = 'food-groups' | 'texture' | 'allergens' | 'tips';

export default function FoodGuideScreen() {
  const { activeChild } = useActiveChild();
  const ageMonths = activeChild ? getAgeInMonths(activeChild.birth_date) : 0;

  // Auto-select the age range based on child age; default to 6-9 ay
  const initialRange = activeChild
    ? getAgeRangeForMonths(ageMonths).slug
    : ('6-9-ay' as AgeRangeSlug);

  const [selectedAge, setSelectedAge] = useState<AgeRangeSlug>(initialRange);
  const [expandedSection, setExpandedSection] = useState<Section | null>('food-groups');
  const [expandedGroup, setExpandedGroup] = useState<FoodGroupSlug | null>(null);

  const plan = AGE_RANGE_PLANS[selectedAge];
  const textureStage = TEXTURE_STAGES.find((s) => s.ageSlug === selectedAge)!;
  const tips = AGE_RANGE_TIPS[selectedAge] ?? [];

  const toggleSection = (section: Section) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  const toggleGroup = (slug: FoodGroupSlug) =>
    setExpandedGroup((prev) => (prev === slug ? null : slug));

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ek Gıda Rehberi 🥣</Text>
        </View>
        {activeChild ? (
          <Text style={styles.headerSub}>
            {activeChild.name} için · {ageMonths} aylık
          </Text>
        ) : (
          <Text style={styles.headerSub}>Yaş aralığı seçerek rehberi inceleyin</Text>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── No-child notice ────────────────────────────────────────────── */}
        {!activeChild && (
          <View style={styles.noChildBanner}>
            <Ionicons name="information-circle-outline" size={20} color="#D97706" />
            <Text style={styles.noChildText}>
              Kişiselleştirilmiş öneriler için Profil sekmesinden çocuk ekleyin.
            </Text>
          </View>
        )}

        {/* ── Age Range Selector ─────────────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Yaş Aralığı Seçin</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ageSelectorRow}
          >
            {AGE_RANGES.map((range) => {
              const isSelected = selectedAge === range.slug;
              return (
                <TouchableOpacity
                  key={range.slug}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedAge(range.slug);
                    setExpandedGroup(null);
                  }}
                  style={[styles.ageChip, isSelected && styles.ageChipSelected]}
                >
                  <Text style={[styles.ageChipText, isSelected && styles.ageChipTextSelected]}>
                    {range.emoji} {range.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Stage Milestone ────────────────────────────────────────────── */}
        <View style={styles.milestoneBanner}>
          <Text style={styles.milestoneTitle}>
            {AGE_RANGES.find((r) => r.slug === selectedAge)?.emoji}{' '}
            {AGE_RANGES.find((r) => r.slug === selectedAge)?.label} Dönemi
          </Text>
          <Text style={styles.milestoneText}>{plan.milestone}</Text>
          <View style={styles.mealPatternRow}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.mealPatternText}>{plan.mealPattern}</Text>
          </View>
          <View style={[styles.mealPatternRow, { marginTop: 4 }]}>
            <Ionicons name="water-outline" size={14} color="#0EA5E9" />
            <Text style={[styles.mealPatternText, { color: '#0369A1' }]}>{plan.milkGuidance}</Text>
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 1 — Besin Grupları                                     */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => toggleSection('food-groups')}
          style={styles.accordionHeader}
        >
          <View style={styles.accordionHeaderLeft}>
            <Text style={styles.accordionHeaderIcon}>🥗</Text>
            <Text style={styles.accordionHeaderTitle}>Besin Grupları & Porsiyonlar</Text>
          </View>
          <Ionicons
            name={expandedSection === 'food-groups' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>

        {expandedSection === 'food-groups' && (
          <View style={styles.accordionBody}>
            {plan.foodGroups.map((entry) => {
              const group = FOOD_GROUPS[entry.groupSlug];
              const isOpen = expandedGroup === entry.groupSlug;
              return (
                <View key={entry.groupSlug} style={[styles.groupCard, { borderLeftColor: group.color }]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => toggleGroup(entry.groupSlug)}
                    style={styles.groupCardHeader}
                  >
                    <View style={[styles.groupIconWrap, { backgroundColor: group.bg }]}>
                      <Text style={styles.groupIcon}>{group.icon}</Text>
                    </View>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Ionicons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.gray[400]}
                    />
                  </TouchableOpacity>

                  {isOpen && (
                    <View style={styles.groupDetails}>
                      {/* Examples */}
                      <Text style={styles.groupDetailLabel}>🍴 Örnek Gıdalar</Text>
                      <View style={styles.examplesWrap}>
                        {entry.examples.map((ex) => (
                          <View key={ex} style={[styles.exampleChip, { backgroundColor: group.bg }]}>
                            <Text style={[styles.exampleChipText, { color: group.color }]}>{ex}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Portion & Frequency table */}
                      <View style={styles.portionTable}>
                        <View style={styles.portionRow}>
                          <Text style={styles.portionKey}>Porsiyon</Text>
                          <Text style={styles.portionVal}>{entry.portion}</Text>
                        </View>
                        <View style={[styles.portionRow, styles.portionRowAlt]}>
                          <Text style={styles.portionKey}>Sıklık</Text>
                          <Text style={styles.portionVal}>{entry.frequency}</Text>
                        </View>
                      </View>

                      {/* Preparation note */}
                      <View style={styles.prepNote}>
                        <Ionicons name="information-circle-outline" size={14} color={group.color} />
                        <Text style={[styles.prepNoteText, { color: group.color }]}>{entry.note}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 2 — Doku / Kıvam İlerlemesi                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => toggleSection('texture')}
          style={styles.accordionHeader}
        >
          <View style={styles.accordionHeaderLeft}>
            <Text style={styles.accordionHeaderIcon}>🥄</Text>
            <Text style={styles.accordionHeaderTitle}>Doku / Kıvam İlerlemesi</Text>
          </View>
          <Ionicons
            name={expandedSection === 'texture' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>

        {expandedSection === 'texture' && (
          <View style={styles.accordionBody}>
            {TEXTURE_STAGES.map((stage) => {
              const isActive = stage.ageSlug === selectedAge;
              return (
                <View
                  key={stage.ageSlug}
                  style={[
                    styles.textureRow,
                    isActive && { borderColor: stage.color, borderWidth: 1.5 },
                  ]}
                >
                  {/* Progress dot + line */}
                  <View style={styles.textureTimeline}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: isActive ? stage.color : COLORS.gray[300] },
                      ]}
                    />
                    {stage.ageSlug !== '2-3-yas' && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.textureContent}>
                    <View style={styles.textureHeader}>
                      <Text style={[styles.textureLabel, isActive && { color: stage.color }]}>
                        {stage.label}
                      </Text>
                      <View
                        style={[
                          styles.textureAgeBadge,
                          { backgroundColor: isActive ? stage.color : COLORS.gray[200] },
                        ]}
                      >
                        <Text
                          style={[
                            styles.textureAgeBadgeText,
                            { color: isActive ? '#fff' : COLORS.gray[600] },
                          ]}
                        >
                          {AGE_RANGES.find((r) => r.slug === stage.ageSlug)?.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.textureDesc}>{stage.description}</Text>
                    <View style={styles.textureExamples}>
                      {stage.examples.map((ex) => (
                        <Text key={ex} style={styles.textureExample}>• {ex}</Text>
                      ))}
                    </View>
                    {/* Progress bar */}
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${stage.progress}%`, backgroundColor: stage.color },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 3 — Alerjen Tanıtım Takvimi                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => toggleSection('allergens')}
          style={styles.accordionHeader}
        >
          <View style={styles.accordionHeaderLeft}>
            <Text style={styles.accordionHeaderIcon}>🛡️</Text>
            <Text style={styles.accordionHeaderTitle}>Alerjen Tanıtım Takvimi</Text>
          </View>
          <Ionicons
            name={expandedSection === 'allergens' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>

        {expandedSection === 'allergens' && (
          <View style={styles.accordionBody}>
            <Text style={styles.allergenIntro}>
              Her yeni alerjen besini tek başına, 3-5 gün aralıkla tanıtın. Şişme, kızarıklık, ishal gibi belirtiler görürseniz durdurun ve doktorunuza danışın.
            </Text>
            {ALLERGEN_SCHEDULE.map((allergen) => {
              const colors = ALLERGEN_URGENCY_COLORS[allergen.urgency];
              return (
                <View
                  key={allergen.name}
                  style={[
                    styles.allergenCard,
                    { backgroundColor: colors.bg, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.allergenCardHeader}>
                    <Text style={[styles.allergenName, { color: colors.text }]}>{allergen.name}</Text>
                    <View style={[styles.allergenBadge, { backgroundColor: colors.border }]}>
                      <Text style={styles.allergenBadgeText}>{allergen.minAgeLabel}</Text>
                    </View>
                  </View>
                  <Text style={[styles.allergenNote, { color: colors.text }]}>{allergen.note}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/*  SECTION 4 — İpuçları & Uyarılar                               */}
        {/* ════════════════════════════════════════════════════════════════ */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => toggleSection('tips')}
          style={styles.accordionHeader}
        >
          <View style={styles.accordionHeaderLeft}>
            <Text style={styles.accordionHeaderIcon}>💡</Text>
            <Text style={styles.accordionHeaderTitle}>
              İpuçları & Uyarılar{' '}
              <Text style={{ color: COLORS.primary, fontWeight: '400' }}>
                ({AGE_RANGES.find((r) => r.slug === selectedAge)?.label})
              </Text>
            </Text>
          </View>
          <Ionicons
            name={expandedSection === 'tips' ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray[500]}
          />
        </TouchableOpacity>

        {expandedSection === 'tips' && (
          <View style={styles.accordionBody}>
            {tips.map((tip, idx) => {
              const c = TIP_COLORS[tip.variant];
              return (
                <View
                  key={idx}
                  style={[
                    styles.tipCard,
                    { backgroundColor: c.bg, borderColor: c.border },
                  ]}
                >
                  <Text style={styles.tipIcon}>{c.icon}</Text>
                  <Text style={[styles.tipText, { color: c.text }]}>{tip.text}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── Disclaimer & Reference ─────────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>{FOOD_GUIDE_DISCLAIMER_TITLE}</Text>
          {FOOD_GUIDE_DISCLAIMER_LINES.map((line, i) => (
            <View key={i} style={styles.disclaimerLineRow}>
              <Text style={styles.disclaimerBullet}>•</Text>
              <Text style={styles.disclaimerLine}>{line}</Text>
            </View>
          ))}
          <View style={styles.disclaimerRef}>
            <Text style={styles.disclaimerRefText}>📚 {FOOD_GUIDE_REFERENCE_NOTE}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBE6',
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginLeft: 38,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },

  // No-child banner
  noChildBanner: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noChildText: {
    fontSize: 13,
    color: '#92400E',
    marginLeft: 10,
    flex: 1,
    lineHeight: 19,
  },

  // Age selector
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  ageSelectorRow: {
    gap: 8,
    paddingBottom: 2,
  },
  ageChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray[100],
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 44,
    justifyContent: 'center',
  },
  ageChipSelected: {
    backgroundColor: '#FFF0E8',
    borderColor: COLORS.primary,
  },
  ageChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  ageChipTextSelected: {
    color: COLORS.primary,
  },

  // Milestone banner
  milestoneBanner: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: 6,
  },
  milestoneText: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 19,
    marginBottom: 10,
  },
  mealPatternRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  mealPatternText: {
    fontSize: 12,
    color: COLORS.gray[600],
    flex: 1,
    lineHeight: 18,
  },

  // Accordion
  accordionHeader: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    minHeight: 52,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionHeaderIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  accordionHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  accordionBody: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },

  // Food Group cards
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    minHeight: 52,
  },
  groupIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  groupIcon: {
    fontSize: 18,
  },
  groupName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  groupDetails: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  groupDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.gray[500],
    marginBottom: 6,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examplesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  exampleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  exampleChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  portionTable: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  portionRow: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
  },
  portionRowAlt: {
    backgroundColor: COLORS.gray[50],
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  portionKey: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray[600],
    width: 80,
  },
  portionVal: {
    fontSize: 12,
    color: COLORS.gray[700],
    flex: 1,
    lineHeight: 18,
  },
  prepNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.gray[50],
    borderRadius: 8,
    padding: 8,
  },
  prepNoteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  // Texture stages
  textureRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  textureTimeline: {
    alignItems: 'center',
    width: 24,
    marginRight: 10,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.gray[200],
    marginTop: 4,
    minHeight: 20,
  },
  textureContent: {
    flex: 1,
  },
  textureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  textureLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    flex: 1,
  },
  textureAgeBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 6,
  },
  textureAgeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textureDesc: {
    fontSize: 12,
    color: COLORS.gray[600],
    lineHeight: 18,
    marginBottom: 6,
  },
  textureExamples: {
    marginBottom: 6,
  },
  textureExample: {
    fontSize: 11,
    color: COLORS.gray[500],
    lineHeight: 17,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: COLORS.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // Allergens
  allergenIntro: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 19,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
  },
  allergenCard: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  allergenCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  allergenName: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  allergenBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
    maxWidth: 160,
  },
  allergenBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
  },
  allergenNote: {
    fontSize: 12,
    lineHeight: 18,
  },

  // Tips
  tipCard: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 8,
  },
  tipIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },

  // Disclaimer
  disclaimer: {
    backgroundColor: COLORS.gray[50],
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  disclaimerLineRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  disclaimerBullet: {
    color: COLORS.gray[500],
    fontSize: 12,
    marginRight: 6,
  },
  disclaimerLine: {
    fontSize: 12,
    color: COLORS.gray[600],
    lineHeight: 18,
    flex: 1,
  },
  disclaimerRef: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  disclaimerRefText: {
    fontSize: 11,
    color: COLORS.gray[400],
    lineHeight: 16,
  },
});
