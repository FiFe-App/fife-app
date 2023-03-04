import { useState, useContext, useEffect } from "react";
import {View, TouchableOpacity, ScrollView, TextInput, Switch, Image} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../../firebase/firebase';
import { FAB, getUri, Loading, NewButton, ProfileImage, Row, MyText } from '../../components/Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "../../styles/styles";
import { default as SaleItem} from "./Item";
import { elapsedTime, search } from "../../lib/textService/textService";
import ImageModal from 'react-native-image-modal';

import { ref as dbRef, child, get, set, onChildAdded, query, orderByChild } from "firebase/database";
import { useWindowDimensions } from "../../lib/hooks/window";
import { ref as sRef, listAll } from "firebase/storage";


export const Sale = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, storage, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const { width } = useWindowDimensions();

    const [settings, setSettings] = useState({
        synonims: false,
        mine: false
    });
    const [keys, setKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(null);
    
    useEffect(() => {
        if (database) {
            const saleRef = dbRef(database,`sale`);
            const userRef = dbRef(database,`users`);

            setList([])
            onChildAdded(query(saleRef,orderByChild('date','desc')), (childSnapshot) => {
                const childData = childSnapshot.val();
                get(child(userRef,childData.owner+'/data/name')).then((snapshot) => {
                    const name = snapshot.val()
                    setList(old=>[...old,{data:childData,name:name,index:childSnapshot.key}])
                  });
            });

        }
      }, [database]);

    const deleteItem = (index) => {
        console.log('delete');
        if (database && storage && index)
        set(dbRef(database,'sale/'+index),null).then(()=> {
            const ref = sRef(storage, 'sale/'+index);
            listAll(ref)
                .then(dir => {
                dir.items.forEach(fileRef => this.deleteFile(ref.fullPath, fileRef.name));
                dir.prefixes.forEach(folderRef => this.deleteFolder(folderRef.fullPath))
                })
                .catch(error => console.log(error));
        })
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
                                    key={i} 
                                    setSelected={setSelected}
                                    deleteItem={deleteItem}/>
                                    
                                )
                            })
                }))
            )
        }
    }

    return (
    <View style={{flex:1, flexDirection:'row'}}>
        <View style={{flex:1}}>
            <TextInput
            onChangeText={setSearchText}
            style={{fontSize:20,padding:10,borderWidth:2,marginTop:-2}}
            placeholder="Keress cserebere dolgokra"
            onSubmitEditing={()=>searchFor(true)}
            />
            <View style={{flexDirection:'row', alignItems:'center',margin:10,width:'50%'}}>
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
            <View style={{flexDirection:'row', alignItems:'center',margin:10,width:'50%'}}>
                <MyText style={{flex:1,}}>Sajátjaim</MyText>
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
            <MyText style={{margin:10}}>Keresőszavak: {keys.map((e,i)=>i < keys.length-1 ? e+', ' : e)}</MyText>}
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
    </View>
    )
}


function Item({title,text,uid,name,date,imageNames,index,setSelected,deleteItem}) {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const myUid = useSelector((state) => state.user.uid)
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState(null);
    const elapsed = elapsedTime(date)

    const getImages = async () => {

        if (imageNames?.length) {
            setImages([])
            setImages(await Promise.all(imageNames.map( async (e,i)=>{
                const fname = e?.filename || e;
                return {uri: await getUri('sale/'+index+'/'+fname),text: e.description}
            })))
        }
    }
    useEffect(() => {
        console.log('imageNames',imageNames);
        getImages()
    }, [imageNames]);

    const onPress = () => {
        setOpen(!open)
    }

    const handleDelete = () => {
        console.log('del');
        deleteItem(index)
    }
    return (
        <View style={[styles.list, { backgroundColor: '#fdfdfd'}]}>
        <TouchableOpacity onPress={onPress} style={{flexDirection:'row',width:'100%',alignSelf:'flex-start'}}>
                {images?.length ?
                    <Image source={images[0]} style={{width:100,height:100,margin:5}}/>
                    : <ProfileImage style={{}} size={100} uid={uid}/>}
                <View style={{margin: 5,width:'80%'}}>
                <MyText style={{ fontWeight: 'bold',fontSize:20 }}>{title}</MyText>
                <Row style={{alignItems:'center'}}>
                    <ProfileImage style={{margin:5}} size={20} uid={uid}/>
                    <MyText style={{ fontWeight: 'bold' }}>{name}</MyText>
                    <MyText> {elapsed}</MyText>
                </Row>
                <OpenableText style={{ margin:5,width:'80%' }} open={open} text={text}/>
                </View>
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
                            <MyText style={{color:'white'}}>{image.text}</MyText>
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
                    { uid != myUid ?
                    <Row style={{width:'100%'}}>
                        <NewButton title={"Írj "+name+"nak"} onPress={()=>navigation.navigate('beszelgetesek',{selected:uid})}/>
                        <NewButton title="Jelentés"/>
                    </Row>:
                    <NewButton title="Töröld ki" onPress={handleDelete}/>
                    }
                </View>}
        </View>
    );
    
  }

  const OpenableText = ({text,open}) => {
    const short = '' || text.substring(0,50)
    if (text.length > 50) {
        return (
            <MyText>{!!open ? text : short+'...'}</MyText>
        )
    } else return <MyText>{text}</MyText>
  }
