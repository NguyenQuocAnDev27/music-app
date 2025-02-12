import { Track } from 'react-native-track-player';

export interface Song extends Track {
  size?: number; // Optional file size in bytes
  lastModified?: string; // Optional last modified date
}
