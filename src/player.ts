import { NativeModules, Platform } from 'react-native';
import { AdItem, AdvertisingConfig } from './advertising';
import { AnalyticsConfig } from './analytics';
import NativeInstance, { NativeInstanceConfig } from './nativeInstance';
import { Source, SourceConfig } from './source';
import { AudioTrack } from './audioTrack';
import { SubtitleTrack } from './subtitleTrack';
import { StyleConfig } from './styleConfig';
import { TweaksConfig } from './tweaksConfig';
import { AdaptationConfig } from './adaptationConfig';
import { OfflineContentManager, OfflineSourceOptions } from './offline';
import { Thumbnail } from './thumbnail';
import { AnalyticsApi } from './analytics/player';
import { RemoteControlConfig } from './remoteControlConfig';

const PlayerModule = NativeModules.PlayerModule;

/**
 * Object used to configure a new `Player` instance.
 */
export interface PlayerConfig extends NativeInstanceConfig {
  /**
   * Bitmovin license key that can be found in the Bitmovin portal.
   * If a license key is set here, it will be used instead of the license key found in the `Info.plist` and `AndroidManifest.xml`.
   * @example
   * Configuring the player license key from source code:
   * ```
   * const player = new Player({
   *   licenseKey: '\<LICENSE-KEY-CODE\>',
   * });
   * ```
   * @example
   * `licenseKey` can be safely omitted from source code if it has
   * been configured in Info.plist/AndroidManifest.xml.
   * ```
   * const player = new Player(); // omit `licenseKey`
   * player.play(); // call methods and properties...
   * ```
   */
  licenseKey?: string;
  /**
   * Configures playback behaviour. A default PlaybackConfig is set initially.
   */
  playbackConfig?: PlaybackConfig;
  /**
   * Configures the visual presentation and behaviour of the player UI. A default StyleConfig is set initially.
   */
  styleConfig?: StyleConfig;
  /**
   * Configures advertising functionality. A default AdvertisingConfig is set initially.
   */
  advertisingConfig?: AdvertisingConfig;
  /**
   * Configures experimental features. A default TweaksConfig is set initially.
   */
  tweaksConfig?: TweaksConfig;
  /**
   * Configures analytics functionality.
   */
  analyticsConfig?: AnalyticsConfig;
  /**
   * Configures adaptation logic.
   */
  adaptationConfig?: AdaptationConfig;
  /**
   * Configures remote playback functionality.
   */
  remoteControlConfig?: RemoteControlConfig;
}

/**
 * Configures the playback behaviour of the player.
 */
export interface PlaybackConfig {
  /**
   * Whether the player starts playing automatically after loading a source or not. Default is `false`.
   * @example
   * ```
   * const player = new Player({
   *   playbackConfig: {
   *     isAutoplayEnabled: true,
   *   },
   * });
   * ```
   */
  isAutoplayEnabled?: boolean;
  /**
   * Whether the sound is muted on startup or not. Default value is `false`.
   * @example
   * ```
   * const player = new Player({
   *   playbackConfig: {
   *     isMuted: true,
   *   },
   * });
   * ```
   */
  isMuted?: boolean;
  /**
   * Whether time shift / DVR for live streams is enabled or not. Default is `true`.
   *  @example
   * ```
   * const player = new Player({
   *   playbackConfig: {
   *     isTimeShiftEnabled: false,
   *   },
   * });
   * ```
   */
  isTimeShiftEnabled?: boolean;
  /**
   * Whether background playback is enabled or not.
   * Default is `false`.
   *
   * When set to `true`, playback is not automatically paused
   * anymore when the app moves to the background.
   * When set to `true`, also make sure to properly configure your app to allow
   * background playback.
   *
   * On tvOS, background playback is only supported for audio-only content.
   *
   * Default is `false`.
   *
   *  @example
   * ```
   * const player = new Player({
   *   {
   *     isBackgroundPlaybackEnabled: true,
   *   }
   * })
   * ```
   */
  isBackgroundPlaybackEnabled?: boolean;
  /**
   * Whether the Picture in Picture mode option is enabled or not. Default is `false`.
   *  @example
   * ```
   * const player = new Player({
   *   playbackConfig: {
   *     isPictureInPictureEnabled: true,
   *   },
   * });
   * ```
   */
  isPictureInPictureEnabled?: boolean;
}

/**
 * Loads, controls and renders audio and video content represented through `Source`s. A player
 * instance can be created via the `usePlayer` hook and will idle until one or more `Source`s are
 * loaded. Once `load` is called, the player becomes active and initiates necessary downloads to
 * start playback of the loaded source(s).
 *
 * Can be attached to `PlayerView` component in order to use Bitmovin's Player Web UI.
 * @see PlayerView
 */
export class Player extends NativeInstance<PlayerConfig> {
  /**
   * Currently active source, or `null` if none is active.
   */
  source?: Source;
  /**
   * Whether the native `Player` object has been created.
   */
  isInitialized = false;
  /**
   * Whether the native `Player` object has been disposed.
   */
  isDestroyed = false;
  /**
   * The `AnalyticsApi` for interactions regarding the `Player`'s analytics.
   *
   * `undefined` if the player was created without analytics support.
   */
  analytics?: AnalyticsApi = undefined;

  /**
   * Allocates the native `Player` instance and its resources natively.
   */
  initialize = () => {
    if (!this.isInitialized) {
      const analyticsConfig = this.config?.analyticsConfig;
      if (analyticsConfig) {
        PlayerModule.initWithAnalyticsConfig(
          this.nativeId,
          this.config,
          analyticsConfig
        );
        this.analytics = new AnalyticsApi(this.nativeId);
      } else {
        PlayerModule.initWithConfig(this.nativeId, this.config);
      }
      this.isInitialized = true;
    }
  };

  /**
   * Destroys the native `Player` and releases all of its allocated resources.
   */
  destroy = () => {
    if (!this.isDestroyed) {
      PlayerModule.destroy(this.nativeId);
      this.source?.destroy();
      this.isDestroyed = true;
    }
  };

  /**
   * Loads a new `Source` from `sourceConfig` into the player.
   */
  load = (sourceConfig: SourceConfig) => {
    this.loadSource(new Source(sourceConfig));
  };

  /**
   * Loads the downloaded content from `OfflineContentManager` into the player.
   */
  loadOfflineContent = (
    offlineContentManager: OfflineContentManager,
    options?: OfflineSourceOptions
  ) => {
    PlayerModule.loadOfflineContent(
      this.nativeId,
      offlineContentManager.nativeId,
      options
    );
  };

  /**
   * Loads the given `Source` into the player.
   */
  loadSource = (source: Source) => {
    source.initialize();
    this.source = source;
    PlayerModule.loadSource(this.nativeId, source.nativeId);
  };

  /**
   * Unloads all `Source`s from the player.
   */
  unload = () => {
    PlayerModule.unload(this.nativeId);
  };

  /**
   * Starts or resumes playback after being paused. Has no effect if the player is already playing.
   */
  play = () => {
    PlayerModule.play(this.nativeId);
  };

  /**
   * Pauses the video if it is playing. Has no effect if the player is already paused.
   */
  pause = () => {
    PlayerModule.pause(this.nativeId);
  };

  /**
   * Seeks to the given playback time specified by the parameter `time` in seconds. Must not be
   * greater than the total duration of the video. Has no effect when watching a live stream since
   * seeking is not possible.
   *
   * @param time - The time to seek to in seconds.
   */
  seek = (time: number) => {
    PlayerModule.seek(this.nativeId, time);
  };

  /**
   * Shifts the time to the given `offset` in seconds from the live edge. The resulting offset has to be within the
   * timeShift window as specified by `maxTimeShift` (which is a negative value) and 0. When the provided `offset` is
   * positive, it will be interpreted as a UNIX timestamp in seconds and converted to fit into the timeShift window.
   * When the provided `offset` is negative, but lower than `maxTimeShift`, then it will be clamped to `maxTimeShift`.
   * Has no effect for VoD.
   *
   * Has no effect if no sources are loaded.
   */
  timeShift = (offset: number) => {
    PlayerModule.timeShift(this.nativeId, offset);
  };

  /**
   * Mutes the player if an audio track is available. Has no effect if the player is already muted.
   */
  mute = () => {
    PlayerModule.mute(this.nativeId);
  };

  /**
   * Unmutes the player if it is muted. Has no effect if the player is already unmuted.
   */
  unmute = () => {
    PlayerModule.unmute(this.nativeId);
  };

  /**
   * Sets the player's volume between 0 (silent) and 100 (max volume).
   *
   * @param volume - The volume level to set.
   */
  setVolume = (volume: number) => {
    PlayerModule.setVolume(this.nativeId, volume);
  };

  /**
   * @returns The player's current volume level.
   */
  getVolume = async (): Promise<number> => {
    return PlayerModule.getVolume(this.nativeId);
  };

  /**
   * @returns The current playback time in seconds.
   *
   * For VoD streams the returned time ranges between 0 and the duration of the asset.
   *
   * For live streams it can be specified if an absolute UNIX timestamp or a value
   * relative to the playback start should be returned.
   *
   * @param mode - The time mode to specify: an absolute UNIX timestamp ('absolute') or relative time ('relative').
   */
  getCurrentTime = async (mode?: 'relative' | 'absolute'): Promise<number> => {
    return PlayerModule.currentTime(this.nativeId, mode);
  };

  /**
   * @returns The total duration in seconds of the current video or INFINITY if it’s a live stream.
   */
  getDuration = async (): Promise<number> => {
    return PlayerModule.duration(this.nativeId);
  };

  /**
   * @returns `true` if the player is muted.
   */
  isMuted = async (): Promise<boolean> => {
    return PlayerModule.isMuted(this.nativeId);
  };

  /**
   * @returns `true` if the player is currently playing, i.e. has started and is not paused.
   */
  isPlaying = async (): Promise<boolean> => {
    return PlayerModule.isPlaying(this.nativeId);
  };

  /**
   * @returns `true` if the player has started playback but it's currently paused.
   */
  isPaused = async (): Promise<boolean> => {
    return PlayerModule.isPaused(this.nativeId);
  };

  /**
   * @returns `true` if the displayed video is a live stream.
   */
  isLive = async (): Promise<boolean> => {
    return PlayerModule.isLive(this.nativeId);
  };

  /**
   * @remarks Only available for iOS devices.
   * @returns `true` when media is played externally using AirPlay.
   */
  isAirPlayActive = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      console.warn(
        `[Player ${this.nativeId}] Method isAirPlayActive is not available for Android. Only iOS devices.`
      );
      return false;
    }
    return PlayerModule.isAirPlayActive(this.nativeId);
  };

  /**
   * @remarks Only available for iOS devices.
   * @returns `true` when AirPlay is available.
   */
  isAirPlayAvailable = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      console.warn(
        `[Player ${this.nativeId}] Method isAirPlayAvailable is not available for Android. Only iOS devices.`
      );
      return false;
    }
    return PlayerModule.isAirPlayAvailable(this.nativeId);
  };

  /**
   * @returns The currently selected audio track or `null`.
   */
  getAudioTrack = async (): Promise<AudioTrack | null> => {
    return PlayerModule.getAudioTrack(this.nativeId);
  };

  /**
   * @returns An array containing AudioTrack objects for all available audio tracks.
   */
  getAvailableAudioTracks = async (): Promise<AudioTrack[]> => {
    return PlayerModule.getAvailableAudioTracks(this.nativeId);
  };

  /**
   * Sets the audio track to the ID specified by trackIdentifier. A list can be retrieved by calling getAvailableAudioTracks.
   */
  setAudioTrack = async (trackIdentifier: string): Promise<void> => {
    return PlayerModule.setAudioTrack(this.nativeId, trackIdentifier);
  };

  /**
   * @returns The currently selected subtitle track or `null`.
   */
  getSubtitleTrack = async (): Promise<SubtitleTrack | null> => {
    return PlayerModule.getSubtitleTrack(this.nativeId);
  };

  /**
   * @returns An array containing SubtitleTrack objects for all available subtitle tracks.
   */
  getAvailableSubtitles = async (): Promise<SubtitleTrack[]> => {
    return PlayerModule.getAvailableSubtitles(this.nativeId);
  };

  /**
   * Sets the subtitle track to the ID specified by trackIdentifier. A list can be retrieved by calling getAvailableSubtitles.
   */
  setSubtitleTrack = async (trackIdentifier?: string): Promise<void> => {
    return PlayerModule.setSubtitleTrack(this.nativeId, trackIdentifier);
  };

  /**
   * Dynamically schedules the `adItem` for playback.
   * Has no effect if there is no active playback session.
   *
   * @param adItem - Ad to be scheduled for playback.
   *
   * @platform iOS, Android
   */
  scheduleAd = (adItem: AdItem) => {
    PlayerModule.scheduleAd(this.nativeId, adItem);
  };

  /**
   * Skips the current ad.
   * Has no effect if the current ad is not skippable or if no ad is being played back.
   *
   * @platform iOS, Android
   */
  skipAd = () => {
    PlayerModule.skipAd(this.nativeId);
  };

  /**
   * @returns `true` while an ad is being played back or when main content playback has been paused for ad playback.
   * @platform iOS, Android
   */
  isAd = async (): Promise<boolean> => {
    return PlayerModule.isAd(this.nativeId);
  };

  /**
   * The current time shift of the live stream in seconds. This value is always 0 if the active `source` is not a
   * live stream or no sources are loaded.
   */
  getTimeShift = async (): Promise<number> => {
    return PlayerModule.getTimeShift(this.nativeId);
  };

  /**
   * The limit in seconds for time shifting. This value is either negative or 0 and it is always 0 if the active
   * `source` is not a live stream or no sources are loaded.
   */
  getMaxTimeShift = async (): Promise<number> => {
    return PlayerModule.getMaxTimeShift(this.nativeId);
  };

  /**
   * Sets the upper bitrate boundary for video qualities. All qualities with a bitrate
   * that is higher than this threshold will not be eligible for automatic quality selection.
   *
   * Can be set to `null` for no limitation.
   */
  setMaxSelectableBitrate = (bitrate: number | null) => {
    PlayerModule.setMaxSelectableBitrate(this.nativeId, bitrate || -1);
  };

  /**
   * @returns a `Thumbnail` for the specified playback time for the currently active source if available.
   * Supported thumbnail formats are:
   * - `WebVtt` configured via `SourceConfig.thumbnailTrack`, on all supported platforms
   * - HLS `Image Media Playlist` in the multivariant playlist, Android-only
   * - DASH `Image Adaptation Set` as specified in DASH-IF IOP, Android-only
   * If a `WebVtt` thumbnail track is provided, any potential in-manifest thumbnails are ignored on Android.
   */
  getThumbnail = async (time: number): Promise<Thumbnail | null> => {
    return PlayerModule.getThumbnail(this.nativeId, time);
  };

  /**
   * Whether casting to a cast-compatible remote device is available. `CastAvailableEvent` signals when
   * casting becomes available.
   *
   * @platform iOS, Android
   */
  isCastAvailable = async (): Promise<boolean> => {
    return PlayerModule.isCastAvailable(this.nativeId);
  };

  /**
   * Whether video is currently being casted to a remote device and not played locally.
   *
   * @platform iOS, Android
   */
  isCasting = async (): Promise<boolean> => {
    return PlayerModule.isCasting(this.nativeId);
  };

  /**
   * Initiates casting the current video to a cast-compatible remote device. The user has to choose to which device it
   * should be sent.
   *
   * @platform iOS, Android
   */
  castVideo = () => {
    PlayerModule.castVideo(this.nativeId);
  };

  /**
   * Stops casting the current video. Has no effect if `isCasting` is false.
   *
   * @platform iOS, Android
   */
  castStop = () => {
    PlayerModule.castStop(this.nativeId);
  };
}
