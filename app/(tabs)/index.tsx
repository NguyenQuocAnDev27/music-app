import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Song } from '@/constants/Interfaces';
import { Audio } from 'expo-av';
import { formatDuration } from '@/utilities/formatHelper';

export default function HomeScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const themeColors = isDarkMode ? Colors.dark : Colors.light;

  // Setup Track Player
  // const setupPlayer = async () => {
  //   try {
  //     await TrackPlayer.setupPlayer();
  //     await TrackPlayer.updateOptions({
  //       capabilities: [
  //         Capability.Play,
  //         Capability.Pause,
  //         Capability.SkipToNext,
  //         Capability.SkipToPrevious,
  //       ],
  //     });
  //   } catch (error) {
  //     console.error('Error setting up Track Player:', error);
  //   }
  // };

  // Request permissions and initialize on mount
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access media library was denied');
      }
      // await setupPlayer();
      await loadSongs();
    })();
  }, []);

  // Helper to get duration and size of a file
  const getFileMetadata = async (uri: string) => {
    const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
    let duration: number | undefined;

    if (fileInfo.exists) {
      const soundObject = new Audio.Sound();
      try {
        await soundObject.loadAsync({ uri }, {}, false);
        const status = await soundObject.getStatusAsync();
        if (status.isLoaded) {
          duration = status.durationMillis ? status.durationMillis / 1000 : undefined;
        }
      } catch (error) {
        console.log(`Error getting duration for ${uri}:`, error);
      } finally {
        await soundObject.unloadAsync();
      }
    }

    return { duration, size: fileInfo.exists ? fileInfo.size : undefined };
  };

  // Load songs from the app’s directory
  const loadSongs = async () => {
    try {
      const musicDir = FileSystem.documentDirectory + 'music/';
      await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true });
      const files = await FileSystem.readDirectoryAsync(musicDir);

      const songObjects = await Promise.all(
        files
          .filter((file) => file.endsWith('.mp3'))
          .map(async (file) => {
            const uri = musicDir + file;
            const { duration, size } = await getFileMetadata(uri);

            return {
              id: uri, // Unique identifier
              url: uri, // Required by Track Player
              title: file,
              artist: 'Unknown Artist',
              duration,
              size,
            } as Song;
          })
      );

      setSongs(songObjects);
      // await TrackPlayer.add(songObjects);
    } catch (error) {
      console.log('Error loading songs:', error);
    }
  };

  // Refresh the song list
  const onRefresh = async () => {
    setRefreshing(true);
    await loadSongs();
    setRefreshing(false);
  };

  // Add picked MP3 files to the app
  const pickAndCopyMp3 = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/mpeg',
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      const musicDir = FileSystem.documentDirectory + 'music/';
      await FileSystem.makeDirectoryAsync(musicDir, { intermediates: true });

      const newTracks: Song[] = [];
      for (const fileObj of result.assets) {
        const sourceUri = fileObj.uri;
        const fileName = fileObj.name || `song_${Date.now()}.mp3`;
        const destUri = musicDir + fileName;

        await FileSystem.copyAsync({ from: sourceUri, to: destUri });
        const { duration, size } = await getFileMetadata(destUri);

        newTracks.push({
          id: destUri,
          url: destUri,
          title: fileName,
          artist: 'Unknown Artist',
          duration,
          size,
        } as Song);
      }

      setSongs((prevSongs) => [...prevSongs, ...newTracks]);
      // await TrackPlayer.add(newTracks);
    } catch (error) {
      console.log('Error picking/copying file:', error);
    }
  };

  // Play selected track
  const playTrack = async (track: Song) => {
    try {
      // await TrackPlayer.skip(track.id);
      // await TrackPlayer.play();
    } catch (error) {
      console.log('Error playing track:', error);
    }
  };

  // Render song item
  const renderSongItem = ({ item }: { item: Song }) => (
    <View style={[styles.songItem, { borderBottomColor: themeColors.border }]}>
      <TouchableOpacity onPress={() => playTrack(item)}>
        <Text style={[styles.songText, { color: themeColors.text }]}>
          {item.title}
        </Text>
        <Text style={[styles.songText, { fontSize: 12, color: themeColors.text }]}>
          Duration: {item.duration ? formatDuration(item.duration * 1000) : 'Unknown'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.header, { color: themeColors.text }]}>My Songs</Text>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={renderSongItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.text}
          />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: themeColors.text }]}>
            No songs found. Try adding some!
          </Text>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: themeColors.accent }]}
        onPress={pickAndCopyMp3}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 16 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  songItem: { borderBottomWidth: 1, paddingVertical: 8 },
  songText: { fontSize: 16 },
  emptyText: { fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  fabIcon: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
});
