import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Mail, ExternalLink } from 'lucide-react-native';
import type { RootStackScreenProps } from '../types/navigation';

const COLORS = {
  primary: '#F97316',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

export default function PrivacyPolicyScreen({ navigation }: RootStackScreenProps<'PrivacyPolicy'>) {
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@afristall.com');
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Shield color={COLORS.primary} size={40} />
          <Text style={styles.title}>Privacy & Data Policy</Text>
          <Text style={styles.subtitle}>Last updated: March 2026</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.sectionText}>
            We collect information you provide directly to us, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Account information (name, email, phone number)</Text>
            <Text style={styles.bulletItem}>• Profile information (business name, location, profile photo)</Text>
            <Text style={styles.bulletItem}>• Product listings (images, descriptions, prices)</Text>
            <Text style={styles.bulletItem}>• Transaction history and communications</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.sectionText}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletItem}>• Process transactions and send related information</Text>
            <Text style={styles.bulletItem}>• Send promotional communications (with your consent)</Text>
            <Text style={styles.bulletItem}>• Respond to your comments, questions, and requests</Text>
            <Text style={styles.bulletItem}>• Monitor and analyze trends, usage, and activities</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.sectionText}>
            We do not sell, trade, or rent your personal information to third parties. We may share
            your information only in the following circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• With your consent or at your direction</Text>
            <Text style={styles.bulletItem}>• With vendors and service providers who need access to perform services</Text>
            <Text style={styles.bulletItem}>• To comply with legal obligations</Text>
            <Text style={styles.bulletItem}>• To protect our rights, privacy, safety, or property</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.sectionText}>
            We take reasonable measures to help protect your personal information from loss, theft,
            misuse, unauthorized access, disclosure, alteration, and destruction. Your data is
            encrypted in transit and at rest using industry-standard encryption protocols.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Retention</Text>
          <Text style={styles.sectionText}>
            We retain your personal information for as long as your account is active or as needed
            to provide you services. You may request deletion of your account and associated data
            at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.sectionText}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Access your personal data</Text>
            <Text style={styles.bulletItem}>• Correct inaccurate data</Text>
            <Text style={styles.bulletItem}>• Request deletion of your data</Text>
            <Text style={styles.bulletItem}>• Object to data processing</Text>
            <Text style={styles.bulletItem}>• Data portability</Text>
            <Text style={styles.bulletItem}>• Withdraw consent at any time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our services are not directed to children under 13. We do not knowingly collect
            personal information from children under 13. If you believe we have collected
            information from a child under 13, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this privacy policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeleteAccount}>
            <Text style={styles.actionButtonText}>Request Account Deletion</Text>
            <ExternalLink color={COLORS.primary} size={18} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Mail color="#FFFFFF" size={20} />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.footerEmail}>support@afristall.com</Text>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: 8,
  },
  bulletItem: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 26,
    paddingLeft: 8,
  },
  actionsSection: {
    marginTop: 16,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerEmail: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
  },
});
