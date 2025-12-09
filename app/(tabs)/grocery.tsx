import { StyleSheet } from 'react-native';

import GroceryList from '@/components/GroceryList';
import { View } from '@/components/Themed';

export default function GroceryTabScreen() {
  return (
    <View style={styles.container}>
      <GroceryList/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
