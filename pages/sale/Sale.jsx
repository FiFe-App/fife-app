import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Auto, FAB, Loading, MyText, NewButton, Row, TextInput } from '../../components/Components';
import { FirebaseContext } from '../../firebase/firebase';
import { default as NewSaleItem } from "./NewItem";

import { useWindowDimensions } from 'react-native';

import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from "../../components/DateTimePicker";
import CloseModal, { UserModal } from "../../components/Modal";
import Select from "../../components/Select";
import { config } from "../../firebase/authConfig";
import { deepEqual, listToMatrix } from "../../lib/functions";
import { Item } from "./ItemOld";
import { SaleListItem } from "./SaleListItem";
import { categories as cats } from "../../lib/categories";
import HelpModal from "../../components/help/Modal";
import { SaleContext } from './SaleContext';


const categories = ['Kategória: Minden',...cats.sale.map(c=>{return c.name})];

const Sale = ({ navigation, route }) => {
    const { id, category=0 } = route.params || {};
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastQuery, setlastQuery] = useState(null);
    const {database, storage, api, auth, firestore} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const { width } = useWindowDimensions();
    const itemsPerRow = width < 900 ? 2 : Math.round(width/2/300);
    const scrollView = useRef()

    const [settings, setSettings] = useState({
        synonims: false,
        category: Number(category),
        author: null,
        minDate: null,
        maxDate: null,
        skip: 0,
        take: itemsPerRow*3
    });
    const [moreFilter, setMoreFilter] = useState(true);
    const [changed, setChanged] = useState(false);
    const [keys, setKeys] = useState([]);

    const [closeModal, setCloseModal] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [interestModal, setInterestModal] = useState(null);
    const [IList, setIList] = useState(null);

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(id || null);
    const [toDelete, setToDelete] = useState(null);
    const [hide, setHide] = useState(false);
    
    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 0.5
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
        console.log('selected',selected);
        if (!id && selected && width <= 900) navigation.push('cserebere',{id:selected})
    }, [selected]);

    useFocusEffect(
        useCallback(() => {
            console.log(!route?.params);
            if (database && !route?.params) {
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
            }).catch(err=>{
                console.log(err);
            })
        })()
    }

    const interestItem = async (index,isInterest) => {
        console.log('interest',interestModal);
        if (interestModal.message)
        return (async ()=> {
            const res = await axios.patch('/sale/'+interestModal.id+'/interest', {
                interested: !isInterest,
                message: interestModal.message
              },config())
              .then((res)=>{
                if (res?.data) {
                    setList(list.map((e,i)=> e._id==index ? {...e, interested:!isInterest, interestedBy: uid} : e))
                } else {
                    setList(list.map((e,i)=> e._id==index ? {...e, interested:true, interestedBy: 'other'} : e))
                }
                return res.data
              })
              .catch(error=>console.error(error))
              .finally(()=>{
                setInterestModal('submitted')})
              console.log(res);
            return !isInterest;
        })()
    }

    const search = async (skip) => {
        setChanged(false)
        if (list.length != 0 && deepEqual(lastQuery,{
            ...settings,
            skip,
            search:searchText
        })) return
        setLoading(true)
        await axios.get('/sale',{...config(),params:{
            ...settings,
            category: settings.category-1,
            skip,
            search:searchText
        }}).then(res=>{
            setList(old=>[...old,...res.data])
        }).catch(err=>{
            if (err?.response?.data == 'Token expired') {
                console.log('Token expired');
                api.logout();
                return
              }
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

    useEffect(() => {
        console.log('interestModal',interestModal);
    }, [interestModal]);

    if (id && width <= 900)
    return <SaleContext.Provider value={{interestModal,setInterestModal,userModal,closeModal,selected,setSelected}}>
        <Item data={list.find(e=>e._id == selected)} toLoadId={selected} 
            setSelected={setSelected} interestItem={setInterestModal}   deleteItem={()=>setCloseModal(true)}/>
        <CloseModal modalVisible={closeModal} setModalVisible={setCloseModal} handleOK={deleteItem}/>
        <UserModal modalVisible={userModal} setModalVisible={setUserModal} uid={selected?.uid} name={selected?.name} handleOK={()=>navigation.push('uzenetek',{uid:selected?.uid})}/>
        <HelpModal
            title="Érdekel a hirdetés?"
            text='Írj üzenetet a hirdetőnek, foglald bele, mi az ami foglalkoztat.'
            actions={[
                {title:'bezárom',onPress:()=>setInterestModal(null)},
                {title:'küldés',onPress:interestItem,color:'#2b80ff'}]}
            open={interestModal}
            setOpen={setInterestModal}
            inputs={[
                {type:'text-input',attribute:'message',label:null,data:interestModal,setData:setInterestModal,style:{backgroundColor:'#fbf1e0'}}
            ]}
            success={{
                text: 'Köszi, hogy részt veszel a FiFe App fejlesztésében:)',
                title:'Sikeres beküldés!'
              }}
        />
    </SaleContext.Provider>
    return (
    <SaleContext.Provider value={{interestModal,setInterestModal,IList,setIList,userModal,closeModal,selected,setSelected}}>
        <View style={{flex:1, flexDirection:'row',backgroundColor:'#FDEEA2'}}>
            <View style={{flex:1}}>
                <ScrollView
                    ref={scrollView}
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
                    <Auto breakPoint={width > 900 ? 1300 : 600} style={{flex:'none'}}>
                        <View style={{padding:0}}>
                            <TextInput
                                onChangeText={setSearchText}
                                style={{fontSize:20,padding:10,margin:10,backgroundColor:'white'}}
                                placeholder="Keress csereberében"
                            />
                            {(!hide || width > 600) && <><Select
                                list={categories}
                                defaultValue={settings.category}
                                style={{fontSize:15,padding:10,marginVertical:0,margin:10,marginBottom:0,backgroundColor:'white',width:'96.5%',borderWidth:0}}
                                placeholder="Válassz kategóriát"
                                onSelect={(selectedItem, index) => {
                                    const i = index == 0 ? 0 : index
                                    console.log(i)
                                    setSettings({...settings,category:i})
                                }} />
                            {false && <NewButton title={moreFilter?"Kevesebb szűrő":"Több szűrő"} color={moreFilter?undefined:'#fdd300'} 
                            onPress={()=>setMoreFilter(!moreFilter)}/>}
                            
                            {false && <Row style={{justifyContent:'center',alignItems:'center'}}>
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
                            </Row>}

                            </>}
                        </View>
                        {(!hide || width > 600) && <View style={{flex:1,margin:5,marginLeft:0}}>
                            {moreFilter && <View style={{minWidth:300}}>
                                <View style={{flexDirection:'row', alignItems:'center',borderBottomWidth:5,borderColor:'#ffffff',marginHorizontal:5}}>
                                    <NewButton color={settings.author ? "#d0c582dd" : "#ffffff"} onPress={(e)=>{setSettings({...settings, author: null})}} 
                                    style={{flex:1,marginBottom:0,marginLeft:0,borderBottomLeftRadius:0,borderBottomRightRadius:0}} 
                                    title="Mindenki másé"/>
                                    <NewButton color={!settings.author ? "#d0c582dd" : "#ffffff"} onPress={(e)=>{setSettings({...settings, author: uid})}} 
                                    style={{flex:1,marginBottom:0,marginRight:0,borderBottomLeftRadius:0,borderBottomRightRadius:0}}
                                    title="Sajátjaim" />
                                </View>

                                {false && <TextInput
                                    onChangeText={v=>setSettings({...settings,author:v})}
                                    style={{fontSize:15,padding:10,margin:5,marginTop:5,backgroundColor:'white'}}
                                    placeholder="Szerző"
                                />}
                            </View>}
                            <Row style={{flex:1}}>
                                <NewButton title="Keresés!" onPress={()=>{setList([]);search(0)}} style={{flex:5}}/>
                                <NewButton title={<Icon name="refresh" size={30} />} onPress={()=>{setList([]);search(0)}} style={{flex:1}}/>
                            </Row>
                        </View>}
                    </Auto>
                    {changed && <MyText style={{textAlign:'center',padding:10}}>Kattints a Keresésre, hogy frissítsd a találatokat!</MyText>}
                    
                    {list.length ?
                    <View style={{marginRight:25}}>
                        {listToMatrix(list,itemsPerRow).map((row,i)=>{
                            console.log('row',i,new Array(itemsPerRow-row.length))
                            return (
                                <Row>
                                {row.map((e,ind,rowL)=>
                                    <SaleListItem
                                        data={e}
                                        key={'sale'+i+ind}
                                        i={'sale'+i+ind}
                                        selected={selected == e._id}
                                        setSelected={setSelected}
                                        interestItem={setInterestModal}
                                        deleteItem={()=>{setCloseModal(true);setToDelete(e._id)}}
                                        openUserModal={()=>setUserModal(true)}
                                    />
                                )}
                                {new Array(itemsPerRow-row.length).map(()=>
                                    <><MyText></MyText>
                                    <View style={{flex:1}}/></>
                                )}
                                </Row>
                            )
                        })}
                    </View>
                    : <View style={{justifyContent:'center',alignItems:'center',margin:30}}>
                        {!error ?
                        <MyText style={{fontSize:20}}>Nincs találat!</MyText>:
                        <MyText style={{fontSize:20}}>{error.message}</MyText>}
                    </View> }
                    {loading && <Loading color='#FFC372' height={10}/>}
                </ScrollView>
                <FAB color="#FFC372" size={80} icon="chevron-up" onPress={()=>scrollView.current.scrollTo(0,0)}/>
                
            </View>
            {(width > 900) &&
                <View style={{flex:1,backgroundColor:'white'}}>
                    {selected ? 
                    <Item data={list.find(e=>e._id == selected)} toLoadId={selected} interestItem={setInterestModal}
                            setSelected={setSelected}    deleteItem={()=>setCloseModal(true)}/>
                    :
                    <NewSaleItem/>}
                </View>
            }
            {(width <= 900) &&
            <FAB color="#FFC372" size={80} icon="add" onPress={()=> navigation.push('uj-cserebere')}/>
            }
            <CloseModal modalVisible={closeModal} setModalVisible={setCloseModal} handleOK={deleteItem}/>
            <UserModal modalVisible={userModal} setModalVisible={setUserModal} uid={selected?.uid} name={selected?.name} handleOK={()=>navigation.push('uzenetek',{selected:selected?.uid})}/>
            <HelpModal
                title="Érdekel a hirdetés?"
                text='Írj üzenetet a hirdetőnek! Foglald bele, mi érdekel téged.'
                actions={[
                    {title:'bezárom',onPress:()=>setInterestModal(null)},
                    {title:'küldés',onPress:interestItem,color:'#2b80ff',submit:true}]}
                open={interestModal}
                setOpen={setInterestModal}
                inputs={[
                    {type:'text-input',attribute:'message',label:null,data:interestModal,setData:setInterestModal,style:{backgroundColor:'#fbf1e0'}}
                ]}
                success={{
                    title: 'Elküldted az üzenetedet!'
                }}
            />
            <HelpModal
                title="Érdeklődők listája"
                text='Nyomj a nevükre hogy megnézd a profiljukat'
                actions={[
                    {title:'bezárom',onPress:()=>setIList(null)},
                ]}
                open={IList}
                setOpen={setIList}
                inputs={
                    IList?.map(e=>{
                        return {type:'user',attribute:e.author,label:e.message,setData:setIList,style:{
                            backgroundColor:'rgb(253, 245, 203)',
                            borderRadius: 8
                        }}
                    })
                }
            />
        </View>
    </SaleContext.Provider>
    )
}


  export default Sale