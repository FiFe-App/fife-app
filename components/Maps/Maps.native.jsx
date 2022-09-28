

import MapView, { Marker } from 'react-native-maps';

import React, { useEffect, useContext, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Text, Platform, View, Button, Pressable, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Dimensions } from 'react-native';
import { Row } from '../Components';
import Icon from 'react-native-vector-icons/Ionicons'
import { AntDesign } from '@expo/vector-icons';

const mapData = [
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

  const [selectedMap,setSelectedMap] = useState(null) 

  const [region, setRegion] = useState({
    latitude: 47.4983,
    longitude: 19.0408,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },);
  const [markers, setMarkers] = useState([]);
  const [maplist,setMapList] = useState(null)
  const [search, setSearch] = React.useState('');
  const [filterList,setFilterList] = useState(null);
  const defaultFilterList = [
    {name: 'ABC',function: (prop='name') => ((a,b)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
    {name: 'CBA',function: (prop='name') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))},
    {name: 'rating',function: (prop='rating') => ((b,a)=>(a[prop] > b[prop]) - (a[prop] < b[prop]))}
  ];
  const [filter, setFilter] = React.useState(defaultFilterList[0]);
  const [selected, setSelected] = React.useState(null);
  const reFilterList = () => {
    return defaultFilterList.map((e,index) => {
      if (e.name != filter.name)
      return ( 
        <TouchableOpacity style={localStyles.filterList} onPress={()=>{setFilter(defaultFilterList[index])}} key={e.name}>
          <Text>{e.name}</Text>
        </TouchableOpacity>
      )
    })
  }

  useEffect(()=>{
    setFilterList(reFilterList())
  },[filter])

  useEffect(()=>{
    let list = []
    if (selectedMap) {
      const map = mapData.find(e=>(e.name==selectedMap))
      map.locations.forEach(location => {
        console.log(location.name);
        list.push({
          latlng: {
            latitude: location.lat,
            longitude: location.lng
          },
          color: map.color
        })
        
      });
      setMarkers(list);
    }
  },[selectedMap])

  useEffect(()=>{
    setMapList(
      mapData.sort(filter.function('name')).map((map,index) => {
        if (map.name.includes(search) || !search || map.locations.find(e=>e.name.includes(search) || e.description.includes(search))) {
          console.log(selectedMap);
          const placeList = map.locations.map((place,index2)=>{
            if (place.name.includes(search) || place.description.includes(search) || !search)
            return (
              <Pressable style={[localStyles.mapLink,{left:10,marginHorizontal:40}]} key={"place"+index2} onPress={()=>setSelected(place)}>
                <Text>{place.name}</Text>
              </Pressable>
            )
          })
          return(
            <View key={index}>
              <Pressable  onPress={()=>setSelectedMap(map.name)} 
                style={[localStyles.mapLink,selectedMap==map.name ? {borderColor:map.color} : {}]}>
                <Icon style={{ marginHorizontal: 12 }} name='map' size={25} color={selectedMap==map.name ?  map.color : "#000"} />
                <Text style={selectedMap==map.name ? {color:map.color} : {}}>{map.name}</Text>
                <Icon style={{ marginHorizontal: 12, flex:1, textAlign:'right' }} name='arrow-forward' size={25} color={selectedMap==map.name ?  map.color : "#000"} />
              </Pressable>
              {selectedMap == map.name && placeList}
            </View>
          )
        }
      })
    )
  },[search,selectedMap,filter])

  useEffect(()=>{
    if (selected) {
      setRegion({
        latitude: selected.lat,
        longitude: selected.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  },[selected])

    return (
      <View style={{flex:1}}>
        <View style={localStyles.side}>
          <TextInput
            style={localStyles.searchInput}
            onChangeText={setSearch}
            editable
            placeholder="Keress valamire"
          />
          <Pressable style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}} 
            onPress={() => setFilterList(filterList ? null : reFilterList)}>
            <Text>Sorrend:</Text>
            <Row style={{alignItems:'center'}}>
              <Text style={{margin:5}}>{filter.name}</Text>
              <AntDesign name="caretdown" size={10} color="black" />
            </Row>
          </Pressable>
          <View style={{textAlign:'right',position:'absolute',top:100,right:10,elevation:2,marginHorizontal:50}}>
            {filterList}  
          </View>                
          {maplist}
        </View>
        <MapView style={localStyles.map} region={region}>
          {markers.map((marker, index) => (
            <Marker
              key={index}
              coordinate={marker.latlng}
              pinColor={marker.color}
            />
          ))}
        </MapView>
        {selected &&
          <LocationData location={selected} />}
      </View>
    )
}

const LocationData = (props) => {
  const {location} = props;
  return (
    <View style={localStyles.selectedLocation}>
      <Text style={{fontSize:20}}>
      {location?.name}
      </Text>
      <Text>
      {location?.description}
      </Text>
    </View>
  )
}

const localStyles = StyleSheet.create({
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
        borderRadius: 10,
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
      flex:8
    },
    side: {
      width: '100%',
      backgroundColor: 'white',
      cursor: 'default'
    },
    mapLink: {
      padding: 5,
      margin: 5,
      marginHorizontal: 30,
      borderColor: 'black',
      borderWidth:1,
      borderRadius: 6,
      flexDirection: 'row',
      justifyContent:'flex-start',
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
  })