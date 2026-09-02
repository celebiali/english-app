import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Path,
  Circle,
  G,
} from 'react-native-svg';

interface AppLogoProps {
  size?: number;
  borderRadius?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 76,
  borderRadius = 20,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: borderRadius,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 1024 1024">
        <Defs>
          {/* Background gradient with brand blue */}
          <LinearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1E40AF" />
            <Stop offset="50%" stopColor="#2563EB" />
            <Stop offset="100%" stopColor="#3B82F6" />
          </LinearGradient>

          {/* Book page left gradient */}
          <LinearGradient id="logoPageLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#EFF6FF" />
          </LinearGradient>

          {/* Book page right gradient */}
          <LinearGradient id="logoPageRight" x1="100%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="100%" stopColor="#DBEAFE" />
          </LinearGradient>

          {/* Check badge green gradient */}
          <LinearGradient id="logoBadge" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#34D399" />
            <Stop offset="100%" stopColor="#059669" />
          </LinearGradient>
        </Defs>

        {/* App icon background rounded rect */}
        <Rect x="0" y="0" width="1024" height="1024" rx="224" fill="url(#logoBg)" />

        {/* Open book */}
        <G>
          {/* Left page */}
          <Path
            d="M512 372 C 452 336, 350 320, 268 336 C 256 338, 248 348, 248 360 L 248 636 C 248 648, 258 658, 270 656 C 348 644, 448 660, 512 696 Z"
            fill="url(#logoPageLeft)"
          />
          {/* Right page */}
          <Path
            d="M512 372 C 572 336, 674 320, 756 336 C 768 338, 776 348, 776 360 L 776 636 C 776 648, 766 658, 754 656 C 676 644, 576 660, 512 696 Z"
            fill="url(#logoPageRight)"
          />
          {/* Spine */}
          <Rect x="504" y="368" width="16" height="330" rx="8" fill="#BFDBFE" />

          {/* Page lines, left */}
          <Path
            d="M300 400 C 356 392, 420 402, 468 424"
            stroke="#93C5FD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M300 448 C 356 440, 420 450, 468 472"
            stroke="#93C5FD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M300 496 C 356 488, 420 498, 468 520"
            stroke="#93C5FD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />

          {/* Page lines, right */}
          <Path
            d="M724 400 C 668 392, 604 402, 556 424"
            stroke="#93C5FD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M724 448 C 668 440, 604 450, 556 472"
            stroke="#93C5FD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M724 496 C 668 488, 604 498, 556 520"
            stroke="#93C5FD"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />
        </G>

        {/* Checkmark badge */}
        <G>
          <Circle
            cx="700"
            cy="330"
            r="96"
            fill="url(#logoBadge)"
            stroke="#FFFFFF"
            strokeWidth="14"
          />
          <Path
            d="M656 332 L688 364 L748 300"
            stroke="#FFFFFF"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
});
