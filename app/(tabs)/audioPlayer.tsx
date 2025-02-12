import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const AudioPlayerScreen: React.FC = (): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const duration: number = 180; // Example duration in seconds (3 minutes)

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const togglePlayPause = (): void => {
    setIsPlaying((prev) => !prev);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background },
      ]}
    >
      {/* Track Name */}
      <Text style={[styles.trackTitle, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
        Track Name
      </Text>

      {/* Progress Bar */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={duration}
        value={currentTime}
        onValueChange={(value: number) => setCurrentTime(value)}
        minimumTrackTintColor={isDarkMode ? Colors.dark.accent : Colors.light.accent}
        maximumTrackTintColor={isDarkMode ? Colors.dark.border : Colors.light.border}
        thumbTintColor={isDarkMode ? Colors.dark.accent : Colors.light.accent}
      />

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
          {formatTime(currentTime)}
        </Text>
        <Text style={[styles.timeText, { color: isDarkMode ? Colors.dark.text : Colors.light.text }]}>
          {formatTime(duration)}
        </Text>
      </View>

      {/* Play / Pause Button */}
      <TouchableOpacity
        style={[
          styles.playPauseButton,
          { backgroundColor: isDarkMode ? Colors.dark.accent : Colors.light.accent },
        ]}
        onPress={togglePlayPause}
      >
        <Text style={styles.playPauseButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  trackTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeText: {
    fontSize: 14,
  },
  playPauseButton: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  playPauseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AudioPlayerScreen;
