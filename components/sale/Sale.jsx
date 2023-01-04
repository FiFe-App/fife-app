import { useState, useContext, useEffect } from "react";
import {View, Text, ScrollView, Switch} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { FAB, Loading, NewButton, Row, TextInput } from '../Components'
import { default as NewSaleItem} from "./NewItem";
import { search } from "../../textService/textService";

import { ref as dbRef, child, get } from "firebase/database";
import { useWindowSize } from "../../hooks/window";
import { ref as sRef, listAll } from "firebase/storage";

import { collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, updateDoc, where } from "firebase/firestore"; 
import CloseModal, { UserModal } from "../Modal";
import DateTimePicker from "../DateTimePicker";
import { SaleListItem } from "./SaleListItem";



const Sale = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, storage, app, auth, firestore} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const width = useWindowSize().width;

    const [settings, setSettings] = useState({
        synonims: false,
        author: false,
        minDate: null,
        maxDate: null
    });
    const [keys, setKeys] = useState([]);

    const [closeModal, setCloseModal] = useState(false);
    const [userModal, setUserModal] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(null);
    
    useEffect(() => {
        if (database) {
            const saleRef = collection(firestore, "sale");
            const userRef = dbRef(database,`users`);

            const q =(settings.maxDate && settings.minDate) ? query(saleRef, 
                orderBy("date", "desc"),
                where('owner',settings.author ? '==' : '!=',settings.author),
                where('date','>',new Date(settings.minDate).getTime()),
                where('date','<',new Date(settings.maxDate).getTime())
                ) :
                query(saleRef, orderBy("date", "desc")) ;
            (async function(){
                const querySnapshot = await getDocs(q);
                setList([])
                querySnapshot.forEach((doc) => {
                    const childData = doc.data();
                    get(child(userRef,childData.owner+'/data/name')).then((snapshot) => {
                        const name = snapshot.val()
                        setList(old=>[...old,{data:childData,name:name,index:doc.id}])
                    });
                });
            })();

        }
      }, [database,settings]);

    const deleteItem = () => {
        console.log('delete',selected);
        if (database && storage && selected)
        (async ()=> {
            await deleteDoc(doc(firestore, "sale", selected))
                .catch(error=>console.log(error))
            await updateDoc(doc(firestore, 'sale',selected), {
                title: deleteField(),
                description: deleteField(),
                images: deleteField(),
                date: deleteField(),
                owner: deleteField(),
                booked: deleteField(),
                bookedBy: deleteField(),
              }).catch(error=>console.log(error))

            const ref = sRef(storage, 'sale/'+selected);
            listAll(ref)
                .then(dir => {
                dir.items.forEach(fileRef => this.deleteFile(ref.fullPath, fileRef.name));
                dir.prefixes.forEach(folderRef => this.deleteFolder(folderRef.fullPath))
                })
                .catch(error => console.log(error));
        })().then(()=>{
            setList(list.filter(e=>e.id=!selected))
        })
    }

    const bookItem = (index,isBook) => {
        console.log('book');
        if (firestore && storage && index)
        (async ()=> {
            await updateDoc(doc(firestore, 'sale',index), {
                booked: !isBook,
                bookedBy: !isBook ? uid : null
              })
              .then(()=>{
            
                console.log(list.map((e,i)=> e.index==index ? {...e, data: {...e.data,booked:!isBook}} : e));
                setList(list.map((e,i)=> e.index==index ? {...e, data: {...e.data,booked:!isBook}} : e))
              })
              .catch(error=>console.log(error))
              
        })()
    }

    useEffect(() => {
        searchFor(false)
    }, [list,searchText,settings]);

    const searchFor = async (withSynonims) => {
        if (list.length) {
            setSearchResult([])
            setSearchResult(
                await Promise.all(list.map( async (e,i)=>{
                    return  search(searchText,[e?.data.title,e?.data.description],withSynonims && settings?.synonims)
                            .then((ret)=>{
                                setKeys(ret?.keys)
                                if (ret?.found)
                                return (
                                    <SaleListItem 
                                    title={e?.data.title}
                                    imageNames={e?.data.images} 
                                    index={e?.index}
                                    text={e?.data.description} 
                                    uid={e?.data.owner} 
                                    name={e?.name} 
                                    date={e?.data.date} 
                                    booked={e?.data.booked}
                                    bookedBy={e?.data.bookedBy}
                                    key={i} 
                                    i={i} 
                                    setSelected={setSelected}
                                    bookItem={bookItem}
                                    deleteItem={()=>setCloseModal(true)}
                                    openUserModal={()=>setUserModal(true)}/>
                                    
                                )
                            })
                }))
            )
        }
    }

    return (
    <View style={{flex:1, flexDirection:'row'}}>
        <View style={{flex:1}}>
            <Row>
                <View style={{padding:10}}>
                    <TextInput
                        onChangeText={setSearchText}
                        style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white'}}
                        placeholder="Keress csereberében"
                        onSubmitEditing={()=>searchFor(true)}
                    />
                    <Row style={{justifyContent:'center',alignItems:'center'}}>
                        <DateTimePicker
                            setValue={(v)=>setSettings({...settings,minDate:v})}
                            value={settings.minDate}
                            style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white',fontSize:15}}
                            placeholder="tól-"
                            onSubmitEditing={()=>searchFor(true)}
                        />
                        <Text style={{fontSize:20}}>-</Text>
                        <DateTimePicker
                            setValue={(v)=>setSettings({...settings,maxDate:v})}
                            value={settings.maxDate}
                            style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white',fontSize:15}}
                            placeholder="-ig"
                            onSubmitEditing={()=>searchFor(true)}
                        />
                    </Row>
                    <TextInput
                        onChangeText={v=>setSettings({...settings,author:v})}
                        style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white'}}
                        placeholder="Szerző"
                        onSubmitEditing={()=>searchFor(true)}
                    />
                </View>
                <View style={{}}>
                    <View style={{flexDirection:'row', alignItems:'center',margin:10,width:'50%'}}>
                    <Text style={{flex:1,}}>Szinonímákkal</Text>
                    <Switch
                        trackColor={{ false: '#767577', true: '#3e3e3e' }}
                        thumbColor={settings?.synonims ? '#white' : 'white'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={(e)=>{setSettings({...settings, synonims: e})}}
                        value={settings?.synonims}
                        style={{alignSelf:'flex-end'}}
                    />
                    </View>
                    <View style={{flexDirection:'row', alignItems:'center',margin:10,width:'50%'}}>
                        <Text style={{flex:1,}}>Sajátjaim</Text>
                        <Switch
                            trackColor={{ false: '#767577', true: '#3e3e3e' }}
                            thumbColor={settings?.mine ? '#fff' : 'white'}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={(e)=>{setSettings({...settings, author: e ? uid : null})}}
                            value={settings?.author == uid}
                            style={{alignSelf:'flex-end'}}
                        />
                    </View>
                    {!!keys?.length &&
                    <Text style={{margin:10}}>Keresőszavak: {keys.map((e,i)=>i < keys.length-1 ? e+', ' : e)}</Text>}
                    <Text>Találatok száma: {list.length}</Text>
                    <NewButton title="Mehet"/>
                </View>
            </Row>
            <ScrollView>
                {searchResult?.length ? searchResult : <Loading color='#FFC372' height={10}/>}
            </ScrollView>
            
        </View>
        {(width > 900) &&
            <View style={{flex:1,backgroundColor:'white'}}>
                <NewSaleItem/>
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