import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import ParentStudentRegistrationScreen from '../screens/auth/ParentStudentRegistrationScreen';
import CoachRegistrationScreen from '../screens/auth/CoachRegistrationScreen';
import ParentStudentDashboard from '../screens/dashboard/ParentStudentDashboard';
import CoachDashboard from '../screens/dashboard/CoachDashboard';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen 
        name="ParentStudentRegistration" 
        component={ParentStudentRegistrationScreen}
        options={{ animationEnabled: true }}
      />
      <Stack.Screen 
        name="CoachRegistration" 
        component={CoachRegistrationScreen}
        options={{ animationEnabled: true }}
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="ParentStudentDashboard" component={ParentStudentDashboard} />
      <Stack.Screen name="CoachDashboard" component={CoachDashboard} />
    </Stack.Navigator>
  );
};

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default RootNavigator;
