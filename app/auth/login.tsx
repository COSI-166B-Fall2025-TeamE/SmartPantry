import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import 'react-native-url-polyfill/auto';
import validatePassword from './passwordValidator';


export default function LoginScreen() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }
  
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(''); //clear previous error message
    
    // authentilize current input password
    if (text.length > 0) {
      const { isValid, errorMessage } = validatePassword(text);
      if (!isValid) {
        setPasswordError(errorMessage);
      }
    }
  };


  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error logging out:', error.message)
    } else {
      console.log('Successfully logged out')
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Login</Text>
      
      {/* The logout button is only displayed when the user is logged in. */}
      {session && session.user ? (
        <View style={styles.loggedInContainer}>
          <Text style={styles.loggedInText}>User Name: {session.user.user_metadata.display_name}</Text>
          <Text style={styles.loggedInText}>You are already logged in</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={handlePasswordChange}//judge password
          />
          
          {passwordError ? (// display error message
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{passwordError}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.button} onPress={signInWithEmail}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <View style={styles.flexSpacer} />

          {/*jump to sign up*/}
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkHighlight}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  justifyContent: 'flex-start',
  alignItems: 'center',
  backgroundColor: '#fff',
  paddingTop: 120, 
  paddingBottom: 50,
},
  title: { 
    fontSize: 28, 
    fontFamily:'Avenir',
    fontWeight: 'bold', 
    marginBottom: 24, 
    color: '#371B34',
    textAlign: 'center' 
},
  loggedInContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
  },
  loggedInText: {
    fontSize: 18,
    color: '#371B34',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#CDD0E3',
    borderRadius: 8,
    padding: 15, 
    marginVertical: 12,
    color: '#371B34',
    backgroundColor: '#EBF6F0',
    fontSize: 18,
},
  errorContainer: {
    width: '80%',
    backgroundColor: '#f8e3e3ff',
    borderColor: '#FFBFBF',
    borderRadius: 8,
    borderWidth: 2,
    padding: 12,
    marginVertical: 12,
  },
  errorText: {
    color: '#f54a4aff',
    fontSize: 14,
    fontWeight: '500',
  },
  button: { 
    backgroundColor: '#371B34',
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center',
    width: '80%',
    marginTop: 12,
},
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '600' 
},
  logoutButton: {
    backgroundColor: '#f54a4aff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  linkText: { 
    fontSize:16,
    marginTop: 20, 
    color: '#A598A4' 
},
  linkHighlight: { 
    color: '#371B34',
    fontWeight: 'bold' 
},
  flexSpacer: {
    flex: 1,
},
});