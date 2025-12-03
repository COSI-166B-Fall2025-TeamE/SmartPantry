import { supabase } from '@/lib/supabase 2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      console.log("Checking onboarding", isLoading)
      // if onboarding hasn't been seen, show it regardless of login status
      if (hasSeenOnboarding !== 'true') {
        setIsLoading(false);
        return;
      }
      
      // only check session if onboarding has been seen
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // user is logged in and has seen onboarding, go to home
        router.replace('/(tabs)');
      } else {
        // user has seen onboarding but not logged in, go to login
        router.replace('/auth/login');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsLoading(false);
    }
  };

  const handleGetStarted = async () => {
    try {
      // mark onboarding as completed
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace('/(tabs)');
      } else {
        // navigate to log in page
        router.replace('/auth/login');
      }

      
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // navigate anyway even if save fails
      router.replace('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#371B34" />
        </View>
      </>
    );
  }
  
  console.log("Showing the loading page")
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            {/* Heading*/}
            <View style={styles.headerSection}>
              <Text style={styles.title}>SMART PANTRY</Text>
              <Text style={styles.subtitle}>A Virtual Representation Of Your Fridge</Text>
            </View>

            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.pinkCircle} />
              <Image
                source={require('@/assets/images/onboarding_image.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* Get Started Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
const styles = StyleSheet.create<{
  loadingContainer: ViewStyle;
  container: ViewStyle;
  content: ViewStyle;
  headerSection: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  illustrationContainer: ViewStyle;
  pinkCircle: ViewStyle;
  illustration: ImageStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}>({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#371B34',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#371B34',
    textAlign: 'center',
    opacity: 0.8,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxHeight: 500,
    position: 'relative', 
  },
  pinkCircle: {  
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 260,
    backgroundColor: '#f4d4d7ff',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -300 }, { translateY: -260 }],
    zIndex: 0,
  },
  illustration: {
    width: '100%',
    height: '100%',
    zIndex: 1,  
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#371B34',
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
});