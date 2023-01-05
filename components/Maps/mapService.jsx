import { ProfileImage, Loading, Row, MyText } from '../Components'

import { ref, child, get, set, onValue } from "firebase/database";
import React, { useEffect, useContext, useState } from 'react';

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import { TextFor } from "../../textService/textService";
import { widthPercentageToDP } from 'react-native-responsive-screen';
import { useWindowSize } from '../../hooks/window';
import { AloneModal } from '../Modal';


export const getMaps = async (db) => {
    
    return get(ref(db,'maps')).then(snapshot => {
      const data = (snapshot.val())
                  .filter(e=>!!e)
                  .map((e,i)=>{
                    const keys = Object.keys(e?.locations || [])
                    const locations = Object.values(e?.locations || []).map((l,li)=>{
                      l.key = keys[li];
                      return l;
                    })
                    console.log(locations)
                    return {
                      ...e,
                      locations:locations,
                      color:'#'+Math.floor(Math.random()*16777215).toString(16)}
                  })
      return(data)
    })
}
export const getHearts = async (db,uid,mapId,locationId) => {
    if (mapId && locationId ) {
      const obj = await get(ref(db,'maps/' + mapId + "/locations/" + locationId + "/likes/"))
      console.log('maps/' + mapId + "/locations/" + locationId + "/likes/",obj);
      if (!obj.val()) return null
      const list = Object.keys(obj.val())
      console.log(list);
      const me = list.includes(uid)
      return ({all: list, me: me});
    } else return null
    
}

export const heartLocation = async (db,uid,mapId,locationId,toHeart) => {
  if (!(uid && mapId && locationId))
  throw new Error('Something is null')

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
    const {location,locationId,mapId,setLocation} = props;
    const [heartedList, setHeartedList] = useState(null);
    const [hearted, setHearted] = useState(false);
    const [help, setHelp] = useState(false);
    const [helpModal, setHelpModal] = useState(false);

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
      <ScrollView style={[styles.selectedLocation,{flex: width <= 900 ? 1 : 'none'} ]}>
        <Row>
          <MyText style={{fontSize:20,padding:10,flexGrow:1}}>{location?.name}</MyText>
          <Pressable style={{padding:10}} onPress={()=>setLocation(null)}><MyText style={{fontSize:20}}>X</MyText></Pressable>
        </Row>
        <MyText style={{padding:10}}>{location?.description}</MyText>
        <TouchableOpacity onPress={handleHeart} style={{flexDirection:'row',alignItems:'center'}}>
            <Icon name={hearted ? "heart" : "heart-outline"} size={25} color="red" style={{paddingHorizontal:10}}/>
            <TextFor text="heart" />
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>help ? handleHelp() : setHelpModal(true)} style={{flexDirection:'row',alignItems:'center'}}>
            <Icon name={help ? "person-add" : "person-add-outline"} size={25} color="green" style={{paddingHorizontal:10}}/>
            <TextFor text="help_needed" />
        </TouchableOpacity>
        <AloneModal 
        modalVisible={helpModal} 
        setModalVisible={setHelpModal} 
        locationName={location?.name}
        handleOK={handleHelp}/>
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
