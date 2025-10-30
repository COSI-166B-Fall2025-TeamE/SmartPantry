import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log("Username:", username);
    console.log("Password:", password);
    // TODO: wait to replace with navigation back or success message
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
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
    fontSize: 16,
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

