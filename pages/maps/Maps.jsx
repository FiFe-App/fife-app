
import React, { useEffect, useContext, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Platform, View, Button, Pressable, ActivityIndicator, Animated, ScrollView, TextInputBase, Switch  } from 'react-native';
import { Dimensions } from 'react-native';
import { Auto, Loading, NewButton, Row, TextInput, MyText } from '../../components/Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { AntDesign } from '@expo/vector-icons';


import {getMaps,LocationData} from "./mapService";
import { FirebaseContext } from '../../firebase/firebase';
import * as Location from 'expo-location';
import { useWindowDimensions } from 'react-native'
import { push, ref, set } from 'firebase/database';


const defaultFilterList = [
  {name: 'ABC',function: (prop='name') => ((a,b)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
  {name: 'CBA',function: (prop='name') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
  {name: 'legközelebbi',function: (prop='rating') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))}
];

const Maps = ({navigation, route}) => {
    //#region state
    const {database} = useContext(FirebaseContext);
    const { width } = useWindowDimensions();

    const [selectedMap,setSelectedMap] = useState({name:null,id:null}) 
    const [open, setOpen] = useState(true);

    const [map,setMap] = useState(null)
    const [categoryList, setCategoryList] = useState(null);
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
            <MyText>{e.name}</MyText>
          </Pressable>
        )
      })
    }
    useFocusEffect(
      React.useCallback(() => {
        console.log('maps loading');
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
          console.log('link, script newly loaded');
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

          setMap(L.map('map'));

          async function getData() {
            setCategoryList(await getMaps(database));
          }
          getData()

        }
  
        return () => {
          console.log('cleanup');
  
          const mapElement = document.getElementById('map')
          console.log('map removed');
          if (mapElement)
          mapElement.innerHTML = "<div id='map' style='width: 100%; height: 100%;'></div>";

        let link = document.getElementById("link")
        let script = document.getElementById("script")
        link?.remove()
        script?.remove()
          // Do something when the screen is unfocused
          // Useful for cleanup functions
        };
      }, [])
    );

    useEffect(() => {
      if (map) {
        map.setView([47.4983, 19.0408], 13)
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

          L.marker([location.coords.latitude, location.coords.longitude],{icon: locationIcon }).addTo(map)
          })()
      }
    }, [map]);

    useEffect(() => {

      if (newMarker)
      if (newPlace) {
        newMarker.addTo(map);
        const popup = newMarker.bindPopup("<b>Ezzel be tudod jelölni az új helyet</b>").openPopup();
        setTimeout(()=>popup.closePopup(), 10000)
      } else {
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
        if (categoryList && selectedMap.name) {
          markers.forEach((m) =>map.removeLayer(m))
         
          console.log('add markers');
          /*categoryList.find((e,mapId)=>
          (e.name==selectedMap.name))
          .locations.forEach((location,index) => {
            if (!settings.secure || location?.likes != null) {
              const marker = L.marker([location.lat, location.lng],selected==location ? {icon: greenIcon } : {}).addTo(map)
              marker.bindPopup("<b>"+location.name+"</b><br>"+location.description)
              marker.on('click',() => {
                setSelected(location)
                setIds({...ids,locationId:location.key})
                marker.getPopup().openPopup();
              })
              setMarkers(old=>[...old,marker])
            }
          });*/
        }
      }
    },[selectedMap,selected,settings,newPlace])

    useEffect(()=>{
      const searchL = search.toLowerCase()
      if (categoryList)
      setMapList(
        categoryList.map((map,index) => {
          if (
            map?.name?.toLowerCase().includes(searchL) || 
            !searchL || 
            map?.locations?.find(e=>e?.name.toLowerCase().includes(searchL) || 
            e?.description?.toLowerCase().includes(searchL))
          ) {
            const placeList = map.locations.map((place,index2)=>{

              if (!settings.secure || place?.likes != null)
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
            })
            return(
              <View key={index} style={{justifyContent:'flex-end'}}>
                  <Pressable  onPress={()=>{
                    if (selectedMap?.name==map.name) {
                      setSelectedMap({id:null,name:null});
                      setIds({mapId:null,locationId:null})
                    } else {
                      setSelectedMap({id:index+1,name:map.name});
                      //setIds({...ids,mapId:categoryList.findIndex(e=>e.name==map.name)})
                    }
                  }}
                  style={[localStyles.mapLink,selectedMap?.name==map.name ? {borderColor:map.color} : {}]}>
                    <Icon style={{ marginHorizontal: 12 }}name='map' size={25} color={selectedMap?.name==map.name ?  map.color : "#000"} />
                    <MyText style={selectedMap?.name==map.name ?  {color:map.color} : {}}>{map.name}</MyText>
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
    },[search,selectedMap,selected,filter,settings,categoryList])

    useEffect(()=>{
      console.log('selected',selected);
      if (map,selected) {
        map.flyTo([selected.lat,selected.lng],16);
      }
    },[selected])

    useEffect(() => {
      if (selected) {
        //setSelected(null)
        //setIds({...ids,locationId:null})
      }
    }, [selectedMap]);

    useEffect(() => {
      console.log('ids',ids);
    }, [ids]);
    useEffect(() => {
      console.log('mapdata',categoryList);
      if (categoryList) {
        const {selected = null, selectedMap} = route?.params || {};
        if (!selectedMap) return

        setSelectedMap({id: selectedMap-1 || null,name: categoryList[selectedMap-1].name || null})
        setIds({mapId:null,locationId:categoryList[selectedMap-1].locations.find(loc=>loc.key == selected)?.key || null})
        setSelected(categoryList[selectedMap-1].locations.find(loc=>loc.key == selected) || null)
      }
    }, [categoryList]);
    //#endregion

    return (
      <Auto style={{flex:1}}>
        {open && <View style={[localStyles.side,{flex: width <= 900 ? 2 : 1}]}>
          <ScrollView>
            <TextInput
              style={localStyles.searchInput}
              onChangeText={setSearch}
              editable
              placeholder="Keress helyekre, kategóriákra"
            />

            <View style={{flexDirection:'row',marginHorizontal:30,marginVertical:5}}>
              <MyText style={{flex:1}}>Csak ellenőrzött helyek mutatása</MyText>
              <Switch
                  trackColor={{ false: '#767577', true: '#3e3e3e' }}
                  thumbColor={settings?.secure ? '#f5dd4b' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={(e)=>{setSettings({...settings, secure: e})}}
                  value={settings?.secure}
                  style={{alignSelf:'flex-end'}}
              />
            </View>
            <ScrollView style={{}}>
              {maplist || <ActivityIndicator size="large" />}
            </ScrollView>  
            </ScrollView>
        {width > 900 && (selected ?        
            <LocationData location={selected} locationId={ids.locationId} setLocation={setSelected}  mapId={selectedMap.id}/>
            :
            <NewPlace setNewPlace={setNewPlace} newPlace={newMarker} selectedMap={selectedMap}/>
            )}            
        </View>}
          {width < 900 &&
          <Pressable style={{borderBottomWidth:2,backgroundColor:'#FFC372',padding:5,alignItems:'center',justifyContent:'center'}}
            onPress={()=>setOpen(!open)}>
            <AntDesign name={!open ? 'caretdown' : 'caretup'} size={20}/>
          </Pressable>}
        <div id="map" style={localStyles.map}/>
        {width <= 900 && (selected ?        
            <LocationData location={selected} locationId={ids.locationId} setLocation={setSelected} mapId={selectedMap.id}/>
            :
            <NewPlace setNewPlace={setNewPlace} newPlace={newMarker} selectedMap={selectedMap}/>
            )}
      </Auto>
    )
}

const NewPlace = ({setNewPlace,newPlace,selectedMap}) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Feltöltöm!');

  const {database} = useContext(FirebaseContext);

  useEffect(() => {
      setNewPlace(open)
  }, [open]);

  useEffect(() => {
    if (title || description)
    setStatusText('Feltöltöm!')
  }, [description,title]);

  const send = () => {
    if (title && description && selectedMap.name && newPlace) {
      setLoading(true);
      setStatusText('Kérlek várj...')
      const mapListRef = ref(database, 'maps/'+selectedMap.id+'/locations');
      const newLocationRef = push(mapListRef);
      set(newLocationRef, {
        description,
        name: title,
        lat: newPlace._latlng.lat,
        lng: newPlace._latlng.lng
      }).then(e=> {
        setTitle('');
        setDescription('')
        setLoading(false);
        setStatusText('Feltöltve!')
      });
    }
  }

  if (!open) return <NewButton title="Tudok egy új helyet!" onPress={()=>setOpen(true)} style={{borderWidth:0}}/>
  else return (
    <View style={{margin:10}}>
      <Row style={{flex:1,padding:10}}>
        <MyText style={{flexGrow:1}}>Új hely</MyText>
        <Pressable onPress={()=>{setOpen(false)}} style={{}}><MyText>Mégse</MyText></Pressable>
      </Row>
      <TextInput style={localStyles.input} placeholder='Hely neve' onChangeText={setTitle} value={title} disabled={loading}/>
      <TextInput style={localStyles.input} placeholder='A helyről' onChangeText={setDescription} value={description} disabled={loading}/>
      <MyText style={localStyles.input}>{selectedMap ? "Kategória: "+selectedMap?.name : "Válassz ki egy kategóriát fent"}</MyText>
      <NewButton title={statusText} onPress={send} disabled={!(title && description && selectedMap) || loading}/>
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


export default Maps