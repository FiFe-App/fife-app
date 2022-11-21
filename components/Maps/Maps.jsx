
import React, { useEffect, useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, Platform, View, Button, Pressable, ActivityIndicator, Animated, ScrollView, TextInputBase, Switch  } from 'react-native';
import { Dimensions } from 'react-native';
import { Auto, Loading, NewButton, Row, TextInput } from '../Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { AntDesign } from '@expo/vector-icons';


import {getMaps,LocationData} from "./mapService";
import { FirebaseContext } from '../../firebase/firebase';
import * as Location from 'expo-location';
import { useWindowSize } from '../../hooks/window';
import { push, ref, set } from 'firebase/database';


const defaultFilterList = [
  {name: 'ABC',function: (prop='name') => ((a,b)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
  {name: 'CBA',function: (prop='name') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
  {name: 'legközelebbi',function: (prop='rating') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))}
];

export const Maps = () => {
    //#region state
    const {database} = useContext(FirebaseContext);
    const width = useWindowSize().width;

    const [selectedMap,setSelectedMap] = useState({name:null,id:null}) 
    const [open, setOpen] = useState(true);

    const [map,setMap] = useState(null)
    const [mapData, setMapData] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [maplist,setMapList] = useState(null)
    const [search, setSearch] = React.useState('');
    const [filterList,setFilterList] = useState(null);
    const [settings, setSettings] = useState({secure:true});
    const [greenIcon, setGreenIcon] = useState(null);
    const [locationIcon, setLocationIcon] = useState(null);
    const [filter, setFilter] = React.useState(defaultFilterList[0]);
    const [selected, setSelected] = React.useState(null);
    const [ids, setIds] = useState({mapId:null,locationId:null});
    const [location, setLocation] = useState(null);

    const [newPlace, setNewPlace] = useState(null);
    const [newMarker, setNewMarker] = useState(null);

    const [errorMsg, setErrorMsg] = useState(null);
    //#endregion

    //#region uef
    const reFilterList = () => {
      return defaultFilterList.map((e,index) => {
        if (e.name != filter.name)
        return ( 
          <Pressable style={localStyles.filterList} onPress={()=>{setFilter(defaultFilterList[index]);reFilterList()}} key={e.name}>
            <Text>{e.name}</Text>
          </Pressable>
        )
      })
    }

    useEffect( () => {
      
      let link = document.getElementById("link")
      let script = document.getElementById("script")
      if (!document.getElementById("link") && !document.getElementById("script")) {
        link = document.createElement("link");
        link.id = "link"
        link.rel = "stylesheet";
        link.href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css"
        link.integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
        link.crossOrigin=""

        script = document.createElement("script");
        script.id = "script"
        script.src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js"
        script.integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s="
        script.crossOrigin=""

        document.head.appendChild(link);
        document.body.appendChild(script);
      } else {

      }

      script.onload = async () => {
        setGreenIcon(L.icon({
          iconUrl: require('../../assets/marker.webp'),
        
          iconSize:     [38, 38], // size of the icon
          iconAnchor:   [22, 38], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }));
        setLocationIcon(L.icon({
          iconUrl: require('../../assets/icons/location.svg'),
        
          iconSize:     [40, 40], // size of the icon
          iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }));

        if (!map)
          setMap(L.map('map').setView([47.4983, 19.0408], 13));

      }

      async function getData() {
        setMapData(await getMaps(database));
      }
      getData()


      
    }, []);

    useEffect(() => {
      if (map) {
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
          
        (async () => {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          }
    
          let location = await Location.getCurrentPositionAsync({});

          console.log(location);
          L.marker([location.coords.latitude, location.coords.longitude],{icon: locationIcon }).addTo(map)
          })()
      }
    }, [map]);

    useEffect(() => {
      console.log(newMarker,newPlace);
      if (newMarker)
      if (newPlace) {
        newMarker.addTo(map);
        const popup = newMarker.bindPopup("<b>Ezzel be tudod jelölni az új helyet</b>").openPopup();
        setTimeout(()=>popup.closePopup(), 10000)
      } else {
        console.log('remove');
        map.removeLayer(newMarker)
      }
    }, [newMarker,newPlace]);

    useEffect(()=>{
      if (map) {

        if (!newMarker) {
          const newM = L.marker(map.getCenter())
          map.on('move',()=>{
            newM.setLatLng(map.getCenter())
          })
          setNewMarker(newM);

        }
        if (mapData && selectedMap.name) {
          markers.forEach((m) =>map.removeLayer(m))
         
          mapData.find((e,mapId)=>
          (e.name==selectedMap.name))
          .locations.forEach((location,index) => {
            if (!settings.secure || location?.likes != null) {
              const marker = L.marker([location.lat, location.lng],selected==location ? {icon: greenIcon } : {}).addTo(map)
              marker.bindPopup("<b>"+location.name+"</b><br>"+location.description)
              marker.on('click',() => {
                setSelected(location)
                setIds({...ids,locationId:index})
                marker.getPopup().openPopup();
              })
              setMarkers(old=>[...old,marker])
            }
          });
        }
      }
    },[selectedMap,selected,settings,newPlace])

    useEffect(()=>{
      const searchL = search.toLowerCase()
      if (mapData)
      setMapList(
        mapData.map((map,index) => {
          if (
            map?.name?.toLowerCase().includes(searchL) || 
            !searchL || 
            map?.locations?.find(e=>e?.name.toLowerCase().includes(searchL) || 
            e?.description?.toLowerCase().includes(searchL))
          ) {
            console.log(map);
            const placeList = map.locations.map((place,index2)=>{

              if (!settings.secure || place?.likes != null) //console.log(null != place.likes);
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
                                setIds({...ids,locationId:mapData.find(e=>e.name == selectedMap?.name).locations.findIndex(e=>e.name==place.name)})
                              }
                            }}>
                  <Text style={{color:selected==place ? map.color : 'black'}}>{place.name}</Text>
                </Pressable>)
            })
            return(
              <View key={index} style={{justifyContent:'flex-end'}}>
                  <Pressable  onPress={()=>{
                    if (selectedMap?.name==map.name) {
                      setSelectedMap({id:null,name:null});
                      setIds({mapId:null,locationId:null})
                    } else {
                      setSelectedMap({id:index+1,name:map.name});
                      //setIds({...ids,mapId:mapData.findIndex(e=>e.name==map.name)})
                    }
                  }}
                  style={[localStyles.mapLink,selectedMap?.name==map.name ? {borderColor:map.color} : {}]}>
                    <Icon style={{ marginHorizontal: 12 }}name='map' size={25} color={selectedMap?.name==map.name ?  map.color : "#000"} />
                    <Text style={selectedMap?.name==map.name ?  {color:map.color} : {}}>{map.name}</Text>
                    <Icon style={{ marginHorizontal: 12, flex:1, textAlign:'right' }} name='arrow-forward' size={25} color={selectedMap?.name==map.name ?  map.color : "#000"} />
                  </Pressable>
                  {selectedMap?.name == map.name && 
                  <ScrollView >
                    {placeList}
                  </ScrollView>}
              </View>
            )
          }
        })
      )
    },[search,selectedMap,selected,filter,settings,mapData])

    useEffect(()=>{
      if (map,selected) {
        map.flyTo([selected.lat,selected.lng]);
      }
    },[selected])
    //#endregion

    return (
      <Auto style={{flex:1}}>
        {open && <View style={[localStyles.side,{flex: width <= 900 ? 2 : 1}]}>
          
            <TextInput
              style={localStyles.searchInput}
              onChangeText={setSearch}
              editable
              placeholder="Keress helyekre, kategóriákra"
            />

            <View style={{flexDirection:'row',marginHorizontal:30,marginVertical:5}}>
              <Text style={{flex:1}}>Ellenőrzött helyek helyek</Text>
              <Switch
                  trackColor={{ false: '#767577', true: '#3e3e3e' }}
                  thumbColor={settings?.secure ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(e)=>{setSettings({...settings, secure: e})}}
                  value={settings?.secure}
                  style={{alignSelf:'flex-end'}}
              />
            </View>
            <ScrollView style={{flex:2}}>
              {maplist || <ActivityIndicator size="large" />}
            </ScrollView>  
            {selected ?        
            <LocationData location={selected} locationId={ids.locationId} mapId={selectedMap.id}/>
            :
            <NewPlace setNewPlace={setNewPlace} newPlace={newMarker} selectedMap={selectedMap}/>
            }
        </View>}

          {width < 900 &&
          <Pressable style={{borderBottomWidth:2,padding:5,alignItems:'center',justifyContent:'center'}}
            onPress={()=>setOpen(!open)}>
            <AntDesign name={!open ? 'caretdown' : 'caretup'} size={20}/>
          </Pressable>}
        <div id="map" style={localStyles.map}></div>
      </Auto>
    )
}

const NewPlace = ({setNewPlace,newPlace,selectedMap}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const {database} = useContext(FirebaseContext);

  useEffect(() => {
      console.log('map id',selectedMap.id);
      setNewPlace(open)
  }, [open]);

  const send = () => {
    if (title && description && selectedMap.name && newPlace) {
      console.log('send');
      const mapListRef = ref(database, 'maps/'+selectedMap.id+'/locations');
      const newLocationRef = push(mapListRef);
      set(newLocationRef, {
        description,
        name: title,
        lat: newPlace._latlng.lat,
        lng: newPlace._latlng.lng
      });
    }
  }

  if (!open) return <NewButton title="Tudok egy új helyet!" onPress={()=>setOpen(true)} style={{padding:10}}/>
  else return (
    <View style={{margin:10}}>
      <Row style={{flex:1,padding:10}}>
        <Text style={{flexGrow:1}}>Új hely</Text>
        <Pressable onPress={()=>{setOpen(false)}} style={{}}><Text>Mégse</Text></Pressable>
      </Row>
      <TextInput style={localStyles.input} placeholder='Hely neve' onChangeText={setTitle}/>
      <TextInput style={localStyles.input} placeholder='A helyről' onChangeText={setDescription}/>
      <Text style={localStyles.input}>{selectedMap ? "Kategória: "+selectedMap?.name : "Válassz ki egy kategóriát fent"}</Text>
      <NewButton title="Feltöltöm!" onPress={send} disabled={!(title && description && selectedMap)}/>
    </View>
  )
}


const localStyles = {
    text:{
      fontWeight: 'bold',
      color: "black",
      fontSize:18,
      paddingHorizontal: 16,
    },
    newButton:{
      borderRadius: 20,
      flex:1,
      margin:10,
      marginHorizontal: 20,
      paddingVertical:10,
      alignItems: 'center',
      justifyContent: "center",
      maxWidth: 500
    },
    verticleLine: {
      height: '100%',
      width: 1,
      backgroundColor: '#909090',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    searchInput: {
        margin: 5,
        borderColor: "black",
        borderWidth: 2,
        backgroundColor: "white",
        padding: 10,
        fontWeight: "bold",
        maxWidth: 500,
    },
    selected: {
      borderColor: 'red',
      color: 'red'
    },
    sectionText:{
      fontWeight: 'bold',
      fontSize:18,

    },
    map: {
      flex:3,
    },
    side: {
      backgroundColor: 'white',
      //borderWidth:2,
      marginTop: -2,
      cursor: 'default'
    },
    mapLink: {
      padding: 5,
      margin: 5,
      marginHorizontal: 30,
      borderColor: 'black',
      borderWidth:1,
      flexDirection: 'row',
      justifyContent: 'start',
      alignItems: 'center'
    },
    filterList: {
      padding:5,
      borderColor: '#f9f9f9',
      borderWidth:1,
      backgroundColor: 'white',
    },
    selectedLocation: {
      padding:10,
      borderColor: '#f9f9f9',
      borderWidth:1,

    },
    input: {
      paddingVertical: 5,
      borderColor: 'black',
      borderWidth: 2,
      borderRadius: 0,
      marginBottom:5,
      color:'black',
      backgroundColor:'white',
      fontWeight: "600",
      padding: 10,
      paddingVertical:10
    },
  }