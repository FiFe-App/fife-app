
import { getDatabase } from 'firebase/database';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AutoPrefix } from '../lib/textService/textService';
import { getPlaces } from '../pages/maps/mapService';
import { Loading, MyText } from './Components';
import { MapContext } from '../pages/maps/MapContext';

export const MapList = ({map}) => {
    //const placeList = [];
    const {selected,setSelected,selectedPlace,setSelectedPlace,placeList,setPlaceList,search} = useContext(MapContext);
    const db = getDatabase()
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (selected.id == map.id)
        getData()
    }, [selected]);

    const getData = async () => {
      console.log('get data');
      setLoading(true);
      try {
        const locations = Object.values(await getPlaces(selected.id+1));
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

    const press = () => {
      if (selected.id==map.id) {
        setSelected({id:null,name:null});
      } else {
        setSelected(map);
      }
    }

    return (
      <View key={map?.id} style={{justifyContent:'flex-end',backgroundColor:'#FDEEA2'}}>
          <Pressable onPress={press}
            style={[localStyles.mapLink,{borderWidth:selected?.id==map.id ? 2 : 0}]}>
              <MyText style={selected.id==map.id ?  {color:map.color} : {}}>{map.name}</MyText>
              <Icon style={{ marginHorizontal: 12, flex:1, textAlign:'right' }} name={selected.id==map.id ? 'chevron-down-outline' : 'chevron-forward-outline'} size={25} color={selected.id==map.id ?  map.color : "#000"} />
          </Pressable>
          {selected.id == map.id && <>
            {loading ?
            <Loading color="#fff" />
             : <ScrollView >
              {!placeList?.length ? <MyText style={{marginLeft:50,width:'70%'}}>
                <AutoPrefix text={selected.name}/> kategória üres még!</MyText> :
                placeList.map((place,index2)=>{
                  console.log('place',index2,place,selectedPlace)
                if (true || place?.likes != null)
                if (place?.title?.toLowerCase().includes(search) || place?.description?.toLowerCase().includes(search) || !search)
                return (
                  <Pressable style={[localStyles.mapLink,{left:10,marginHorizontal:40,borderWidth:selectedPlace?.id==place.id ? 2 : 0}]} 
                            key={"place"+index2} onPress={()=>{
                                if (selectedPlace?.id==place.id) {
                                  setSelectedPlace(null)
                                }
                                else {
                                  setSelectedPlace(place);
                                  //setIds({...ids,locationId:placeList.find(e=>e.title==place.title).key})
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
      borderColor:'black',
      flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center'
    },
  }