import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Auto, Loading, MyText, NewButton, ProfileImage, Row, SearchBar } from '../components/Components';
import { config } from '../firebase/authConfig';
import { FirebaseContext } from '../firebase/firebase';
import { TextFor, toldalek } from '../lib/textService/textService';
import BasePage from '../components/BasePage';
import PostForm from '../components/tools/Post';
import { TouchableRipple } from 'react-native-paper';
import * as Location from 'expo-location';

import { categories as allCategories } from "../lib/categories";

const Search = ({ route, style }) => {
    const { api } = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const small = width <= 900;
    const key = route.params?.key || null;
    const [categories, setCategories] = useState({
        sale: {
            name:'Cserebere',
            active:true
        },
        users: {
            name:'Felhasználók',
            active:true
        },
        maps: {
            name:'Helyek',
            active:true
        },
        buziness: {
            name:'Biznisz',
            active:true
        },
        categories: {
            name:'Kategóriák',
            active:true
        }
    });
    
    const [array, setArray] = React.useState({
        sale: [],
        users: [],
        maps: [],
        buziness: [],
        categories: []
    });
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [noResult, setNoResult] = useState();
    const ready = 1;

    const [myLocation, setMyLocation] = useState(null);
    
    const getLocation = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('a kisfecskébe be nem teszem a lábam');
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});

        setMyLocation([location.coords.latitude, location.coords.longitude]);
        return [location.coords.latitude, location.coords.longitude]
    }


    useFocusEffect(
        useCallback(() => {
            (async()=>{
                const loc = (await getLocation());
                handleSearch2(loc)
            })()
            //if (array.length == 0)
            //handleSearch()
          return () => {
            setArray({
                sale: [],
                users: [],
                maps: [],
                buziness: [],
                categories: []
            })
          };
        }, [route.params])
      );
    const handleSearch2 = (loc) => {

        if (key) {
            axios.post('/search',{
                key,myLocation:loc
            },config()).then(res=>{
                setArray(res.data);

                console.log('search',res.data);
                setProgress(progress+1)
            }).catch(err=>{
                console.log(err);
                if (err?.response?.data == 'Token expired') {
                    console.log('Token expired');
                    api.logout();
                    return
                }
                setArray({
                    sale: [],
                    users: [],
                    maps: [],
                    buziness: [],
                    categories: []
                })
            })
        }
    }

    useEffect(() => {
        //console.log(allCategories.places.filter(e=>e.name.toLowerCase().includes(key.toLowerCase())));
        if (!array?.categories || array.categories == [])
        setArray({...array,categories:allCategories.places.filter(e=>e.name.toLowerCase().includes(key.toLowerCase()))})
    }, [array]);

    //console.log(array);
    const text = route.params?.key+" kifejezésre"//toldalek(route.params?.key||null,'ra')

    return(
        <BasePage style={{flex:1,backgroundColor:'#FDEEA2'}}>
            <MyText title>Keresés a fife appon</MyText>
            {width < 1340 && <SearchBar style={{flexGrow:0,flex:'none',width:'100%',marginRight:40}}/>}
            <View style={{marginHorizontal:25,width:'90%'}}>
                {!route.params?.key &&
                    <MyText>Keress profilokra, bizniszre, helyekre, cserebere cikkekre</MyText>}
            </View>
            <View style={{backgroundColor:'#FDEEA2',zIndex:-1}}>
                <View style={{justifyContent:'center',width:'100%',flexWrap:small?'wrap':'none',flexDirection:'row',}}>
                    {Object.keys(categories).map((cat,ind) =>
                        {return <NewButton title={categories[cat].name} key={ind+"cat"} 
                            color={categories[cat].active?'#ffdaad':'#FDEEA2'}
                            style={{userSelect:'none',padding:3}}
                            onPress={()=>setCategories({...categories,[cat]:{...categories[cat],active:!categories[cat].active}})}/>}
                    )}
                </View>
                {progress < ready ?
                    <>
                    {route.params?.key && <Loading color="#f5d761" />}
                    </>:
                    (
                        error ?   <View>
                                <TextFor style={styles.noResultText} text="no_result"/>
                                <MyText style={styles.noResultSubText}>{error}</MyText>
                            </View>
                        :   <ScrollView contentContainerStyle={{alignItems:'center'}}>
                                    {Object.keys(categories).map((cat,ind) =>{
                                        if (categories[cat].active && array[cat]?.length)
                                        return <View style={{width:'100%'}}>
                                            <MyText title>{categories[cat].name}</MyText>
                                            <View style={{alignItems:'center'}}>
                                                {array[cat].map((item,ind)=>{
                                                    if (item)
                                                return <Item key={'sale'+ind} cat={cat} data={item}  />
                                                })}
                                            </View>
                                        </View>
                                    })}
                            </ScrollView>)
                }
                {false&&<View>
                    <MyText>Nem találod amit keresel? Írj posztot!</MyText>
                    <PostForm />
                </View>}
            </View>
        </BasePage>
    )
}

function Item({data,cat}) {
    const navigation = useNavigation();

    const [title, setTitle] = useState(null);
    const [text, setText] = useState(null);
    const [image, setImage] = useState(null);
    const [link, setLink] = useState(null);
    const [params, setParams] = useState(null);
    const [sortData, setSortData] = useState(null);



    const onPress = () => {
        navigation.push(link,params || {});
        }
    useEffect(() => {
        //cica
        setTitle(cat)
        switch (cat) {
            case 'users':
                setTitle(data.name)
                setText(data.username)
                setImage(`profiles/${data.uid}/profile.jpg`)
                setLink('profil')
                setParams({uid:data.uid})
                break;
            case 'sale':
                setTitle(data.title)
                setImage('sale/'+data.id+'/0')
                setText(data.description)
                setLink(cat)
                setParams({id:data.id})
                break;
            case 'maps':
                setTitle(data.title)
                setText(data.description)
                setLink('terkep')
                setParams({id:data.id})
                break;
            case 'buziness':
                setTitle(data.name)
                setText(data.description)
                setImage('profiles/'+data.uid+'/profile.jpg')
                setLink('profil')
                setParams({uid:data.uid})
                setSortData(Math.round(data.distance?.[0]?.distance*10)/10)
                break;
            case 'categories':
                setTitle(data.name)
                setText('Kategória')
                //setImage('profiles/'+data.uid+'/profile.jpg')
                setLink('terkep')
                //setParams({id:data.uid})
                //setSortData(Math.round(data.distance?.[0]?.distance*10)/10)
                break;
            default:
                break;
        }
    }, [cat]);
    return (
        <TouchableRipple onPress={onPress} style={{width:'100%',borderRadius:8, maxWidth:500,}}>
            <View style={[styles.list,{flexDirection: "row"}]}>
                {image && <ProfileImage style={styles.listIcon} path={image}/>}
                <View style={{marginLeft: 5,flexGrow:1}}>
                <MyText style={{ fontWeight: 'bold',flex: 1, }}>{title}</MyText>
                <MyText style={{ flex:1,maxHeight:20,overflow:'hidden' }}>{text}</MyText>
                </View>
                <View style={{marginLeft: 5}}>
                <MyText style={{ flex:1,maxHeight:20,overflow:'hidden' }}>{!!sortData && sortData+" km"}</MyText>
                </View>
            </View>
        </TouchableRipple>
    );
    
  }

const styles = StyleSheet.create({

    list: {
        alignItems: "center",
        borderColor: "rgb(240,240,240)",
        backgroundColor: 'white',
        width:'100%',
        borderBottomWidth: 2,
        borderTopWidth: 1,
        padding: 12,
        marginTop: -1,
        borderRadius:8
    },
    noResultText: {
        fontSize: 30,
        margin: 40,
        marginBottom: 10,
    },
    noResultSubText: {
        fontSize: 20,
        margin: 50,
        marginTop:10
    },
    listIcon: {
        borderRadius: 8
    },
    searchList: {
        padding: 16,
        backgroundColor: 1,
        borderBottomWidth: 1,
        borderBottomColor: 0,
        alignItems: "center",
    },
  })

export default Search