import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Auto, MyText, NewButton, ProfileImage, Row, SearchBar } from '../components/Components';
import Loading from "../components/Loading";
import { config } from '../firebase/authConfig';
import { FirebaseContext } from '../firebase/firebase';
import { TextFor, toldalek } from '../lib/textService/textService';
import BasePage from '../components/BasePage';
import PostForm from '../components/tools/Post';
import { TouchableRipple } from 'react-native-paper';
import * as Location from 'expo-location';

import { categories as allCategories } from '../lib/categories';
import { listToMatrix } from '../lib/functions';

const Search = () => {
    const { api } = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams();
    const small = width <= 900;
    const key = params?.key || null;
    const [categories, setCategories] = useState({
        all: {
            name:'Minden',
            active:true
        },
        sale: {
            name:'Cserebere',
            active:false
        },
        users: {
            name:'Felhasználók',
            active:false
        },
        maps: {
            name:'Helyek',
            active:false
        },
        buziness: {
            name:'Biznisz',
            active:false
        }
    });
    const [selected, setSelected] = useState(0);
    const itemsPerRow = width < 900 ? Math.round(width/200) : 4;
    
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
          //setError('Nincs megosz');
          setMyLocation(null)
          return;
        }
  
        let location = await Location.getCurrentPositionAsync({});

        setMyLocation([location.coords.latitude, location.coords.longitude]);
        return [location.coords.latitude, location.coords.longitude]
    }

    useEffect(() => {
        console.log('search',key);
    }, [key]);

    useFocusEffect(
        useCallback(() => {
            console.log('focusEffect');
            handleSearch2(myLocation)
            return () => {
                setArray({
                    sale: [],
                    users: [],
                    maps: [],
                    buziness: [],
                    categories: []
                })
            };
        }, [key])
    );

    const handleSearch2 = (loc) => {
        console.log('search');
        if (!myLocation) getLocation()

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
        if (!array?.categories || array.categories == [])
        setArray({...array,categories:allCategories.places.filter(e=>e.name.toLowerCase().includes(key.toLowerCase()))})
    }, [array]);

    return(
        <BasePage style={{}}>
            {width < 1340 && <SearchBar style={{flexGrow:0,flex:undefined,width:'100%',marginRight:40}}/>}

            <View style={{justifyContent:'center',width:'100%',flexWrap:small?'wrap':'none',flexDirection:'row',zIndex:-1}}>
                        {Object.keys(categories).map((cat,ind) =>
                            {
                                if(array[cat]?.length || selected == ind || ind==0 || progress== 0)
                                return <NewButton title={categories[cat].name} key={ind+'cat'}
                                color={selected==ind?'#fdfbf0':'#fdf6d1'}
                                style={{userSelect:'none',padding:small?3:8,marginBottom:0,borderBottomLeftRadius:0,borderBottomRightRadius:0}}
                                textStyle={{fontSize:small?11:18,fontWeight:'400'}}
                                onPress={()=>setSelected(ind)}/>}
                        )}
            </View>
            <ScrollView style={{borderRadius:8,padding:16,flex:1,zIndex:-1}}>
                <View style={{marginHorizontal:25,width:'90%'}}>
                    {!params?.key &&
                        <MyText>Keress profilokra, bizniszre, helyekre, cserebere cikkekre</MyText>}
                </View>
                {myLocation==null && progress>0 && array && 
                <MyText>Ha szeretnél távolság alapján rendezett találatokat, engedélyezd a hozzáférést a helyadatokhoz.</MyText>
                }
                <View style={{backgroundColor:'#fdfbf0',zIndex:-1}}>
                    
                    {progress < ready ?
                        <>
                        {params?.key && <Loading color="#f5d761" />}
                        </>:
                        (
                            error ?   <View>
                                    <TextFor style={styles.noResultText} text="no_result"/>
                                    <MyText style={styles.noResultSubText}>{error}</MyText>
                                </View>
                            :   <View contentContainerStyle={{alignItems:'center',flex:1}}>
                                        {Object.keys(categories).map((cat,ind) =>{
                                            if ((selected == 0 || selected==ind))
                                            if (array[cat]?.length)
                                            return <View style={{width:'100%'}}>
                                                <MyText title>{categories[cat].name}</MyText>
                                                <View style={{marginTop:16}}>
                                                {!!array[cat]?.length && listToMatrix(array[cat],itemsPerRow).map((row,i)=>{
                                                    return (
                                                        <Row style={{marginBottom:8}} key={'item'+i}>
                                                            {row.map((item,ind,rowL)=>
                                                            {if (item)
                                                                return<Item key={'sale'+ind+'r'+i} cat={cat} data={item}  />
                                                            })}
                                                            <View style={{flex:itemsPerRow-row?.length}}/>
                                                        </Row>
                                                    )
                                                })}

                                                </View>
                                            </View>
                                        })}
                                </View>)
                    }
                    {false&&<View>
                        <MyText>Nem találod amit keresel? Írj posztot!</MyText>
                        <PostForm />
                    </View>}
                </View>
            </ScrollView>
        </BasePage>
    )
}

function Item({data,cat}) {
    const navigation = router;

    const [title, setTitle] = useState(null);
    const [text, setText] = useState(null);
    const [image, setImage] = useState(null);
    const [link, setLink] = useState(null);
    const [params, setParams] = useState(null);
    const [sortData, setSortData] = useState(null);


    const onPress = () => {
        navigation.push({pathname:link,params:params || {}});
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
                setLink('cserebere')
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
        <View style={[styles.list, { aspectRatio:1/1}]}>
        <TouchableRipple onPress={onPress}  style={{width:'100%',backgroundColor:'#ffffff',borderRadius:8}}>
                <>{image ? <ProfileImage path={image} size={'100%'} style={{flex:1,aspectRatio: 1,margin:0,borderRadius:8,}}/>
                : <ProfileImage uid={data?.author} size={10} style={{flex:1,aspectRatio: 1,margin:0,borderRadius:8}}/>}
                    <View style={{position:'absolute',bottom:0,backgroundColor:'#ffffff',padding:4,width:'100%',borderBottomLeftRadius:8,borderBottomRightRadius:8}}>
                        
                                        <View style={{marginLeft: 5}}>
                        <MyText style={{ fontWeight: 'bold',fontSize:14 }}>{title}</MyText>
                        <MyText style={{ flex:1,maxHeight:20,overflow:'hidden' }}>{text}</MyText>
                                        </View>
                                        <View style={{marginLeft: 5}}>
                        <MyText style={{ flex:1,maxHeight:20,overflow:'hidden' }}>{!!sortData && sortData+' km'}</MyText>
                                        </View>
                    </View>
                    </>
                
        </TouchableRipple>
        { false &&
            <MyText style={{marginRight:5,position:'absolute',padding:5}}>{}</MyText>
            }
        </View>
    );
    
  }

const styles = StyleSheet.create({

    list: {
        alignItems: 'center',
        flex:1,
        borderBottomWidth: 0,
        borderTopWidth: 0,
        marginTop: -1,
        margin: 6,
        borderRadius: 8
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
        alignItems: 'center',
    },
  })

export default Search