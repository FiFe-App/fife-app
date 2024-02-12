import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';
import { Auto, FAB, MyText, NewButton, Row, TextInput } from '../../components/Components';
import Loading from "../../components/Loading";
import { FirebaseContext } from '../../firebase/firebase';

import { useWindowDimensions } from 'react-native';

import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import BasePage from '../../components/BasePage';
import GoBack from '../../components/Goback';
import DeleteModal from '../../components/Modal';
import Select from '../../components/Select';
import HelpModal from '../../components/help/Modal';
import ShareModal from '../../components/tools/ShareModal';
import { config } from '../../firebase/authConfig';
import { categories as cats } from '../../lib/categories';
import { deepEqual, listToMatrix } from '../../lib/functions';
import { Item } from './Item';
import { SaleContext } from './SaleContext';
import { SaleListItem } from './SaleListItem';


const categories = ['Kategória: Minden',...cats.sale.map(c=>{return c.name})];

const Sale = () => {
    const params = useLocalSearchParams();
    const { id, category=0 } = params || {};
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastQuery, setlastQuery] = useState(null);
    const {database, storage, api, auth, firestore} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const { width } = useWindowDimensions();
    const [saleWidth, setWidth] = useState(600);
    const itemWidth = 200
    const itemsPerRow = Math.round(saleWidth/itemWidth);
    const scrollView = useRef()

    const [settings, setSettings] = useState({...{
        synonims: false,
        category: Number(category),
        author: undefined,
        minDate: undefined,
        maxDate: undefined,
        skip: 0,
        take: itemsPerRow*3,
        searchText: undefined
    },...{...params,id:undefined} });
    const [moreFilter, setMoreFilter] = useState(true);
    const [changed, setChanged] = useState(false);
    const [keys, setKeys] = useState([]);

    const [deleteModal, setDeleteModal] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [interestModal, setInterestModal] = useState(null);
    const [shareModal, setShareModal] = useState(null);
    const [IList, setIList] = useState(null);

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(id || null);
    const [toDelete, setToDelete] = useState(null);
    const [toEdit, setToEdit] = useState(null);
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

    const loadMoreData = () => {
        if (loading) return 

        search(itemsPerRow*3)
    }

    useEffect(() => {
        setChanged(true);
    }, [settings]);

    useEffect(() => {
        setToEdit(null)
        console.log('selected',selected);
        if (!id && selected && width <= 900) router.push('cserebere',{id:selected})
    }, [selected]);

    useFocusEffect(
        useCallback(() => {
            setList([]);
            search(0,true)
          return () => {
          };
        }, [])
      );

    const deleteItem = () => {
        console.log('delete',selected);
        if (selected)
        (async ()=> {
            axios.delete('/sale/'+selected,config()).then(res=>{
                setList(list.filter(e=>e._id!=toDelete))
            }).catch(err=>{
                console.log(err);
            })
        })()
    }

    const interestItem = async (index,isInterest) => {
        console.log('interest',interestModal,isInterest);
        if (interestModal.message)
        return (async ()=> {
            const res = await axios.patch('/sale/'+interestModal.id+'/interest', {
                interested: interestModal.isInterest,
                message: interestModal.message
              },config())
              .then((res)=>{
                if (res?.data) {
                    setList(list.map((e,i)=> e._id==index ? {...e, interested:!isInterest, interestedBy: uid} : e))
                } else {
                    setList(list.map((e,i)=> e._id==index ? {...e, interested:true, interestedBy: 'other'} : e))
                }
                setInterestModal('submitted')
                return res.data
              })
              .catch(error=>{
                console.error(error)
                setInterestModal({error:'Nem vagy bejelentkezve!'})
            })
              console.log(res);
            return !isInterest;
        })()
    }

    const search = async (skip,initial=false) => {
        console.log(settings);
        setChanged(false)
        if (list.length != 0 && deepEqual(lastQuery,{
            ...(settings||params),
            skip,
            search:searchText
        })) console.log('no');
        if (lastQuery?.skip && lastQuery?.skip == skip) return
        setLoading(true)
        await axios.get('/sale',{...config(),params:{
            ...(settings||params),
            id: undefined,
            category: settings.category-1,
            take:itemsPerRow*3,
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

    const toShare = {interestModal,setInterestModal,IList,setIList,userModal,setToEdit,deleteModal,setDeleteModal,selected,setSelected,shareModal,setShareModal}
    const modals = <>
            <DeleteModal modalVisible={deleteModal} setModalVisible={setDeleteModal} handleOK={deleteItem}/>
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
                        return {type:'user',attribute:e.author,label:'üzenet: '+e.message,setData:setIList,style:{
                            backgroundColor:'rgb(253, 245, 203)',
                            borderRadius: 8
                        },extra:'message',extraAction:()=>router.push('üzenetek',{uid:e.author})}
                    })
                }
            />
            <ShareModal
            open={shareModal}
            setOpen={setShareModal} />
    </>

    if (id)
    return <SaleContext.Provider value={toShare}>
    <GoBack breakPoint={10000} text={null} floating icon style={{backgroundColor:'#FFC372'}} color='black'/>
    <BasePage style={{paddingTop:0}} title="Cserebere">
        <Item data={list.find(e=>e._id == selected)} toLoadId={selected} 
            setSelected={setSelected} interestItem={setInterestModal}   deleteItem={()=>setDeleteModal(true)}/>
        {modals}
        </BasePage>
    </SaleContext.Provider>
    else return (
    <SaleContext.Provider value={toShare}>
        <BasePage title="Cserebere" full style={{paddingTop:12}}>
            <Auto style={{flex:1,justifyContent:'center'}}>
                <View style={{minWidth:300}}>
                    <View style={{padding:0}}>
                        <TextInput
                            onChangeText={(e)=>setSettings({...settings,searchText:e})}
                            style={{fontSize:17,padding:10,margin:10,marginBottom:0,backgroundColor:'white',borderRadius:8}}
                            placeholder="Keress csereberében"
                            value={settings.searchText}
                        />
                        {(!hide || width > 600) && <><Select
                            list={categories}
                            defaultValue={settings.category}
                            style={{fontSize:17,padding:10,margin:10,paddingRight:20,backgroundColor:'white',borderWidth:0,width:'auto',borderRadius:8}}
                            placeholder="Válassz kategóriát"
                            onSelect={(selectedItem, index) => {
                                const i = index == 0 ? 0 : index
                                console.log(i)
                                setSettings({...settings,category:i})
                            }} />
                        </>}
                    </View>
                    {(!hide || width > 600) && <View style={{margin:5,marginTop:-5}}>
                        <View style={{flexDirection:'row', alignItems:'center',borderBottomWidth:5,borderColor:'#ffffff',marginHorizontal:5,minHeight:50}}>
                            <NewButton color={settings.author ? '#d0c582dd' : '#ffffff'} onPress={(e)=>{setSettings({...settings, author: null})}}
                            style={{flex:1,marginBottom:0,marginLeft:0,borderBottomLeftRadius:0,borderBottomRightRadius:0,padding:10}}
                            title="Mindenki másé"/>
                            <NewButton color={!settings.author ? '#d0c582dd' : '#ffffff'} onPress={(e)=>{setSettings({...settings, author: uid})}}
                            style={{flex:1,marginBottom:0,marginRight:0,borderBottomLeftRadius:0,borderBottomRightRadius:0,padding:10}}
                            title="Sajátjaim" />
                        </View>
                        <Row style={{flex:1}}>
                            <NewButton color={changed?'#FFC372':undefined} title="Keresés!" onPress={()=>{setList([]);search(0)}} textStyle={{fontSize:24}} style={{flex:5}}/>
                            <NewButton title={<Icon name="refresh" size={30} />} onPress={()=>{setList([]);search(0)}} style={{flex:1}}/>
                        </Row>
                    </View>}
                    {changed && <MyText style={{textAlign:'center',padding:10,backgroundColor:'white'}}>Kattints a Keresésre, hogy frissítsd a találatokat!</MyText>}
                </View>
                
                <ScrollView
                    ref={scrollView}
                    style={{maxWidth:800}}
                    contentContainerStyle={{alignItems:'center',paddingBottom:100}}
                    onLayout={(e)=>{
                        setWidth(e.nativeEvent.layout.width)
                    }}
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
                    <View style={{width:'100%',alignItems:'center'}}>
                        {listToMatrix(list,itemsPerRow).map((row,i)=>{
                            return (
                                <Row key={'saleRow'+i} style={{width:'100%'}}>
                                {row.map((e,ind,rowL)=>
                                    <SaleListItem
                                        data={e}
                                        key={'sale'+i+ind}
                                        i={'sale'+i+ind}
                                        selected={selected == e._id}
                                        setSelected={setSelected}
                                        interestItem={setInterestModal}
                                        deleteItem={()=>{setDeleteModal(true);setToDelete(e._id)}}
                                        openUserModal={()=>setUserModal(true)}
                                    />
                                )}
                                <View style={{flex:itemsPerRow-row.length}}/>
                                </Row>
                            )
                        })}
                    </View>
                    : <View style={{justifyContent:'center',alignItems:'center',margin:30}}>
                        {!error ?
                        <MyText style={{fontSize:17}}>Nincs találat!</MyText>:
                        <MyText style={{fontSize:17}}>{error.message}</MyText>}
                    </View> }
                    {loading && <Loading color='#FFC372' height={10}/>}
                </ScrollView>
            </Auto>
        </BasePage>
        <FAB color="#FFC372" size={80} icon="chevron-up" onPress={()=>scrollView.current.scrollTo(0,0)}/>
        {uid&&<FAB color="#FFC372" size={80} icon="add" onPress={()=> router.push('uj-cserebere')}/>}
        {modals}
    </SaleContext.Provider>
    )
}


  export default Sale