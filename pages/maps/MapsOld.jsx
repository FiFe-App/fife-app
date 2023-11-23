
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Auto, MyText, NewButton, Openable, Row, TextInput } from '../../components/Components';


import * as Location from 'expo-location';
import { push, ref, set } from 'firebase/database';
import { useWindowDimensions } from 'react-native';
import { FirebaseContext } from '../../firebase/firebase';
import { getMaps, getPlaces, LocationData } from "./mapService";
import { MapElement } from '../../components/MapList';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import { Checkbox } from 'react-native-paper';


const defaultFilterList = [
  {name: 'ABC',function: (prop='name') => ((a,b)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
  {name: 'CBA',function: (prop='name') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
  {name: 'legközelebbi',function: (prop='rating') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))}
];

const Maps = ({navigation, route}) => {
    //#region state
    const { id, category } = route?.params || {}
    const {database} = useContext(FirebaseContext);
    const { width } = useWindowDimensions();

    const [selectedMap,setSelectedMap] = useState({name:null,id:null}) 
    const [open, setOpen] = useState(true);

    const [map,setMap] = useState(null)
    const [categoryList, setCategoryList] = useState(null);
    const [filteredCategoryList,setFilteredCategoryList] = useState([])

    const [placeList, setPlaceList] = useState([]);
    const [markers, setMarkers] = useState([]);

    const [search, setSearch] = React.useState('');
    const [settings, setSettings] = useState({secure:true});
    const [filter, setFilter] = React.useState(defaultFilterList[0]);

    const [greenIcon, setGreenIcon] = useState(null);
    const [locationIcon, setLocationIcon] = useState(null);
    const [selected, setSelected] = React.useState(null);
    const [ids, setIds] = useState({mapId:null,locationId:null});

    const [newPlace, setNewPlace] = useState(null);
    const [newMarker, setNewMarker] = useState(null);

    const [errorMsg, setErrorMsg] = useState(null);

    const sheetRef = React.useRef(null);
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

    //MAP LOAD
    useFocusEffect(
      React.useCallback(() => {
        if (Platform.OS != 'web') return
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

    //MAP INIT-LOCATION
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
        if (id) setSelected(id)
        if (category) setSelectedMap(category)
      }
    }, [map]);

    // NEW PLACE MARKER
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

    //SELECTED MAP MARKERS
    useEffect(()=>{
      if (map) {

        if (!newMarker) {
          const newM = L.marker(map.getCenter())
          console.log('on move');
          map.on('move',()=>{
            newM.setLatLng(map.getCenter())
          })
          setNewMarker(newM);

        }
        if (categoryList && selectedMap.name) {
          markers.forEach((m) =>map.removeLayer(m))
         
          console.log('add markers',selectedMap);
          if (placeList?.length)
          placeList.forEach((location,index) => {
            if (true) {
              const marker = L.marker([location.lat, location.lng],selected==location ? {icon: greenIcon } : {}).addTo(map)
              marker.bindPopup("<b>"+location.title+"</b><br>"+location.description)
              marker.on('click',() => {
                setSelected(location)
                setIds({...ids,locationId:location.key})
                marker.getPopup().openPopup();
              })
              setMarkers(old=>[...old,marker])
            }
          });
        }
      }
      return ()=> {
        map?.off('move')
      }
    },[placeList])

    // GENERATE MAPLIST
    useEffect(()=>{
      const searchL = search.toLowerCase()
      if (categoryList){
        const cl = categoryList.filter((map,index) => {
          if (
            map?.name?.toLowerCase().includes(searchL) || 
            !searchL || 
            map?.locations?.find(e=>e?.name.toLowerCase().includes(searchL) || 
            e?.description?.toLowerCase().includes(searchL))
          ) {
            return true;
          }
        })
        setFilteredCategoryList(
          cl
        )

      }
    },[search,selectedMap,selected,filter,settings,categoryList])

    // FLY TO SELECTED
    useEffect(()=>{
      console.log('selected',selected);
      if (map,selected) {
        map.flyTo([selected.lat,selected.lng],16);
      }
    },[selected])

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

    const menu = <>
    <ScrollView>
      <TextInput
        style={localStyles.searchInput}
        onChangeText={setSearch}
        editable
        placeholder="Keress helyekre, kategóriákra"
      />

      <View style={{marginHorizontal:30,marginVertical:5}}>
        <Checkbox.Item label={<MyText>Csak ellenőrzött helyek mutatása</MyText>} 
          color="#000" style={[]} 
          labelStyle={{fontFamily:'SpaceMono_400Regular', letterSpacing:-1}}
          status={settings.secure?'checked':'unchecked'} onPress={v=>setSettings({...settings,secure:!settings.secure})} />
        
      </View>
      <ScrollView style={{flexWrap:'wrap',flexDirection:'row'}} horizontal>
        {filteredCategoryList.map((map,index)=>{
          return <MapElement 
          key={index+'map'}
          placeList={placeList} setPlaceList={setPlaceList}
          map={map} selectedMap={selectedMap} 
          setSelectedMap={setSelectedMap}
          ids={ids} setIds={setIds} 
          categoryList={categoryList}
          index={index} searchL={search} selected={selected}
            setSelected={setSelected}
          />}

        ) || <ActivityIndicator size="large" />}
      </ScrollView>  
    </ScrollView>
    {width > 900 && (selected &&        
      <LocationData location={selected} locationId={ids.locationId} setLocation={setSelected}  mapId={selectedMap.id} setOpen={setOpen}/>
    )}      
    </>

    return (
      <Auto style={{flex:1,backgroundColor:'#FDEEA2'}}>
        {width <= 900 ?
        <Openable open={open} style={[localStyles.side,{flex: width <= 900 ? 2 : 1,minWidth:300,backgroundColor:'#FDEEA2'}]}>
          {menu}
        </Openable>: <View
        style={[localStyles.side,{flex: width <= 900 ? 2 : 1,minWidth:300,backgroundColor:'#FDEEA2'}]}
        >{menu}</View>
        }
          {width <= 900 &&
          <Pressable style={{borderBottomWidth:2,backgroundColor:'#FFC372',padding:5,alignItems:'center',justifyContent:'center'}}
            onPress={()=>setOpen(!open)}>
            <AntDesign name={!open ? 'caretdown' : 'caretup'} size={20}/>
          </Pressable>}
        <View style={{flex:3,backgroundColor:'#FDEEA2'}}>
          <div id="map" style={localStyles.map} />
        </View>
        {!selected && <NewPlace setNewPlace={setNewPlace} newPlace={newMarker} selectedMap={selectedMap}/>}
        {width <= 900 && (selected &&
            
            <BottomSheet
              ref={sheetRef}
              snapPoints={[450, 300, 0]}
              borderRadius={10}
              renderContent={()=>{
                <LocationData location={selected} locationId={ids.locationId} setLocation={setSelected} mapId={selectedMap.id}/>
              }}
            />
            )}
      </Auto>
    )
}

const NewPlace = ({setNewPlace,newPlace,selectedMap}) => {
  const [open, setOpen] = useState(false);
  const { api } = useContext(FirebaseContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Feltöltöm!');

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
      axios.post('places/'+selectedMap.id,{
        description,
        title,
        lat: newPlace._latlng.lat,
        lng: newPlace._latlng.lng
      },config()).then(e=> {
        setTitle('');
        setDescription('')
        setLoading(false);
        setStatusText('Feltöltve!')
      });
    }
  }

  if (!open) return <NewButton title="Tudok egy új helyet!" floating onPress={()=>setOpen(true)} style={{borderWidth:0,position:'absolute',right:5,bottom:5,padding:10,zIndex:5}}/>
  else return (
    <View style={{margin:10}}>
      <Row style={{flex:1,padding:10}}>
        <MyText style={{flexGrow:1}}>Új hely</MyText>
        <Pressable onPress={()=>{setOpen(false)}} style={{}}><MyText>Mégse</MyText></Pressable>
      </Row>
      <TextInput style={localStyles.input} placeholder='Hely neve' onChangeText={setTitle} value={title} disabled={loading}/>
      <TextInput style={localStyles.input} placeholder='A helyről' onChangeText={setDescription} value={description} disabled={loading}/>
      <MyText style={localStyles.input}>{selectedMap ? "Kategória: "+(selectedMap.name||'Válassz egyet') : "Válassz ki egy kategóriát fent"}</MyText>
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
        backgroundColor: "#ffffff",
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
      flex:1,
      borderRadius:16,
      zIndex:-10
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
      backgroundColor:'#ffffff',
      fontWeight: "600",
      padding: 10,
      paddingVertical:10
    },
  }


export default Maps