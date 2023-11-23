import { ProfileImage, Loading, Row, MyText } from '../../components/Components'

import { ref, child, get, set, onValue } from "firebase/database";
import React, { useEffect, useContext, useState, useRef } from 'react';

import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { Pressable, StyleSheet, TouchableOpacity, ScrollView, Animated, PanResponder, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'

import { TextFor } from "../../lib/textService/textService";
import { useWindowDimensions } from 'react-native'
import { AloneModal } from '../../components/Modal';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import UrlText from '../../components/tools/UrlText';
import openMap from 'react-native-open-maps';
import { MapContext } from './MapContext';
import Comments from '../../components/tools/Comments';
import { categories } from '../../lib/categories';



export const getMaps = async (db) => {
    try {
      return categories.places;
    } catch (error) {
      console.log(error);
      return null
    }
}

export const getPlaces = async (id,secure) => {

  try {
    const data = await axios.get('/places/'+id,{...config(),params:{
      secure:secure
    }})
    return data.data
  } catch (error) {
    console.log(error);
    return null
  }
}

export const getPlaceById = async (id) => {

  try {
    const data = await axios.get('/places/'+id+'/search',config())
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

    const {database} = useContext(FirebaseContext);
    const {selectedPlace,setSelectedPlace} = useContext(MapContext);
    const uid = useSelector((state) => state.user.uid)
    const [heartedList, setHeartedList] = useState(null);
    const [hearted, setHearted] = useState(false);
    const [help, setHelp] = useState(false);
    const [helpModal, setHelpModal] = useState(false);


    useEffect(() => {
      console.log('locationLIke',selectedPlace.id);

      if (selectedPlace.id) {
        (async ()=>{
        const hearted = await getHearts(selectedPlace.id)
        console.log('hearted',hearted);
        setHearted(hearted)
        })()
        
      }
    }, [selectedPlace?.id]);

    if (!selectedPlace) return null

    const handleHeart = async () => {
      const success = await heartLocation(selectedPlace.id,hearted)
      if (success)
      setHearted(!hearted)
    }
    const handleHelp = async () => {
      const success = await helpLocation(database,uid,mapId,locationId,help)
      if (success)
      setHelp(!help)
    }

    return (
        <ScrollView style={[styles.selectedLocation,{flexGrow:1} ]}>
          {false&&<View style={styles.draggable}/>}
          <Row>
            <Pressable style={{paddingHorizontal:10,justifyContent:'center'}} onPress={()=>setSelectedPlace(null)}><Icon size={25} name="chevron-back-outline"/></Pressable>
            <MyText style={{fontSize:20,paddingHorizontal:10,flexGrow:1}}>{selectedPlace?.title}</MyText>
          </Row>
          <UrlText style={{padding:10}} text={selectedPlace?.description} />
          <TouchableOpacity onPress={handleHeart} style={{flexDirection:'row',alignItems:'center'}}>
              <Icon name={hearted ? "heart" : "heart-outline"} size={25} color="red" style={{paddingHorizontal:10}}/>
              <TextFor text="heart" />
          </TouchableOpacity>

          <TouchableOpacity onPress={()=>openMap({ 
            latitude: selectedPlace.lat, 
            longitude: selectedPlace.lng,
            query: selectedPlace.title,
            end: selectedPlace.title,
          }) } 
          style={{flexDirection:'row',alignItems:'center'}}>
              <Icon name={"compass-outline"} size={25} color="blue" style={{paddingHorizontal:10}}/>
              <TextFor text="open_maps" />
          </TouchableOpacity>
          <Comments path={"places/"+selectedPlace.id} />
          <AloneModal 
          modalVisible={helpModal} 
          setModalVisible={setHelpModal} 
          locationName={selectedPlace?.name}
          handleOK={handleHelp}/>
        </ScrollView>
    )
  }

const styles = StyleSheet.create({
  selectedLocation: {
    padding:10,
    bottom:0,
    flex:1,
    zIndex:10,
    width:'100%',
    backgroundColor:'#ffffd6'
  },
  draggable: {
    backgroundColor:'black',
    borderRadius:8,
    alignSelf:'center',
    width:30,
    height:5,
    margin:5
  }
})
