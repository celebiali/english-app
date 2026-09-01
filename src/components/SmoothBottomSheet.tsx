import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  Keyboard,
  Platform,
} from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeight?: string | number;
  height?: string | number;
  showHandle?: boolean;
}

export const SmoothBottomSheet: React.FC<Props> = ({
  visible,
  onClose,
  children,
  maxHeight = '88%',
  height,
  showHandle = true,
}) => {
  const { colors } = useThemeStore();
  const [showModal, setShowModal] = useState(visible);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 26,
          mass: 0.85,
          stiffness: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModal(false);
      onClose();
    });
  };

  // Drag-to-dismiss pan responder for the top handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            damping: 24,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardOffset(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardOffset(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const parsedMaxHeight =
    typeof maxHeight === 'string' && maxHeight.endsWith('%')
      ? (SCREEN_HEIGHT * parseFloat(maxHeight)) / 100
      : Number(maxHeight) || SCREEN_HEIGHT * 0.88;

  const parsedHeight =
    typeof height === 'string' && height.endsWith('%')
      ? (SCREEN_HEIGHT * parseFloat(height)) / 100
      : height !== undefined
      ? Number(height)
      : undefined;

  const effectiveMaxHeight = keyboardOffset > 0
    ? Math.min(parsedMaxHeight, SCREEN_HEIGHT - keyboardOffset - (Platform.OS === 'ios' ? 60 : 30))
    : parsedMaxHeight;

  const effectiveHeight = parsedHeight
    ? (keyboardOffset > 0 ? Math.min(parsedHeight, effectiveMaxHeight) : parsedHeight)
    : undefined;

  if (!showModal) return null;

  return (
    <Modal
      transparent
      visible={showModal}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Fading Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.55],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>

        {/* Sliding Bottom Sheet Container */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: colors.cardBackground,
              maxHeight: effectiveMaxHeight,
              ...(effectiveHeight ? { height: effectiveHeight } : {}),
              marginBottom: keyboardOffset,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {showHandle && (
            <View {...panResponder.panHandlers} style={[styles.handleArea, { backgroundColor: colors.cardBackground }]}>
              <View style={[styles.handlePill, { backgroundColor: colors.border }]} />
            </View>
          )}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 20,
  },
  handleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  handlePill: {
    width: 38,
    height: 4.5,
    borderRadius: 999,
  },
});
