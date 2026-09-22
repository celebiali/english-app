import { Vibration } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

// Safe dynamic imports for native modules per AGENTS.md rule 3.1
let AudioModule: any = null;
try {
  AudioModule = require('expo-av')?.Audio;
} catch (e) {
  // Safe fallback if native module is not available in binary
}

let HapticsModule: any = null;
try {
  HapticsModule = require('expo-haptics');
} catch (e) {
  // Safe fallback if native module is not available
}

class SoundServiceImpl {
  private isConfigured = false;
  private activeSounds: any[] = [];

  /**
   * Configure audio session so it plays even if iOS device has silent switch active.
   */
  private async configureAudio() {
    if (this.isConfigured || !AudioModule) return;
    try {
      if (typeof AudioModule.setAudioModeAsync === 'function') {
        await AudioModule.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
      this.isConfigured = true;
    } catch (err) {
      // Non-fatal, fallback to default audio mode
      this.isConfigured = true;
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
    if (!soundEnabled || !AudioModule?.Sound) return;

    try {
      await this.configureAudio();
      const soundSource = require('../../assets/sounds/correct.wav');
      const { sound } = await AudioModule.Sound.createAsync(
        soundSource,
        { shouldPlay: true, volume: 0.85 }
      );

      this.activeSounds.push(sound);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          this.activeSounds = this.activeSounds.filter((s) => s !== sound);
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      // Fails gracefully without breaking the UI
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
    if (!soundEnabled || !AudioModule?.Sound) return;

    try {
      await this.configureAudio();
      const soundSource = require('../../assets/sounds/wrong.wav');
      const { sound } = await AudioModule.Sound.createAsync(
        soundSource,
        { shouldPlay: true, volume: 0.85 }
      );

      this.activeSounds.push(sound);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          this.activeSounds = this.activeSounds.filter((s) => s !== sound);
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      // Fails gracefully without breaking the UI
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
   * Clean up any running sounds (e.g. screen unmount)
   */
  public async cleanup() {
    try {
      for (const sound of this.activeSounds) {
        if (sound) {
          await sound.unloadAsync().catch(() => {});
        }
      }
      this.activeSounds = [];
    } catch (_) {}
  }
}

export const SoundService = new SoundServiceImpl();
