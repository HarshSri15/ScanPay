import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../context/ShopContext';

export default function CartScreen() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useShop();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const originalTotal = cart.reduce((acc, item) => acc + item.price * 1.4 * item.quantity, 0);
  const totalDiscount = originalTotal - subtotal;
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shopping Cart</Text>
        <Text style={styles.itemCount}>{totalItems} items</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.emptyLink}>Scan a product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <Image
                  source={{ uri: item.imageUrl || 'https://via.placeholder.com/80' }}
                  style={styles.productImage}
                />
                <View style={styles.productDetails}>
                  <Text style={styles.shopLabel}>{item.shop}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.variantText}>Size: {item.selectedVariant}</Text>

                  {/* Quantity controls */}
                  <View style={styles.qtyRow}>
                    <Text style={styles.qtyLabel}>Qty</Text>
                    <TouchableOpacity
                      style={[styles.qtyBtn, item.quantity <= 1 && styles.qtyBtnDisabled]}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.qtyDisplay}>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.priceDeleteRow}>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => setItemToDelete(item.id)}
                    >
                      <Text style={styles.deleteBtnText}>🗑</Text>
                    </TouchableOpacity>
                    <View>
                      <Text style={styles.lineTotal}>₹{(item.price * item.quantity).toFixed(0)}</Text>
                      <Text style={styles.lineTotalOriginal}>
                        ₹{(item.price * 1.4 * item.quantity).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* Order summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Price (Inc GST)</Text>
                <Text style={styles.summaryValue}>₹{originalTotal.toFixed(0)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={styles.discountValue}>− ₹{totalDiscount.toFixed(0)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{subtotal.toFixed(0)}</Text>
              </View>
              <View style={styles.savingsBanner}>
                <Text style={styles.savingsText}>
                  You save ₹{totalDiscount.toFixed(0)} on this order
                </Text>
              </View>
            </View>

            <View style={{ height: 160 }} />
          </ScrollView>

          {/* Checkout CTA */}
          <View style={styles.checkoutBar}>
            <View style={styles.checkoutTotal}>
              <Text style={styles.checkoutTotalLabel}>Total</Text>
              <Text style={styles.checkoutTotalValue}>₹{subtotal.toFixed(0)}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push('/checkout')}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Delete confirmation modal */}
      {itemToDelete && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Remove Item?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to remove this item from your cart?
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setItemToDelete(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalDeleteBtn}
                onPress={() => {
                  removeFromCart(itemToDelete);
                  setItemToDelete(null);
                }}
              >
                <Text style={styles.modalDeleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 8, marginRight: 8 },
  backBtnText: { fontSize: 22, color: '#111827' },
  title: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  itemCount: { fontSize: 13, color: '#6B7280' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { color: '#9CA3AF', fontSize: 15 },
  emptyLink: { color: '#2563EB', fontSize: 15, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  cartCard: { backgroundColor: 'white', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  productImage: { width: 80, height: 110, borderRadius: 10, resizeMode: 'cover', backgroundColor: '#F3F4F6' },
  productDetails: { flex: 1, gap: 4 },
  shopLabel: { fontSize: 10, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#111827', lineHeight: 20 },
  variantText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  qtyLabel: { fontSize: 11, fontWeight: '700', color: '#111827', textTransform: 'uppercase' },
  qtyBtn: { width: 32, height: 32, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyBtnText: { fontSize: 18, color: '#374151', fontWeight: '500' },
  qtyDisplay: { width: 32, height: 32, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  qtyValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  priceDeleteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  deleteBtn: { width: 32, height: 32, backgroundColor: '#F3F4F6', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtnText: { fontSize: 15 },
  lineTotal: { fontSize: 15, fontWeight: '700', color: '#111827', textAlign: 'right' },
  lineTotalOriginal: { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through', textAlign: 'right' },
  summaryCard: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', marginTop: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#111827', padding: 16, paddingBottom: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#111827' },
  discountValue: { fontSize: 14, fontWeight: '500', color: '#16A34A' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16, marginVertical: 8 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#111827' },
  totalValue: { fontSize: 14, fontWeight: '700', color: '#111827' },
  savingsBanner: { backgroundColor: '#F0FDF4', padding: 12, alignItems: 'center' },
  savingsText: { fontSize: 13, fontWeight: '700', color: '#15803D' },
  checkoutBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20, paddingBottom: 34, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 20, gap: 12 },
  checkoutTotal: { flexDirection: 'row', justifyContent: 'space-between' },
  checkoutTotalLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  checkoutTotalValue: { fontSize: 15, fontWeight: '700', color: '#111827' },
  checkoutBtn: { backgroundColor: '#2563EB', borderRadius: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  modalOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', padding: 16 },
  modal: { backgroundColor: 'white', borderRadius: 20, padding: 24, gap: 12, marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center' },
  modalText: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, height: 48, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  modalDeleteBtn: { flex: 1, height: 48, backgroundColor: '#EF4444', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalDeleteText: { fontSize: 14, fontWeight: '700', color: 'white' },
});
