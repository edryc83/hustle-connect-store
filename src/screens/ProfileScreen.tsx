import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Star,
  Package,
  Eye,
  MessageCircle,
  Settings,
  Camera,
  Shield,
  Trash2,
  ChevronRight,
} from 'lucide-react-native';
import type { MainTabScreenProps } from '../types/navigation';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
  primary: '#F97316',
  primaryLight: '#FFEDD5',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  whatsapp: '#25D366',
  danger: '#EF4444',
};

// Sample profile data
const SAMPLE_PROFILE = {
  name: 'Sarah Namuli',
  businessName: 'Namuli Crafts',
  location: 'Kampala, Uganda',
  phone: '+256 700 123456',
  email: 'sarah@namulicrafts.com',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  bio: 'Handmade jewelry and crafts from Uganda. Quality products with love.',
  stats: {
    products: 12,
    views: 1234,
    followers: 89,
  },
};

// Sample products
const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Handmade Jewelry Set',
    price: 45000,
    currency: 'UGX',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
    featured: true,
  },
  {
    id: '2',
    name: 'African Print Dress',
    price: 85000,
    currency: 'UGX',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=300',
    featured: false,
  },
];

type Product = typeof SAMPLE_PRODUCTS[0];

export default function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const [profile] = useState(SAMPLE_PROFILE);
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleEditProduct = () => {
    setModalVisible(false);
    if (selectedProduct) {
      Alert.alert('Edit Product', `Editing: ${selectedProduct.name}`);
    }
  };

  const handleShareToWhatsAppStatus = async () => {
    if (!selectedProduct) return;

    const message = `🛍️ *${selectedProduct.name}*\n\n💰 Price: ${formatPrice(selectedProduct.price, selectedProduct.currency)}\n\n📲 Contact me to order!\n\n#HustleConnect #AfriStall`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        setModalVisible(false);
      } else {
        Alert.alert(
          'WhatsApp Not Installed',
          'Please install WhatsApp to share products to your status.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open WhatsApp. Please try again.');
    }
  };

  const handlePrivacyPolicy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleDeleteAccount = () => {
    navigation.navigate('DeleteAccount');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      {item.featured && (
        <View style={styles.featuredBadge}>
          <Star color="#FFFFFF" size={12} fill="#FFFFFF" />
        </View>
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {formatPrice(item.price, item.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[COLORS.primary, '#EA580C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity style={styles.editProfileBtn}>
            <Edit3 color="#FFFFFF" size={20} />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.cameraBtn}>
              <Camera color="#FFFFFF" size={16} />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.businessName}>{profile.businessName}</Text>

          <View style={styles.locationRow}>
            <MapPin color="rgba(255,255,255,0.8)" size={14} />
            <Text style={styles.locationText}>{profile.location}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Package color={COLORS.primary} size={20} />
            <Text style={styles.statNumber}>{profile.stats.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Eye color={COLORS.primary} size={20} />
            <Text style={styles.statNumber}>{profile.stats.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <User color={COLORS.primary} size={20} />
            <Text style={styles.statNumber}>{profile.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{profile.bio}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <Phone color={COLORS.textSecondary} size={18} />
            <Text style={styles.contactText}>{profile.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Mail color={COLORS.textSecondary} size={18} />
            <Text style={styles.contactText}>{profile.email}</Text>
          </View>
        </View>

        {/* My Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productsScroll}
          />
        </View>

        {/* Account & Privacy Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account & Privacy</Text>

          <TouchableOpacity style={styles.accountItem} onPress={handlePrivacyPolicy}>
            <View style={styles.accountItemLeft}>
              <View style={[styles.accountIconContainer, { backgroundColor: '#EFF6FF' }]}>
                <Shield color="#3B82F6" size={20} />
              </View>
              <View style={styles.accountItemContent}>
                <Text style={styles.accountItemTitle}>Privacy & Data Policy</Text>
                <Text style={styles.accountItemDescription}>How we handle your data</Text>
              </View>
            </View>
            <ChevronRight color={COLORS.textSecondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.accountItem} onPress={handleDeleteAccount}>
            <View style={styles.accountItemLeft}>
              <View style={[styles.accountIconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Trash2 color={COLORS.danger} size={20} />
              </View>
              <View style={styles.accountItemContent}>
                <Text style={[styles.accountItemTitle, { color: COLORS.danger }]}>
                  Delete Account
                </Text>
                <Text style={styles.accountItemDescription}>
                  Permanently delete your account and data
                </Text>
              </View>
            </View>
            <ChevronRight color={COLORS.danger} size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Product Actions Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHandle} />
            </View>

            {selectedProduct && (
              <>
                <View style={styles.modalProductInfo}>
                  <Image
                    source={{ uri: selectedProduct.image }}
                    style={styles.modalProductImage}
                  />
                  <View style={styles.modalProductDetails}>
                    <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                    <Text style={styles.modalProductPrice}>
                      {formatPrice(selectedProduct.price, selectedProduct.currency)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleEditProduct}
                  >
                    <View style={[styles.modalActionIcon, { backgroundColor: COLORS.primaryLight }]}>
                      <Edit3 color={COLORS.primary} size={24} />
                    </View>
                    <Text style={styles.modalActionText}>Edit Product</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleShareToWhatsAppStatus}
                  >
                    <View style={[styles.modalActionIcon, { backgroundColor: '#DCFCE7' }]}>
                      <MessageCircle color={COLORS.whatsapp} size={24} />
                    </View>
                    <Text style={styles.modalActionText}>Share to WhatsApp Status</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  editProfileBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
  },
  businessName: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    padding: 20,
    paddingBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 15,
    color: COLORS.text,
  },
  productsScroll: {
    gap: 12,
    paddingBottom: 20,
  },
  productCard: {
    width: 160,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 4,
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  modalProductInfo: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalProductImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  modalProductDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  modalProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  modalActions: {
    padding: 16,
    gap: 12,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    gap: 16,
  },
  modalActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    marginHorizontal: 16,
    padding: 16,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  // Account & Privacy Section styles
  accountSection: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  accountItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accountIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  accountItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  accountItemDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
