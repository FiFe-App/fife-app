import { useState, useContext, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, TextInput, Switch, Image} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { FAB, getUri, Loading, NewButton, ProfileImage, Row } from './Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";
import { Chat } from "./Chat";
import { widthPercentageToDP,  heightPercentageToDP} from 'react-native-responsive-screen';
import { Item as SaleItem} from "./Item";
import { elapsedTime, search } from "../textService/textService";
import ImageModal from 'react-native-image-modal';

import { ref as dbRef, child, get, set, onValue, onChildAdded, off } from "firebase/database";
import { useWindowSize } from "../hooks/window";


export const Sale = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const width = useWindowSize().width;

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

            onChildAdded(saleRef, (childSnapshot) => {
                const childData = childSnapshot.val();
                get(child(userRef,childData.owner+'/data/name')).then((snapshot) => {
                    const name = snapshot.val()
                    setList(old=>[...old,{data:childData,name:name,index:childSnapshot.key}])
                  });
            });

        }
      }, [database]);

    useEffect(() => {
        searchFor(false)
    }, [list,searchText,settings]);

    const searchFor = async (withSynonims) => {
        if (list.length) {
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
                                    setSelected={setSelected}/>
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
        <FAB color="#FFC372" size={80} icon="add" onPress={()=> navigation.navigate('item')}/>
        }
    </View>
    )
}


function Item({title,text,uid,name,date,imageNames,index,setSelected}) {
    const navigation = useNavigation();
    const width = useWindowSize().width;
    const myUid = useSelector((state) => state.user.uid)
    const [open, setOpen] = useState(false);
    const [images, setImages] = useState(null);
    const elapsed = elapsedTime(date)

    const getImages = async () => {

        if (imageNames?.length) {
            setImages(await Promise.all(imageNames.map( async (e,i)=>{
                return getUri('sale/'+index+'/'+e)
                .then((ret)=>{
                    return ret
                })
            })))
        }
    }
    useEffect(() => {
        getImages()
    }, [imageNames]);

    const onPress = () => {
        setOpen(!open)
    }

    const handleDelete = () => {
        console.log('delete');
    }
    return (
        <View style={[styles.list, { backgroundColor: '#fdfdfd'}]}>
        <TouchableOpacity onPress={onPress} style={{flexDirection:'row',width:'100%',alignSelf:'flex-start'}}>
                {images?.length ?
                    <Image source={images[0]} style={{width:100,height:100,margin:5}}/>
                    : <ProfileImage style={styles.listIcon} size={100} uid={uid}/>}
                <View style={{margin: 5,width:'80%'}}>
                <Text style={{ fontWeight: 'bold',fontSize:20,flex: 1, }}>{title}</Text>
                <Row style={{alignItems:'center'}}>
                    <ProfileImage style={styles.listIcon} size={20} uid={uid}/>
                    <Text style={{ fontWeight: 'bold' }}>{name}</Text>
                    <Text> {elapsed}</Text>
                </Row>
                <Text style={{ margin:5,width:'80%' }}>{text}</Text>
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
                        renderFooter={()=><Text>abc</Text>}
                        style={{
                            width: 200,
                            height: 200,
                            padding:10
                        }}
                        source={image}
                        />
                        )}
                    </ScrollView>}
                    { uid != myUid ?
                    <Row style={{width:'100%'}}>
                        <NewButton title={"Írj "+name+"nak"} onPress={()=>navigation.navigate('messages',{selected:uid})}/>
                        <NewButton title="Jelentés" onPress={()=>handleDelete}/>
                    </Row>:
                    <NewButton title="Töröld ki" onPress={()=>handleDelete}/>}
                </View>}
        </View>
    );
    
  }

