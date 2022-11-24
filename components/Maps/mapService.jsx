import { ProfileImage, Loading, Row } from '../Components'

import { ref, child, get, set, onValue } from "firebase/database";
import React, { useEffect, useContext, useState } from 'react';

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import { TextFor } from "../../textService/textService";
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { useWindowSize } from '../../hooks/window';
import { ScrollView } from 'react-native-web';


export const getMaps = async (db) => {
    
    return get(ref(db,'maps')).then(snapshot => {
      const data = (snapshot.val())
                  .filter(e=>!!e)
                  .map(e=>{
                    return {...e,locations:Object.values(e?.locations || [])}
                  })
      return(data)
    })
}
export const getHearts = async (db,uid,mapId,locationId) => {
    let list = [];
    let me = false
    await get(ref(db,'maps/' + mapId + "/locations/" + locationId + "/likes/"), async (snapshot) => {
      let mine = false
      snapshot.forEach((childSnapshot) => {
        const childKey = childSnapshot.key;
        if (childKey == uid)
          mine = true

        list.push(childKey)
      });
      return mine
      });
    return ({all: list, me: me});
    
}

export const heartLocation = async (db,uid,mapId,locationId,toHeart) => {
  let success = false
  const dbRef = ref(db, 'maps/' + mapId + "/locations/" + locationId + "/likes/" + uid);
  if (toHeart)
    await set(dbRef,{"owner":null}).then(success = true);
  else
    await set(dbRef, { "owner": uid }).then(success = true);;
  return success
}

export const helpLocation = async (db,uid,mapId,locationId,toHelp) => {
    
  let success = false
  const dbRef = ref(db, 'help/'+uid);
  if (toHelp)
    await set(dbRef,null).then(success = true);
  else
    await set(dbRef, { 
      mapId: mapId,
      locationId: locationId,
      date: Date.now()
    }).then(success = true);;
  return success
}

export const LocationData = (props) => {
    const width = useWindowSize().width;
    const {database} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const {location,locationId,mapId} = props;
    const [heartedList, setHeartedList] = useState(null);
    const [hearted, setHearted] = useState(false);
    const [help, setHelp] = useState(false);

    useEffect(() => {
      if (location) {
        (async ()=>{
        const hearts = await getHearts(database,uid,mapId,locationId)
        setHearted(hearts?.me)
        })()
        
      }
    }, [props.locationId,props.mapId]);

    if (!location) return null

    const handleHeart = async () => {
      const success = await heartLocation(database,uid,mapId,locationId,hearted)
      if (success)
      setHearted(!hearted)
    }
    const handleHelp = async () => {
      const success = await helpLocation(database,uid,mapId,locationId,help)
      if (success)
      setHelp(!help)
    }

    return (
      <ScrollView style={[styles.selectedLocation,{flex: width <= 900 ? 'none':1} ]}>
        <Text style={{fontSize:20,padding:10}}>{location?.name}</Text>
        <Text style={{padding:10}}>{location?.description}</Text>
        <TouchableOpacity onPress={handleHeart} style={{flexDirection:'row',alignItems:'center'}}>
            <Icon name={hearted ? "heart" : "heart-outline"} size={25} color="red" style={{paddingHorizontal:10}}/>
            <TextFor text="heart" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleHelp} style={{flexDirection:'row',alignItems:'center'}}>
            <Icon name={help ? "person-add" : "person-add-outline"} size={25} color="green" style={{paddingHorizontal:10}}/>
            <TextFor text="help_needed" />
        </TouchableOpacity>
      </ScrollView>
    )
  }

const styles = StyleSheet.create({
  selectedLocation: {
    padding:10,
    borderColor: '#f9f9f9',
    flex:1,
    borderWidth:1
  }
})
