import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
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
import BuzinessItem from './BuzinessItem';
import * as Location from 'expo-location';
import { styles } from '../../styles/styles';
import { BuzinessPage } from './BuzinessPage';


const categories = ['Kategória: Minden',...cats.buziness.map(c=>{return c.name})];

const BuzinessSearch = () => {
    const params = useLocalSearchParams();
    const { id, category=0 } = params || {};
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastQuery, setlastQuery] = useState(null);
    const {database, storage, api, auth, firestore} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const { width } = useWindowDimensions();
    const small = useWindowDimensions().width <= 900;
    const [saleWidth, setWidth] = useState(600);
    const itemWidth = 200
    const itemsPerRow = 3//Math.round(saleWidth/itemWidth);
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
        console.log(settings);
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
        const loc = await getLocation();
        console.log(settings);
        console.log('location',loc)
        setChanged(false)
        if (list.length != 0 && deepEqual(lastQuery,{
            ...(settings||params),
            skip,
            search:searchText,
        })) console.log('no');
        if (lastQuery?.skip && lastQuery?.skip == skip) return
        setLoading(true)
        await axios.get('/buziness',{...config(),params:{
            ...(settings||params),
            id: undefined,
            category: settings.category-1,
            take:itemsPerRow*3,
            skip,
            myLocation:loc
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
    return <>
    <BasePage style={{paddingTop:0}} title="Biznisz">
        <BuzinessPage data={list.find(e=>e._id == selected)} toLoadId={id} 
            setSelected={setSelected} interestItem={setInterestModal}   deleteItem={()=>setDeleteModal(true)}/>
        {modals}
        </BasePage>
    </>

    return (
        <BasePage title="Biznisz" full style={{paddingTop:32}}>

            <View style={{backgroundColor:'#fcf7e8',padding:16,borderRadius:8,marginBottom:30}}>
                <View style={{maxWidth:800,margin:'auto'}}>
                        <MyText title>Induljon a biznisz!</MyText>
                        <MyText>
                        Itt keresgélhetsz mások bizniszei között! Valakinek a bizniszei azon hobbijai, képességei vagy szakmái listája, amelyeket meg szeretne osztani másokkal is.
                        Ha te mondjuk úgy gyártod a sütiket, mint egy gép, és ezt felveszed a bizniszeid közé, az ebben a listában megtalálható leszel, a süti kulcsszóval keresve.</MyText>
                        <Row>
                            <TextInput
                                    onChangeText={(e)=>setSettings({...settings,searchText:e})}
                                    onSubmitEditing={()=>{setList([]);search(0)}}
                                    style={{fontSize:17,flex:1,padding:10,margin:5,backgroundColor:'white',borderRadius:8}}
                                    placeholder="Keress bizniszek közt"
                                    value={settings.searchText}
                                />
                            <NewButton color={changed?'#FFC372':undefined} title="Keresés!" onPress={()=>{setList([]);search(0)}} textStyle={{fontSize:24}} style={{}}/>
                        </Row>
                        <Row style={{justifyContent:'space-evenly',marginTop:24}}>
                            <NewButton title="Bővebben a bizniszről" onPress={()=>router.push({pathname:'cikk',params:{id:'65cb9ede39992764cfdcb1ba'}})}/>
                            <NewButton title="Hozz létre saját bizniszt!" 
                                onPress={()=>router.push('biznisz/uj')}
                                color="#fcf7e8" style={{borderColor:'#000000',borderWidth:2}}/>
                        </Row>

                </View>
            </View>
            <View style={{maxWidth:small?'auto':1000,margin:'auto'}}>
                <MyText size={18} style={[styles.p2]}>A közelben</MyText>
            
                <Auto style={{justifyContent:small?'flex-start':'center'}}>
                    {false&&<View style={{width:small?'auto':300}}>
                        <View style={{padding:0}}>
                            <Row style={styles.alignC}>
                                <TextInput
                                    onChangeText={(e)=>setSettings({...settings,searchText:e})}
                                    style={{fontSize:17,flex:1,padding:10,marginHorizontal:10,marginBottom:0,backgroundColor:'white',borderRadius:8}}
                                    placeholder="Keress bizniszek közt"
                                    value={settings.searchText}
                                />
                                <Pressable onPress={(e)=>setSettings({...settings,searchText:''})}
                                    style={{position:'absolute',right:20}}>
                                    <Icon name="close-outline" size={30} />
                                </Pressable>
                            </Row>
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
                        {( !hide || width > 600 ) && <View style={{margin:5,marginTop:-5}}>
                            <Row style={{flex:1}}>
                                <NewButton color={changed?'#FFC372':undefined} title="Keresés!" onPress={()=>{setList([]);search(0)}} textStyle={{fontSize:24}} style={{flex:5}}/>
                                <NewButton title={<Icon name="refresh" size={30} />} onPress={()=>{setList([]);search(0)}} style={{flex:1}}/>
                            </Row>
                        </View>}
                        {changed && <MyText style={{textAlign:'center',padding:10,marginHorizontal:10,whiteSpace:'break'}}>Kattints a Keresésre, hogy frissítsd a találatokat!</MyText>}
                    </View>}
                
                    {list.length?<ScrollView
                        key='list'
                        scrollEnabled={false}
                        ref={scrollView}
                        style={{width:'100%'}}
                        contentContainerStyle={{paddingBottom:100}}
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
                        }}
                        >
                            <View style={{gap:16,flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
                                {list.map((e,i)=><BuzinessItem data={e} key={i} />)}
                            </View>
                            {loading && <Loading color='#FFC372' height={10}/>}
                            <NewButton title="Mutass többet!" onPress={()=>search(settings.skip+itemsPerRow)}/>
                    </ScrollView>: <View style={{justifyContent:'center',alignItems:'center',margin:30}}>
                            {!error ?
                            <MyText style={{fontSize:17}}>Nincs találat!</MyText>:
                            <MyText style={{fontSize:17}}>{error.message}</MyText>}
                        </View>}
                </Auto>
            </View>      
            {scrollView.current?.top > 0 && <FAB color="#FFC372" size={80} icon="chevron-up" onPress={()=>scrollView.current.scrollTo(0,0)}/>}
            {uid&&<FAB color="#FFC372" size={80} icon="add" onPress={()=> router.push('biznisz/uj')}/>}

        </BasePage>
    )
}

export default BuzinessSearch