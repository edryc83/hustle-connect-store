import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Shield,
  Trash2,
  Package,
  TrendingUp,
  Users,
  ChevronRight,
} from 'lucide-react-native';
import type { MainTabScreenProps } from '../types/navigation';

const COLORS = {
  primary: '#F97316',
  primaryLight: '#FFEDD5',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
};

export default function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primary, '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appName}>Hustle Connect</Text>
          <Text style={styles.tagline}>Your marketplace for local hustles</Text>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Package color={COLORS.primary} size={24} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp color={COLORS.primary} size={24} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statCard}>
            <Users color={COLORS.primary} size={24} />
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Products')}
          >
            <View style={styles.actionIcon}>
              <Package color={COLORS.primary} size={24} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Browse Products</Text>
              <Text style={styles.actionDescription}>View and manage your product listings</Text>
            </View>
            <ChevronRight color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Legal & Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal & Account</Text>

          <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Shield color="#3B82F6" size={20} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Privacy & Data Policy</Text>
              <Text style={styles.menuDescription}>Learn how we protect your data</Text>
            </View>
            <ChevronRight color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleDeleteAccount}>
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Trash2 color={COLORS.danger} size={20} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Delete Account</Text>
              <Text style={styles.menuDescription}>Request to delete your account and data</Text>
            </View>
            <ChevronRight color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Hustle Connect v1.0.0</Text>
          <Text style={styles.copyright}>© 2026 Afristall. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginHorizontal: 16,
  },
  appVersion: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  copyright: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
