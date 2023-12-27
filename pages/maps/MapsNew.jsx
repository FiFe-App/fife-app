
import { AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Auto, MyText, NewButton, Openable, Row, TextInput } from '../../components/Components';


import * as Location from 'expo-location';
import { get, push, ref, set } from 'firebase/database';
import { useWindowDimensions } from 'react-native';
import { FirebaseContext } from '../../firebase/firebase';
import { getMaps, getPlaceById, getPlaces, LocationData } from "./mapService";
import MapElement from './MapElementNew';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import { Checkbox } from 'react-native-paper';
import { categories } from '../../lib/categories';
import { MapContext } from './MapContext';
import { MapList } from '../../components/MapList';
import HelpModal from '../../components/help/Modal';
import { useSelector } from 'react-redux';
import { arraysEqual, deepEqual } from '../../lib/functions';
import BottomSheet from '@gorhom/bottom-sheet';

const Maps = ({navigation, route}) => {
    //#region state
    const uid = useSelector((state) => state.user.uid)
    const {id,category} = route?.params || {}
    const {database} = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const small = width < 900;
    const [open, setOpen] = useState(true);

    const [search, setSearch] = useState('');
    const [secure, setSecure] = useState(false);

    const [categoryList, setCategoryList] = useState([]);
    const [nearby, setNearby] = useState([]);

    const [selected, setSelected] = useState({name:null,id:null});
    const [selectedPlace, setSelectedPlace] = useState(null);

    const [placeList, setPlaceList] = useState([]);
    const [newPlace, setNewPlace] = useState(null);
    const [newMarker, setNewMarker] = useState(null);

    const [newCategory, setNewCategory] = useState(null);
    const [starred, setStarred] = useState([]);
    const [oldStarred, setOldStarred] = useState([]);
    
    const sheetRef = React.useRef(null);
    const snapPoints = useMemo(() => ['10%','40%', '70%'], []);
    const handleSheetChanges = useCallback((index) => {
      console.log('handleSheetChanges', index);
    }, []);

    const [myLocation, setMyLocation] = useState(null);

    //#endregion

    const getLocation = async () => {
      if (myLocation) return myLocation;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }
    
        console.log('loc',status);
        let location = await Location.getCurrentPositionAsync({});
        try {
            //L.marker([location.coords.latitude, location.coords.longitude],{icon: myLocationIcon }).addTo(map)
            setMyLocation([location.coords.latitude, location.coords.longitude])
            return [location.coords.latitude, location.coords.longitude]
            
        } catch (error) {
            console.log('marker',error);
        }
    }

    useFocusEffect(
      useCallback(() => {
        (async () => {

          getLocation()
          setCategoryList(await getMaps(database));
          const getL = (await get(ref(database,'users/'+uid+'/data/mapLikes'))).val()
          console.log('getL',getL)
          setStarred(getL || [])
          setOldStarred(getL || [])
        })()

      }, [])
    );

    useEffect(() => {
      console.log('myLocation',myLocation);
      if (myLocation)
        getNearby()
    }, [myLocation,selected]);

    const getNearby = () => {
      console.log('getNearby',myLocation);
      if (!myLocation) return;


      setNearby([])
      axios.post('places/nearby',{myLocation,category:selected.id?(selected?.id+1):null},config()).then(res=>{
        console.log('nearby:',res.data);
        if (res?.data?.length)
        setNearby(res.data);
      })
    }

    useEffect(() => {
      console.log('star log',starred,oldStarred,!arraysEqual(starred,oldStarred));
      if (!arraysEqual(starred,oldStarred)) {
        console.log('upload',starred)
        set(ref(database,'users/'+uid+'/data/mapLikes'),starred);
      }
    }, [starred])

    useEffect(() => {
        if (id)
        (async () => {
      console.log('ID');
            const place = await getPlaceById(id);
            if (!place) return
            console.log(place);
            setSelectedPlace(place);
            setSelected({id:place.category-1,name:categories.places[place.category-1].name})
        })()
    }, [id]);

    useEffect(() => {
      console.log('cat',categories.places[category]);
      if (category)
      setSelected({name:categories.places[category].name,id:category})
    }, [category]);
    
    useEffect(() => {
      console.log('setParams cat',selected,selectedPlace);
      navigation.setParams({category:Number(selected?.id) || undefined,id:(selectedPlace?.id||selectedPlace?._id) || undefined})
    }, [selected,selectedPlace]);

    useEffect(() => {
      if (search)
      axios.get('places/search',{...config(),params:{
        key: search,
        secure: secure
      }}).then(res=>{
        console.log("search",res);
      })
    }, [search]);

    const menu = <View style={{padding:10}}>
      {selected.id == null && <><Row style={{zIndex:10}}>
        <TextInput
          style={localStyles.searchInput}
          onChangeText={setSearch}
          editable
          placeholder="Keress helyekre, kategóriákra"
        />
      </Row>
      <MyText bold style={{paddingLeft:10}}>Kategóriák #</MyText></>}
      {selectedPlace == null && <>
        <ScrollView horizontal style={{height:selected?.id==null?150:'none'}} contentContainerStyle={{flexWrap:'wrap',flexDirection:'column',flex:1}}>
          {categoryList.map((cat,ind) => {
            if (selected.id == null || selected.id==ind)
            return <MapList map={{name:cat.name,id:ind}} key={ind} />
          })}

        </ScrollView>
        <MyText bold style={{paddingLeft:10}}>Közelemben <Icon name="location"/></MyText>
        <ScrollView horizontal={small} style={{height:selected?.id==null?(small?150:'none'):'none'}} contentContainerStyle={{flexWrap:small?'wrap':'none',flexDirection:small?'row':'column',flex:1}}>
          {!myLocation && <NewButton onPress={getLocation} title="Közeli helyek keresése"/> }
          {nearby.map((place,index2) => {
            return <Pressable style={[localStyles.mapLink]} 
                              key={"place"+index2} onPress={()=>{
                                  console.log(selectedPlace,place._id);
                                  if (selectedPlace?.id==place._id) {
                                    setSelectedPlace(null)
                                  }
                                  else {
                                    setSelectedPlace(place);
                                  }
                                }}>
                      <MyText>{place.title}</MyText>
                    </Pressable>
          })}

        </ScrollView>
      </>}
        {false&&!selected.id && <NewButton title="Új kategória ajánlása"  style={{order:2}} onPress={()=>setNewCategory(true)} />}
      
      {selectedPlace && <LocationData />}
    </View>

    return (
        <MapContext.Provider value={{selected,setSelected,setSelectedPlace,selectedPlace,search,placeList,setPlaceList,newPlace,setNewPlace,newMarker, setNewMarker,secure:secure,open,starred,setStarred}}>
            <Auto style={{flex:1,backgroundColor:'#ffffd6'}}>
                {width > 900 && <View
                style={[localStyles.side,{flex: width <= 900 ? 2 : 1,minWidth:300,backgroundColor:'#ffffd6'}]}
                >{menu}</View>
                }
                <View style={{flex:3,backgroundColor:'#ffffd6'}}>
                    <MapElement markers={placeList} center={{lat:selectedPlace?.lat,lng:selectedPlace?.lng}} index='0'/>
                </View>

                {width <= 900 && <BottomSheet
                  ref={sheetRef}
                  index={1}
                  snapPoints={snapPoints}
                  backgroundStyle={{backgroundColor:'#ffffd6'}}
                  onChange={handleSheetChanges}
                >
                  {menu}
                </BottomSheet>}

                {false&&<NewPlace selected={selected}/>}
            </Auto>
            <HelpModal
              title="Új térkép kategória ajánlása"
              inputs={[
                {label:'Kategória neve',type:'text-input',attribute:'name',data:newCategory,setData:setNewCategory},
                {label:'Leírása, miért van szükség rá?',type:'text-input',attribute:'description',data:newCategory,setData:setNewCategory,lines:2}
              ]}
              actions={[
                {title:'Beküldés',
                color:'#006aff',onPress:()=>{
                  push(ref(database,'maps/categories'),newCategory).then(res=>{
                    setNewCategory('submitted');
                  })
                }},
                {title:'Mégsem',onPress:()=>{
                  setNewCategory(null);
                }}
              ]}
              success={{
                text: 'Köszi, hogy részt veszel a fife app fejlesztésében:)',
                title:'Sikeres beküldés!'
              }}
              setOpen={setNewCategory}
              open={newCategory}/>
        </MapContext.Provider>
    )
}

const NewPlace = () => {
  const {selected,setSelected,newMarker, setSelectedPlace,setNewMarker,newPlace,setNewPlace} = useContext(MapContext);
  const open = !!newPlace;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('Feltöltöm!');

  useEffect(() => {
      if (!newPlace)
      setNewMarker(null)
  }, [newPlace]);

  useEffect(() => {
    if (title || description)
    setStatusText('Feltöltöm!')
  }, [description,title]);

  const send = () => {
    if (title && description && selected.name && newMarker) {
      setLoading(true);
      setStatusText('Kérlek várj...')
      console.log(selected);
      axios.post('places/'+(Number(selected.id)+1),{
        description,
        title,
        lat: newMarker._latlng.lat,
        lng: newMarker._latlng.lng
      },config()).then(e=> {
        setTitle('');
        setDescription('')
        setLoading(false);
        const s = selected;
        setSelected({name:null,id:null});
        setTimeout(() => {
          setSelected(s)
          setSelectedPlace({id:e.data})
        }, 100);
        setStatusText('Feltöltve!')
      });
    }
  }

  if (!open) return <NewButton title="Tudok egy új helyet!" floating onPress={()=>setNewPlace(true)} style={{borderWidth:0,position:'absolute',right:5,bottom:5,padding:10,zIndex:5}}/>
  else return (
    <View style={{margin:10}}>
      <Row style={{flex:1,padding:10}}>
        <MyText style={{flexGrow:1}}>Új hely</MyText>
        <Pressable onPress={()=>{setNewPlace(null)}} style={{}}><MyText>Mégse</MyText></Pressable>
      </Row>
      <TextInput style={localStyles.input} placeholder='Hely neve' onChangeText={setTitle} value={title} disabled={loading}/>
      <TextInput style={localStyles.input} placeholder='A helyről' onChangeText={setDescription} value={description} disabled={loading}/>
      <MyText style={localStyles.input}>{selected ? "Kategória: "+(selected.name||'Válassz egyet') : "Válassz ki egy kategóriát fent"}</MyText>
      <NewButton title={statusText} onPress={send} disabled={!(title && description && selected) || loading}/>
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
        flexGrow:1,
        borderRadius:8,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
      zIndex:100,
      //borderWidth:2,
      marginTop: -2,
      cursor: 'default',
      shadowColor: "#000",
      shadowOffset: {width: 4, height: 4 },
      shadowOpacity: 0.2,shadowRadius: 1
    },
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