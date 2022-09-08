import { LoadImage, Loading } from './Components'
import { getDatabase, ref, child, push, get, set, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import React, { useContext, useEffect } from 'react';
import { Text, View, Button, Pressable, TextInput } from 'react-native';
import { styles } from './styles'

import { global } from './global'
import { useSelector } from 'react-redux'
import Icon from 'react-native-vector-icons'
import { FirebaseContext } from '../firebase/firebase';
//import { DatePicker } from './date/DatePicker';

export const NewEvent = ({ navigation, route }) => {
  const uid = useSelector((state) => state.user.uid)
  const {app, auth}  = useContext(FirebaseContext);
  const [data, setData] = React.useState({
    title: '',
    description: ''
  });
  function save() {
    if (uid) { 
        console.log('save');
        console.log(uid);
        const db = getDatabase();
        const postListRef = ref(db, 'events' );
        const newPostRef = push(postListRef)
        data.uid = uid
        set(newPostRef, data)
        console.log(data);
        console.log('real uid',auth);
        console.log(newPostRef.key);
    }
    else {
      console.log('not logged in');
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
        placeholder="Leírás"
      />
      <Button style={styles.headline} title="Mentés" color="black" onPress={save} />
    </View>
  )
}