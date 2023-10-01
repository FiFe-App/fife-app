
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
import { getMaps, getPlaceById, getPlaces, LocationData } from "./mapService";
import MapElement from './MapElement';
import axios from 'axios';
import { config } from '../../firebase/authConfig';
import { Checkbox } from 'react-native-paper';
import { categories } from '../../lib/categories';
import { MapContext } from './MapContext';
import { MapList } from '../../components/MapList';
import HelpModal from '../../components/help/Modal';

const Maps = ({navigation, route}) => {
    //#region state
    
    const [id, setId] = useState(route?.params?.id || null);
    const {database} = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const [open, setOpen] = useState(true);

    const [search, setSearch] = useState('');
    const [secure, setSecure] = useState(true);

    const [categoryList, setCategoryList] = useState([]);

    const [selected, setSelected] = useState({name:null,id:null});
    const [selectedPlace, setSelectedPlace] = useState(null);

    const [placeList, setPlaceList] = useState([]);
    const [newPlace, setNewPlace] = useState(null);
    const [newMarker, setNewMarker] = useState(null);

    const [newCategory, setNewCategory] = useState(null);

    //#endregion

    useEffect(() => {
        (async () => {
            setCategoryList(await getMaps(database));
        })()
    }, []);

    useEffect(() => {
        if (id)
        (async () => {
      console.log('ID');
            const place = await getPlaceById(id);
            setSelectedPlace(place);
            setSelected({id:place.category-1,name:categories.places[place.category-1].name})
        })()
    }, [id]);

    useEffect(() => {
      if (search)
      axios.get('places/search',{...config(),params:{
        key: search,
        secure: secure
      }}).then(res=>{
        console.log("search",res);
      })
    }, [search]);

    const menu = <>
      <Row style={{zIndex:10}}>
        <TextInput
          style={localStyles.searchInput}
          onChangeText={setSearch}
          editable
          placeholder="Keress helyekre, kategóriákra"
        />
        <NewButton info={secure?"BE: Csak ellenőrzött helyek mutatása":"KI: Minden hely mutatása"}
        icon onPress={()=>setSecure(!secure)} title={<Icon size={30} name={secure?'flask':'flask-outline'}/> }/>
      </Row>
      <ScrollView style={{flexGrow:0}}>
        {categoryList.map((cat,ind) => {
          if (selected.id == null || selected.id==ind)
          return <MapList map={{name:cat,id:ind}} key={ind} />
        })}
      </ScrollView>
      {!selected.id && <NewButton title="Új kategória ajánlása" onPress={()=>setNewCategory(true)} />}
      {width > 900 && (selectedPlace &&        
        <LocationData />
      )}      
    </>

    return (
        <MapContext.Provider value={{selected,setSelected,setSelectedPlace,selectedPlace,search,placeList,setPlaceList,newPlace,setNewPlace,newMarker, setNewMarker,secure:secure,open}}>
            <Auto style={{flex:1,backgroundColor:'#FDEEA2'}}>
                {width <= 900 ?
                <Openable open={open} style={[localStyles.side,{flex: 1,minWidth:300,backgroundColor:'#FDEEA2'}]}>
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
                    <MapElement markers={placeList} center={{lat:selectedPlace?.lat,lng:selectedPlace?.lng}}/>
                </View>

                {<NewPlace selected={selected}/>}
                {width <= 900 && (selectedPlace &&
                        <LocationData />
                    )}
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
                text: 'Köszi, hogy részt veszel a FiFe App fejlesztésében:)',
                title:'Sikeres beküldés!'
              }}
              setOpen={setNewCategory}
              open={newCategory}/>
        </MapContext.Provider>
    )
}

const NewPlace = () => {
  const {selected,newMarker, setNewMarker,newPlace,setNewPlace} = useContext(MapContext);
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
        flexGrow:1
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