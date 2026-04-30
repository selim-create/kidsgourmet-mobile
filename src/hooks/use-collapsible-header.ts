import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

/** Height of the full header (top row + bottom child row). */
export const HEADER_FULL_HEIGHT = 104;
/** Height of just the top row (stays visible). */
export const HEADER_COMPACT_HEIGHT = 56;

interface UseCollapsibleHeaderOptions {
  /** Scroll distance (px) over which the collapse animation completes. */
  collapseDistance?: number;
}

interface UseCollapsibleHeaderResult {
  scrollY: ReturnType<typeof useSharedValue<number>>;
  /** Animated style for the collapsible bottom row container. */
  bottomRowStyle: ReturnType<typeof useAnimatedStyle>;
  /** Scroll handler to attach to an Animated.ScrollView. */
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
}

export function useCollapsibleHeader({
  collapseDistance = 80,
}: UseCollapsibleHeaderOptions = {}): UseCollapsibleHeaderResult {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const bottomRowStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, collapseDistance],
      [48, 0],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollY.value,
      [0, collapseDistance * 0.6],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { height, opacity, overflow: 'hidden' };
  });

  return { scrollY, bottomRowStyle, scrollHandler };
}
