/* eslint-disable no-undef */

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { MyText, NewButton } from '../../components/Components';


import * as Location from 'expo-location';

import { useWindowDimensions } from 'react-native';

import { MapContext } from './MapContext';

import 'leaflet/dist/leaflet.css';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import ErrorBoundary from 'react-native-error-boundary';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize:     [25, 41], // size of the icon
    iconAnchor:   [12, 41], // point of the icon which will correspond to marker's location
    shadowAnchor: [12, 41],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapElement = ({markers,center,index,editable,data,setData,style}) => {
    const [location,setLocation] = useState(data?.location);
    const [oldLocation] = useState(data?.location);
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
    const [quit, setQuit] = useState(false);

    //#endregion

    const MapControl = () => {
      const map = useMapEvents({
        move(e) {
          if (editable) {
            const center = map.getCenter();
            setLocation([center.lat,center.lng])
          }
        }
      });

      // FLY TO SELECTED
      useEffect(()=>{
          if (map &&selectedPlace?.location?.[0] && selectedPlace?.location?.[1]) {
            map.flyTo([selectedPlace?.location[0],selectedPlace?.location[1]],16);
          }
      },[selectedPlace])
        
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
          
          console.log('markers',markers);
          if (markers?.length)
          markers.forEach((location,index) => {
              const marker = L.marker([location.location[0], location.location[1]],selectedPlace?.id==location.id ? {icon: locationIcon } : {}).addTo(map)
              marker.bindPopup("<b>"+location.title+"</b><br>"+location.description)
              marker.on('click',() => {
                  marker.getPopup().openPopup();
                  setSelectedPlace(location);
              })
              setCurrentMarkers(old=>[...old,marker])
          });
      }, [markers,selectedPlace]);


      return <>
          {location?.length && map &&
            <NewButton title={<Icon name="location" size={30}/>} onPress={()=>{
              console.log(map)
              map?.flyTo(location)  
            }} 
            floating style={{position:'absolute',zIndex:500,right:5,padding:10}}/>
          }
            {myLocation && !location?.length && 
                <NewButton 
                    floating style={{position:'absolute',right:5,top:5,zIndex:500,width:50}}
                    onPress={()=>{map.flyTo(myLocation)}}
                    info="Saját helyzetem"
                    title={<Icon size={30} name='locate' />}
                />
                }
      </>

    }

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
        if (map && center.location[0] && center.location[1]) {
          map.flyTo([center?.location[0],center?.location[1]],16);
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
            const marker = L.marker([location.location[0], location.location[1]],selectedPlace?.id==location.id ? {icon: locationIcon } : {}).addTo(map)
            marker.bindPopup("<b>"+location.title+"</b><br>"+location.description)
            marker.on('click',() => {
                marker.getPopup().openPopup();
                setSelectedPlace(location);
            })
            setCurrentMarkers(old=>[...old,marker])
        });
    }, [markers,selectedPlace]);


    useEffect(() => {
      if (editable && location) {
        setData({...data,location:location})
      }
    }, [location]);
    useEffect(() => {
      return
      setLocation(data?.location)
    }, [data]);

    useEffect(() => {

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
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
      }));
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            //setErrorMsg('Permission to access location was denied');
            return;
        }
    
        let location = await Location.getCurrentPositionAsync({});
        try {
            //L.marker([location.coords.latitude, location.coords.longitude],{icon: myLocationIcon }).addTo(map)
            setMyLocation([location.coords.latitude, location.coords.longitude])
            
        } catch (error) {
            console.log('marker',error);
        }
    })()
    return () => {
      setQuit(true);
      console.log('quit');
    }
    }, []);

    useEffect(() => {
      if (map) {
        if (oldLocation?.length)
          map.setView({lat:location[0],lng:location[1]}, 13)
        else
          map.setView({lat:47.498333,lng:	19.040833}, 13)
      }
    }, []);
    const time = useMemo(() => new Date().getTime(), [])

    if (!quit)
    return (
  
      <ErrorBoundary
      FallbackComponent={(e)=><><MyText>{e.error.message}</MyText></>}>
        <View style={[{flex:1},style]}>
            {error && <MyText>erorr</MyText>}
            <MapContainer id={time} key={time} center={oldLocation||[47.498333,	19.040833]} zoom={13} scrollWheelZoom={true} style={{flex:1,zIndex:10}}
            ref={mapRef}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
              />
              {editable && <>
                <Circle center={location} radius={400} fill fillColor={'#FFC372'} color={'#FFC372'}/>
              </>}
              {oldLocation && <>
                <Circle center={oldLocation} radius={400} fill fillColor={'#fff1a2'} color={'#fff1a2'}/>
              </>}
              {markers?.map((location)=>{
                return <Marker position={[location.location[0],location.location[1]]}
                icon={selectedPlace?.id===location?.id?locationIcon:DefaultIcon}
                key={'marker'+location.id}
                eventHandlers={{
                  click: () => {
                    setSelectedPlace(location)
                  },
                }}>
                  <Popup>{location.title}</Popup>
                </Marker>
              })}
              {selectedPlace &&
                <Marker position={[selectedPlace.location[0],selectedPlace.location[1]]}
                icon={locationIcon}>
                  <Popup>{selectedPlace.title}</Popup>
                </Marker>
              }
              {myLocation && <Marker position={myLocation} icon={myLocationIcon}>
              <Popup>Itt vagy te</Popup>
              </Marker>}
              <MapControl/>
          </MapContainer>
        </View>
      </ErrorBoundary>
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