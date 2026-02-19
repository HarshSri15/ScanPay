import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../context/ShopContext';
import { findMockProductByArticleNo } from '../data/mockProducts';
import { getProductByArticleNo } from '../db/products';
import { apiClient } from '../api/client';
import { Product } from '../types';

export default function EnterArticleScreen() {
  const router = useRouter();
  const { addToCart, isOnline } = useShop();
  const [articleNo, setArticleNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSearch = async () => {
    if (!articleNo.trim()) return;
    setIsLoading(true);

    // 1. Check mock products first (no backend needed)
    let product: Product | null = findMockProductByArticleNo(articleNo.trim());

    // 2. Try SQLite cache
    if (!product) product = getProductByArticleNo(articleNo.trim());

    // 3. If not cached and online, fetch from backend
    if (!product && isOnline) {
      try {
        const res = await apiClient.get(`/products/lookup?articleNo=${articleNo.trim()}`);
        product = res.data.product;
      } catch {
        // Not found
      }
    }

    setIsLoading(false);

    if (product) {
      setScannedProduct(product);
    } else {
      Alert.alert('Not Found', `No product found with article number ${articleNo}`);
    }
  };

  const handleAddToCart = (variant: string) => {
    if (!scannedProduct) return;
    addToCart(scannedProduct, variant);
    showNotification(`${scannedProduct.name} added!`);
    setScannedProduct(null);
    setArticleNo('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Enter Article Number</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.hint}>Enter the article number found on the price tag.</Text>

            <TextInput
              style={styles.input}
              value={articleNo}
              onChangeText={(t) => setArticleNo(t.replace(/\D/g, '').slice(0, 8))}
              placeholder="e.g. 123456"
              keyboardType="numeric"
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />

            <TouchableOpacity
              style={[styles.searchBtn, (!articleNo || isLoading) && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={!articleNo || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.searchBtnText}>Find Product</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Result bottom sheet */}
        {scannedProduct && (
          <View style={styles.overlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={() => setScannedProduct(null)}
            />
            <View style={styles.bottomSheet}>
              <View style={styles.productRow}>
                {scannedProduct.imageUrl ? (
                  <Image source={{ uri: scannedProduct.imageUrl }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.imagePlaceholder]} />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productShop}>{scannedProduct.shop}</Text>
                  <Text style={styles.productName}>{scannedProduct.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>₹{scannedProduct.price.toFixed(0)}</Text>
                    <Text style={styles.originalPrice}>
                      ₹{(scannedProduct.price * 1.4).toFixed(0)}
                    </Text>
                  </View>
                  <Text style={styles.articleLabel}>Art. {scannedProduct.articleNo}</Text>
                </View>
              </View>

              <Text style={styles.variantLabel}>Select Size / Variant</Text>
              <View style={styles.variantRow}>
                {scannedProduct.variants.map((v) => (
                  <TouchableOpacity
                    key={v}
                    style={styles.variantBtn}
                    onPress={() => handleAddToCart(v)}
                  >
                    <Text style={styles.variantBtnText}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setScannedProduct(null)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notification */}
        {notification && (
          <View style={styles.snackbar}>
            <Text style={styles.snackbarText}>✓  {notification}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { padding: 8, marginRight: 8 },
  backBtnText: { fontSize: 22, color: '#111827' },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  content: { padding: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  hint: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, fontSize: 18, fontWeight: '700', letterSpacing: 4, textAlign: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  searchBtn: { backgroundColor: '#2563EB', borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  searchBtnDisabled: { backgroundColor: '#E5E7EB' },
  searchBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  overlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  productRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  productImage: { width: 100, height: 120, borderRadius: 12, resizeMode: 'cover' },
  imagePlaceholder: { backgroundColor: '#E5E7EB' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productShop: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  productName: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  price: { fontSize: 18, fontWeight: '800', color: '#15803D' },
  originalPrice: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  articleLabel: { fontSize: 12, color: '#9CA3AF' },
  variantLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  variantBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2563EB' },
  variantBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  snackbar: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: '#111827', padding: 16, borderRadius: 12, alignItems: 'center' },
  snackbarText: { color: 'white', fontWeight: '600', fontSize: 14 },
});
