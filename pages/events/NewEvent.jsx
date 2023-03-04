import { MyText, Row } from '../../components/Components'
import { getDatabase, ref, push, set } from "firebase/database";
import React, { useContext, useEffect } from 'react';
import { View, Button, TextInput } from 'react-native';
import { styles } from '../../styles/styles'

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import Select from '../../components/Select';
import DateTimePicker from '../../components/DateTimePicker';
import axios from 'axios';
import { MyImagePicker } from '../../components/tools/MyImagePicker';
//import { DatePicker } from './date/DatePicker';

const categories = [
  'Zene','Buli','Fesztivál','Vásár','Mozgás/Sport','Előadás','Film','Kiállítás'
]

const NewEvent = ({ navigation, route }) => {
  const uid = useSelector((state) => state.user.uid)
  const {app, auth}  = useContext(FirebaseContext);
  const [data, setData] = React.useState({
    title: '',
    description: '',
    dateStart: null,
    dateEnd: null,
    place: {
      lat:-1,
      lng:-1,
      address:null
    },
    category: null,
    genre: []
  });

  useEffect(() => {
    axios.get('https://maps.googleapis.com/maps/api/geocode/json',{
      params: {
        address: 'Liptói u. 48',
        key: 'AIzaSyDqjygaNZxE3FU0aJbQ9v6EOzOdV2waxSo'
      }
    }).then(
      res=>{
        console.log('geo',res);
      }
    )
  }, [data]);
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
      <MyText style={styles.subTitle}>Új esemény feltöltése</MyText>
      <MyImagePicker />
      <MyText style={styles.label}>Esemény neve</MyText>
      <TextInput
        style={styles.searchInput}
        onChangeText={(e)=>setData({...data,title: e})}
        editable
        placeholder="Esemény neve"
      />
      <MyText style={styles.label}>Leírás</MyText>
      <TextInput
        style={styles.searchInput}
        onChangeText={(e)=>setData({...data,description: e})}
        editable
        numberOfLines={3}
        placeholder="Leírás"
      />
      <MyText style={styles.label}>Időtartam</MyText>
      <Row style={{justifyContent:'center',alignItems:'center'}}>
          <DateTimePicker
              setValue={(v)=>setData({...data,minDate:v})}
              value={data.minDate}
              style={{...styles.searchInput,flex:1}}
              min="now"
              placeholder="tól-"
          />
          <MyText style={{fontSize:20}}>-</MyText>
          <DateTimePicker
              setValue={(v)=>setData({...data,maxDate:v})}
              value={data.maxDate}
              style={{...styles.searchInput,flex:1}}
              min="now"
              placeholder="-ig"
          />
      </Row>
      <MyText style={styles.label}>Cím</MyText>
      <TextInput
        style={styles.searchInput}
        onChangeText={(e)=>setData({...data,place: {address:e}})}
        editable
        placeholder="Hely"
      />
      <MyText style={styles.label}>Kategória</MyText>
      <Select
        style={styles.searchInput}
        onSelect={(e)=>setData({...data,category: e})}
        list={categories}
        placeholder="Hely"
      />
      <Button style={styles.headline} title="Mentés" color="black" onPress={save} />
    </View>
  )
}
export default NewEvent