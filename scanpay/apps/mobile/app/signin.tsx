import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShop } from '../context/ShopContext';

export default function SignInScreen() {
  const router = useRouter();
  const { sendOtp, login } = useShop();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (phone.length < 10 || !name.trim()) return;
    setIsLoading(true);
    try {
      await sendOtp(phone, name);
      setStep('otp');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to send OTP. Try again.');
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return;
    setIsLoading(true);
    try {
      await login(phone, otp);
      router.replace('/profile');
    } catch (err: any) {
      Alert.alert('Invalid OTP', err?.response?.data?.error || 'Wrong OTP. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex1}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              {step === 'details' ? 'Sign In' : 'Enter OTP'}
            </Text>

            {step === 'details' ? (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    returnKeyType="next"
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.phoneRow}>
                    <View style={styles.countryCode}>
                      <Text style={styles.countryCodeText}>+91</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.phoneInput]}
                      value={phone}
                      onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98765 43210"
                      keyboardType="phone-pad"
                      returnKeyType="done"
                      onSubmitEditing={handleSendOtp}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.btn, (phone.length < 10 || !name.trim() || isLoading) && styles.btnDisabled]}
                  onPress={handleSendOtp}
                  disabled={phone.length < 10 || !name.trim() || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>Get OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.otpHint}>
                  OTP sent to +91 {phone}{'  '}
                  <Text style={styles.changeLink} onPress={() => setStep('details')}>
                    Change
                  </Text>
                </Text>

                <View style={styles.field}>
                  <Text style={styles.label}>One Time Password</Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    value={otp}
                    onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    keyboardType="numeric"
                    maxLength={4}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyOtp}
                    secureTextEntry
                  />
                </View>

                <TouchableOpacity
                  style={[styles.btn, (otp.length < 4 || isLoading) && styles.btnDisabled]}
                  onPress={handleVerifyOtp}
                  disabled={otp.length < 4 || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.btnText}>Verify & Sign In</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendBtn} onPress={handleSendOtp}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  flex1: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 0 },
  header: { paddingVertical: 14 },
  backBtn: { padding: 8, width: 44 },
  backBtnText: { fontSize: 22, color: '#111827' },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 16 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB', flex: 1 },
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  countryCode: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  countryCodeText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  phoneInput: { flex: 1 },
  otpInput: { textAlign: 'center', letterSpacing: 10, fontSize: 22, fontWeight: '700' },
  otpHint: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  changeLink: { color: '#2563EB', fontWeight: '600' },
  btn: { backgroundColor: '#2563EB', borderRadius: 12, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700' },
  resendBtn: { alignItems: 'center', padding: 8 },
  resendText: { color: '#2563EB', fontSize: 14, fontWeight: '600' },
});
