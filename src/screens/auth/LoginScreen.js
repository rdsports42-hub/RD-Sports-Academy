import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

const COLORS = {
  primary: '#1D9E75',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  darkText: '#333333',
  lightText: '#666666',
  border: '#DDDDDD',
  error: '#FF6B6B',
};

const LoginScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('parent');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');
  const [coachEmail, setCoachEmail] = useState('');
  const [coachPassword, setCoachPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, userRole } = useAuth();

  useEffect(() => {
    if (userRole) {
      if (userRole === 'coach') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CoachDashboard' }],
        });
      } else if (userRole === 'parent_student') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ParentStudentDashboard' }],
        });
      }
    }
  }, [userRole]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (email, password) => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error || 'An error occurred during login');
    }
  };

  const renderParentTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Parent / Student Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={COLORS.lightText}
        keyboardType="email-address"
        value={parentEmail}
        onChangeText={setParentEmail}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.lightText}
        secureTextEntry
        value={parentPassword}
        onChangeText={setParentPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={() => handleLogin(parentEmail, parentPassword)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ParentStudentRegistration')}>
        <Text style={styles.registerLink}>New Registration</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCoachTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Coach Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor={COLORS.lightText}
        keyboardType="email-address"
        value={coachEmail}
        onChangeText={setCoachEmail}
        editable={!loading}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={COLORS.lightText}
        secureTextEntry
        value={coachPassword}
        onChangeText={setCoachPassword}
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={() => handleLogin(coachEmail, coachPassword)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('CoachRegistration')}>
        <Text style={styles.registerLink}>New Registration</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>RD Sports Academy</Text>
          <Text style={styles.appSubtitle}>Excellence in Sports Training</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'parent' && styles.activeTab]}
            onPress={() => setActiveTab('parent')}
          >
            <Text style={[styles.tabLabel, activeTab === 'parent' && styles.activeTabLabel]}>
              Parent / Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'coach' && styles.activeTab]}
            onPress={() => setActiveTab('coach')}
          >
            <Text style={[styles.tabLabel, activeTab === 'coach' && styles.activeTabLabel]}>
              Coach
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {activeTab === 'parent' ? renderParentTab() : renderCoachTab()}
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
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: COLORS.gray,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.lightText,
  },
  activeTabLabel: {
    color: COLORS.white,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  tabContent: {
    backgroundColor: COLORS.white,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 14,
    color: COLORS.darkText,
    backgroundColor: COLORS.white,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LoginScreen;
