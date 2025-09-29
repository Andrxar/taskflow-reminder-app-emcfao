
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export class SoundService {
  private static sound: Audio.Sound | null = null;
  private static isPlaying = false;
  private static playbackTimeout: NodeJS.Timeout | null = null;

  static async initializeAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('Error initializing audio:', error);
    }
  }

  static async playReminderSound(): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stopSound();
      }

      await this.initializeAudio();

      // Use a repeating interval to play system notification sound
      this.isPlaying = true;
      this.playRepeatingNotification();

      // Play for 1 minute (60 seconds) as requested
      this.playbackTimeout = setTimeout(async () => {
        await this.stopSound();
      }, 60000);

      console.log('Reminder sound started playing');
    } catch (error) {
      console.log('Error playing reminder sound:', error);
    }
  }

  private static playRepeatingNotification(): void {
    if (!this.isPlaying) return;

    // Play system notification sound
    this.playSystemSound();

    // Repeat every 2 seconds
    setTimeout(() => {
      if (this.isPlaying) {
        this.playRepeatingNotification();
      }
    }, 2000);
  }

  private static async playSystemSound(): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { shouldPlay: true, volume: 1.0 }
      );
      
      // Unload after playing
      setTimeout(async () => {
        try {
          await sound.unloadAsync();
        } catch (error) {
          console.log('Error unloading sound:', error);
        }
      }, 1000);
    } catch (error) {
      console.log('Error playing system sound:', error);
    }
  }



  static async stopSound(): Promise<void> {
    try {
      if (this.playbackTimeout) {
        clearTimeout(this.playbackTimeout);
        this.playbackTimeout = null;
      }

      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      }

      this.isPlaying = false;
      console.log('Reminder sound stopped');
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  }

  static isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }
}
