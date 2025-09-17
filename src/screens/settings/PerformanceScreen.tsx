// Performance Monitoring Screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { RootState } from '../../store';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants';
import PerformanceService, { 
  PerformanceMetrics, 
  PerformanceReport, 
  OptimizationStrategy 
} from '../../services/performanceService';

const { width } = Dimensions.get('window');

export default function PerformanceScreen() {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [performanceService] = useState(() => PerformanceService.getInstance());
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [strategies, setStrategies] = useState<OptimizationStrategy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'metrics' | 'reports' | 'optimization'>('overview');

  useEffect(() => {
    if (currentUser) {
      loadPerformanceData();
    }
  }, [currentUser]);

  const loadPerformanceData = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      await performanceService.initialize(currentUser);
      
      const [currentMetrics, history, optimizationStrategies] = await Promise.all([
        performanceService.getCurrentMetrics(),
        performanceService.getPerformanceHistory(),
        performanceService.getOptimizationStrategies(),
      ]);
      
      setMetrics(currentMetrics);
      setReports(history);
      setStrategies(optimizationStrategies);
    } catch (error) {
      console.error('Error loading performance data:', error);
      Alert.alert('Error', 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunPerformanceTests = async () => {
    try {
      setIsRunningTests(true);
      const report = await performanceService.runPerformanceTests();
      setReports(prev => [...prev, report]);
      setMetrics(report.metrics);
      
      Alert.alert(
        'Performance Tests Completed',
        `Overall Score: ${report.overallScore}/100\n\nViolations: ${report.violations.length}\nRecommendations: ${report.recommendations.length}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error running performance tests:', error);
      Alert.alert('Error', 'Failed to run performance tests');
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleOptimizationStrategy = async (strategy: OptimizationStrategy) => {
    try {
      await strategy.implementation();
      Alert.alert('Success', `Optimization strategy "${strategy.name}" applied successfully`);
    } catch (error) {
      console.error('Error applying optimization strategy:', error);
      Alert.alert('Error', 'Failed to apply optimization strategy');
    }
  };

  const getMetricColor = (metric: keyof PerformanceMetrics, value: number): string => {
    const thresholds = {
      launchTime: 3000,
      navigationTime: 500,
      audioLatency: 200,
      animationFPS: 60,
      memoryUsage: 100,
      cpuUsage: 80,
      batteryUsage: 5,
      networkLatency: 1000,
    };

    const threshold = thresholds[metric];
    if (metric === 'animationFPS') {
      return value >= threshold ? COLORS.SUCCESS : value >= threshold * 0.8 ? COLORS.WARNING : COLORS.ERROR;
    }
    return value <= threshold ? COLORS.SUCCESS : value <= threshold * 1.2 ? COLORS.WARNING : COLORS.ERROR;
  };

  const getMetricStatus = (metric: keyof PerformanceMetrics, value: number): string => {
    const thresholds = {
      launchTime: 3000,
      navigationTime: 500,
      audioLatency: 200,
      animationFPS: 60,
      memoryUsage: 100,
      cpuUsage: 80,
      batteryUsage: 5,
      networkLatency: 1000,
    };

    const threshold = thresholds[metric];
    if (metric === 'animationFPS') {
      return value >= threshold ? 'Excellent' : value >= threshold * 0.8 ? 'Good' : 'Needs Improvement';
    }
    return value <= threshold ? 'Excellent' : value <= threshold * 1.2 ? 'Good' : 'Needs Improvement';
  };

  const renderOverview = () => {
    if (!metrics) return null;

    const overallScore = reports.length > 0 ? reports[reports.length - 1].overallScore : 0;
    const violations = reports.length > 0 ? reports[reports.length - 1].violations.length : 0;

    return (
      <View style={styles.overviewContainer}>
        {/* Overall Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Overall Performance Score</Text>
          <View style={styles.scoreContainer}>
            <Text style={[
              styles.scoreValue,
              { color: overallScore >= 80 ? COLORS.SUCCESS : overallScore >= 60 ? COLORS.WARNING : COLORS.ERROR }
            ]}>
              {overallScore}
            </Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <Text style={styles.scoreDescription}>
            {overallScore >= 80 ? 'Excellent Performance' : 
             overallScore >= 60 ? 'Good Performance' : 'Needs Improvement'}
          </Text>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="rocket" size={24} color={getMetricColor('launchTime', metrics.launchTime)} />
            <Text style={styles.metricValue}>{metrics.launchTime.toFixed(0)}ms</Text>
            <Text style={styles.metricLabel}>Launch Time</Text>
            <Text style={styles.metricStatus}>{getMetricStatus('launchTime', metrics.launchTime)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="navigate" size={24} color={getMetricColor('navigationTime', metrics.navigationTime)} />
            <Text style={styles.metricValue}>{metrics.navigationTime.toFixed(0)}ms</Text>
            <Text style={styles.metricLabel}>Navigation</Text>
            <Text style={styles.metricStatus}>{getMetricStatus('navigationTime', metrics.navigationTime)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="volume-high" size={24} color={getMetricColor('audioLatency', metrics.audioLatency)} />
            <Text style={styles.metricValue}>{metrics.audioLatency.toFixed(0)}ms</Text>
            <Text style={styles.metricLabel}>Audio Latency</Text>
            <Text style={styles.metricStatus}>{getMetricStatus('audioLatency', metrics.audioLatency)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="play" size={24} color={getMetricColor('animationFPS', metrics.animationFPS)} />
            <Text style={styles.metricValue}>{metrics.animationFPS.toFixed(0)} FPS</Text>
            <Text style={styles.metricLabel}>Animations</Text>
            <Text style={styles.metricStatus}>{getMetricStatus('animationFPS', metrics.animationFPS)}</Text>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Performance Summary</Text>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.SUCCESS} />
            <Text style={styles.summaryText}>
              {violations === 0 ? 'No performance violations detected' : `${violations} performance violations found`}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="trending-up" size={20} color={COLORS.INFO} />
            <Text style={styles.summaryText}>
              {reports.length} performance reports generated
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="settings" size={20} color={COLORS.WARNING} />
            <Text style={styles.summaryText}>
              {strategies.length} optimization strategies available
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.testButton]}
            onPress={handleRunPerformanceTests}
            disabled={isRunningTests}
          >
            {isRunningTests ? (
              <ActivityIndicator size="small" color={COLORS.SURFACE} />
            ) : (
              <Ionicons name="play" size={20} color={COLORS.SURFACE} />
            )}
            <Text style={styles.actionButtonText}>
              {isRunningTests ? 'Running Tests...' : 'Run Performance Tests'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMetrics = () => {
    if (!metrics) return null;

    const metricItems = [
      { key: 'launchTime', label: 'Launch Time', value: `${metrics.launchTime.toFixed(0)}ms`, threshold: '3000ms', icon: 'rocket' },
      { key: 'navigationTime', label: 'Navigation Time', value: `${metrics.navigationTime.toFixed(0)}ms`, threshold: '500ms', icon: 'navigate' },
      { key: 'audioLatency', label: 'Audio Latency', value: `${metrics.audioLatency.toFixed(0)}ms`, threshold: '200ms', icon: 'volume-high' },
      { key: 'animationFPS', label: 'Animation FPS', value: `${metrics.animationFPS.toFixed(0)} FPS`, threshold: '60 FPS', icon: 'play' },
      { key: 'memoryUsage', label: 'Memory Usage', value: `${metrics.memoryUsage.toFixed(0)}MB`, threshold: '100MB', icon: 'hardware-chip' },
      { key: 'cpuUsage', label: 'CPU Usage', value: `${metrics.cpuUsage.toFixed(0)}%`, threshold: '80%', icon: 'speedometer' },
      { key: 'batteryUsage', label: 'Battery Usage', value: `${metrics.batteryUsage.toFixed(0)}%`, threshold: '5%', icon: 'battery-half' },
      { key: 'networkLatency', label: 'Network Latency', value: `${metrics.networkLatency.toFixed(0)}ms`, threshold: '1000ms', icon: 'globe' },
    ];

    return (
      <View style={styles.metricsContainer}>
        {metricItems.map((item) => (
          <View key={item.key} style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <View style={styles.metricInfo}>
                <Ionicons name={item.icon as any} size={24} color={getMetricColor(item.key as keyof PerformanceMetrics, metrics[item.key as keyof PerformanceMetrics])} />
                <View style={styles.metricDetails}>
                  <Text style={styles.metricName}>{item.label}</Text>
                  <Text style={styles.metricThreshold}>Threshold: {item.threshold}</Text>
                </View>
              </View>
              <View style={styles.metricValueContainer}>
                <Text style={[
                  styles.metricValueText,
                  { color: getMetricColor(item.key as keyof PerformanceMetrics, metrics[item.key as keyof PerformanceMetrics]) }
                ]}>
                  {item.value}
                </Text>
                <Text style={styles.metricStatusText}>
                  {getMetricStatus(item.key as keyof PerformanceMetrics, metrics[item.key as keyof PerformanceMetrics])}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderReports = () => {
    return (
      <View style={styles.reportsContainer}>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={COLORS.TEXT_SECONDARY} />
            <Text style={styles.emptyStateTitle}>No Performance Reports</Text>
            <Text style={styles.emptyStateText}>
              Run performance tests to generate reports and track performance over time.
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleRunPerformanceTests}>
              <Text style={styles.emptyStateButtonText}>Run Performance Tests</Text>
            </TouchableOpacity>
          </View>
        ) : (
          reports.slice().reverse().map((report, index) => (
            <View key={index} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportDate}>
                  {report.timestamp.toLocaleDateString()} {report.timestamp.toLocaleTimeString()}
                </Text>
                <View style={[
                  styles.reportScore,
                  { backgroundColor: report.overallScore >= 80 ? COLORS.SUCCESS : 
                                   report.overallScore >= 60 ? COLORS.WARNING : COLORS.ERROR }
                ]}>
                  <Text style={styles.reportScoreText}>{report.overallScore}</Text>
                </View>
              </View>
              
              <View style={styles.reportMetrics}>
                <Text style={styles.reportMetricsTitle}>Key Metrics:</Text>
                <Text style={styles.reportMetricsText}>
                  Launch: {report.metrics.launchTime.toFixed(0)}ms | 
                  Navigation: {report.metrics.navigationTime.toFixed(0)}ms | 
                  Audio: {report.metrics.audioLatency.toFixed(0)}ms | 
                  FPS: {report.metrics.animationFPS.toFixed(0)}
                </Text>
              </View>

              {report.violations.length > 0 && (
                <View style={styles.reportViolations}>
                  <Text style={styles.reportViolationsTitle}>Violations ({report.violations.length}):</Text>
                  {report.violations.slice(0, 3).map((violation, vIndex) => (
                    <Text key={vIndex} style={styles.reportViolationText}>
                      • {violation.description}
                    </Text>
                  ))}
                  {report.violations.length > 3 && (
                    <Text style={styles.reportViolationText}>
                      • ... and {report.violations.length - 3} more
                    </Text>
                  )}
                </View>
              )}

              {report.recommendations.length > 0 && (
                <View style={styles.reportRecommendations}>
                  <Text style={styles.reportRecommendationsTitle}>Recommendations:</Text>
                  {report.recommendations.slice(0, 2).map((recommendation, rIndex) => (
                    <Text key={rIndex} style={styles.reportRecommendationText}>
                      • {recommendation}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  const renderOptimization = () => {
    return (
      <View style={styles.optimizationContainer}>
        <Text style={styles.sectionTitle}>Optimization Strategies</Text>
        
        {strategies.map((strategy) => (
          <View key={strategy.id} style={styles.strategyCard}>
            <View style={styles.strategyHeader}>
              <View style={styles.strategyInfo}>
                <Text style={styles.strategyName}>{strategy.name}</Text>
                <Text style={styles.strategyDescription}>{strategy.description}</Text>
              </View>
              <View style={[
                styles.strategyPriority,
                { backgroundColor: strategy.priority === 'critical' ? COLORS.ERROR : 
                                 strategy.priority === 'high' ? COLORS.WARNING : 
                                 strategy.priority === 'medium' ? COLORS.INFO : COLORS.SUCCESS }
              ]}>
                <Text style={styles.strategyPriorityText}>{strategy.priority}</Text>
              </View>
            </View>

            <View style={styles.strategyDetails}>
              <View style={styles.strategyDetail}>
                <Ionicons name="trending-up" size={16} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.strategyDetailText}>
                  Estimated Impact: {strategy.estimatedImpact}%
                </Text>
              </View>
              <View style={styles.strategyDetail}>
                <Ionicons name="flag" size={16} color={COLORS.TEXT_SECONDARY} />
                <Text style={styles.strategyDetailText}>
                  Targets: {strategy.targetMetrics.join(', ')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.strategyButton}
              onPress={() => handleOptimizationStrategy(strategy)}
            >
              <Ionicons name="play" size={16} color={COLORS.PRIMARY} />
              <Text style={styles.strategyButtonText}>Apply Strategy</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'metrics':
        return renderMetrics();
      case 'reports':
        return renderReports();
      case 'optimization':
        return renderOptimization();
      default:
        return renderOverview();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading performance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'overview', label: 'Overview', icon: 'home' },
          { key: 'metrics', label: 'Metrics', icon: 'speedometer' },
          { key: 'reports', label: 'Reports', icon: 'document-text' },
          { key: 'optimization', label: 'Optimization', icon: 'settings' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              selectedTab === tab.key && styles.tabButtonSelected
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={selectedTab === tab.key ? COLORS.SURFACE : COLORS.TEXT_SECONDARY} 
            />
            <Text style={[
              styles.tabButtonText,
              selectedTab === tab.key && styles.tabButtonTextSelected
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.MD,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.SM,
    gap: SPACING.XS,
  },
  tabButtonSelected: {
    backgroundColor: COLORS.PRIMARY,
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
  tabButtonTextSelected: {
    color: COLORS.SURFACE,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.MD,
  },
  overviewContainer: {
    gap: SPACING.LG,
  },
  scoreCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.LG,
    alignItems: 'center',
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.SM,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  scoreMax: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.XS,
  },
  scoreDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.SM,
  },
  metricCard: {
    width: (width - SPACING.MD * 3) / 2,
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    alignItems: 'center',
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.SM,
  },
  metricLabel: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  metricStatus: {
    fontSize: TYPOGRAPHY.FONT_SIZES.XS,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.XS,
  },
  summaryCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  summaryText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    gap: SPACING.MD,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderRadius: BORDER_RADIUS.MD,
    gap: SPACING.SM,
  },
  testButton: {
    backgroundColor: COLORS.PRIMARY,
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  metricsContainer: {
    gap: SPACING.MD,
  },
  metricItem: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    flex: 1,
  },
  metricDetails: {
    flex: 1,
  },
  metricName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  metricThreshold: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  metricValueContainer: {
    alignItems: 'flex-end',
  },
  metricValueText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
  },
  metricStatusText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  reportsContainer: {
    gap: SPACING.MD,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.XL,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.MD,
    marginBottom: SPACING.SM,
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: SPACING.LG,
  },
  emptyStateButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  emptyStateButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  reportCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SM,
  },
  reportDate: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  reportScore: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  reportScoreText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  reportMetrics: {
    marginBottom: SPACING.SM,
  },
  reportMetricsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  reportMetricsText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  reportViolations: {
    marginBottom: SPACING.SM,
  },
  reportViolationsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.ERROR,
    marginBottom: SPACING.XS,
  },
  reportViolationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  reportRecommendations: {
    marginBottom: SPACING.SM,
  },
  reportRecommendationsTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.INFO,
    marginBottom: SPACING.XS,
  },
  reportRecommendationText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  optimizationContainer: {
    gap: SPACING.MD,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MD,
  },
  strategyCard: {
    backgroundColor: COLORS.SURFACE,
    borderRadius: BORDER_RADIUS.MD,
    padding: SPACING.MD,
    shadowColor: COLORS.TEXT_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.SM,
  },
  strategyInfo: {
    flex: 1,
    marginRight: SPACING.SM,
  },
  strategyName: {
    fontSize: TYPOGRAPHY.FONT_SIZES.LARGE,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.XS,
  },
  strategyDescription: {
    fontSize: TYPOGRAPHY.FONT_SIZES.MEDIUM,
    color: COLORS.TEXT_SECONDARY,
  },
  strategyPriority: {
    paddingHorizontal: SPACING.SM,
    paddingVertical: SPACING.XS,
    borderRadius: BORDER_RADIUS.SM,
  },
  strategyPriorityText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.BOLD,
    color: COLORS.SURFACE,
  },
  strategyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SM,
  },
  strategyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XS,
  },
  strategyDetailText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  strategyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.SM,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
    gap: SPACING.XS,
  },
  strategyButtonText: {
    fontSize: TYPOGRAPHY.FONT_SIZES.SMALL,
    color: COLORS.PRIMARY,
    fontWeight: TYPOGRAPHY.FONT_WEIGHTS.MEDIUM,
  },
});
