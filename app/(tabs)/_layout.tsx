import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/templateColors';

// FontAwesome icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  size?: number;
}) {
  return <FontAwesome size={props.size || 24} style={{ marginBottom: -3 }} {...props} />;
}

// MaterialCommunityIcons icon component
function MaterialIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  size?: number;
}) {
  return <MaterialCommunityIcons size={props.size || 24} style={{ marginBottom: -3 }} {...props} />;
}

// Custom elevated home button with scale animation
function HomeTabButton({ color, focused }: { color: string; focused: boolean }) {
  const scaleAnim = React.useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const buttonColor = focused ? '#E17A89' : '#ECACB6';
  
  React.useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1 : 0.85,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.homeButtonContainer}>
      <Animated.View 
        style={[
          styles.homeButton, 
          { 
            backgroundColor: buttonColor,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <FontAwesome name="home" color="#fff" size={28} />
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="index" 
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'light' ? '#371B34' : Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 5,
        },
      }}>
      
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
          tabBarIcon: ({ color }) => <MaterialIcon name="fridge" color={color} />,
        }}
      />

      <Tabs.Screen
        name="expiration"
        options={{
          title: 'Expiration',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar-o" color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => <HomeTabButton color={color} focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Grocery',
          tabBarIcon: ({ color }) => <TabBarIcon name="shopping-cart" color={color} />,
        }}
      />

      <Tabs.Screen
        name="recipe"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  homeButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    top: -8,
  },
  homeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
