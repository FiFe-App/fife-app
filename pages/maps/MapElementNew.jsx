
import { useFocusEffect } from '@react-navigation/native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MyText, NewButton } from '../../components/Components';


import * as Location from 'expo-location';
import { useWindowDimensions } from 'react-native';
import Error from '../../components/tools/Error';
import { MapContext } from './MapContext';

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Helmet } from 'react-helmet';
import 'leaflet/dist/leaflet.css';




const MapElement = ({markers,center,index,editable,data,setData}) => {
    const [location,setLocation] = useState(data?.location);
    //#region state


    const { width } = useWindowDimensions();
    const [map, setMap] = useState(null);
    const [error, setError] = useState(false);
    const {selectedPlace,setSelectedPlace,newPlace,newMarker,setNewMarker,open} = useContext(MapContext);
    const mapRef = useRef()
    mapRef.current = map;
    const [currentMarkers, setCurrentMarkers] = useState([]);

    const [myLocation, setMyLocation] = useState(null);

    const [locationIcon, setLocationIcon] = useState(null);
    const [myLocationIcon, setMyLocationIcon] = useState(null);

    //#endregion


    const getErrors = () => {
      var observables = document.querySelectorAll('.leaflet-pane');
      console.log('mapC',
        observables.length);
      setTimeout(() => {
        if (!observables.length){
          getErrors()
          setError(true)
        }
        else setError(false)
      }, 1000);
    }
    //MAP LOAD
    useEffect(() => {
      return
      if (Platform.OS != 'web')

      getErrors()

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

        return
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

        map?.on('move',undefined);

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
    }, []);

    useEffect(() => {
      return
        if (map)
            map?.invalidateSize();
    }, [width,newPlace,open,selectedPlace]);

    // NEW PLACE MARKER
    useEffect(() => {
return
        //if (map)
        if (newMarker)
        if (newPlace) {
          newMarker.addTo(map);
          const popup = newMarker.bindPopup("<b>Ezzel be tudod jelölni az új helyet</b>").openPopup();
          setTimeout(()=>popup.closePopup(), 10000)
        } else {
          map.removeLayer(newMarker)
        }
      }, [newMarker,newPlace]);

    // FLY TO SELECTED
    useEffect(()=>{
      return
        if (map && center.lat && center.lng) {
          map.flyTo([center?.lat,center?.lng],16);
        }
    },[center])
        
    useEffect(() => {
return
        if (map && !newMarker) {
            const newM = L.marker(map.getCenter())
            console.log('on move');
            map?.on('drag',(e)=>{
              newM.setLatLng(e.target.getCenter())
            })
            setNewMarker(newM);
  
        } else {
          map?.on('move',undefined)
        }
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
      return
        console.log('map changed',map);
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
            map.on('move',(ev)=>{
              const center = map.getCenter();
              circle.setLatLng(center)
              setLocation([center.lat,center.lng])
            });
          }  

          if (location?.length) {
            const c = L.circle({lat:location[0],lng:location[1]}, {radius:24*(13),fill:true,fillColor:'#fff1a2',color:'#fff1a2',}).addTo(map)
          }

            (async () => {

                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    //setErrorMsg('Permission to access location was denied');
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

    useEffect(() => {
      return
      if (editable && location) {
        setData({...data,location:location})
      }
    }, [location]);
    useEffect(() => {
      return
      setLocation(data?.location)
    }, [data]);

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
        if (map != undefined) { L.map.remove(); } 
        setMap(L.map('map'));

    }

    useEffect(() => {
    }, [document.getElementsByClassName('leaflet-pane')]);


    const focus = () => {
      if (location?.length)
        map.flyTo(location)
    }

    return (
        <View style={{flex:1}} onLayout={()=>{
          }}>

            {error && <MyText>erorr</MyText>}
            <MapContainer center={[47.498333,	19.040833]} zoom={13} scrollWheelZoom={true} style={{flex:1}}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
              />
              {markers.map((location)=>{
                console.log('l',location)
                return <Marker position={[location.lat,location.lng]}
                onPress={()=>{
                setSelectedPlace(location);
                }}>
                  <Popup>{location.title}</Popup>
                </Marker>
              })}
              <MapControl />
          </MapContainer>
            {myLocation && !location?.length && 
                <NewButton 
                    floating style={{position:'absolute',right:5,top:5,zIndex:100,width:50}}
                    onPress={()=>{map.flyTo(myLocation)}}
                    info="Saját helyzetem"
                    title={<Icon size={30} name='locate' />}
                />
                }
              {location?.length &&
                <NewButton title={<Icon name="location" size={30}/>} onPress={focus} 
                floating style={{position:'absolute',zIndex:10,right:5,padding:10}}/>
              }
        </View>
    )
}

const MapControl = () => {
  const map = useMap()

}


const localStyles = {
    map: {
      flex:1,
      borderRadius:16,
      zIndex:-10
    }
  }


export default MapElement