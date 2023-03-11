import { useCallback, useContext, useEffect, useState } from "react";
import { Animated, ScrollView, Switch, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Auto, FAB, Loading, MyText, NewButton, Row, TextInput } from '../../components/Components';
import { FirebaseContext } from '../../firebase/firebase';
import { search } from "../../lib/textService/textService";
import { default as NewSaleItem } from "./NewItem";

import { ref as dbRef } from "firebase/database";
import { useWindowDimensions } from "../../lib/hooks/window";

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
    const [keys, setKeys] = useState([]);

    const [closeModal, setCloseModal] = useState(false);
    const [userModal, setUserModal] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(id || null);
    
    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >=
          contentSize.height - paddingToBottom
    }

    const loadMoreData = () => {
        if (loading) return 

        console.log('more',settings.skip,settings.take);
        search()
    }

    useEffect(() => {
        console.log('uef',selected);
    }, [selected]);

    useFocusEffect(
        useCallback(() => {
            if (database) {
                const userRef = dbRef(database,`users`);
                setList([]);
                search()
            }
          return () => {
          };
        }, [])
      );

    const deleteItem = () => {
        console.log('delete',selected);
        if (database && storage && selected)
        (async ()=> {
            axios.delete('/sale/'+selected,config()).then(res=>{
                setList(list.filter(e=>e._id=!selected))
            })
        })().then(()=>{
            setList(list.filter(e=>e._id=!selected))
        })
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
              .catch(error=>console.log(error))
              
        })()
    }

    const search = async () => {
        setLoading(true)
        console.log('more2',settings,list.length);
        await axios.get('/sale',{...config(),params:{
            ...settings,
            skip:list.length,
            search:searchText
        }}).then(res=>{
            console.log(res.data);
            setList(old=>[...old,...res.data])
        }).catch(err=>{
            //navigation.push('bejelentkezes');
            console.error(err);
            setList([])
        })
        setLoading(false)
    }

    if (id && width < 900)
    return <Item data={list.find(e=>e._id == selected)} toLoadId={selected} />
    return (
    <View style={{flex:1, flexDirection:'row'}}>
        <View style={{flex:1}}>
            <Auto breakPoint={width > 900 ? 1200 : 600} style={{flex:'none',height:'none'}}>
                <View style={{padding:10}}>
                    <TextInput
                        onChangeText={setSearchText}
                        style={{fontSize:15,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white'}}
                        placeholder="Keress csereberében"
                    />
                    <Select
                        list={categories}
                        style={{fontSize:15,padding:10,marginVertical:0,margin:10,marginBottom:10,borderWidth:2,backgroundColor:'white',width:'95%'}}
                        placeholder="Válassz kategóriát"
                        onSelect={(selectedItem, index) => {
                            console.log(selectedItem, index)
                            const i = index == 0 ? -1 : index-1
                            setSettings({...settings,category:i})
                        }} />
                    <Row style={{justifyContent:'center',alignItems:'center'}}>
                        <DateTimePicker
                            setValue={(v)=>setSettings({...settings,minDate:v})}
                            value={settings.minDate}
                            style={{fontSize:15,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white',fontSize:15}}
                            placeholder="tól-"
                        />
                        <MyText style={{fontSize:15}}>-</MyText>
                        <DateTimePicker
                            setValue={(v)=>setSettings({...settings,maxDate:v})}
                            value={settings.maxDate}
                            style={{fontSize:15,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white',fontSize:15}}
                            placeholder="-ig"
                        />
                    </Row>

                    <TextInput
                        onChangeText={v=>setSettings({...settings,author:v})}
                        style={{fontSize:15,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white'}}
                        placeholder="Szerző"
                    />
                </View>
                <View style={{flex:1}}>
                    <View style={{maxWidth:300}}>
                        <View style={{flexDirection:'row', alignItems:'center',margin:2}}>
                            <MyText style={{flex:1,}}>Szinonímákkal</MyText>
                            <Switch
                                trackColor={{ false: '#767577', true: '#3e3e3e' }}
                                thumbColor={settings?.synonims ? '#white' : 'white'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={(e)=>{setSettings({...settings, synonims: e})}}
                                value={settings?.synonims}
                                style={{alignSelf:'flex-end'}}
                            />
                        </View>
                        <View style={{flexDirection:'row', alignItems:'center',margin:2}}>
                            <MyText style={{flex:1,}}>Sajátjaim</MyText>
                            <Switch
                                trackColor={{ false: '#767577', true: '#3e3e3e' }}
                                thumbColor={settings?.mine ? '#fff' : 'white'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={(e)=>{setSettings({...settings, author: e ? uid : null})}}
                                value={settings?.author == uid}
                                style={{alignSelf:'flex-end'}}
                            />
                        </View>
                    </View>
                    {!!keys?.length &&
                    <MyText style={{margin:10}}>Keresőszavak: {keys.map((e,i)=>i < keys.length-1 ? e+', ' : e)}</MyText>}
                    <MyText>Találatok száma: {list.length}</MyText>
                    <NewButton title="Mehet" onPress={()=>{setList([]);search()}}/>
                </View>
            </Auto>
            <ScrollView
                scrollEventThrottle={16}
                onScroll={event => {
                        if (isCloseToBottom(event.nativeEvent)) {
                        loadMoreData()
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
                            deleteItem={()=>setCloseModal(true)}
                            openUserModal={()=>setUserModal(true)}
                        />
                    )
                })
                : <View style={{justifyContent:'center',alignItems:'center',margin:30}}>
                    <MyText style={{fontSize:20}}>Nincs találat!</MyText>
                </View>}
                 {loading && <Loading color='#FFC372' height={10}/>}
            </ScrollView>
            
        </View>
        {(width > 900) &&
            <View style={{flex:1,backgroundColor:'white'}}>
                {selected ? 
                <Item data={list.find(e=>e._id == selected)} toLoadId={selected} 
                            deleteItem={()=>setCloseModal(true)}/>
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