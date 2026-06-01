import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';

const COLORS = {
  primary: '#1D9E75',
  white: '#FFFFFF',
  gray: '#F5F5F5',
  darkText: '#333333',
  lightText: '#666666',
  border: '#DDDDDD',
};

const ParentStudentDashboard = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dailyThought, setDailyThought] = useState(null);
  const [dailyTip, setDailyTip] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch today's thought
      const today = new Date().toISOString().split('T')[0];
      const { data: thoughtData } = await supabase
        .from('daily_thoughts')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', today)
        .single();
      
      setDailyThought(thoughtData);

      // Fetch daily tip
      const { data: tipData } = await supabase
        .from('daily_tips')
        .select('*')
        .eq('active_date', today)
        .single();
      
      setDailyTip(tipData);

      // Fetch recent coach feedback
      const { data: feedbackData } = await supabase
        .from('coach_feedback')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      setRecentFeedback(feedbackData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await signOut();
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }],
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome, {profile?.full_name || 'Student'}!</Text>
          <Text style={styles.subtitle}>Track your progress and achievements</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Tip Card */}
        {dailyTip && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Daily Athlete Tip</Text>
            </View>
            <Text style={styles.cardContent}>{dailyTip.tip}</Text>
            <Text style={styles.cardMeta}>{dailyTip.sport}</Text>
          </View>
        )}

        {/* Daily Thought Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Today's Thought</Text>
          </View>
          {dailyThought ? (
            <>
              <Text style={styles.cardContent}>{dailyThought.content}</Text>
              <Text style={styles.cardMeta}>Added today</Text>
            </>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('StudentTracker')}
            >
              <Text style={styles.addButtonText}>Add your thought for today</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Feedback */}
        {recentFeedback.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubbles" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Recent Coach Feedback</Text>
            </View>
            {recentFeedback.map((feedback, index) => (
              <View key={index} style={styles.feedbackItem}>
                <View style={styles.feedbackHeader}>
                  <Text style={styles.feedbackType}>{feedback.feedback_type}</Text>
                  <Text style={styles.feedbackTime}>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.feedbackMessage}>{feedback.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  logoutButton: {
    padding: 8,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginLeft: 10,
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.darkText,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  addButton: {
    backgroundColor: COLORS.gray,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  feedbackItem: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 12,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  feedbackType: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  feedbackTime: {
    fontSize: 12,
    color: COLORS.lightText,
  },
  feedbackMessage: {
    fontSize: 13,
    color: COLORS.darkText,
    lineHeight: 18,
  },
});

export default ParentStudentDashboard;
