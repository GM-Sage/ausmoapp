// Visual Scene Page Component - Custom background images with invisible hotspots
// Hybrid Visual Scene pages allow deeper communication about scenes

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import {
  CommunicationPage,
  CommunicationButton as CommunicationButtonType,
  Hotspot,
} from '../../types';
import { TYPOGRAPHY, SPACING } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import AudioService from '../../services/audioService';

const { width, height } = Dimensions.get('window');

interface VisualScenePageProps {
  page: CommunicationPage;
  onButtonPress: (button: CommunicationButtonType) => void;
  onNavigateToPage?: (pageId: string) => void;
}

export default function VisualScenePage({
  page,
  onButtonPress,
  onNavigateToPage,
}: VisualScenePageProps) {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [showHotspots, setShowHotspots] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: themeColors.primary,
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.SM,
    },
    headerTitle: {
      fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
      color: themeColors.surface,
    },
    hotspotControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.SM,
    },
    controlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: themeColors.surface,
      paddingHorizontal: SPACING.SM,
      paddingVertical: SPACING.XS,
      borderRadius: 4,
      gap: SPACING.XS,
    },
    controlButtonActive: {
      backgroundColor: themeColors.primary,
    },
    controlButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.primary,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
    },
    controlButtonTextActive: {
      color: themeColors.surface,
    },
    sceneContainer: {
      flex: 1,
      position: 'relative',
    },
    backgroundImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    defaultBackground: {
      backgroundColor: themeColors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    defaultBackgroundText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
      color: themeColors.textSecondary,
      marginTop: SPACING.SM,
    },
    defaultBackgroundSubtext: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.textSecondary,
      marginTop: SPACING.XS,
    },
    hotspot: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'transparent',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    hotspotVisible: {
      borderColor: themeColors.primary,
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
    },
    hotspotSelected: {
      borderColor: themeColors.secondary,
      backgroundColor: 'rgba(76, 175, 80, 0.2)',
    },
    hotspotIndicator: {
      backgroundColor: themeColors.surface,
      borderRadius: 12,
      padding: 4,
      shadowColor: themeColors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    sceneButtonsContainer: {
      backgroundColor: themeColors.surface,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      paddingVertical: SPACING.SM,
    },
    sceneButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.SM,
    },
    sceneButton: {
      backgroundColor: themeColors.background,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 8,
      padding: SPACING.SM,
      margin: SPACING.XS,
      minWidth: 80,
      alignItems: 'center',
    },
    sceneButtonText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
      color: themeColors.text,
      textAlign: 'center',
      marginTop: SPACING.XS,
    },
    hotspotInfo: {
      position: 'absolute',
      bottom: SPACING.LG,
      left: SPACING.MD,
      right: SPACING.MD,
      backgroundColor: themeColors.surface,
      padding: SPACING.MD,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: themeColors.border,
      shadowColor: themeColors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    hotspotInfoText: {
      fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
      color: themeColors.text,
      textAlign: 'center',
    },
    sceneImageContainer: {
      flex: 1,
      position: 'relative',
    },
  });

  useEffect(() => {
    // Initialize hotspots from page data
    initializeHotspots();
  }, [page]);

  const initializeHotspots = () => {
    // Create sample hotspots for demonstration
    const sampleHotspots: Hotspot[] = [
      {
        id: 'hotspot-1',
        pageId: page.id,
        x: 100,
        y: 150,
        width: 80,
        height: 80,
        action: { type: 'speak', customAction: 'This is the kitchen area' },
        isVisible: true,
      },
      {
        id: 'hotspot-2',
        pageId: page.id,
        x: 200,
        y: 200,
        width: 80,
        height: 80,
        action: { type: 'speak', customAction: 'This is the living room' },
        isVisible: true,
      },
      {
        id: 'hotspot-3',
        pageId: page.id,
        x: 150,
        y: 300,
        width: 80,
        height: 80,
        action: { type: 'speak', customAction: 'This is the dining area' },
        isVisible: true,
      },
    ];
    setHotspots(sampleHotspots);
  };

  const handleHotspotPress = async (hotspot: Hotspot) => {
    try {
      console.log('Hotspot pressed:', hotspot.id, hotspot.action);

      if (hotspot.action.type === 'speak') {
        const message = hotspot.action.customAction || 'Hotspot activated';

        const voiceSettings = currentUser?.settings?.voiceSettings || {
          ttsVoice: undefined,
          ttsSpeed: 1.0,
          ttsPitch: 1.0,
          volume: 0.8,
          autoRepeat: false,
          repeatDelay: 2000,
        };

        await AudioService.speak(message, voiceSettings);
      } else if (hotspot.action.type === 'navigate') {
        if (hotspot.action.targetPageId && onNavigateToPage) {
          onNavigateToPage(hotspot.action.targetPageId);
        }
      }

      setSelectedHotspot(hotspot);

      // Hide hotspot selection after a delay
      setTimeout(() => {
        setSelectedHotspot(null);
      }, 2000);
    } catch (error) {
      console.error('Error handling hotspot press:', error);
      Alert.alert('Error', 'Failed to process hotspot action');
    }
  };

  const handleAddHotspot = () => {
    Alert.alert('Add Hotspot', 'Hotspot editing functionality coming soon');
  };

  const handleEditHotspot = (hotspotId: string) => {
    Alert.alert('Edit Hotspot', 'Hotspot editing functionality coming soon');
  };

  const handleDeleteHotspot = (hotspotId: string) => {
    Alert.alert(
      'Delete Hotspot',
      'Are you sure you want to delete this hotspot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setHotspots(prev => prev.filter(h => h.id !== hotspotId));
          },
        },
      ]
    );
  };

  const renderBackgroundImage = () => {
    if (page.backgroundImage) {
      return (
        <Image
          source={{ uri: page.backgroundImage }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      );
    }

    // Default background if no image is set
    return (
      <View style={[styles.backgroundImage, styles.defaultBackground]}>
        <Ionicons name="image" size={64} color={themeColors.textSecondary} />
        <Text style={styles.defaultBackgroundText}>No Background Image</Text>
        <Text style={styles.defaultBackgroundSubtext}>
          Tap + to add an image
        </Text>
      </View>
    );
  };

  const renderHotspots = () => {
    return hotspots.map(hotspot => (
      <TouchableOpacity
        key={hotspot.id}
        style={[
          styles.hotspot,
          {
            left: hotspot.x,
            top: hotspot.y,
            width: hotspot.width,
            height: hotspot.height,
          },
          showHotspots && styles.hotspotVisible,
          selectedHotspot?.id === hotspot.id && styles.hotspotSelected,
        ]}
        onPress={() => handleHotspotPress(hotspot)}
        onLongPress={() => handleEditHotspot(hotspot.id)}
      >
        {showHotspots && (
          <View style={styles.hotspotIndicator}>
            <Ionicons name="location" size={16} color={themeColors.primary} />
          </View>
        )}
      </TouchableOpacity>
    ));
  };

  const renderHotspotControls = () => {
    return (
      <View style={styles.hotspotControls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            showHotspots && styles.controlButtonActive,
          ]}
          onPress={() => setShowHotspots(!showHotspots)}
        >
          <Ionicons
            name="eye"
            size={20}
            color={showHotspots ? themeColors.surface : themeColors.primary}
          />
          <Text
            style={[
              styles.controlButtonText,
              showHotspots && styles.controlButtonTextActive,
            ]}
          >
            {showHotspots ? 'Hide' : 'Show'} Hotspots
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleAddHotspot}
        >
          <Ionicons name="add" size={20} color={themeColors.primary} />
          <Text style={styles.controlButtonText}>Add Hotspot</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSceneButtons = () => {
    // Render any additional buttons for the scene
    return page.buttons
      .filter(button => button.isVisible)
      .map((button, index) => (
        <TouchableOpacity
          key={`${button.id}-${index}`}
          style={[
            styles.sceneButton,
            {
              backgroundColor: button.backgroundColor,
              borderColor: button.borderColor,
            },
          ]}
          onPress={() => onButtonPress(button)}
        >
          <Text style={[styles.sceneButtonText, { color: button.textColor }]}>
            {button.text}
          </Text>
        </TouchableOpacity>
      ));
  };

  return (
    <View style={[styles.container, { backgroundColor: page.backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Visual Scene</Text>
        {renderHotspotControls()}
      </View>

      {/* Scene Container */}
      <View style={styles.sceneContainer}>
        <View style={styles.sceneImageContainer}>
          {renderBackgroundImage()}
          {renderHotspots()}
        </View>

        {/* Scene Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sceneButtonsContainer}
        >
          <View style={styles.sceneButtons}>{renderSceneButtons()}</View>
        </ScrollView>
      </View>

      {/* Hotspot Info */}
      {selectedHotspot && (
        <View style={styles.hotspotInfo}>
          <Text style={styles.hotspotInfoText}>
            {selectedHotspot.action.customAction || 'Hotspot activated'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
