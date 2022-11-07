
import React, { useEffect, useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, Platform, View, Button, Pressable, TextInput } from 'react-native';
import { Dimensions } from 'react-native';
import { Loading, Row } from '../Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { AntDesign } from '@expo/vector-icons';

import {getMaps,LocationData} from "./mapService";
import { FirebaseContext } from '../../firebase/firebase';
import { ActivityIndicator, ScrollView } from 'react-native-web';

const mapaData = [
  {
    name: "turik",
    locations: [
      {
        name: "háda",
        description: 'ez egy turi',
        lat: 47.47355815076657,
        lng: 19.0523721029790424
      },
      {
        name: "humana",
        description: 'ez egy másik turi',
        lat: 47.47547816076657,
        lng: 19.040723069790424
      }
    ],
    rating: 3.5,
    color: '#9a66c4'
  },
  {
    name: "olcsó helyek",
    locations: [
      {
        name: "kinai",
        description: 'ez egy olcso',
        lat: 47.47584325076657,
        lng: 19.050721029467424
      },
      {
        name: "humana",
        description: 'ez egy másik olcso',
        lat: 47.47584325076657,
        lng: 19.053721029467424
      }
    ],
    rating: 2.5,
    color: 'green'
  }
]


export const Maps = () => {
    const {database} = useContext(FirebaseContext);
    const [mapOptions,setMapOptions] = useState({
        center: {
          lat: 47.47585815076657,
          lng: 19.050721029790424
        },
        zoom: 16
    })

    const [selectedMap,setSelectedMap] = useState(null) 

    const [map,setMap] = useState(null)
    const [mapData, setMapData] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [maplist,setMapList] = useState(null)
    const [search, setSearch] = React.useState('');
    const [filterList,setFilterList] = useState(null);
    const [greenIcon, setGreenIcon] = useState(null);
    const defaultFilterList = [
      {name: 'ABC',function: (prop='name') => ((a,b)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
      {name: 'CBA',function: (prop='name') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
      {name: 'rating',function: (prop='rating') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))}
    ];
    const [filter, setFilter] = React.useState(defaultFilterList[0]);
    const [selected, setSelected] = React.useState(null);
    const [ids, setIds] = useState({mapId:null,locationId:null});

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
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href="https://unpkg.com/leaflet@1.9.1/dist/leaflet.css"
      link.integrity="sha256-sA+zWATbFveLLNqWO2gtiw3HL/lh1giY/Inf1BJ0z14="
      link.crossOrigin=""
  
      const script = document.createElement("script");
      script.src="https://unpkg.com/leaflet@1.9.1/dist/leaflet.js"
      script.integrity="sha256-NDI0K41gVbWqfkkaHj15IzU7PtMoelkzyKp8TOaFQ3s="
      script.crossOrigin=""
  
      document.head.appendChild(link);
      document.body.appendChild(script);

      script.onload = () => {
        setMap(L.map('map').setView([47.4983, 19.0408], 13));
        setGreenIcon(L.icon({
          iconUrl: require('../../assets/marker.webp'),
        
          iconSize:     [38, 38], // size of the icon
          iconAnchor:   [22, 38], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }));
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
      }
    }, [map]);

    useEffect(()=>{
      if ( map && mapData && selectedMap) {
        markers.forEach((m) =>map.removeLayer(m))
        mapData.find(e=>(e.name==selectedMap)).locations.forEach((location,index) => {
          const marker = L.marker([location.lat, location.lng],selected==location ? {icon: greenIcon } : {}).addTo(map)
          marker.bindPopup("<b>"+location.name+"</b><br>"+location.description)
          marker.on('click',() => {
            setSelected(location)
            setIds({...ids,locationId:index})
            marker.getPopup().openPopup();
          })
          setMarkers(old=>[...old,marker])
        });
      }
    },[selectedMap,selected])

    useEffect(()=>{
      const searchL = search.toLowerCase()
      if (mapData)
      setMapList(
        mapData.sort(filter.function('name')).map((map,index) => {
          if (
            map?.name?.toLowerCase().includes(searchL) || 
            !searchL || 
            map?.locations?.find(e=>e?.name.toLowerCase().includes(searchL) || 
            e?.description?.toLowerCase().includes(searchL))
          ) {
            
            const placeList = map?.locations?.map((place,index2)=>{
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
                                setIds({...ids,locationId:mapData.find(e=>e.name == selectedMap).locations.findIndex(e=>e.name==place.name)})
                              }
                            }}>
                  <Text style={{color:selected==place ? map.color : 'black'}}>{place.name}</Text>
                </Pressable>)
            })
            return(
              <View key={index} style={{justifyContent:'flex-end'}}>
                  <Pressable  onPress={()=>{
                    if (selectedMap==map.name) {
                      setSelectedMap(null);
                      setIds({mapId:null,locationId:null})
                    } else {
                      setSelectedMap(map.name);
                      setIds({...ids,mapId:mapData.findIndex(e=>e.name==map.name)})
                    }
                  }}
                  style={[localStyles.mapLink,selectedMap==map.name ? {borderColor:map.color} : {}]}>
                    <Icon style={{ marginHorizontal: 12 }}name='map' size={25} color={selectedMap==map.name ?  map.color : "#000"} />
                    <Text style={selectedMap==map.name ?  {color:map.color} : {}}>{map.name}</Text>
                    <Icon style={{ marginHorizontal: 12, flex:1, textAlign:'right' }} name='arrow-forward' size={25} color={selectedMap==map.name ?  map.color : "#000"} />
                  </Pressable>
                  {selectedMap == map.name && 
                  <ScrollView >
                    {placeList}
                  </ScrollView>}
              </View>
            )
          }
        })
      )
    },[search,selectedMap,selected,filter,mapData])

    useEffect(()=>{
      if (map,selected) {
        map.flyTo([selected.lat,selected.lng]);
      }
    },[selected])

    return (
      <View style={{flex:1,flexDirection:'row'}}>
        <View style={localStyles.side}>
          <TextInput
            style={localStyles.searchInput}
            onChangeText={setSearch}
            editable
            placeholder="Keress helyekre, kategóriákra"
          />
          <Pressable style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}} 
            onPress={() => setFilterList(filterList ? null : reFilterList)}>
            <Text>Sorrend:</Text>
            <Row style={{alignItems:'center'}}>
              <Text style={{margin:5}}>{filter.name}</Text>
              <AntDesign name="caretdown" size={10} color="black" />
            </Row>
          </Pressable>
          <View style={{textAlign:'right',marginHorizontal:50}}>
            {filterList}  
          </View>      
          <ScrollView style={{flex:2}}>
            {maplist || <ActivityIndicator size="large" />}
          </ScrollView>          
          <LocationData location={selected} locationId={ids.locationId} mapId={ids.mapId}/>
        </View>
        <div id="map" style={localStyles.map}></div>

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
      flex:1,
      backgroundColor: 'white',
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

    }
  }