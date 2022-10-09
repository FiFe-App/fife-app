import { useState, useContext, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, TextInput, Switch, Image} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { ref, child, get, set, onValue, onChildAdded, off } from "firebase/database";
import { FAB, LoadImage, Row } from './Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";
import { Chat } from "./Chat";
import { widthPercentageToDP,  heightPercentageToDP} from 'react-native-responsive-screen';
import { Item as SaleItem} from "./Item";
import { elapsedTime, search } from "../textService/textService";
import ImageModal from 'react-native-image-modal';


export const Sale = ({route,navigation}) => {
    const [list, setList] = useState([]);
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const width = Dimensions.get('window').width

    const [settings, setSettings] = useState({
        synonims: false
    });
    const [keys, setKeys] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [selected, setSelected] = useState(null);
    
    useEffect(() => {
        if (database) {
            const dbRef = ref(database,`sale`);
            const userRef = ref(database,`users`);

            onChildAdded(dbRef, (childSnapshot) => {
                const childData = childSnapshot.val();
                get(child(userRef,childData.owner+'/data/name')).then((snapshot) => {
                    const name = snapshot.val()
                    setList(old=>[...old,{data:childData,name:name}])
                  });
            });

        }
      }, [database]);

    useEffect(() => {
        searchFor(false)
    }, [list,searchText]);

    const searchFor = async (withSynonims) => {
        if (list.length) {
            setSearchResult(
                await Promise.all(list.map( async (e,i)=>{
                    return search(searchText,[e?.data.title,e?.data.description],withSynonims && settings?.synonims)
                    .then((ret)=>{
                        setKeys(ret?.keys)
                        if (ret?.found)
                        return (
                            <Item title={e?.data.title} text={e?.data.description} uid={e?.data.owner} name={e?.name} date={e?.data.date} key={i} setSelected={setSelected}/>
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
            {!!keys?.length &&
            <Text style={{margin:10}}>Keresőszavak: {keys.map((e,i)=>i < keys.length-1 ? e+', ' : e)}</Text>}
            <ScrollView>
                {searchResult}
            </ScrollView>
            
        </View>
        {(width > 900) &&
            <View style={{flex:1,backgroundColor:'white'}}>
                <SaleItem/>
            </View>
        }
        <FAB color="#fffbc9" size={80} icon="add" onPress={()=> console.log('add')}/>
    </View>
    )
}


function Item({title,text,uid,name,date,setSelected}) {
    const navigation = useNavigation();
    const width = Dimensions.get('window').width
    const [open, setOpen] = useState(false);
    const elapsed = elapsedTime(date)

    const images = [
        { uri: 'https://cdn.pixabay.com/photo/2017/05/19/07/34/teacup-2325722__340.jpg' },
        { uri: 'https://cdn.pixabay.com/photo/2017/05/02/22/43/mushroom-2279558__340.jpg' },
        { uri: 'https://cdn.pixabay.com/photo/2017/05/18/21/54/tower-bridge-2324875__340.jpg' },
        { uri: 'https://cdn.pixabay.com/photo/2017/05/16/21/24/gorilla-2318998__340.jpg' },
        { uri: 'https://cdn.skillflow.io/resources/img/skillflowninja.png' }
    ];
    const onPress = () => {
        setOpen(!open)
    }

    return (
        <View style={[styles.list, { backgroundColor: '#fdfdfd'}]}>
        <TouchableOpacity onPress={onPress} style={{flexDirection:'row',width:'100%',alignSelf:'flex-start'}}>
                <LoadImage style={styles.listIcon} size={100} uid={uid}/>
                <View style={{margin: 5,width:'80%'}}>
                <Text style={{ fontWeight: 'bold',fontSize:20,flex: 1, }}>{title}</Text>
                <Row style={{alignItems:'center'}}>
                    <LoadImage style={styles.listIcon} size={20} uid={uid}/>
                    <Text style={{ fontWeight: 'bold' }}>{name}</Text>
                    <Text> {elapsed}</Text>
                </Row>
                <Text style={{ margin:5,width:'80%' }}>{text}</Text>
                </View>
        </TouchableOpacity>
            {open && 
                <ScrollView horizontal style={{height:120,width:'80%',marginTop:20}}>
                    {images.map((image,i)=>
                    <ImageModal
                    key={'image'+i} 
                    swipeToDismiss={false}
                    resizeMode="center"
                    modalImageResizeMode="contain"
                    imageBackgroundColor="none"
                    renderFooter={()=><Text>abc</Text>}
                    style={{
                        width: 100,
                        height: 100,
                        padding:10
                    }}
                    source={image}
                    />
                    )}
                </ScrollView>}
        </View>
    );
    
  }

