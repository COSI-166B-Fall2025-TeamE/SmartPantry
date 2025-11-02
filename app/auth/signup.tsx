import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { validatePassword } from '../auth/passwordValidator';


export default function SignUpScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateUsername = (text: string) => {
  //check if username is at most 20 characters long
  if (text.length > 20) {
    return false;
  }
  //check if username contains only alphanumeric characters
  const regex = /^[a-zA-Z0-9]+$/;
  return regex.test(text);
};

  const handleUsernameChange = (text: string) => {
    //limit username to 20 characters
    if (text.length <= 20) {
      setUsername(text);
    }
  
  setUsernameError('');
  if (text.length > 0) {
    if (!validateUsername(text)) {
      setUsernameError('Username can only contain letters and numbers and must be no longer than 20 characters');
    }
  }
};
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(''); //clear previous error message
    
    // authenticate current input password
    if (text.length > 0) {
      const { isValid, errorMessage } = validatePassword(text);
      if (!isValid) {
        setPasswordError(errorMessage);
      }
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError('');
    
    if (text !== password) {
      setConfirmPasswordError('Passwords do not match');
    }
  };

  const handleSignup = () => {
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Password:", password);
    
    if (!validateUsername(username)) {
      Alert.alert(
        'Invalid Username',
        'Username must be less than 20 characters and contain only letters and numbers.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Validate password
    const { isValid, errorMessage } = validatePassword(password);
    if (!isValid) {
      Alert.alert(
        'Invalid Password',
        errorMessage,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'Passwords do not match',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // TODO: wait to replace with navigation back or success message
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={handleUsernameChange}
        maxLength={20}
      />
      {usernameError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{usernameError}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input with Eye Icon */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputWithIcon}
          placeholder="Password"
          value={password}
          secureTextEntry={!showPassword}
          onChangeText={handlePasswordChange}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? "eye":"eye-off" } 
            size={24} 
            color="#371B34" 
          />
        </TouchableOpacity>
      </View>
      
      {passwordError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{passwordError}</Text>
        </View>
      ) : null}
      
      {/* Confirm Password Input with Eye Icon */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputWithIcon}
          placeholder="Confirm Password"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? "eye":"eye-off" } 
            size={24} 
            color="#371B34" 
          />
        </TouchableOpacity>
      </View>
      
      {confirmPasswordError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{confirmPasswordError}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupText}>Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.flexSpacer} />

      {/* jump back to login */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkHighlight}>Log in</Text>
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
    fontWeight: 'bold',
    fontFamily:'Avenir',
    marginBottom: 30,
    color: '#371B34',
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
  inputContainer: {
    width: '80%',
    borderWidth: 2,
    borderColor: '#CDD0E3',
    borderRadius: 8,
    marginVertical: 12,
    backgroundColor: '#EBF6F0',
    flexDirection: 'row',
    alignItems: 'center',
},
  inputWithIcon: {
    flex: 1,
    padding: 15,
    color: '#371B34',
    fontSize: 16,
},
  eyeIcon: {
    padding: 15,
},
  signupButton: {
    backgroundColor: '#371B34',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    marginTop: 20,
  },
  signupText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  linkText: {
    fontSize:16,
    marginTop: 20,
    color: '#A598A4',
    //marginBottom: 30, 
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
  linkHighlight: {
    color: '#371B34',
    fontWeight: 'bold',
  },
  flexSpacer: {
    flex: 1,
},
});
