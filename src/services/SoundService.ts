import { Vibration } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { useThemeStore } from '../store/useThemeStore';

// Safe dynamic imports for native haptics module per AGENTS.md rule 3.1
let HapticsModule: any = null;
try {
  HapticsModule = require('expo-haptics');
} catch (e) {
  // Safe fallback if native module is not available
}

class SoundServiceImpl {
  private isConfigured = false;
  private correctSound: Audio.Sound | null = null;
  private wrongSound: Audio.Sound | null = null;
  private isPreloading = false;

  constructor() {
    // Automatically initialize audio mode and preload sounds
    this.preloadSounds().catch(() => {});
  }

  /**
   * Configure audio session so it plays even if iOS device has silent switch active.
   */
  public async configureAudio() {
    if (this.isConfigured) return;
    try {
      if (Audio && typeof Audio.setAudioModeAsync === 'function') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // Essential for iOS silent switch
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          playThroughEarpieceAndroid: false,
        });
        this.isConfigured = true;
      }
    } catch (err) {
      console.warn('[SoundService] Full audio mode config warning, falling back to minimal mode:', err);
      try {
        if (Audio && typeof Audio.setAudioModeAsync === 'function') {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });
          this.isConfigured = true;
        }
      } catch (fallbackErr) {
        console.warn('[SoundService] Minimal audio config fallback error:', fallbackErr);
      }
    }
  }

  /**
   * Preload audio files so there is 0ms latency when user answers a question.
   */
  public async preloadSounds() {
    if (this.isPreloading) return;
    this.isPreloading = true;
    try {
      await this.configureAudio();

      if (!this.correctSound && Audio?.Sound) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/correct.wav'),
          { shouldPlay: false, volume: 1.0 }
        );
        this.correctSound = sound;
      }

      if (!this.wrongSound && Audio?.Sound) {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/wrong.wav'),
          { shouldPlay: false, volume: 1.0 }
        );
        this.wrongSound = sound;
      }
    } catch (err) {
      console.warn('[SoundService] Sound preload warning:', err);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Play cheerful, encouraging chime for a correct answer.
   */
  public async playCorrect() {
    // 1. Tactile Haptic Feedback
    this.triggerHaptic(true);

    // 2. Audio Playback
    const soundEnabled = useThemeStore.getState().soundEffectsEnabled;
    if (!soundEnabled || !Audio?.Sound) return;

    try {
      if (!this.isConfigured) {
        await this.configureAudio();
      }

      if (this.correctSound) {
        const status = await this.correctSound.getStatusAsync();
        if (status.isLoaded) {
          await this.correctSound.setPositionAsync(0);
          await this.correctSound.playAsync();
          return;
        }
      }

      // If preloaded sound wasn't ready, create and play directly
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/correct.wav'),
        { shouldPlay: true, volume: 1.0 }
      );
      this.correctSound = sound;
      await sound.playAsync().catch(() => {});
    } catch (err) {
      console.warn('[SoundService] playCorrect error:', err);
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/correct.wav'),
          { shouldPlay: true, volume: 1.0 }
        );
        this.correctSound = sound;
        await sound.playAsync().catch(() => {});
      } catch (_) {}
    }
  }

  /**
   * Play soft, non-intrusive sound for an incorrect answer.
   */
  public async playWrong() {
    // 1. Tactile Haptic Feedback
    this.triggerHaptic(false);

    // 2. Audio Playback
    const soundEnabled = useThemeStore.getState().soundEffectsEnabled;
    if (!soundEnabled || !Audio?.Sound) return;

    try {
      if (!this.isConfigured) {
        await this.configureAudio();
      }

      if (this.wrongSound) {
        const status = await this.wrongSound.getStatusAsync();
        if (status.isLoaded) {
          await this.wrongSound.setPositionAsync(0);
          await this.wrongSound.playAsync();
          return;
        }
      }

      // If preloaded sound wasn't ready, create and play directly
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/wrong.wav'),
        { shouldPlay: true, volume: 1.0 }
      );
      this.wrongSound = sound;
      await sound.playAsync().catch(() => {});
    } catch (err) {
      console.warn('[SoundService] playWrong error:', err);
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/sounds/wrong.wav'),
          { shouldPlay: true, volume: 1.0 }
        );
        this.wrongSound = sound;
        await sound.playAsync().catch(() => {});
      } catch (_) {}
    }
  }

  /**
   * Triggers haptic vibration with graceful fallback
   */
  private triggerHaptic(isSuccess: boolean) {
    try {
      if (HapticsModule?.notificationAsync && HapticsModule?.NotificationFeedbackType) {
        const type = isSuccess
          ? HapticsModule.NotificationFeedbackType.Success
          : HapticsModule.NotificationFeedbackType.Error;
        HapticsModule.notificationAsync(type).catch(() => {});
      } else if (HapticsModule?.impactAsync && HapticsModule?.ImpactFeedbackStyle) {
        const style = isSuccess
          ? HapticsModule.ImpactFeedbackStyle.Light
          : HapticsModule.ImpactFeedbackStyle.Medium;
        HapticsModule.impactAsync(style).catch(() => {});
      } else {
        // Fallback to React Native Vibration
        Vibration.vibrate(isSuccess ? 30 : 60);
      }
    } catch (_) {
      try {
        Vibration.vibrate(isSuccess ? 30 : 60);
      } catch (__) {}
    }
  }

  /**
   * Clean up any running sounds
   */
  public async cleanup() {
    try {
      if (this.correctSound) {
        await this.correctSound.unloadAsync().catch(() => {});
        this.correctSound = null;
      }
      if (this.wrongSound) {
        await this.wrongSound.unloadAsync().catch(() => {});
        this.wrongSound = null;
      }
    } catch (_) {}
  }
}

export const SoundService = new SoundServiceImpl();
