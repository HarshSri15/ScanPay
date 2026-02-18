import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';

export default function SuccessScreen() {
  const router = useRouter();
  const { receiptPayload } = useLocalSearchParams<{ receiptPayload: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.heading}>Payment Successful!</Text>
        <Text style={styles.subheading}>Your order has been confirmed.</Text>

        {/* Receipt QR Code */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            {receiptPayload ? (
              <QRCode
                value={receiptPayload}
                size={200}
                color="#111827"
                backgroundColor="white"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Text style={styles.qrPlaceholderText}>QR not available</Text>
              </View>
            )}
          </View>
          <Text style={styles.qrHint}>
            Show this QR code to the store associate when exiting
          </Text>
        </View>

        {/* Back to home */}
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
          <Text style={styles.homeBtnText}>🏠  Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ordersBtn} onPress={() => router.push('/orders')}>
          <Text style={styles.ordersBtnText}>View Order History</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  checkIcon: { fontSize: 44, color: '#16A34A' },
  heading: { fontSize: 22, fontWeight: '800', color: '#111827' },
  subheading: { fontSize: 15, color: '#6B7280' },
  qrCard: { backgroundColor: 'white', borderRadius: 20, padding: 24, alignItems: 'center', gap: 16, width: '100%', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  qrWrapper: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  qrPlaceholder: { width: 200, height: 200, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qrPlaceholderText: { color: '#9CA3AF', fontSize: 14 },
  qrHint: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  homeBtn: { width: '100%', height: 54, backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  homeBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  ordersBtn: { alignItems: 'center', padding: 8 },
  ordersBtnText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
});
