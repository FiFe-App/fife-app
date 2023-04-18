import { useCallback, useContext, useEffect, useState } from "react";
import { Animated, ScrollView, Switch, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Auto, FAB, Loading, MyText, NewButton, Row, TextInput } from '../../components/Components';
import { FirebaseContext } from '../../firebase/firebase';
import { search } from "../../lib/textService/textService";
import { default as NewSaleItem } from "./NewItem";

import { ref as dbRef } from "firebase/database";
import {useWindowDimensions} from 'react-native';

import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { doc, updateDoc } from "firebase/firestore";
import SelectDropdown from "react-native-select-dropdown";
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from "../../components/DateTimePicker";
import CloseModal, { UserModal } from "../../components/Modal";
import { config } from "../../firebase/authConfig";
import { SaleListItem } from "./SaleListItem";
import Select from "../../components/Select";
import { Item } from "./ItemOld";
import { deepEqual } from "../../lib/functions";

const categories = [
    'Minden',
    'Eladó tárgyak',
    'Tárgyakat keresek',
    'Kiadó lakás',
    'Munka',
    'Bármi egyéb'
]

const Sale = ({ navigation, route }) => {
    const id = route.params?.id;
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastQuery, setlastQuery] = useState(null);
    const {database, storage, app, auth, firestore} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const { width } = useWindowDimensions();

    const [settings, setSettings] = useState({
        synonims: false,
        category: -1,
        author: null,
        minDate: null,
        maxDate: null,
        skip: 0,
        take: 5
    });
    const [changed, setChanged] = useState(false);
    const [keys, setKeys] = useState([]);

    const [closeModal, setCloseModal] = useState(false);
    const [userModal, setUserModal] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(id || null);
    const [toDelete, setToDelete] = useState(null);
    const [hide, setHide] = useState(false);
    
    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 0
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom
    }
    const isScrollDown = ({layoutMeasurement, contentOffset, contentSize}) => {
        if (list.length < 5) return false
        const paddingToBottom = 0
        return contentOffset.y >= 20
    }

    const loadMoreData = () => {
        if (loading) return 

        search(list.length)
    }

    useEffect(() => {
        setChanged(true);
    }, [settings]);

    useEffect(() => {
        if (selected && width < 900) navigation.navigate('cserebere',{id:selected})
    }, [selected]);

    useFocusEffect(
        useCallback(() => {
            if (database) {
                const userRef = dbRef(database,`users`);
                setList([]);
                search(0)
            }
          return () => {
          };
        }, [])
      );

    const deleteItem = () => {
        console.log('delete',toDelete);
        if (database && storage && toDelete)
        (async ()=> {
            axios.delete('/sale/'+toDelete,config()).then(res=>{
                setList(list.filter(e=>e._id!=toDelete))
            })
        })()
    }

    const bookItem = (index,isBook) => {
        console.log('book');
        if (firestore && storage && index)
        (async ()=> {
            await axios.patch('/sale/'+index+'/book', {
                booked: !isBook,
                bookedBy: !isBook ? uid : null
              },config())
              .then((res)=>{
                if (res.data) {
                    console.log(!isBook);
                    setList(list.map((e,i)=> e._id==index ? {...e, booked:!isBook, bookedBy: uid} : e))
                } else {
                    setList(list.map((e,i)=> e._id==index ? {...e, booked:true, bookedBy: 'other'} : e))
                }
              })
              .catch(error=>console.error(error))
              
        })()
    }

    const search = async (skip) => {
        setChanged(false)
        if (deepEqual(lastQuery,{
            ...settings,
            skip,
            search:searchText
        })) return
        setLoading(true)
        await axios.get('/sale',{...config(),params:{
            ...settings,
            skip,
            search:searchText
        }}).then(res=>{
            setList(old=>[...old,...res.data])
        }).catch(err=>{
            //navigation.push('bejelentkezes');
            console.error(err);
            setError(err);
            setList([])
        }).finally(()=>{
            setlastQuery({
                ...settings,
                skip,
                search:searchText
            })
        })
        setLoading(false)
    }

    if (id && width < 900)
    return <Item data={list.find(e=>e._id == selected)} toLoadId={selected} />
    return (
    <View style={{flex:1, flexDirection:'row',backgroundColor:'#FDEEA2'}}>
        <View style={{flex:1}}>
            <Auto breakPoint={width > 900 ? 1300 : 600} style={{flex:'none',height:'none'}}>
                <View style={{padding:0}}>
                    <TextInput
                        onChangeText={setSearchText}
                        style={{fontSize:15,padding:10,margin:10,backgroundColor:'white'}}
                        placeholder="Keress csereberében"
                    />
                    {(!hide || width > 600) && <><Select
                        list={categories}
                        style={{fontSize:15,padding:10,marginVertical:0,margin:10,marginBottom:10,backgroundColor:'white',width:'96.5%',borderWidth:0}}
                        placeholder="Válassz kategóriát"
                        onSelect={(selectedItem, index) => {
                            const i = index == 0 ? -1 : index-1
                            setSettings({...settings,category:i})
                        }} />
                    <Row style={{justifyContent:'center',alignItems:'center'}}>
                        <DateTimePicker
                            setValue={(v)=>setSettings({...settings,minDate:v})}
                            value={settings.minDate}
                            style={{fontSize:15,padding:10,margin:10,backgroundColor:'white',fontSize:15,borderWidth:0}}
                            placeholder="tól-"
                        />
                        <MyText style={{fontSize:15}}>-</MyText>
                        <DateTimePicker
                            setValue={(v)=>setSettings({...settings,maxDate:v})}
                            value={settings.maxDate}
                            style={{fontSize:15,padding:10,margin:10,backgroundColor:'white',fontSize:15,borderWidth:0}}
                            placeholder="-ig"
                        />
                    </Row>

                    </>}
                </View>
                {(!hide || width > 600) && <View style={{flex:1,margin:5,marginLeft:0}}>
                    <View style={{minWidth:300}}>
                        <View style={{flexDirection:'row', alignItems:'center',borderBottomWidth:5,borderColor:'#ffffff',marginHorizontal:5}}>
                            <NewButton color={settings.author ? "#d0c582dd" : "#ffffff"} onPress={(e)=>{setSettings({...settings, author: null})}} title="Mindenki másé"
                            style={{flex:1,marginBottom:0,marginLeft:0}} />
                            <NewButton color={!settings.author ? "#d0c582dd" : "#ffffff"} onPress={(e)=>{setSettings({...settings, author: uid})}} 
                            style={{flex:1,marginBottom:0,marginRight:0}} title="Sajátjaim" />
                        </View>

                        <TextInput
                            onChangeText={v=>setSettings({...settings,author:v})}
                            style={{fontSize:15,padding:10,margin:5,marginTop:5,backgroundColor:'white'}}
                            placeholder="Szerző"
                        />
                    </View>
                    <NewButton title="Keresés!" onPress={()=>{setList([]);search(0)}}/>
                </View>}
            </Auto>
            {changed && <MyText style={{textAlign:'center',padding:10}}>Kattints a Keresésre, hogy frissítsd a találatokat!</MyText>}
            <ScrollView
                scrollEventThrottle={16}
                onScroll={event => {
                        if (isCloseToBottom(event.nativeEvent)) 
                            loadMoreData()
                        
                        const down = isScrollDown(event.nativeEvent);
                        if (down != hide) {
                            setHide(down)
                        }
                    }
                    }
                >
                {list.length ?
                list.map((e,i)=>{
                    return (
                        <SaleListItem 
                            data={e}
                            key={i} 
                            i={i} 
                            selected={selected == e._id}
                            setSelected={setSelected}
                            bookItem={bookItem}
                            deleteItem={()=>{setCloseModal(true);setToDelete(e._id)}}
                            openUserModal={()=>setUserModal(true)}
                        />
                    )
                }) 
                : <View style={{justifyContent:'center',alignItems:'center',margin:30}}>
                    {!error ?
                    <MyText style={{fontSize:20}}>Nincs találat!</MyText>:
                    <MyText style={{fontSize:20}}>{error.message}</MyText>}
                </View> }
                 {loading && <Loading color='#FFC372' height={10}/>}
            </ScrollView>
            
        </View>
        {(width > 900) &&
            <View style={{flex:1,backgroundColor:'white'}}>
                {selected ? 
                <Item data={list.find(e=>e._id == selected)} toLoadId={selected} 
                        setSelected={setSelected}    deleteItem={()=>setCloseModal(true)}/>
                :
                <NewSaleItem/>}
            </View>
        }
        {(width <= 900) &&
        <FAB color="#FFC372" size={80} icon="add" onPress={()=> navigation.navigate('uj-cserebere')}/>
        }
        <CloseModal modalVisible={closeModal} setModalVisible={setCloseModal} handleOK={deleteItem}/>
        <UserModal modalVisible={userModal} setModalVisible={setUserModal} uid={selected?.uid} name={selected?.name} handleOK={()=>navigation.navigate('uzenetek',{selected:selected?.uid})}/>
    </View>
    )
}


  export default Sale