
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Auto, MyText, NewButton, Openable, Row, TextInput } from '../../components/Components';


import * as Location from 'expo-location';
import { push, ref, set } from 'firebase/database';
import { useWindowDimensions } from 'react-native';
import { FirebaseContext } from '../../firebase/firebase';
import { getMaps, getPlaces, LocationData } from "./mapService";
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import { Checkbox } from 'react-native-paper';
import { categories } from '../../lib/categories';
import { MapContext } from './MapContext';

const MapElement = ({markers,center}) => {
    //#region state

    const [map, setMap] = useState(null);
    const {selected,setSelected,selectedPlace,setSelectedPlace,placeList,setPlaceList,search} = useContext(MapContext);
    const mapRef = useRef()
    mapRef.current = map;
    const [currentMarkers, setCurrentMarkers] = useState([]);

    const [myLocation, setMyLocation] = useState(null);

    const [locationIcon, setLocationIcon] = useState(null);
    const [myLocationIcon, setMyLocationIcon] = useState(null);

    //#endregion


    //MAP LOAD
    useFocusEffect(
        React.useCallback(() => {
          if (Platform.OS != 'web') return
          console.log('maps loading');
          let link = document.getElementById("link")
          let script = document.getElementById("script")
          if (true) {
          //if (!document.getElementById("link") && !document.getElementById("script")) {
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
          script.onload = afterMapLoad
    
          return () => {
            console.log('cleanup');
            console.log(mapRef.current);
    
            console.log('map cleanup ',map);
            try {
                mapRef.current.off();
                mapRef.current.remove();
            } catch (error) {
                console.error('MAP REMOVE ERROR ',error);
            }

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


    // FLY TO SELECTED
    useEffect(()=>{
        if (map && center.lat && center.lng) {
          map.flyTo([center?.lat,center?.lng],16);
        }
    },[center])

    useEffect(() => {
        currentMarkers.forEach((m) =>map.removeLayer(m))
        
        if (markers?.length)
        markers.forEach((location,index) => {
            const marker = L.marker([location.lat, location.lng],selectedPlace?.id==location.id ? {icon: locationIcon } : {}).addTo(map)
            marker.bindPopup("<b>"+location.title+"</b><br>"+location.description)
            marker.on('click',() => {
                marker.getPopup().openPopup();
                setSelectedPlace(location);
            })
            setCurrentMarkers(old=>[...old,marker])
        });
    }, [markers,selectedPlace]);

    useEffect(() => {
        console.log('map changed',map);
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
                try {
                    L.marker([location.coords.latitude, location.coords.longitude],{icon: myLocationIcon }).addTo(map)
                    setMyLocation([location.coords.latitude, location.coords.longitude])
                    
                } catch (error) {
                    console.log('marker',error);
                }
            })()
        }
    }, [map]);

    const afterMapLoad = async () => {
        setLocationIcon(L.icon({
          iconUrl: require('../../assets/icons/locationSelected.png'),
          shadowUrl: require('../../assets/icons/marker-shadow.png'),
        
          iconSize:     [25, 41], // size of the icon
          iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
          shadowAnchor: [12, 41],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }));
        setMyLocationIcon(L.icon({
          iconUrl: require('../../assets/icons/location.svg'),
        
          iconSize:     [40, 40], // size of the icon
          iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        }));

        console.log('afterMapload');
        setMap(L.map('map'));

    }

    return (
        <>
            <div id="map" style={localStyles.map} >
            </div>
            {myLocation && 
                <NewButton 
                    floating style={{position:'absolute',right:5,top:5,zIndex:100,width:50}}
                    onPress={()=>{map.flyTo(myLocation)}}
                    title={<Icon size={30} name='navigate' />}
                />
            }
        </>
    )
}



const localStyles = {
    map: {
      flex:1,
      borderRadius:16,
      zIndex:-10
    }
  }


export default MapElement