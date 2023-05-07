
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MyText } from './Components';
import { useEffect } from 'react';
import axios from 'axios';
import { config } from '../firebase/authConfig';
import { get, getDatabase, ref } from 'firebase/database';

export const MapElement = ({selectedMap,map,setSelectedMap,setIds,index,searchL,selected}) => {
    //const placeList = [];
    const db = getDatabase()
    const [placeList, setPlaceList] = useState([]);
    useEffect(() => {
      if (selectedMap?.name == map)
        getData()
    }, [selectedMap]);

    const getData = async () => {
      console.log(index);
      const locations = Object.values((await get(ref(db,'maps/'+(index+1)),config())).val().locations);
      setPlaceList(locations.map((place,index2)=>{

        if (false || place?.likes != null)
        if (place?.name?.toLowerCase().includes(searchL) || place?.description?.toLowerCase().includes(searchL) || !searchL)
        return (
          <Pressable style={[localStyles.mapLink,{left:10,marginHorizontal:40,borderColor:selected==place ? map.color : 'black'}]} 
                     key={"place"+index2} onPress={()=>{
                        if (selected==place) {
                          setSelected(null)
                          setIds({mapId:null,locationId:null})
                        }
                        else {
                          setSelected(place);
                          setIds({...ids,locationId:categoryList.find(e=>e.name == selectedMap?.name).locations.find(e=>e.name==place.name).key})
                        }
                      }}>
            <MyText style={{color:selected==place ? map.color : 'black'}}>{place.name}</MyText>
          </Pressable>)
      }))
    }
      return(
      <View key={index} style={{justifyContent:'flex-end',backgroundColor:'#FDEEA2'}}>
          <Pressable  onPress={()=>{
            if (selectedMap?.name==map) {
              setSelectedMap({id:null,name:null});
              setIds({mapId:null,locationId:null})
            } else {
              setSelectedMap({id:index+1,name:map});
              //setIds({...ids,mapId:categoryList.findIndex(e=>e.name==map)})
            }
          }}
          style={[localStyles.mapLink,selectedMap?.name==map ? {borderColor:map.color} : {}]}>
            <Icon style={{ marginHorizontal: 12 }} name='map' size={25} color={selectedMap?.name==map ?  map.color : "#000"} />
            <MyText style={selectedMap?.name==map ?  {color:map.color} : {}}>{map}</MyText>
            <Icon style={{ marginHorizontal: 12, flex:1, textAlign:'right' }} name='arrow-forward' size={25} color={selectedMap?.name==map ?  map.color : "#000"} />
          </Pressable>
          {selectedMap?.name == map && 
          <ScrollView >
            {placeList}
          </ScrollView>}
      </View>
    )
}


const localStyles = {
    mapLink: {
      padding: 5,
      margin: 5,
      marginHorizontal: 30,
      backgroundColor: 'white',
      borderRadius:8,
      flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center'
    },
  }