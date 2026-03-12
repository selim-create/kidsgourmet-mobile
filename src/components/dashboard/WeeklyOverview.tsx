import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../../lib/constants';

const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface WeekDay {
  date: string;
  dayName: string;
  shortDay: string;
  dayNumber: number;
  isToday: boolean;
  hasMeals: boolean;
}

interface WeeklyOverviewProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  mealPlanDays?: Array<{ date: string; meals: unknown[] }>;
}

function getWeekDays(selectedDate: string): WeekDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find Monday of the week containing selectedDate
  const selected = new Date(selectedDate || today);
  selected.setHours(0, 0, 0, 0);
  const dayOfWeek = selected.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(selected);
  monday.setDate(monday.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().split('T')[0];
    return {
      date: iso,
      dayName: DAYS_TR[i],
      shortDay: DAYS_TR[i],
      dayNumber: d.getDate(),
      isToday: d.getTime() === today.getTime(),
      hasMeals: false, // will be filled in component
    };
  });
}

export function WeeklyOverview({ selectedDate, onSelectDate, mealPlanDays }: WeeklyOverviewProps) {
  const todayIso = new Date().toISOString().split('T')[0];
  const effectiveDate = selectedDate || todayIso;
  const weekDays = getWeekDays(effectiveDate);

  const mealsByDate = new Map<string, number>();
  mealPlanDays?.forEach((day) => {
    mealsByDate.set(day.date, day.meals.length);
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 10 }}>
        Haftalık Bakış 📅
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 4 }}
      >
        {weekDays.map((day) => {
          const isSelected = day.date === effectiveDate;
          const mealCount = mealsByDate.get(day.date) ?? 0;

          return (
            <TouchableOpacity
              key={day.date}
              activeOpacity={0.8}
              onPress={() => onSelectDate(day.date)}
              style={{
                width: 52,
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 6,
                borderRadius: 14,
                backgroundColor: isSelected ? COLORS.primary : day.isToday ? '#FFF3EE' : '#fff',
                borderWidth: isSelected ? 0 : 1,
                borderColor: day.isToday ? COLORS.primary : '#E5E7EB',
                elevation: isSelected ? 2 : 0,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: isSelected ? 0.12 : 0,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isSelected ? '#fff' : '#9CA3AF',
                  marginBottom: 4,
                }}
              >
                {day.shortDay}
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color: isSelected ? '#fff' : day.isToday ? COLORS.primary : '#374151',
                }}
              >
                {day.dayNumber}
              </Text>
              {mealCount > 0 && (
                <View
                  style={{
                    marginTop: 4,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.7)' : COLORS.primary,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
