import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { apiClient } from '../../api/client';
import { Order } from '../../types';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      setOrder(res.data.order);
    } catch {
      setOrder(null);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Order not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Order info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          {[
            ['Order ID', order._id.slice(-8).toUpperCase()],
            ['Date', formattedDate],
            ['Payment Method', order.paymentMethod || 'Razorpay'],
            ['Payment Status', order.paymentStatus === 'paid' ? '✅ Paid' : order.paymentStatus],
          ].map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Text style={[styles.rowValue, label === 'Payment Status' && order.paymentStatus === 'paid' && styles.paidText]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Store address */}
        {order.store && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Store</Text>
            <Text style={styles.storeName}>{order.store}</Text>
            {order.storeAddress && <Text style={styles.storeAddress}>{order.storeAddress}</Text>}
            {order.storePhone && <Text style={styles.storePhone}>{order.storePhone}</Text>}
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items Purchased</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.imagePlaceholder]} />
              )}
              <View style={styles.itemDetails}>
                <Text style={styles.itemBrand}>{item.brand || item.shop}</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemMeta}>Size: {item.selectedVariant}  |  Qty: {item.quantity}</Text>
                <View style={styles.itemPriceRow}>
                  <Text style={styles.itemPrice}>₹{item.price.toLocaleString()}</Text>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <>
                      <Text style={styles.itemOriginalPrice}>₹{item.originalPrice.toLocaleString()}</Text>
                      <Text style={styles.itemDiscount}>
                        {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Receipt QR */}
        {order.receiptQrPayload && (
          <View style={[styles.card, styles.qrCard]}>
            <Text style={styles.cardTitle}>Exit Receipt</Text>
            <View style={styles.qrWrapper}>
              <QRCode value={order.receiptQrPayload} size={180} />
            </View>
            <Text style={styles.qrHint}>Show this QR at the store exit</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 16, color: '#6B7280' },
  backLink: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 22, color: '#111827' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  rowLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  rowValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  paidText: { color: '#16A34A' },
  storeName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6, textTransform: 'uppercase' },
  storeAddress: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 6 },
  storePhone: { fontSize: 14, color: '#374151', fontWeight: '500' },
  itemRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  itemImage: { width: 90, height: 90, borderRadius: 10, resizeMode: 'cover', backgroundColor: '#F3F4F6' },
  imagePlaceholder: { backgroundColor: '#E5E7EB' },
  itemDetails: { flex: 1, justifyContent: 'center' },
  itemBrand: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  itemName: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 4 },
  itemMeta: { fontSize: 13, color: '#6B7280', marginBottom: 6 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemPrice: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemOriginalPrice: { fontSize: 13, color: '#9CA3AF', textDecorationLine: 'line-through' },
  itemDiscount: { fontSize: 12, fontWeight: '700', color: '#16A34A' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 12 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  qrCard: { alignItems: 'center', gap: 16 },
  qrWrapper: { padding: 12, borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 12 },
  qrHint: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
});
