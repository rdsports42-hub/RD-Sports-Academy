# RD Sports Academy - React Native Mobile App

A cross-platform mobile application built with React Native (Expo) for managing sports academy operations, including student/parent and coach management, schedules, attendance, payments, and performance tracking.

## Project Overview

- **App Name**: RD Sports Academy
- **Platforms**: iOS & Android
- **Frontend**: React Native with Expo (Managed Workflow)
- **Backend**: Supabase (PostgreSQL + Authentication)
- **Navigation**: React Navigation v6

## Features

### Parent/Student Features
- Login and registration with email/password
- Dashboard with daily thoughts, tips, and coach feedback
- Student Tracker for performance and attendance
- Payment management with UPI integration
- Settings and profile management
- Support chatbot interface

### Coach Features
- Login and registration with specialization selection
- Coach dashboard with student stats and attendance overview
- My Students management with performance updates
- Schedule management with Realtime updates
- Feedback system for students
- Payment history tracking
- Reports and analytics

## Technology Stack

### Core Dependencies
- `expo` - Expo framework for React Native
- `react-native` - Mobile UI framework
- `@react-navigation/*` - Navigation library
  - `@react-navigation/native`
  - `@react-navigation/stack`
  - `@react-navigation/bottom-tabs`
  - `@react-navigation/drawer`
- `@supabase/supabase-js` - Backend and authentication
- `@react-native-async-storage/async-storage` - Local storage
- `react-native-calendars` - Calendar UI
- `react-native-qrcode-svg` - QR code generation
- `victory-native` - Charts and graphs
- `@react-native-picker/picker` - Picker component
- `@expo/vector-icons` - Icon library (Ionicons)

## Project Structure

```
rd-sports-academy/
├── App.js                          # Root app entry point
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── src/
│   ├── supabaseClient.js          # Supabase initialization
│   ├── contexts/
│   │   └── AuthContext.js         # Authentication context
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── ParentStudentRegistrationScreen.js
│   │   │   └── CoachRegistrationScreen.js
│   │   └── dashboard/
│   │       ├── ParentStudentDashboard.js
│   │       └── CoachDashboard.js
│   └── navigation/
│       └── RootNavigator.js       # Navigation setup
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Supabase account

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/rdsports42-hub/rd-sports-academy.git
cd rd-sports-academy

# Install dependencies
npm install
# or
yarn install
```

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Get your Project URL and Anon Key from project settings
3. Update `src/supabaseClient.js`:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 3. Set Up Database Tables

Run the SQL migrations in your Supabase database. See `DATABASE_SETUP.md` for detailed instructions.

### 4. Start the App

```bash
# Start Expo development server
npm start

# For iOS simulator
npm run ios

# For Android emulator
npm run android

# For web preview
npm run web
```

## Database Schema

### Core Tables

#### `profiles`
- `id` (UUID) - Primary key, references auth.users
- `full_name` (text)
- `email` (text)
- `phone` (text)
- `username` (text)
- `role` (text) - 'parent_student' or 'coach'
- `sports_program` (text) - For parent/student
- `specialization` (text) - For coach (comma-separated)
- `avatar_url` (text)
- `created_at` (timestamp)

#### `daily_thoughts`
- `id` (UUID)
- `user_id` (UUID)
- `content` (text)
- `created_at` (timestamp)

#### `daily_tips`
- `id` (UUID)
- `tip` (text)
- `sport` (text)
- `active_date` (date)
- `created_at` (timestamp)

#### `coach_feedback`
- `id` (UUID)
- `coach_id` (UUID)
- `student_id` (UUID)
- `feedback_type` (text)
- `message` (text)
- `created_at` (timestamp)

#### `attendance`
- `id` (UUID)
- `student_id` (UUID)
- `coach_id` (UUID)
- `date` (date)
- `status` (text) - 'present', 'absent', 'late'
- `created_at` (timestamp)

#### `performance`
- `id` (UUID)
- `student_id` (UUID)
- `coach_id` (UUID)
- `score` (integer) - 1-10
- `week_start` (date)
- `notes` (text)
- `created_at` (timestamp)

#### `schedules`
- `id` (UUID)
- `coach_id` (UUID)
- `title` (text)
- `sport` (text)
- `day_of_week` (text)
- `start_time` (time)
- `end_time` (time)
- `location` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `payments`
- `id` (UUID)
- `student_id` (UUID)
- `coach_id` (UUID)
- `amount` (decimal)
- `status` (text) - 'paid', 'due', 'pending'
- `payment_date` (date)
- `method` (text)
- `created_at` (timestamp)

For more tables, see `DATABASE_SETUP.md`.

## Authentication Flow

1. User enters email and password on Login screen
2. Supabase Auth signs in user
3. App fetches user's profile from `profiles` table
4. Role determines which dashboard to display
5. Session persists via AsyncStorage for offline access

## Key Features Implementation

### Role-Based Login
The app checks the user's role in the `profiles` table after authentication to route to the correct dashboard (Parent/Student or Coach).

### Registration
Both registration screens follow a specific sequence:
1. Create user in Supabase Auth
2. Wait 500ms for auth user to be created
3. Upsert profile data into profiles table
4. Navigate to appropriate dashboard

### Real-time Updates
Supabase Realtime subscriptions are used for:
- Schedule updates
- Attendance changes
- Performance scores
- Coach feedback
- Achievements

### Local Storage
AsyncStorage is used to persist:
- Notification preferences
- Language selection
- Session data (managed by Supabase auth)

## Design Guidelines

### Color Scheme
- **Primary**: #1D9E75 (Green)
- **White**: #FFFFFF
- **Gray**: #F5F5F5
- **Dark Text**: #333333
- **Light Text**: #666666
- **Border**: #DDDDDD

### Components
- Rounded input fields with 8px border radius
- Card-based layout with subtle shadows
- Bottom tab navigation with Ionicons
- Drawer navigation for menu

## Deployment

### Build for Production

```bash
# Create EAS build (requires EAS CLI)
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

### Submit to App Stores

```bash
# Submit to Apple App Store
eas submit --platform ios

# Submit to Google Play Store
eas submit --platform android
```

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS policies enabled
2. **Authentication**: Supabase Auth handles secure password management
3. **Session Persistence**: Sessions stored in AsyncStorage
4. **Environment Variables**: Keep Supabase credentials secure

## Troubleshooting

### "public.profiles not found in schema cache"
This occurs when trying to insert into profiles before the auth user is created. The app follows the registration sequence outlined in the specification with a 500ms delay.

### Blank Screen on Startup
Check that:
- Supabase credentials are correct
- Network connection is available
- Database tables are created

### Authentication Not Persisting
Ensure AsyncStorage is properly configured in Supabase client setup.

## Contributing

Please follow these guidelines:
1. Create feature branches from `main`
2. Write descriptive commit messages
3. Test on both iOS and Android simulators
4. Submit pull requests with detailed descriptions

## Future Enhancements

- [ ] AI-powered chatbot for support
- [ ] Advanced analytics and reporting
- [ ] Video lesson integration
- [ ] In-app notifications
- [ ] Multi-language support
- [ ] Payment gateway integration
- [ ] Video call coaching sessions
- [ ] Performance prediction models

## Support

For issues or questions:
- Check the troubleshooting section
- Review DATABASE_SETUP.md for database issues
- Contact the development team

## License

This project is proprietary and confidential.

---

**Last Updated**: June 2026
**Version**: 1.0.0
