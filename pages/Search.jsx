import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useCallback, useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Auto, Loading, MyText, NewButton, ProfileImage, Row, SearchBar } from '../components/Components';
import { config } from '../firebase/authConfig';
import { FirebaseContext } from '../firebase/firebase';
import { TextFor, toldalek } from '../lib/textService/textService';
import BasePage from '../components/BasePage';
import PostForm from '../components/tools/Post';


const Search = ({ route, style }) => {
    const { api } = useContext(FirebaseContext);
    const { width } = useWindowDimensions();
    const small = width <= 900;
    //const { key } = route.params;
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
            name:'Bizinsz',
            active:true
        }
    });
    
    const [array, setArray] = React.useState({
        sale: [],
        users: [],
        maps: [],
        buziness: []
    });
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const ready = 1;


    useFocusEffect(
        useCallback(() => {
            handleSearch2()
            //if (array.length == 0)
            //handleSearch()
          return () => {
            setArray({
                sale: [],
                users: [],
                maps: [],
                buziness: []
            })
          };
        }, [route.params])
      );
    const handleSearch2 = () => {
        const key = route.params?.key || null;
        if (key) {
            axios.post('/search',{
                key
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
            })
        }
    }

    console.log(array);
    const text = toldalek(route.params?.key||null,'ra')

    return(
        <BasePage style={{flex:1,backgroundColor:'#FDEEA2'}}>
            <MyText title>Keresés a fife appon</MyText>
            {width < 1340 && <SearchBar style={{flexGrow:0,flex:'none',width:'100%',marginRight:40}}/>}
            <View style={{backgroundColor:'#FDEEA2'}}>
                <View style={{justifyContent:'center',width:'100%',flexWrap:small?'wrap':'none',flexDirection:'row',}}>
                    {Object.keys(categories).map((cat,ind) =>
                        {return <NewButton title={categories[cat].name} key={ind+"cat"} 
                        color={categories[cat].active?'#ffdaad':'#fdf6d1'}
                         style={{userSelect:'none',padding:20,width:small?'40%':'20%'}}
                         onPress={()=>setCategories({...categories,[cat]:{...categories[cat],active:!categories[cat].active}})}/>}
                        
                    )}
                </View>
                {route.params?.key ? <MyText title style={{marginLeft:50}}>Keresés {text}</MyText> :
                <MyText>Keress profilokra, bizniszre, helyekre, cserebere cikkekre</MyText>}
                {progress < ready ?
                    <>
                    {route.params?.key && <Loading color="#f5d761" />}
                    </>:
                    (error
                        ?   <View>
                                <TextFor style={styles.noResultText} text="no_result"/>
                                <MyText style={styles.noResultSubText}>{error}</MyText>
                            </View>
                        :   <ScrollView contentContainerStyle={{alignItems:'center'}}>
                                    {Object.keys(categories).map((cat,ind) =>{
                                        if (categories[cat].active && array[cat]?.length)
                                        return <View style={{}}>
                                            <MyText title>{categories[cat].name}</MyText>
                                            <View style={{alignItems:'center'}}>
                                                {array[cat].map((item,ind)=>{
                                                    if (item)
                                                return <Item key={'sale'+ind} title={item?.title || item.name} text={item.description} uid={item?.author||item.uid} />
                                                })}
                                            </View>
                                        </View>
                                    })}
                            </ScrollView>)
                }
                <View>
                    <MyText>Nem találod amit keresel? Írj posztot!</MyText>
                    <PostForm />
                </View>
            </View>
        </BasePage>
    )
}

function Item({title,text,uid,link,params}) {
    const navigation = useNavigation();
    const onPress = () => {
        if (link)
        navigation.push(link,params || {});
        else
        navigation.push("profil", {uid});
        }
    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row"}]}>
            {uid && <ProfileImage style={styles.listIcon} uid={uid}/>}
            <View style={{marginLeft: 5}}>
              <MyText style={{ fontWeight: 'bold',flex: 1, }}>{title}</MyText>
              <MyText style={{ flex:1,maxHeight:20,overflow:'hidden' }}>{text}</MyText>
            </View>
        </TouchableOpacity>
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
        maxWidth:500,
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