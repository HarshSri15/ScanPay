import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../context/ShopContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useShop();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    await logout();
    setShowLogoutConfirm(false);
    router.replace('/');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.logoText}>ScanPay</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.guestContent}>
          <Text style={styles.guestIcon}>🎁</Text>
          <Text style={styles.guestTitle}>Earn rewards on your purchases</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to earn rewards and sync purchases across devices.
          </Text>

          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/signin')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.receiptsBtn} onPress={() => router.push('/orders')}>
            <Text style={styles.receiptsBtnText}>View Receipts on this Device</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.privacyBadge}>
          <Text style={styles.privacyText}>🛡  No location tracking</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.logoText}>ScanPay</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* User info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>+91 {user.phone}</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {[
          { icon: '📄', label: 'Your Receipts', onPress: () => router.push('/orders') },
          { icon: '🎁', label: 'Rewards', onPress: () => {} },
          { icon: '⚙️', label: 'Settings', onPress: () => {} },
          { icon: 'ℹ️', label: 'About', onPress: () => {} },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.menuItem} onPress={() => setShowLogoutConfirm(true)}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[styles.menuLabel, styles.logoutLabel]}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Logout confirm */}
      {showLogoutConfirm && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalText}>Are you sure you want to sign out?</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLogoutConfirm(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleLogout}>
                <Text style={styles.modalConfirmText}>Sign Out</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 22, color: '#111827' },
  logoText: { fontSize: 22, fontWeight: '700', color: '#ac1c1c' },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'white', padding: 20, marginBottom: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#2563EB' },
  userName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  userPhone: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  menu: { backgroundColor: 'white', marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 15, color: '#111827', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#D1D5DB' },
  logoutLabel: { color: '#EF4444' },
  guestContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  guestIcon: { fontSize: 64, marginBottom: 8 },
  guestTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  signInBtn: { width: '100%', height: 54, backgroundColor: '#2563EB', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  signInBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  receiptsBtn: { width: '100%', height: 54, backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  receiptsBtnText: { color: '#111827', fontSize: 15, fontWeight: '500' },
  privacyBadge: { alignItems: 'center', padding: 20 },
  privacyText: { fontSize: 13, color: '#16A34A', backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  modalOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', padding: 16 },
  modal: { backgroundColor: 'white', borderRadius: 20, padding: 24, gap: 12, marginBottom: 8 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center' },
  modalText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancel: { flex: 1, height: 48, backgroundColor: '#F3F4F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontWeight: '700', color: '#374151' },
  modalConfirm: { flex: 1, height: 48, backgroundColor: '#EF4444', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { fontWeight: '700', color: 'white' },
});
