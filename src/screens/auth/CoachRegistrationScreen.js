import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = {
  primary: '#1D9E75',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  darkText: '#333333',
  lightText: '#666666',
  border: '#DDDDDD',
  error: '#FF6B6B',
};

const SPORTS = [
  'Cricket',
  'Basketball',
  'Weightlifting',
  'Football',
  'Volleyball',
  'Skating',
  'Fun and Fitness',
  'Judo',
  'Yoga',
  'Zumba',
];

const CoachRegistrationScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [currentSpecialization, setCurrentSpecialization] = useState(SPORTS[0]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
  };

  const toggleSpecialization = (sport) => {
    if (specializations.includes(sport)) {
      setSpecializations(specializations.filter(s => s !== sport));
    } else {
      setSpecializations([...specializations, sport]);
    }
  };

  const handleRegister = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter your phone number');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (specializations.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one specialization');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Validation Error', 'Please enter a username');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await signUp(email, password, {
      full_name: fullName,
      email,
      phone,
      specialization: specializations.join(', '),
      username,
      role: 'coach',
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Registration successful! Redirecting to dashboard...', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'CoachDashboard' }],
            });
          },
        },
      ]);
    } else {
      Alert.alert('Registration Failed', result.error || 'An error occurred during registration');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Coach Registration</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={COLORS.lightText}
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.lightText}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 10-digit phone number"
            placeholderTextColor={COLORS.lightText}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
          />

          <Text style={styles.label}>Specializations *</Text>
          <Text style={styles.hint}>Select all sports you specialize in:</Text>
          <View style={styles.specializationContainer}>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.sportTag,
                  specializations.includes(sport) && styles.sportTagActive,
                ]}
                onPress={() => toggleSpecialization(sport)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.sportTagText,
                    specializations.includes(sport) && styles.sportTagTextActive,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            placeholderTextColor={COLORS.lightText}
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password (minimum 6 characters)"
            placeholderTextColor={COLORS.lightText}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            placeholderTextColor={COLORS.lightText}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkText,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.darkText,
    marginBottom: 8,
    marginTop: 12,
  },
  hint: {
    fontSize: 12,
    color: COLORS.lightText,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 5,
    fontSize: 14,
    color: COLORS.darkText,
    backgroundColor: COLORS.white,
  },
  specializationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 8,
  },
  sportTag: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  sportTagActive: {
    backgroundColor: COLORS.primary,
  },
  sportTagText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  sportTagTextActive: {
    color: COLORS.white,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CoachRegistrationScreen;