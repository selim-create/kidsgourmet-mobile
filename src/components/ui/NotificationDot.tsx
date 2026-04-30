import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../../lib/constants';

interface NotificationDotProps {
  size?: number;
  color?: string;
  visible?: boolean;
}

export function NotificationDot({
  size = 8,
  color = COLORS.warning,
  visible = true,
}: NotificationDotProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withTiming(1.3, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      scale.value = 1;
    }
  }, [visible, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <View style={[styles.halo, { width: size + 4, height: size + 4, borderRadius: (size + 4) / 2 }]}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    // background set via prop
  },
});
