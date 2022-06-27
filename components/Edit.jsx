import { LoadImage, Loading } from './Components'
import { ref, child, get, set, onValue } from "firebase/database";
import React, { useEffect } from 'react';
import { Text, View, Button, Pressable, TextInput } from 'react-native';
import { styles } from './styles'
//import { MapView } from 'react-native-maps';
import { global } from './global'
import Icon from 'react-native-vector-icons'

export const Edit = ({ navigation, route }) => {
  const [data, setData] = React.useState({
    username: '',
    name: ''
  });
  function save() {
    console.log('save');
  }
  return (
    <View>
      <Text>Felhasználónév</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={setData}
        editable
        placeholder=""
      />
      <Text>Név</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={setData}
        editable
        secureTextEntry
        placeholder="Név"
      />
      <Button style={styles.headline} title="Bejelentkezés" color="black" onPress={() =>
        save()
      } />
    </View>
  )
}