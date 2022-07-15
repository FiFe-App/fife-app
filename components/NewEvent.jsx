import { LoadImage, Loading } from './Components'
import { getDatabase, ref, child, push, get, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import React, { useEffect } from 'react';
import { Text, View, Button, Pressable, TextInput } from 'react-native';
import { styles } from './styles'
//import { MapView } from 'react-native-maps';
import { global } from './global'
import Icon from 'react-native-vector-icons'

import DateTimePicker from '@react-native-community/datetimepicker';


export const NewEvent = ({ navigation, route }) => {
  const auth = getAuth();
  const [data, setData] = React.useState({
    title: '',
    description: ''
  });
  function save() {
    if (auth?.currentUser) { 
        console.log('save');
        console.log(auth.currentUser.uid);
        const db = getDatabase();
        const postListRef = ref(db, 'events');
        const newPostRef = push(postListRef)
        data.uid = auth.currentUser.uid
        //set(newPostRef, data)
        console.log(data);
        console.log(newPostRef.key);
    }
  }
  return (
    <View>
      <Text>Esemény neve</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={(e)=>setData({...data,title: e})}
        editable
        placeholder="Esemény neve"
      />
      <Text>Leírás</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={(e)=>setData({...data,description: e})}
        editable
        secureTextEntry
        placeholder="Leírás"
      />
      <RNDateTimePicker display="spinner" />
      <Button style={styles.headline} title="Mentés" color="black" onPress={() =>
        save()
      } />
    </View>
  )
}