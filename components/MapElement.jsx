
import { getDatabase } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AutoPrefix } from '../lib/textService/textService';
import { getPlaces } from '../pages/maps/mapService';
import { Loading, MyText } from './Components';

export const MapElement = ({selectedMap,map,setSelectedMap,ids,categoryList,setIds,index,searchL,selected,setSelected,placeList, setPlaceList}) => {
    //const placeList = [];
    const db = getDatabase()
    const [loading, setLoading] = useState(false);
    useEffect(() => {
      if (selectedMap?.name == map)
        getData()
    }, [selectedMap]);

    const getData = async () => {
      console.log('get data');
      setLoading(true);
      try {
        const locations = Object.values(await getPlaces(index+1));
        setPlaceList(locations)
      } catch (error) {
        console.log(error);

        if (error?.response?.data == 'Token expired') {
          console.log('Token expired');
          api.logout();
          return
        }
        setPlaceList([])
      }
      setLoading(false)
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
          {selectedMap?.name == map && <>
            {loading ?
            <Loading color="#fff" />
             : <ScrollView >
              {!placeList?.length ? <MyText style={{marginLeft:50,width:'70%'}}><AutoPrefix text={selectedMap.name}/> kategória üres még!</MyText> :
              placeList.map((place,index2)=>{
                if (true || place?.likes != null)
                if (place?.title?.toLowerCase().includes(searchL) || place?.description?.toLowerCase().includes(searchL) || !searchL)
                return (
                  <Pressable style={[localStyles.mapLink,{left:10,marginHorizontal:40,borderColor:selected==place ? map.color : 'black'}]} 
                            key={"place"+index2} onPress={()=>{
                                if (selected==place) {
                                  setSelected(null)
                                  setIds({mapId:null,locationId:null})
                                }
                                else {
                                  setSelected(place);
                                  setIds({...ids,locationId:placeList.find(e=>e.title==place.title).key})
                                }
                              }}>
                    <MyText style={{color:selected==place ? map.color : 'black'}}>{place.title}</MyText>
                  </Pressable>)
                })}
            </ScrollView>}
          </>}
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