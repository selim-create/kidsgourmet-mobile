import React, { useMemo } from 'react';
import { ActivityIndicator, Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import type { GrowthChartData, GrowthChartType } from '../../lib/types';

interface GrowthChartProps {
  chartData: GrowthChartData | null;
  isLoading: boolean;
  selectedType: GrowthChartType;
  onTypeChange: (type: GrowthChartType) => void;
}

const CHART_WIDTH = Math.max(260, Math.min(Dimensions.get('window').width - 76, 340));
const CHART_HEIGHT = 220;
const PADDING_X = 36;
const PADDING_Y = 24;

const TYPE_OPTIONS: Array<{ key: GrowthChartType; label: string }> = [
  { key: 'weight_for_age', label: 'Kilo' },
  { key: 'height_for_age', label: 'Boy' },
  { key: 'head_for_age', label: 'Baş Çevresi' },
];

const CURVE_COLORS: Record<string, string> = {
  p3: '#FBCFE8',
  p15: '#FDE68A',
  p50: '#BFDBFE',
  p85: '#C4B5FD',
  p97: '#FCA5A5',
};

function unitForType(type: GrowthChartType): string {
  if (type === 'weight_for_age') return 'kg';
  return 'cm';
}

export function GrowthChart({
  chartData,
  isLoading,
  selectedType,
  onTypeChange,
}: GrowthChartProps) {
  const chartModel = useMemo(() => {
    if (!chartData) return null;

    const curves = [
      ...chartData.reference_curves.p3,
      ...chartData.reference_curves.p15,
      ...chartData.reference_curves.p50,
      ...chartData.reference_curves.p85,
      ...chartData.reference_curves.p97,
      ...chartData.measurements.map((m) => ({ age_days: m.age_days, value: m.value })),
    ];

    if (curves.length === 0) return null;

    const xValues = curves.map((item) => item.age_days);
    const yValues = curves.map((item) => item.value);

    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const plotWidth = CHART_WIDTH - PADDING_X * 2;
    const plotHeight = CHART_HEIGHT - PADDING_Y * 2;

    const scaleX = (ageDays: number) => {
      if (maxX === minX) return PADDING_X;
      return PADDING_X + ((ageDays - minX) / (maxX - minX)) * plotWidth;
    };

    const scaleY = (value: number) => {
      if (maxY === minY) return CHART_HEIGHT - PADDING_Y;
      return CHART_HEIGHT - PADDING_Y - ((value - minY) / (maxY - minY)) * plotHeight;
    };

    const toPoints = (items: Array<{ age_days: number; value: number }>) =>
      items.map((item) => `${scaleX(item.age_days)},${scaleY(item.value)}`).join(' ');

    return {
      minY,
      maxY,
      minX,
      maxX,
      scaleX,
      scaleY,
      curveLines: {
        p3: toPoints(chartData.reference_curves.p3),
        p15: toPoints(chartData.reference_curves.p15),
        p50: toPoints(chartData.reference_curves.p50),
        p85: toPoints(chartData.reference_curves.p85),
        p97: toPoints(chartData.reference_curves.p97),
      },
      measurementLine: toPoints(
        chartData.measurements.map((item) => ({
          age_days: item.age_days,
          value: item.value,
        })),
      ),
    };
  }, [chartData]);

  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#DBEAFE',
      }}
    >
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        {TYPE_OPTIONS.map((item, index) => {
          const isActive = item.key === selectedType;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onTypeChange(item.key)}
              style={{
                flex: 1,
                marginRight: index < TYPE_OPTIONS.length - 1 ? 8 : 0,
                minHeight: 36,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: isActive ? '#2563EB' : '#D1D5DB',
                backgroundColor: isActive ? '#DBEAFE' : '#fff',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: isActive ? '#1D4ED8' : '#4B5563' }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={{ minHeight: 220, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#2563EB" />
        </View>
      ) : !chartData || chartData.measurements.length === 0 || !chartModel ? (
        <View style={{ minHeight: 120, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#6B7280', fontSize: 13 }}>Henüz ölçüm kaydedilmemiş</Text>
        </View>
      ) : (
        <>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            <Line
              x1={PADDING_X}
              y1={CHART_HEIGHT - PADDING_Y}
              x2={CHART_WIDTH - PADDING_X}
              y2={CHART_HEIGHT - PADDING_Y}
              stroke="#D1D5DB"
              strokeWidth={1}
            />
            <Line
              x1={PADDING_X}
              y1={PADDING_Y}
              x2={PADDING_X}
              y2={CHART_HEIGHT - PADDING_Y}
              stroke="#D1D5DB"
              strokeWidth={1}
            />

            {Object.entries(chartModel.curveLines).map(([key, points]) => (
              <Polyline
                key={key}
                points={points}
                fill="none"
                stroke={CURVE_COLORS[key]}
                strokeWidth={1.4}
              />
            ))}

            <Polyline
              points={chartModel.measurementLine}
              fill="none"
              stroke="#1D4ED8"
              strokeWidth={2.2}
            />

            {chartData.measurements.map((item) => (
              <Circle
                key={`${item.date}-${item.age_days}`}
                cx={chartModel.scaleX(item.age_days)}
                cy={chartModel.scaleY(item.value)}
                r={3.5}
                fill="#1D4ED8"
              />
            ))}

            <SvgText x={4} y={PADDING_Y} fill="#6B7280" fontSize="10">
              {chartModel.maxY.toFixed(1)} {unitForType(selectedType)}
            </SvgText>
            <SvgText x={6} y={CHART_HEIGHT - PADDING_Y} fill="#6B7280" fontSize="10">
              {chartModel.minY.toFixed(1)}
            </SvgText>
            <SvgText x={PADDING_X} y={CHART_HEIGHT - 4} fill="#6B7280" fontSize="10">
              {(chartModel.minX / 30).toFixed(0)} ay
            </SvgText>
            <SvgText x={CHART_WIDTH - PADDING_X - 28} y={CHART_HEIGHT - 4} fill="#6B7280" fontSize="10">
              {(chartModel.maxX / 30).toFixed(0)} ay
            </SvgText>
          </Svg>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
            {(['p3', 'p15', 'p50', 'p85', 'p97'] as const).map((curveKey) => (
              <View
                key={curveKey}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, marginBottom: 6 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 2,
                    backgroundColor: CURVE_COLORS[curveKey],
                    marginRight: 4,
                  }}
                />
                <Text style={{ fontSize: 11, color: '#6B7280' }}>{curveKey.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
