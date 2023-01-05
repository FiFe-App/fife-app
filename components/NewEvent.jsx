import { MyText } from './Components'
import { getDatabase, ref, push, set } from "firebase/database";
import React, { useContext } from 'react';
import { View, Button, TextInput } from 'react-native';
import { styles } from './styles'

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
//import { DatePicker } from './date/DatePicker';

const NewEvent = ({ navigation, route }) => {
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
      <MyText>Esemény neve</MyText>
      <TextInput
        style={styles.searchInput}
        onChangeText={(e)=>setData({...data,title: e})}
        editable
        placeholder="Esemény neve"
      />
      <MyText>Leírás</MyText>
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
export default NewEvent