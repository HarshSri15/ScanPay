import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Switch,
  SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useShop } from '../context/ShopContext';
import { findMockProductByBarcode } from '../data/mockProducts';
import { getProductBySku } from '../db/products';
import { apiClient } from '../api/client';
import { Product } from '../types';

export default function HomeScreen() {
  const router = useRouter();
  const { cart, addToCart, isOnline } = useShop();
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enableQuickAdd, setEnableQuickAdd] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const lastScan = useRef<string>('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (isProcessing || data === lastScan.current) return;
      lastScan.current = data;
      setIsProcessing(true);

      // 1. Check built-in mock products first (works with NO backend)
      let product: Product | null = findMockProductByBarcode(data);

      // 2. Check SQLite cache
      if (!product) product = getProductBySku(data);

      // 3. Fallback to backend API if online
      if (!product && isOnline) {
        try {
          const res = await apiClient.get(`/products/lookup?barcode=${encodeURIComponent(data)}`);
          product = res.data.product;
        } catch {
          // Not found or offline
        }
      }

      if (product) {
        if (enableQuickAdd) {
          addToCart(product, product.variants[0]);
          showNotification(`${product.name} added to cart!`);
        } else {
          setScannedProduct(product);
        }
      } else {
        Alert.alert('Product Not Found', `No product found for barcode: ${data}`);
      }

      // Debounce: allow re-scan after 3 seconds
      debounceTimer.current = setTimeout(() => {
        setIsProcessing(false);
        lastScan.current = '';
      }, 3000);
    },
    [isProcessing, isOnline, enableQuickAdd, addToCart]
  );

  const handleConfirmAddToCart = (variant: string) => {
    if (!scannedProduct) return;
    addToCart(scannedProduct, variant);
    showNotification(`${scannedProduct.name} added to cart!`);
    setScannedProduct(null);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permissionText}>Camera access is needed to scan products</Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View — top 60% */}
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39'],
          }}
        />

        {/* Header overlay */}
        <View style={styles.header}>
          <Text style={styles.logo}>ScanPay</Text>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Scan frame */}
        <View style={styles.scanFrameContainer}>
          <View style={styles.scanFrame}>
            {/* Corner dots */}
            <View style={[styles.corner, { top: -6, left: -6 }]} />
            <View style={[styles.corner, { top: -6, right: -6 }]} />
            <View style={[styles.corner, { bottom: -6, left: -6 }]} />
            <View style={[styles.corner, { bottom: -6, right: -6 }]} />

            {/* Corner brackets */}
            <View style={[styles.bracket, styles.bracketTL]} />
            <View style={[styles.bracket, styles.bracketTR]} />
            <View style={[styles.bracket, styles.bracketBL]} />
            <View style={[styles.bracket, styles.bracketBR]} />

            {isProcessing ? (
              <View style={styles.processingPill}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.processingText}>Hold steady…</Text>
              </View>
            ) : (
              <View style={styles.scanPill}>
                <Text style={styles.scanPillText}>SCAN A BARCODE OR QR CODE</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.articleLink}
          onPress={() => router.push('/enter-article')}
        >
          <Text style={styles.articleLinkText}>⌨️  Can't scan? Enter Article No.</Text>
        </TouchableOpacity>

        <View style={styles.quickAddRow}>
          <Text style={styles.quickAddLabel}>Enable Quick Add to Cart</Text>
          <Switch
            value={enableQuickAdd}
            onValueChange={setEnableQuickAdd}
            trackColor={{ true: '#2563EB', false: '#555' }}
          />
        </View>

        <View style={styles.flex1} />

        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>📴 Offline mode — payment requires internet</Text>
          </View>
        )}

        <Text style={styles.hintText}>Internet required only for payment</Text>

        <TouchableOpacity
          style={[styles.cartBtn, cartItemCount === 0 && styles.cartBtnDisabled]}
          disabled={cartItemCount === 0}
          onPress={() => router.push('/cart')}
        >
          <Text style={styles.cartBtnText}>🛍  View Cart</Text>
          <Text style={styles.cartBtnCount}>{cartItemCount} items</Text>
        </TouchableOpacity>
      </View>

      {/* Notification snackbar */}
      {notification && (
        <View style={styles.snackbar}>
          <View style={styles.snackbarIcon}>
            <Text>✓</Text>
          </View>
          <Text style={styles.snackbarText}>{notification}</Text>
        </View>
      )}

      {/* Scan result bottom sheet */}
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
                  <Text style={styles.originalPrice}>₹{(scannedProduct.price * 1.4).toFixed(0)}</Text>
                </View>
                <Text style={styles.articleText}>Art. {scannedProduct.articleNo}</Text>
              </View>
            </View>

            <Text style={styles.variantLabel}>Select Size / Variant</Text>
            <View style={styles.variantRow}>
              {scannedProduct.variants.map((v) => (
                <TouchableOpacity
                  key={v}
                  style={styles.variantBtn}
                  onPress={() => handleConfirmAddToCart(v)}
                >
                  <Text style={styles.variantBtnText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setScannedProduct(null)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 24 },
  cameraContainer: { flex: 0.6, position: 'relative', overflow: 'hidden' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10 },
  logo: { color: '#ac1c1c', fontSize: 22, fontWeight: '700' },
  profileBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  profileIcon: { fontSize: 16 },
  scanFrameContainer: { position: 'absolute', top: 80, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  scanFrame: { width: '70%', aspectRatio: 1, position: 'relative', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16 },
  corner: { position: 'absolute', width: 14, height: 14, backgroundColor: '#3B82F6', borderRadius: 7 },
  bracket: { position: 'absolute', width: 48, height: 48, borderColor: 'rgba(255,255,255,0.8)', borderWidth: 0 },
  bracketTL: { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 12 },
  bracketTR: { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 12 },
  bracketBL: { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 12 },
  bracketBR: { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 12 },
  processingPill: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  processingText: { color: 'white', fontSize: 13 },
  scanPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  scanPillText: { color: 'white', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  controls: { flex: 0.4, backgroundColor: '#000', padding: 24, paddingTop: 20 },
  articleLink: { alignItems: 'center', marginBottom: 12 },
  articleLinkText: { color: '#BCBCBC', fontSize: 14 },
  quickAddRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 8 },
  quickAddLabel: { color: '#BCBCBC', fontSize: 13 },
  flex1: { flex: 1 },
  hintText: { color: '#555', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  offlineBadge: { backgroundColor: '#374151', padding: 8, borderRadius: 8, marginBottom: 8 },
  offlineText: { color: '#FCD34D', fontSize: 12, textAlign: 'center' },
  cartBtn: { backgroundColor: '#2563EB', borderRadius: 12, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
  cartBtnDisabled: { backgroundColor: '#374151', opacity: 0.5 },
  cartBtnText: { color: 'white', fontSize: 14, fontWeight: '500' },
  cartBtnCount: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  snackbar: { position: 'absolute', bottom: 100, left: 24, right: 24, backgroundColor: '#111827', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  snackbarIcon: { width: 32, height: 32, backgroundColor: '#16A34A', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  snackbarText: { color: 'white', fontSize: 14, fontWeight: '500', flex: 1 },
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
  articleText: { fontSize: 12, color: '#9CA3AF' },
  variantLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  variantBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2563EB' },
  variantBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  cancelBtn: { alignItems: 'center', padding: 12 },
  cancelBtnText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  permissionText: { fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 20 },
  permissionBtn: { backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  permissionBtnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
