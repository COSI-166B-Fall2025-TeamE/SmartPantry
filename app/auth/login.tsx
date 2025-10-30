import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState(''); 

  const validateUsername = (text: string) => {
    // Check if the username is at most 8 characters long and contains only alphanumeric characters
    if (text.length > 8) {
      return false;
    }
    // Check  if the username contains only alphanumeric characters
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(text);
  };

  const handleUsernameChange = (text: string) => {
    
    // limit  username to 8 characters 
    if (text.length <= 8) {
      setUsername(text);
    }

    setUsernameError('');

    // Check if text contains only alphanumeric characters
    if (text.length > 0) {
      const regex = /^[a-zA-Z0-9]*$/;
      if (!regex.test(text)) {
        setUsernameError('Username can only contain letters and numbers and on longer than 8 characters');
      }
    }
  };

  const handleLogin = () => {
    console.log("Username:", username);
    console.log("Password:", password);

    //  Validate username
    if (!validateUsername(username)) {
      Alert.alert(
        'Invalid Username',
        'Username must be exactly 8 characters long and contain only letters and numbers.',
        [{ text: 'OK' }]
      );
      return;
    }
    // TODO: wait to replace with navigation back or success message
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={handleUsernameChange}
        autoCapitalize="none"
        maxLength={8}
      />

      {usernameError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{usernameError}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.flexSpacer} />

      {/*jump to sign up*/}
      <TouchableOpacity onPress={() => router.push('/auth/signup')}>
        <Text style={styles.linkText}>
          Don’t have an account? <Text style={styles.linkHighlight}>Sign up</Text>
        </Text>
      </TouchableOpacity>

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

