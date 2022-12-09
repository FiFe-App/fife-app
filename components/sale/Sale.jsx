import { useState, useContext, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, Switch, Image} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { FAB, getUri, Loading, NewButton, ProfileImage, Row, TextInput } from '../Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "../styles";
import { Chat } from "../Chat";
import { widthPercentageToDP,  heightPercentageToDP} from 'react-native-responsive-screen';
import { Item as SaleItem} from "./Item";
import { elapsedTime, search } from "../../textService/textService";
import ImageModal from 'react-native-image-modal';

import { ref as dbRef, child, get, set, onValue, onChildAdded, off, orderByChild, orderByValue } from "firebase/database";
import { useWindowSize } from "../../hooks/window";
import { ref as sRef, deleteObject, listAll } from "firebase/storage";
import Icon from 'react-native-vector-icons/Ionicons'

import { collection, deleteDoc, deleteField, doc, getDocs, query, setDoc, updateDoc } from "firebase/firestore"; 
import CloseModal, { UserModal } from "../Modal";
import DateTimePicker from "../DateTimePicker";



export const Sale = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, storage, app, auth, firestore} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const width = useWindowSize().width;


    const [settings, setSettings] = useState({
        synonims: false,
        mine: false
    });
    const [keys, setKeys] = useState([]);

    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [author, setAuthor] = useState(null);

    const [closeModal, setCloseModal] = useState(false);
    const [userModal, setUserModal] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(null);
    
    useEffect(() => {
        if (database) {
            const saleRef = collection(firestore, "sale");
            const userRef = dbRef(database,`users`);

            setList([])
            const q = query(saleRef);
            (async function(){
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.id, " => ", doc.data());
                    const childData = doc.data();
                    get(child(userRef,childData.owner+'/data/name')).then((snapshot) => {
                        const name = snapshot.val()
                        setList(old=>[...old,{data:childData,name:name,index:doc.id}])
                    });
                });
            })();

        }
      }, [database]);

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
                booked: deleteField()
              }).catch(error=>console.log(error))

            const ref = sRef(storage, 'sale/'+selected);
            listAll(ref)
                .then(dir => {
                dir.items.forEach(fileRef => this.deleteFile(ref.fullPath, fileRef.name));
                dir.prefixes.forEach(folderRef => this.deleteFolder(folderRef.fullPath))
                })
                .catch(error => console.log(error));
        })()
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
                                if (ret?.found && !settings?.mine || e?.data.owner == uid)
                                return (
                                    <Item 
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
                <View style={{flex:1,padding:10}}>
                    <TextInput
                        onChangeText={setSearchText}
                        style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white'}}
                        placeholder="Keress csereberében"
                        onSubmitEditing={()=>searchFor(true)}
                    />
                    <Row style={{justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontSize:20}}>Dátum:</Text>
                        <TextInput
                            onChangeText={setMinDate}
                            style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white',width:100}}
                            placeholder="tól-"
                            onSubmitEditing={()=>searchFor(true)}
                        />
                        <DateTimePicker/>
                        <TextInput
                            onChangeText={setMaxDate}
                            style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white',width:100}}
                            placeholder="-ig"
                            onSubmitEditing={()=>searchFor(true)}
                        />
                    </Row>
                    <TextInput
                        onChangeText={setAuthor}
                        style={{fontSize:20,padding:10,margin:10,borderWidth:2,marginTop:-2,backgroundColor:'white'}}
                        placeholder="Szerző"
                        onSubmitEditing={()=>searchFor(true)}
                    />
                </View>
                <View style={{flex:1}}>
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
                            onValueChange={(e)=>{setSettings({...settings, mine: e})}}
                            value={settings?.mine}
                            style={{alignSelf:'flex-end'}}
                        />
                    </View>
                    {!!keys?.length &&
                    <Text style={{margin:10}}>Keresőszavak: {keys.map((e,i)=>i < keys.length-1 ? e+', ' : e)}</Text>}
                    <NewButton title="Mehet"/>
                </View>
            </Row>
            <ScrollView>
                {searchResult?.length ? searchResult : <Loading color='#FFC372' height={10}/>}
            </ScrollView>
            
        </View>
        {(width > 900) &&
            <View style={{flex:1,backgroundColor:'white'}}>
                <SaleItem/>
            </View>
        }
        {(width <= 900) &&
        <FAB color="#FFC372" size={80} icon="add" onPress={()=> navigation.navigate('uj-cserebere')}/>
        }
        <CloseModal modalVisible={closeModal} setModalVisible={setCloseModal} handleOK={deleteItem}/>
        <UserModal modalVisible={userModal} setModalVisible={setUserModal} uid={selected?.uid} name={selected?.name} handleOK={()=>navigation.navigate('uzenetek',{uid:selected?.uid})}/>
    </View>
    )
}


function Item({title,text,uid,name,date,imageNames,index,booked,bookedBy,setSelected,deleteItem,bookItem,openUserModal}) {
    const navigation = useNavigation();
    const width = useWindowSize().width;
    const myUid = useSelector((state) => state.user.uid)
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState(null);
    const elapsed = elapsedTime(date.toDate())

    const getImages = async () => {

        if (imageNames?.length) {
            setImages([])
            setImages(
                await Promise.all(imageNames.map( async (e,i)=>{
                    const fname = e?.filename || e;
                    try {
                        return {uri: await getUri('sale/'+index+'/'+fname),text: e.description}
                    } catch (error) {
                        return {uri: require('../../assets/profile.jpeg'), text: e.description}
                    }
                }))
            )
        }
    }
    useEffect(() => {
        console.log('imageNames',imageNames);
        getImages()
    }, [imageNames]);

    const book = (id,isBook) => {
        console.log('booking '+id);
        bookItem(id,isBook)
    }

    const onPress = () => {
        setOpen(!open)
    }

    const handleDelete = () => {
        console.log('del');
        setSelected(index)
        deleteItem(index)
    }
    const handleMessage = (uid) => {
        setSelected({uid:bookedBy})
        openUserModal(index,bookedBy)
    }
    return (
        <>
        <View style={[styles.list, { backgroundColor: '#fdfdfd'}]}>
        <TouchableOpacity onPress={onPress} style={{flexDirection:'row',width:'100%',alignSelf:'flex-start'}}>
                {images?.length ?
                    <Image source={images[0]} style={{width:100,height:100,margin:5}}/>
                    : <ProfileImage style={{}} size={100} uid={uid}/>}
                <View style={{margin: 5, flexGrow:1, alignItems:'stretch'}}>
                    <Text style={{ fontWeight: 'bold',fontSize:20 }}>{title}</Text>
                    <Row style={{alignItems:'center'}}>
                        <ProfileImage style={{margin:5}} size={20} uid={uid}/>
                        <Text style={{ fontWeight: 'bold' }}>{name}</Text>
                        <Text> {elapsed}</Text>
                    </Row>
                    <OpenableText style={{ margin:5, }} open={open} text={text}/>
                </View>
                { uid == myUid ?
                booked ?
                <TouchableOpacity style={{backgroundColor:'#669d51',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>handleMessage(uid)}>
                    <Icon name='happy-outline' color='white' size={25}/>
                    <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>Lefoglalva</Text>
                </TouchableOpacity>:
                <TouchableOpacity style={{backgroundColor:'#df5264',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>handleDelete()}>
                    <Icon name='trash' color='white' size={25}/>
                    <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>Törlés</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity style={{backgroundColor:booked?'#111111':'#ddd',width:100,justifyContent:'center',alignItems:'center'}} onPress={()=>book(index,booked)}>
                    <Icon name={booked?'lock-closed':'lock-open'} color='white' size={25}/>
                    <Text style={{color:'white',fontSize:11,fontWeight:'bold'}}>{booked?'Lefoglalva':'Foglalás'}</Text>
                </TouchableOpacity>
                
                }
        </TouchableOpacity>
            {open &&
                <View style={{width:'100%'}}>
                    {!!images && <ScrollView horizontal style={{height:200,width:'100%',marginTop:20}}>
                        {images.map((image,i)=>
                        <ImageModal
                        key={'image'+i} 
                        swipeToDismiss={false}
                        resizeMode="center"
                        modalImageResizeMode="contain"
                        imageBackgroundColor="none"
                        renderFooter={()=><View style={{padding:20,backgroundColor:'rgba(0,0,0,0.7)'}}>
                            <Text style={{color:'white'}}>{image.text}</Text>
                        </View>}
                        style={{
                            width: 200,
                            height: 200,
                            padding:10
                        }}
                        source={image.uri}
                        />
                        )}
                    </ScrollView>}
                    <View style={{padding:10}}>
                        { uid != myUid ?
                        <Row style={{width:'100%'}}>
                            <NewButton style={{width:'50%'}} title={"Írj "+name+"nak"} onPress={()=>navigation.navigate('uzenetek',{selected:uid})}/>
                            <NewButton style={{width:'50%'}} title="Jelentés"/>
                        </Row>:
                        <NewButton title="Töröld ki" onPress={handleDelete}/>
                        }
                    </View>
                </View>}
        </View>
        </>
    );
    
  }

  const OpenableText = ({text,open,style}) => {
    const short = '' || text.substring(0,50).replace(/(\r\n|\n|\r)/gm, "");
    if (text.length > 50) {
        return (
            <Text style={style}>{!!open ? text : short+'...'}</Text>
        )
    } else return <Text style={style}>{text}</Text>
  }
