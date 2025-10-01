// Express Page Component - Sentence Building Mode
// Accumulates selected messages in a speech bar that play in sequence when tapped

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import CommunicationButton from './CommunicationButton';
import {
  CommunicationPage,
  CommunicationButton as CommunicationButtonType,
  ExpressSentence,
} from '../../types';
import { TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import { useVisualSettings } from '../../contexts/VisualSettingsContext';
import { getThemeColors } from '../../utils/themeUtils';
import AudioService from '../../services/audioService';

const getStyles = (themeColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
  },
  speechBar: {
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minHeight: 60,
    justifyContent: 'center',
  },
  speechBarText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: themeColors.text,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  speechBarEmpty: {
    color: themeColors.textSecondary,
    fontStyle: 'italic',
  },
  playButton: {
    backgroundColor: themeColors.primary,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.SM,
  },
  playButtonDisabled: {
    backgroundColor: themeColors.textSecondary,
  },
  clearButton: {
    backgroundColor: themeColors.error,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.XS,
  },
  gridContainer: {
    flex: 1,
    padding: SPACING.SM,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.SM,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: SPACING.XS,
    aspectRatio: 1,
  },
  navigationBar: {
    backgroundColor: themeColors.surface,
    borderTopWidth: 1,
    borderTopColor: themeColors.border,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: themeColors.primary,
    borderRadius: BORDER_RADIUS.MD,
    paddingHorizontal: SPACING.MD,
    paddingVertical: SPACING.SM,
    minWidth: 80,
    alignItems: 'center',
  },
  navButtonText: {
    color: themeColors.surface,
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  navButtonDisabled: {
    backgroundColor: themeColors.textSecondary,
  },
});

