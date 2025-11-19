import Colors from '@/constants/templateColors';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function HelpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
        
        <View style={[styles.section, { backgroundColor: colors.selectedDateCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          
          <View style={styles.faqItem}>
            <Text style={[styles.question, { color: colors.text }]}>How do I add items to my pantry?</Text>
            <Text style={[styles.answer, { color: colors.text, opacity: 0.8 }]}>
              You can add items by scanning barcodes or entering them manually. 
              Go to the home screen and choose either "Scan A Barcode" or "Enter Items Manually".
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={[styles.question, { color: colors.text }]}>How are expiration dates tracked?</Text>
            <Text style={[styles.answer, { color: colors.text, opacity: 0.8 }]}>
              Items are displayed in the "Expiration Tracker" tab with visual indicators. 
              You'll receive notifications for items expiring soon.
            </Text>
          </View>
          
          <View style={styles.faqItem}>
            <Text style={[styles.question, { color: colors.text }]}>Can I share my shopping list?</Text>
            <Text style={[styles.answer, { color: colors.text, opacity: 0.8 }]}>
              Currently, shopping lists are personal. You can view and edit your list in the "Grocery List" section.
            </Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.selectedDateCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          
          <View style={styles.contactItem}>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Email:</Text>
            <Text style={[styles.contactValue, { color: colors.buttonBackground }]}>support@smartpantry.app</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Phone:</Text>
            <Text style={[styles.contactValue, { color: colors.buttonBackground }]}>1-800-SMART-PANTRY</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={[styles.contactLabel, { color: colors.text }]}>Hours:</Text>
            <Text style={[styles.contactValue, { color: colors.text, opacity: 0.8 }]}>Monday - Friday: 9AM - 5PM</Text>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.selectedDateCard }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Feedback</Text>
          <Text style={[styles.description, { color: colors.text, opacity: 0.8 }]}>
            We value your feedback! Help us improve SmartPantry by sharing your experience and suggestions.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.homeButton, { backgroundColor: colors.inventoryChip}]}
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
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  faqItem: {
    marginBottom: 15,
  },
  question: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  answer: {
    fontSize: 16,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 60,
  },
  contactValue: {
    fontSize: 16,
    flex: 1,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
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