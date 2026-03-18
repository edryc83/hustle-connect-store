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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Edit3,
  MessageCircle,
  Star,
  Copy,
  Trash2,
  Share2,
  ArrowLeft,
} from 'lucide-react-native';
import type { RootStackScreenProps } from '../types/navigation';

const { width } = Dimensions.get('window');

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

// Sample product - in real app this would be fetched based on productId
const SAMPLE_PRODUCT = {
  id: '1',
  name: 'Handmade Jewelry Set',
  price: 45000,
  currency: 'UGX',
  image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
  description: 'Beautiful handcrafted jewelry set with earrings and necklace. Perfect for any occasion. Made with high-quality materials and attention to detail.',
  featured: true,
  category: 'Jewelry',
  stock: 5,
};

export default function ProductDetailScreen({ navigation, route }: RootStackScreenProps<'ProductDetail'>) {
  const { productId } = route.params;
  const [product] = useState(SAMPLE_PRODUCT);

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  const handleEditProduct = () => {
    Alert.alert('Edit Product', 'Opening product editor...');
  };

  const handleShareToWhatsAppStatus = async () => {
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

  const handleToggleFeatured = () => {
    Alert.alert(
      product.featured ? 'Remove from Featured' : 'Add to Featured',
      `${product.name} has been ${product.featured ? 'removed from' : 'added to'} featured products.`
    );
  };

  const handleCopyLink = () => {
    Alert.alert('Link Copied', 'Product link copied to clipboard!');
  };

  const handleDeleteProduct = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {product.featured && (
            <View style={styles.featuredBadge}>
              <Star color="#FFFFFF" size={14} fill="#FFFFFF" />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {formatPrice(product.price, product.currency)}
          </Text>

          <View style={styles.stockInfo}>
            <View style={[styles.stockBadge, product.stock > 0 ? styles.inStock : styles.outOfStock]}>
              <Text style={styles.stockText}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        </View>

        {/* Quick Actions Bar */}
        <View style={styles.quickActionsBar}>
          <TouchableOpacity style={styles.quickActionItem} onPress={handleToggleFeatured}>
            <Star
              color={product.featured ? COLORS.primary : COLORS.textSecondary}
              size={22}
              fill={product.featured ? COLORS.primary : 'transparent'}
            />
            <Text style={styles.quickActionLabel}>Feature</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={handleCopyLink}>
            <Copy color={COLORS.textSecondary} size={22} />
            <Text style={styles.quickActionLabel}>Copy Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionItem} onPress={handleDeleteProduct}>
            <Trash2 color={COLORS.danger} size={22} />
            <Text style={[styles.quickActionLabel, { color: COLORS.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProduct}>
            <Edit3 color="#FFFFFF" size={20} />
            <Text style={styles.editButtonText}>Edit Product</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} onPress={handleShareToWhatsAppStatus}>
            <MessageCircle color="#FFFFFF" size={20} />
            <Text style={styles.shareButtonText}>Share to WhatsApp Status</Text>
          </TouchableOpacity>
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
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: width,
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  featuredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 20,
  },
  category: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  stockInfo: {
    marginTop: 12,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  inStock: {
    backgroundColor: '#DCFCE7',
  },
  outOfStock: {
    backgroundColor: '#FEE2E2',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  descriptionSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  quickActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionItem: {
    alignItems: 'center',
    gap: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.whatsapp,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
