import { Vibration } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';

// Safe dynamic imports for native modules per AGENTS.md rule 3.1
let AudioModule: any = null;
let InterruptionModeIOS: any = null;
let InterruptionModeAndroid: any = null;
let isAudioChecked = false;

function getAudio() {
  if (isAudioChecked) return AudioModule;
  isAudioChecked = true;
  try {
    const av = require('expo-av');
    if (av && av.Audio) {
      AudioModule = av.Audio;
      InterruptionModeIOS = av.InterruptionModeIOS;
      InterruptionModeAndroid = av.InterruptionModeAndroid;
    }
  } catch (e) {
    // Native binary does not contain expo-av module yet
    AudioModule = null;
  }
  return AudioModule;
}

let HapticsModule: any = null;
let isHapticsChecked = false;

function getHaptics() {
  if (isHapticsChecked) return HapticsModule;
  isHapticsChecked = true;
  try {
    HapticsModule = require('expo-haptics');
  } catch (e) {
    HapticsModule = null;
  }
  return HapticsModule;
}

class SoundServiceImpl {
  private isConfigured = false;
  private correctSound: any = null;
  private wrongSound: any = null;
  private isPreloading = false;

  /**
   * Configure audio session so it plays even if iOS device has silent switch active.
   */
  public async configureAudio() {
    const audio = getAudio();
    if (this.isConfigured || !audio) return;

    try {
      if (typeof audio.setAudioModeAsync === 'function') {
        await audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true, // Essential for iOS silent switch
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS?.DuckOthers ?? 2,
          shouldDuckAndroid: true,
          interruptionModeAndroid: InterruptionModeAndroid?.DuckOthers ?? 2,
          playThroughEarpieceAndroid: false,
        });
        this.isConfigured = true;
      }
    } catch (err) {
      try {
        if (typeof audio.setAudioModeAsync === 'function') {
          await audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });
          this.isConfigured = true;
        }
      } catch (_) {
        this.isConfigured = true;
      }
    }
  }

  /**
   * Preload audio files so there is 0ms latency when user answers a question.
   */
  public async preloadSounds() {
    const audio = getAudio();
    if (this.isPreloading || !audio?.Sound) return;
    this.isPreloading = true;

    try {
      await this.configureAudio();

      if (!this.correctSound) {
        const { sound } = await audio.Sound.createAsync(
          require('../../assets/sounds/correct.wav'),
          { shouldPlay: false, volume: 1.0 }
        );
        this.correctSound = sound;
      }

      if (!this.wrongSound) {
        const { sound } = await audio.Sound.createAsync(
          require('../../assets/sounds/wrong.wav'),
          { shouldPlay: false, volume: 1.0 }
        );
        this.wrongSound = sound;
      }
    } catch (err) {
      // Non-fatal safe fallback
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Play cheerful chime for a correct answer.
   */
  public async playCorrect() {
    // 1. Tactile Haptic Feedback
    this.triggerHaptic(true);

    // 2. Audio Playback Check
    const soundEnabled = useThemeStore.getState().soundEffectsEnabled;
    const audio = getAudio();
    if (!soundEnabled || !audio?.Sound) return;

    try {
      if (!this.isConfigured) {
        await this.configureAudio();
      }

      if (this.correctSound) {
        try {
          const status = await this.correctSound.getStatusAsync();
          if (status.isLoaded) {
            if (typeof this.correctSound.replayAsync === 'function') {
              await this.correctSound.replayAsync();
              return;
            }
            await this.correctSound.setPositionAsync(0);
            await this.correctSound.playAsync();
            return;
          }
        } catch (_) {}
      }

      // If preloaded sound wasn't ready, create and play directly
      const { sound } = await audio.Sound.createAsync(
        require('../../assets/sounds/correct.wav'),
        { shouldPlay: true, volume: 1.0 }
      );
      this.correctSound = sound;
      await sound.playAsync().catch(() => {});
    } catch (err) {
      try {
        const { sound } = await audio.Sound.createAsync(
          require('../../assets/sounds/correct.wav'),
          { shouldPlay: true, volume: 1.0 }
        );
        this.correctSound = sound;
        await sound.playAsync().catch(() => {});
      } catch (_) {}
    }
  }

  /**
   * Play soft sound for an incorrect answer.
   */
  public async playWrong() {
    // 1. Tactile Haptic Feedback
    this.triggerHaptic(false);

    // 2. Audio Playback Check
    const soundEnabled = useThemeStore.getState().soundEffectsEnabled;
    const audio = getAudio();
    if (!soundEnabled || !audio?.Sound) return;

    try {
      if (!this.isConfigured) {
        await this.configureAudio();
      }

      if (this.wrongSound) {
        try {
          const status = await this.wrongSound.getStatusAsync();
          if (status.isLoaded) {
            if (typeof this.wrongSound.replayAsync === 'function') {
              await this.wrongSound.replayAsync();
              return;
            }
            await this.wrongSound.setPositionAsync(0);
            await this.wrongSound.playAsync();
            return;
          }
        } catch (_) {}
      }

      // If preloaded sound wasn't ready, create and play directly
      const { sound } = await audio.Sound.createAsync(
        require('../../assets/sounds/wrong.wav'),
        { shouldPlay: true, volume: 1.0 }
      );
      this.wrongSound = sound;
      await sound.playAsync().catch(() => {});
    } catch (err) {
      try {
        const { sound } = await audio.Sound.createAsync(
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
      const haptics = getHaptics();
      if (haptics?.notificationAsync && haptics?.NotificationFeedbackType) {
        const type = isSuccess
          ? haptics.NotificationFeedbackType.Success
          : haptics.NotificationFeedbackType.Error;
        haptics.notificationAsync(type).catch(() => {});
      } else if (haptics?.impactAsync && haptics?.ImpactFeedbackStyle) {
        const style = isSuccess
          ? haptics.ImpactFeedbackStyle.Light
          : haptics.ImpactFeedbackStyle.Medium;
        haptics.impactAsync(style).catch(() => {});
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
