import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { supabase } from '@/lib/supabase';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      // console.log('Current user from loading:', user); // Should not be null

      if (loaded) {
        SplashScreen.hideAsync();
      }
    };

    checkUser(); // Call the async function

  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // hiding headers globally
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
         name="sidebar/instructions" 
         options={{ 
           headerShown: true, 
           headerTitle: '',
           headerBackTitle: 'Back',
           headerTintColor: '#007AFF'
         }} 
       />
        <Stack.Screen
          name="auth/login"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: '',
            headerBackTitle: ' Back',
            headerTintColor: '#007AFF',
            headerTitleStyle: {color: '#000000'},
          }}
        />
        <Stack.Screen
          name="auth/signup"
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: '',
            headerBackTitle: ' Back',
            headerTintColor: '#007AFF',
            headerTitleStyle: {color: '#000000'},
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
