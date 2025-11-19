import Colors from '@/constants/templateColors';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function AboutUsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>About Us</Text>
        
        <Text style={[styles.description, { color: colors.buttonBackground }]}>
        SmartPantry is a revolutionary mobile application designed to help households reduce food waste  and better manage their pantry items.
        </Text>

        <View style={[styles.teamSection, { backgroundColor: colors.todayCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryButtonText }]}>Our Team</Text>
          
          <View style={styles.teamContainer}>
            {/* Team Member 1 */}
            <View style={styles.memberContainer}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.expiringCard }]} />
              <Text style={[styles.memberName, { color: colors.secondaryButtonText }]}>Amie Feng</Text>
              <Text style={[styles.memberRole, { color: colors.text, opacity: 0.7 }]}>Developer</Text>
            </View>
            
            {/* Team Member 2 */}
            <View style={styles.memberContainer}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.expiringCard }]} />
              <Text style={[styles.memberName, { color: colors.secondaryButtonText }]}>Rowan Scassellati</Text>
              <Text style={[styles.memberRole, { color: colors.text, opacity: 0.7 }]}>Developer</Text>
            </View>
            
            {/* Team Member 3 */}
            <View style={styles.memberContainer}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.expiringCard }]} />
              <Text style={[styles.memberName, { color: colors.secondaryButtonText }]}>Qiping Zhang</Text>
              <Text style={[styles.memberRole, { color: colors.text, opacity: 0.7 }]}>Developer</Text>
            </View>
            
            {/* Team Member 4 */}
            <View style={styles.memberContainer}>
              <View style={[styles.imagePlaceholder, { backgroundColor: colors.expiringCard }]} />
              <Text style={[styles.memberName, { color: colors.secondaryButtonText }]}>Promise Adeliyi</Text>
              <Text style={[styles.memberRole, { color: colors.text, opacity: 0.7 }]}>Developer</Text>
            </View>
          </View>
        </View>

        <View style={[styles.missionSection, { backgroundColor: colors.todayCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryButtonText }]}>Our Mission</Text>
          <Text style={[styles.description, { color: colors.secondaryButtonText }]}>
            We want to create a more sustainable future by empowering users with smart tools for food management and avoid waste.
            </Text>
            <Text style={[styles.description, { color: colors.secondaryButtonText }]}>
            We believe that reducing food waste starts with awareness and smart planning. 
            SmartPantry was created to help individuals and families take control of their 
            food consumption habits, save money, and contribute to environmental sustainability.
          </Text>
        </View>

        <View style={[styles.visionSection, { backgroundColor: colors.todayCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.secondaryButtonText }]}>Vision for the Future</Text>
          <Text style={[styles.description, { color: colors.secondaryButtonText }]}>
            Our vision extends beyond just tracking expiration dates. We aim to create 
            a comprehensive ecosystem that connects users with local food banks, recipe 
            suggestions based on expiring items, and community sharing platforms to 
            redistribute surplus food.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.scanCard}]}
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Back to Homepage</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  teamSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  memberContainer: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center'
  },
  memberRole: {
    fontSize: 14,
    textAlign: 'center',
  },
  missionSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  visionSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});