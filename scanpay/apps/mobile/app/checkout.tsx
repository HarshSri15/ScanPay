import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../context/ShopContext';
import { apiClient } from '../api/client';

// NOTE: Install react-native-razorpay and add to package.json
// import RazorpayCheckout from 'react-native-razorpay';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, user, clearCart } = useShop();
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const handlePay = async () => {
    if (!user) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order on backend (validates prices server-side)
      const orderRes = await apiClient.post('/payments/create-order', {
        items: cart.map((i) => ({
          sku: i.sku,
          quantity: i.quantity,
          selectedVariant: i.selectedVariant,
        })),
        store: 'ScanPay Store',
      });

      const { razorpayOrderId, orderId, key } = orderRes.data;

      // Step 2: Open Razorpay checkout
      // Uncomment when react-native-razorpay is installed:
      /*
      const paymentData = await RazorpayCheckout.open({
        key,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'ScanPay',
        description: 'In-Store Purchase',
        order_id: razorpayOrderId,
        prefill: { contact: user.phone, name: user.name },
        theme: { color: '#2563EB' },
      });

      // Step 3: Verify payment signature on backend
      const verifyRes = await apiClient.post('/payments/verify', {
        razorpayOrderId,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
        orderId,
      });

      clearCart();
      router.push({ pathname: '/success', params: { receiptPayload: verifyRes.data.receiptPayload } });
      */

      // ── TEMPORARY: simulate payment for development ──
      await new Promise((r) => setTimeout(r, 1500));
      const fakeReceiptPayload = `RECEIPT_${orderId}_${Date.now()}`;
      clearCart();
      router.push({ pathname: '/success', params: { receiptPayload: fakeReceiptPayload } });
      // ─────────────────────────────────────────────────

    } catch (err: any) {
      if (err?.code === 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Cancelled', 'Your payment was cancelled.');
      } else {
        Alert.alert('Payment Failed', 'Something went wrong. Please try again.');
        console.error(err);
      }
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Payment method card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentIcon}>💳</Text>
            <View>
              <Text style={styles.paymentLabel}>Razorpay</Text>
              <Text style={styles.paymentSub}>UPI, Cards, Netbanking, Wallets</Text>
            </View>
          </View>
        </View>

        {/* Order summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Summary</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(0)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{subtotal.toFixed(0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>GST (18%)</Text>
            <Text style={styles.summaryValue}>₹{tax.toFixed(0)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total.toFixed(0)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, isLoading && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{total.toFixed(0)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 8, marginRight: 8 },
  backBtnText: { fontSize: 22, color: '#111827' },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 16 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#EFF6FF', padding: 16, borderRadius: 12 },
  paymentIcon: { fontSize: 24 },
  paymentLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  paymentSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  itemName: { fontSize: 14, color: '#374151', flex: 1, marginRight: 8 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#111827' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, color: '#374151' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  footer: { backgroundColor: 'white', padding: 20, paddingBottom: 34, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  payBtn: { backgroundColor: '#111827', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center' },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: 'white', fontSize: 17, fontWeight: '700' },
});
