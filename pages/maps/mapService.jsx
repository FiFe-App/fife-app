import { ProfileImage, Loading, Row, MyText } from '../../components/Components'

import { ref, child, get, set, onValue } from "firebase/database";
import React, { useEffect, useContext, useState } from 'react';

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { Pressable, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import { TextFor } from "../../lib/textService/textService";
import { useWindowDimensions } from 'react-native'
import { AloneModal } from '../../components/Modal';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import UrlText from '../../components/tools/UrlText';
import openMap from 'react-native-open-maps';



export const getMaps = async (db) => {
    try {
      
      return [
        "Adományboltok",
        "Turik",
        "Nyilvános vécék",
        "Ivóvíz lelőhelyek",
        "FiFe kocsmák",
        "Csomagolásmentes boltok",
        "Piacok",
        "Bulihelyek",
        "Ruhaleadó helyek",
        "Szelektív gyűjtők",
        "Komposztok",
        "Közösségi helyek, kertek",
        "Fotóboltok",
        "Biszbasz boltok, régiség boltok",
        "Galériák",
        "Művészmozik",
        "Kifőzdék",
        "Biztonságos biciklitárolók",
        "Jó szpotok"
      ]
    } catch (error) {
      console.log(error);
      return null
    }
    /*return get(ref(db,'maps')).then(snapshot => {
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
    })*/
}

export const getPlaces = async (id) => {

  try {
    const data = await axios.get('/places/'+id,config())
    console.log('getPlaces',data);
    return data.data
  } catch (error) {
    console.log(error);
    return null
  }
}

export const getHearts = async (locationId) => {
    if (locationId ) {
      const heart = await axios.get('/places/' + locationId + '/like',config());
      console.log('heart',heart.data);
      return heart.data
    } else return null
    
}

export const heartLocation = async (locationId,toHeart) => {
  if (!(locationId)){
    console.log(locationId);
    throw new Error('Something is null')
  }


  const success = await axios.post('/places/' + locationId + '/like',toHeart,config());
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
    const { width } = useWindowDimensions();
    const {database} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const {location,locationId,mapId,setLocation} = props;
    const [heartedList, setHeartedList] = useState(null);
    const [hearted, setHearted] = useState(false);
    const [help, setHelp] = useState(false);
    const [helpModal, setHelpModal] = useState(false);

    useEffect(() => {
      console.log('locationLIke',location.id);

      if (location.id) {
        (async ()=>{
        const hearted = await getHearts(location.id)
        console.log('hearted',hearted);
        setHearted(hearted)
        })()
        
      }
    }, [location.id]);

    if (!location) return null

    const handleHeart = async () => {
      const success = await heartLocation(location.id,hearted)
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
          <MyText style={{fontSize:20,padding:10,flexGrow:1}}>{location?.title}</MyText>
          <Pressable style={{paddingHorizontal:10}} onPress={()=>setLocation(null)}><MyText style={{fontSize:20}}>X</MyText></Pressable>
        </Row>
        <UrlText style={{padding:10}} text={location?.description} />
        <TouchableOpacity onPress={handleHeart} style={{flexDirection:'row',alignItems:'center'}}>
            <Icon name={hearted ? "heart" : "heart-outline"} size={25} color="red" style={{paddingHorizontal:10}}/>
            <TextFor text="heart" />
        </TouchableOpacity>

        <TouchableOpacity onPress={()=>openMap({ 
          latitude: location.lat, 
          longitude: location.lng,
          query: location.title,
          end: location.title,
        }) } 
        style={{flexDirection:'row',alignItems:'center'}}>
            <Icon name={"compass-outline"} size={25} color="blue" style={{paddingHorizontal:10}}/>
            <TextFor text="open_maps" />
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
    borderWidth:1,
    zIndex:10,
    width:'100%',
    backgroundColor:'rgb(253, 238, 162)'
  }
})
