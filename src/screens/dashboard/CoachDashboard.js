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

const CoachDashboard = ({ navigation }) => {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [todaysNote, setTodaysNote] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch total students under this coach's specialization
      if (profile?.specialization) {
        const sports = profile.specialization.split(', ');
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' })
          .eq('role', 'parent_student')
          .in('sports_program', sports);
        
        setTotalStudents(count || 0);
      }

      // Fetch average attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('coach_id', user?.id);
      
      if (attendanceData && attendanceData.length > 0) {
        const presentCount = attendanceData.filter(a => a.status === 'present').length;
        const avgAttendance = Math.round((presentCount / attendanceData.length) * 100);
        setAverageAttendance(avgAttendance);
      }

      // Fetch today's note
      const today = new Date().toISOString().split('T')[0];
      const { data: noteData } = await supabase
        .from('coach_notes')
        .select('*')
        .eq('coach_id', user?.id)
        .eq('note_date', today)
        .single();
      
      setTodaysNote(noteData);

      // Fetch recent activity
      const { data: activityData } = await supabase
        .from('attendance')
        .select('*')
        .eq('coach_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentActivity(activityData || []);
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
          <Text style={styles.greeting}>Welcome Back, {profile?.full_name || 'Coach'}!</Text>
          <Text style={styles.subtitle}>Coach Dashboard</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalStudents}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{averageAttendance}%</Text>
            <Text style={styles.statLabel}>Avg. Attendance</Text>
          </View>
        </View>

        {/* Today's Note Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notebook" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Today's Note</Text>
          </View>
          {todaysNote ? (
            <>
              <Text style={styles.cardContent}>{todaysNote.note}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('ScheduleUpdate')}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit Note</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('ScheduleUpdate')}
            >
              <Text style={styles.addButtonText}>Add today's note</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Recent Activity</Text>
            </View>
            {recentActivity.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIndicator}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>
                    Attendance recorded - {activity.status}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(activity.created_at).toLocaleDateString()}
                  </Text>
                </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.lightText,
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
    marginBottom: 12,
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
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 12,
  },
  activityIndicator: {
    marginRight: 10,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: COLORS.darkText,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.lightText,
    marginTop: 2,
  },
});

export default CoachDashboard;
