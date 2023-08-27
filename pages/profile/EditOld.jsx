
import React, { useContext, useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Image from 'expo-fast-image';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';

import Icon from 'react-native-vector-icons/Ionicons';

import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { equalTo, get, getDatabase, query, ref as databaseRef, set } from 'firebase/database';
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Auto, MyText, NewButton, Row, TextInput } from '../../components/Components';
import { deepEqual } from '../../lib/functions';
import { useDimensions } from 'react-native-web-hooks';

const themeColor = '#000';//#ba9007
const color2 = '#aaa'//'#FFC372'
//const themeColor = '#fcf3d4';FFC372
const bgColor = '#FDEEA2'

export const Professions = (props) => {
  const {data,setData} = props
  const { width } = useWindowDimensions();
  const centered = props.centered || false
  const [list, setList] = useState(data.buziness || [{name: '', description: ''}]);

  useEffect(() => {
    setList(props.data.buziness || [])
  }, [props]);

  const addNew = () => {
    setList([...list,{name: '', description: ''}])
  }
  const set = (val,index,key) => {
    const newState = [...list]
    newState[index] = {...newState[index], [key]:val}
    setList(newState)
    if (newState?.length)
      setData({...data,buziness:newState})
  } 
  const remove = (i) => {
    setList(list.filter((item,ei) => ei !== i));
    setData({...data,buziness:list.filter((item,ei) => ei !== i)})
  }
  return (
    <View style={{marginBottom:5,flex:'none',maxWidth:500,width:'100%',alignSelf:'center'}}>
      <Header title="Bizniszeim" icon="thumbs-up" centered={centered} helpText=""/>
      {!list.length && <MyText style={localStyle.label}>Van valami amiben jó vagy? </MyText>}
      <ScrollView style={{flex:width <= 900 ? 'none' : 1}}>
        {!!list && !!list.length && list.map((e,i)=>
          <View key={'buziness'+i}  style={localStyle.buziness}>
            <View style={{flexDirection:'row'}}>
              <View style={{width:50,justifyContent:'space-evenly',alignItems:'center'}}>
                <MyText style={{fontSize:20}}>{i+1}</MyText>
                <Pressable onPress={()=>remove(i)}>
                  <Icon name="trash" color={themeColor} size={25}/>
                </Pressable>
              </View>
              <View style={{flex:1,justifyContent:'center'}}>
                <TextInput style={localStyle.input} placeholder="kulcsszavak" onChangeText={(val)=>set(val,i,'name')} value={list[i].name}/>
                <TextInput style={localStyle.input} placeholder="leírás" onChangeText={(val)=>set(val,i,'description')} value={list[i].description} multiline numberOfLines={2}/>
              </View>
              <View style={{width:100,justifyContent:'flex-end'}}>
                <Pressable style={{width:100,height:100,margin:5,backgroundColor:'lightblue',alignItems:'center',justifyContent:'center'}}>
                  <MyText>+ Új kép</MyText>
                </Pressable>
              </View>
            </View>
            {(list.length > i+1) && <View style={localStyle.divider}/>}
          </View>
        )}
      </ScrollView>
      <View>
        <Pressable style={[localStyle.adder,centered ? {borderRadius:0} : {}]} onPress={addNew}>
          <MyText style={localStyle.text}>
            <Icon name="md-add" color={0} size={40}/>
          </MyText>
        </Pressable>
      </View>
    </View>)
}

export const Map = ({data,setData,editable}) => {
  const [location,setLocation] = useState(data?.location);
  const [map, setMap] = useState(null);
  const small = useDimensions().window.width < 900

  useEffect(() => {
    if (map) {
      if (location?.length)
        map.setView({lat:location[0],lng:location[1]}, 13)
      else
        map.setView({lat:47.498333,lng:	19.040833}, 13)
    
      
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);

      if (editable) {

        const circle = L.circleMarker(map.getCenter(), {radius:60,fill:true,fillColor:'#FFC372',color:'#FFC372',}).addTo(map)
        map.on('zoom',(ev)=> {
          const zoom = map.getZoom()
          const center = map.getCenter()
          //setLocation({zoom,lat:center.lat,lng:center.lng})
        })
        map.on('move',(ev)=>{
          const center = map.getCenter();
          circle.setLatLng(center)
          setLocation([center.lat,center.lng])
        });
      } else {
        //const circle = L.circleMarker(map.getCenter(), {radius:60,fill:true,fillColor:'#FFC372',color:'#FFC372',}).addTo(map)

      }        
      if (location?.length)
        L.circle({lat:location[0],lng:location[1]}, {radius:24*(13),fill:true,fillColor:'#fff1a2',color:'#fff1a2',}).addTo(map)

      
    }
  }, [map]);

  useEffect(() => {
    if (editable && location) {
      setData({...data,location:location})
    }
  }, [location]);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS != 'web') return
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
      script.onload = () => {
        console.log('mapLoad');
        var container = L.DomUtil.get("map");
    
        if (container) {
        container._leaflet_id = null;
        }
        setMap(L.map('map'));
      }
      return () => {
        console.log('cleanup');

        let link = document.getElementById("link")
        let script = document.getElementById("script")
        link?.remove()
        script?.remove()
        
      }
    }, [])
  )

  const focus = () => {
    if (location?.length)
      map.flyTo(location)
  }

  return (<>
    <NewButton title={<Icon name="location" size={30}/>} onPress={focus} 
    floating style={{position:'absolute',zIndex:10,right:5,padding:10}}/><View>
    <div id="map" style={{flex:small?'none':1,height:small?300:'none',marginTop:-2,marginBottom:5}}/>
  </View></>)
}

const Header = (props) => {
  const { width } = useWindowDimensions();
  const {icon,title,centered,helpText} = props
  const color = color2
  const [help, setHelp] = useState(false);
  return (
    <>
    <View style={[localStyle.adder,{flexDirection:'row',borderWidth:0},centered ? {borderRadius:30} : {}]}>
      <View style={[localStyle.plusContainer,{color: color}]}>
        <MyText style={localStyle.plusText}><Icon name={icon} size={25} color={0}/></MyText>
      </View>
      {(width > 900 || !help) && 
      <View style={localStyle.textContainer}>
        <View style={{flex:1}}>
          <MyText style={[localStyle.text]}>{title}</MyText>
        </View>
        {!!helpText &&
        <TouchableOpacity onPress={()=>setHelp(!help)}>
          <Icon name={ help ? "help-circle" : "help-circle-outline"} size={25}/>
        </TouchableOpacity>}
      </View>}

    </View>
    {(help && helpText) && 
    <View style={[localStyle.adder,{flexDirection:'row'},centered ? {borderRadius:30} : {}]}>
      <View style={localStyle.textContainer}>
        <MyText style={localStyle.text}>{helpText}</MyText>
      </View>

    </View>}
    </>
  )
}

const localStyle = StyleSheet.create ({
  container: { 
    textAlign:'left',
    backgroundColor: bgColor
  },
  image: {
    aspectRatio: 1,
    flex:1,
    width:150,
    height:150,
    backgroundColor:bgColor
  },
  imageContainer: {
    backgroundColor: bgColor,
    flexDirection: 'row',
    marginBottom:5
  },
  imagePadding: {
    flex:1,
    backgroundColor: themeColor
  },
  input: {
    paddingVertical: 10,
    borderRadius: 0,
    marginBottom:5,
    color:themeColor,
    backgroundColor:'#fff7',
    fontWeight: "600",
    padding: 10,
    paddingVertical:10
  },
  adder: {
    backgroundColor: 'white',
    //marginTop: 10,
    marginBottom:5,
    alignItems: 'center'
  },
  plusContainer: {
    backgroundColor: 'white',
    justifyContent: "center",
    textAlign: 'center',
    alignItems:'center',
    width: 43,
    height: 43,
  },
  textContainer: {
    alignItems:'center',
    flexDirection:'row',
    paddingRight:10,
    flex:1
  },
  text: {
    color: 'black',
    margin: 10,
  },
  buziness: {
    paddingLeft: 0,
    marginTop:5
  },
  divider: {
    height:2,
    backgroundColor:'gray'
  },
  label: {
    marginLeft: 20,
    marginVertical: 10,
    fontSize: 16,
    textAlign:'center'
  },
  smallButton: {
    paddingHorizontal:20,
    alignItems: 'center',
    justifyContent: "center",
    flex:1,
    width:150/2,
    backgroundColor:'white'

  },
  
})

