// Add Custom Symbol Screen

import React, { useState } from 'react';
import { getThemeColors } from '../../utils/themeUtils';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RootState } from '../../store';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import SymbolDataService from '../../services/symbolDataService';
import CloudStorageService from '../../services/cloudStorageService';
import AudioService from '../../services/audioService';

interface AddCustomSymbolScreenProps {
  navigation: any;
}

export default function AddCustomSymbolScreen({
  navigation,
}: AddCustomSymbolScreenProps) {
  const { theme } = useVisualSettings();
  const safeTheme = theme || 'light'; // Ensure theme is never undefined
  const themeColors = getThemeColors(safeTheme);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [symbolName, setSymbolName] = useState('');
  const [symbolCategory, setSymbolCategory] = useState('Custom');
  const [keywords, setKeywords] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Custom',
    'Food & Drink',
    'Activities',
    'People',
    'Places',
    'Objects',
    'Emotions',
    'Actions',
    'Body',
    'Animals',
    'Colors',
    'Time',
    'Transportation',
    'Shapes',
    'School',
    'Home',
    'Other',
  ];

  const requestImagePermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to add custom symbols.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your camera to take photos for custom symbols.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const testTTS = async () => {
    if (!symbolName.trim()) {
      Alert.alert('Test TTS', 'Please enter a symbol name first');
      return;
    }

    try {
      await AudioService.speak(symbolName, {
        ttsVoice: undefined,
        ttsSpeed: 1.0,
        ttsPitch: 1.0,
        volume: 0.8,
        autoRepeat: false,
        repeatDelay: 2000,
      });
    } catch (error) {
      console.error('Error testing TTS:', error);
      Alert.alert('Error', 'Failed to test text-to-speech');
    }
  };

  const saveSymbol = async () => {
    if (!symbolName.trim()) {
      Alert.alert('Error', 'Please enter a symbol name');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image for your symbol');
      return;
    }

    setIsLoading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `custom-symbol-${timestamp}.jpg`;

      // Upload image to cloud storage
      const cloudStorageService = CloudStorageService.getInstance();
      let imageUrl = selectedImage; // Default to local URI

      if (cloudStorageService.isCloudStorageAvailable()) {
        console.log('Uploading image to cloud storage...');
        const uploadedUrl = await cloudStorageService.uploadImage(
          selectedImage,
          fileName
        );
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log('Image uploaded successfully to cloud storage');
        }
      } else {
        console.log('Cloud storage not available, using local storage');
      }

      // Create the custom symbol
      const customSymbol = {
        id: `custom-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        name: symbolName.trim(),
        category: symbolCategory,
        image: imageUrl, // Use cloud URL or local URI
        keywords: keywords
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
        isBuiltIn: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to SymbolDataService
      await SymbolDataService.getInstance().addCustomSymbol(customSymbol);

      // Clear the form
      setSymbolName('');
      setSymbolCategory('Custom');
      setKeywords('');
      setSelectedImage(null);

      Alert.alert(
        'Success!',
        `Custom symbol "${symbolName}" has been added successfully!${cloudStorageService.isCloudStorageAvailable() ? ' (Cloudinary synced)' : ' (Local only)'}`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              // Form is already cleared, user can add another symbol
            },
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving custom symbol:', error);
      Alert.alert('Error', 'Failed to save custom symbol');
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image for your symbol',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={24} color={themeColors.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Custom Symbol</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbol Image</Text>
            <TouchableOpacity
              style={styles.imageContainer}
              onPress={showImageOptions}
              accessible={true}
              accessibilityLabel="Select image for symbol"
              accessibilityRole="button"
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons
                    name="camera"
                    size={48}
                    color={themeColors.textSecondary}
                  />
                  <Text style={styles.imagePlaceholderText}>
                    Tap to add image
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Symbol Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbol Name *</Text>
            <TextInput
              style={styles.textInput}
              value={symbolName}
              onChangeText={setSymbolName}
              placeholder="e.g., Gerber Garden Tomato Crunchies"
              placeholderTextColor={themeColors.textSecondary}
              accessible={true}
              accessibilityLabel="Symbol name input"
            />
            <TouchableOpacity
              style={styles.testTTSButton}
              onPress={testTTS}
              accessible={true}
              accessibilityLabel="Test text-to-speech"
              accessibilityRole="button"
            >
              <Ionicons
                name="volume-high"
                size={20}
                color={themeColors.primary}
              />
              <Text style={styles.testTTSText}>Test TTS</Text>
            </TouchableOpacity>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScrollView}
            >
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    symbolCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSymbolCategory(category)}
                  accessible={true}
                  accessibilityLabel={`${category} category`}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      symbolCategory === category &&
                        styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Keywords */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keywords (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={keywords}
              onChangeText={setKeywords}
              placeholder="e.g., snack, food, tomato, crunchies"
              placeholderTextColor={themeColors.textSecondary}
              multiline
              accessible={true}
              accessibilityLabel="Keywords input"
            />
            <Text style={styles.helpText}>
              Separate keywords with commas. These help with searching.
            </Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!symbolName.trim() || !selectedImage || isLoading) &&
                styles.saveButtonDisabled,
            ]}
            onPress={saveSymbol}
            disabled={!symbolName.trim() || !selectedImage || isLoading}
            accessible={true}
            accessibilityLabel="Save custom symbol"
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save Symbol'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: themeColors.primary,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.TITLE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.LG,
  },
  section: {
    marginVertical: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.text_PRIMARY,
    marginBottom: SPACING.SM,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS.MD,
    backgroundColor: themeColors.surface,
    borderWidth: 2,
    borderColor: themeColors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS.MD,
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    borderRadius: BORDER_RADIUS.SM,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: themeColors.text_PRIMARY,
    minHeight: 48,
  },
  testTTSButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.SM,
    alignSelf: 'flex-start',
  },
  testTTSText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.primary,
    marginLeft: SPACING.XS,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  categoryScrollView: {
    marginTop: SPACING.SM,
  },
  categoryButton: {
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    marginRight: SPACING.SM,
    borderRadius: BORDER_RADIUS.SM,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  categoryButtonActive: {
    backgroundColor: themeColors.primary,
    borderColor: themeColors.primary,
  },
  categoryButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.text_PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  categoryButtonTextActive: {
    color: themeColors.surface,
  },
  helpText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: themeColors.textSecondary,
    marginTop: SPACING.XS,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
  },
  saveButton: {
    backgroundColor: themeColors.primary,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.SM,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: themeColors.textSecondary,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: themeColors.surface,
  },
});
