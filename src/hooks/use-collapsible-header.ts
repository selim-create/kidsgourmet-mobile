import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';

/** Height of the full header (top row + bottom child row). */
export const HEADER_FULL_HEIGHT = 104;
/** Height of just the top row (stays visible). */
export const HEADER_COMPACT_HEIGHT = 56;

/** Scroll distance (px) over which the collapse animation completes. */
const DEFAULT_COLLAPSE_DISTANCE = 80;

/**
 * Lower-level hook that computes the animated style for the collapsible bottom
 * row given an external scrollY SharedValue (or undefined for static/visible).
 * Used by AppHeader to avoid duplicating the animation math.
 */
export function useBottomRowStyle(
  scrollY: SharedValue<number> | undefined,
  collapseDistance: number = DEFAULT_COLLAPSE_DISTANCE,
): ReturnType<typeof useAnimatedStyle> {
  return useAnimatedStyle(() => {
    if (!scrollY) return { height: 48, opacity: 1 };
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
    return { height, opacity };
  });
}

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
  collapseDistance = DEFAULT_COLLAPSE_DISTANCE,
}: UseCollapsibleHeaderOptions = {}): UseCollapsibleHeaderResult {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const bottomRowStyle = useBottomRowStyle(scrollY, collapseDistance);

  return { scrollY, bottomRowStyle, scrollHandler };
}
