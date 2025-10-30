import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


export default function SignUpScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.signupButton}>
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
  linkHighlight: {
    color: '#371B34',
    fontWeight: 'bold',
  },
  flexSpacer: {
    flex: 1,
},
});
