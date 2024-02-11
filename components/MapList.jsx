
import { getDatabase } from 'firebase/database';
import React, { useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { AutoPrefix } from '../lib/textService/textService';
import { getPlaces } from '../pages/maps/mapService';
import { Loading, MyText, NewButton, Row } from './Components';
import { MapContext } from '../pages/maps/MapContext';

export const MapList = ({map}) => {
    //const placeList = [];
    const {selected,setSelected,selectedPlace,setSelectedPlace,placeList,setPlaceList,setNewPlace,secure,starred,setStarred} = useContext(MapContext);
    const [loading, setLoading] = useState(false);
    const thisStarred = starred.find(e=>e==map.id)!=undefined;

    useEffect(() => {
      if (selected.id == map.id)
        getData()
    }, [selected]);
;

    const getData = async () => {
      setLoading(true);
      try {
        const locations = Object.values(await getPlaces(selected.id+1,secure));
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

    const press = () => {
      console.log('press');
      if (selected.id==map.id) {
        setSelected({id:null,name:null});
      } else {
        setSelected(map);
      }
    }
    return (
      <View key={map?.id} style={{justifyContent:'flex-end',backgroundColor:'#ffffd6',order:thisStarred?0:1}}>
          <Row>
            {selected?.id==map.id &&
            <Pressable onPress={press} style={{alignItems:'center',justifyContent:'center',width:30}}>
              <Icon name="chevron-back-outline" size={30} color='black'/>
            </Pressable>}
            <Pressable onPress={press}
              style={[localStyles.mapLink]}>
            
                <MyText style={[selected.id==map.id ?  {color:map.color} : {},{flexGrow:1}]}>{map.name}</MyText>
                <Pressable
                style={{ marginHorizontal: 12, textAlign:'right' }}
                onPress={()=>{
                  console.log('star',map.id,starred?.[map?.id])
                  starred.find(e=>e==map.id) != undefined ?
                  setStarred(starred.filter(e=>e!=map.id))
                  :
                  setStarred(old=>[...old,map.id])
            
                }}>
                  <Icon name={thisStarred?"star":"star-outline"} size={20} color={thisStarred?'#e7c73d':'#988328'}/>
                </Pressable>
            </Pressable>
          </Row>
          {selected.id == map.id && <>
            {loading ?
            <Loading color="#fff" />
              :<View style={{flexWrap:'wrap',flexDirection:'row',flex:1}}>
              {!placeList?.length ? 
                <View style={{marginLeft:50,width:'70%'}}>
                  <MyText><AutoPrefix text={selected.name}/> kategória üres még!</MyText>
                  
                </View> :
                placeList.map((place,index2)=>{
                  return (
                    <Pressable style={[localStyles.mapLink,{borderWidth:selectedPlace?.id==place.id ? 2 : 0}]} 
                              key={"place"+index2} onPress={()=>{
                                  if (selectedPlace?.id==place.id) {
                                    setSelectedPlace(null)
                                  }
                                  else {
                                    setSelectedPlace(place);
                                  }
                                }}>
                      <MyText style={{color:selected==place ? map.color : 'black'}}>{place.title}</MyText>
                    </Pressable>)
                  })}
            </View>}

          </>}
            {false&&<NewButton title="+ Új hely" style={{backgroundColor:'#FDEEA2'}}
                  onPress={()=>{setNewPlace(true)}}
                  />}
      </View>
    )
}


const localStyles = {
    mapLink: {
      padding: 5,
      margin: 5,
      backgroundColor: 'white',
      borderRadius:8,
      borderColor:'black',
      flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center',
      flexGrow:1,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
  }