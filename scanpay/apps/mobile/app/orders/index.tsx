import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../../api/client';
import { Order } from '../../types';

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders');
      setOrders(res.data.orders);
    } catch {
      setOrders([]);
    }
    setIsLoading(false);
  };

  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Receipts</Text>
      </View>

      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search receipts by store or item..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>No receipts found</Text>
          <Text style={styles.emptyText}>Your completed orders will appear here</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order._id}
              style={styles.orderCard}
              onPress={() => router.push(`/orders/${order._id}`)}
            >
              <View style={styles.orderLeft}>
                <Text style={styles.storeName}>{order.store}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                  {'  •  '}
                  {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>₹{order.total.toLocaleString()}</Text>
                <Text style={styles.orderItems}>
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 8, marginRight: 8 },
  backBtnText: { fontSize: 22, color: '#111827' },
  title: { fontSize: 15, fontWeight: '600', color: '#111827' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', margin: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#374151', paddingVertical: 10 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyText: { fontSize: 14, color: '#9CA3AF' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 12 },
  orderCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  orderLeft: { flex: 1 },
  storeName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#6B7280' },
  orderRight: { alignItems: 'flex-end', marginRight: 8 },
  orderTotal: { fontSize: 15, fontWeight: '700', color: '#111827' },
  orderItems: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 22, color: '#D1D5DB' },
});
