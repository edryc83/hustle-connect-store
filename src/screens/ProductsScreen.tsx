import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Linking,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Star,
  Copy,
  Share2,
  X,
  MessageCircle,
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
  success: '#10B981',
  danger: '#EF4444',
  whatsapp: '#25D366',
};

// Sample product data - in real app this would come from Supabase
const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Handmade Jewelry Set',
    price: 45000,
    currency: 'UGX',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300',
    description: 'Beautiful handcrafted jewelry set with earrings and necklace. Perfect for any occasion.',
    featured: true,
  },
  {
    id: '2',
    name: 'African Print Dress',
    price: 85000,
    currency: 'UGX',
    image: 'https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=300',
    description: 'Elegant African print dress made with quality Ankara fabric.',
    featured: false,
  },
  {
    id: '3',
    name: 'Leather Handbag',
    price: 120000,
    currency: 'UGX',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
    description: 'Genuine leather handbag with multiple compartments.',
    featured: true,
  },
];

type Product = typeof SAMPLE_PRODUCTS[0];

export default function ProductsScreen({ navigation }: MainTabScreenProps<'Products'>) {
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const handleProductPress = (product: Product) => {
    // Navigate to product detail screen where WhatsApp share is prominently displayed
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleQuickShare = async (product: Product) => {
    const message = `🛍️ *${product.name}*\n\n💰 Price: ${formatPrice(product.price, product.currency)}\n\n📝 ${product.description}\n\n📲 Contact me to order!\n\n#HustleConnect #AfriStall`;

    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`;

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
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

  const handleEditProduct = () => {
    setModalVisible(false);
    if (selectedProduct) {
      // Navigate to edit screen or show edit modal
      Alert.alert('Edit Product', `Editing: ${selectedProduct.name}`);
    }
  };

  const handleShareToWhatsAppStatus = async () => {
    if (!selectedProduct) return;

    const message = `🛍️ *${selectedProduct.name}*\n\n💰 Price: ${formatPrice(selectedProduct.price, selectedProduct.currency)}\n\n📝 ${selectedProduct.description}\n\n📲 Contact me to order!\n\n#HustleConnect #AfriStall`;

    // WhatsApp Status sharing - opens WhatsApp with the message
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

  const handleCopyLink = () => {
    if (selectedProduct) {
      // In real app, copy product link to clipboard
      Alert.alert('Link Copied', 'Product link copied to clipboard!');
      setModalVisible(false);
    }
  };

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      Alert.alert(
        'Delete Product',
        `Are you sure you want to delete "${selectedProduct.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // Handle delete
              setModalVisible(false);
            },
          },
        ]
      );
    }
  };

  const handleToggleFeatured = () => {
    if (selectedProduct) {
      Alert.alert(
        selectedProduct.featured ? 'Remove from Featured' : 'Add to Featured',
        `${selectedProduct.name} has been ${selectedProduct.featured ? 'removed from' : 'added to'} featured products.`
      );
      setModalVisible(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.featured && (
          <View style={styles.featuredBadge}>
            <Star color="#FFFFFF" size={12} fill="#FFFFFF" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          {formatPrice(item.price, item.currency)}
        </Text>
      </View>
      {/* Quick action icons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={(e) => {
            e.stopPropagation();
            handleQuickShare(item);
          }}
        >
          <MessageCircle color={COLORS.whatsapp} size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedProduct(item);
            handleEditProduct();
          }}
        >
          <Edit3 color={COLORS.primary} size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedProduct(item);
            handleToggleFeatured();
          }}
        >
          <Star
            color={item.featured ? COLORS.primary : COLORS.textSecondary}
            size={16}
            fill={item.featured ? COLORS.primary : 'transparent'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={(e) => {
            e.stopPropagation();
            setSelectedProduct(item);
            handleDeleteProduct();
          }}
        >
          <Trash2 color={COLORS.danger} size={16} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus color="#FFFFFF" size={20} />
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyState}>
          <Package color={COLORS.textSecondary} size={64} />
          <Text style={styles.emptyTitle}>No Products Yet</Text>
          <Text style={styles.emptyDescription}>
            Start adding products to showcase your hustle!
          </Text>
          <TouchableOpacity style={styles.addProductButton}>
            <Plus color="#FFFFFF" size={20} />
            <Text style={styles.addProductButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productGrid}
          columnWrapperStyle={styles.productRow}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 8,
  },
  addProductButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  productGrid: {
    padding: 16,
  },
  productRow: {
    gap: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: CARD_WIDTH,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 6,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  quickActionBtn: {
    padding: 8,
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
});
