import Icon from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getDatabase, off, onChildAdded, onValue, orderByChild, query, ref } from 'firebase/database';
import { useCallback, useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from '../components/Components';
import { config } from '../firebase/authConfig';
import { FirebaseContext } from '../firebase/firebase';
import { elapsedTime } from '../lib/textService/textService';
import { styles } from '../styles/styles';
import Chat from './Chat';

const Messages = () => {
    const { width } = useWindowDimensions();
    const params = useLocalSearchParams();
    const navigation = router;
    
    const [list, setList] = useState([]);
    const [extraList, setExtraList] = useState([]);
    const finalExtraList = (extraList.filter(x => !list.find(e=>e.uid==x.uid)));
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState('');
    const database = getDatabase()
    const uid = useSelector((state) => state.user.uid)
    const [selected, setSelected] = useState(params?.uid);
    const msgQuery = query(ref(database,`users/${uid}/messages`),orderByChild('last/date'))
    const unreadMessages = useSelector((state) => state.user.unreadMessage)

    const getRandom = () => {
        const dbRef = ref(database,'users');

        onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const random = Math.floor(Math.random() * (snapshot.size - 2) + 1);
                console.log(random);

                let index = 0
                snapshot.forEach((childSnapshot) => {
                    index++;
                    if (index == random) {

                        if (childSnapshot.key == uid) {
                            console.log(childSnapshot.key,' SAME ',uid);
                            getRandom()
                            return;
                        } else 
                        navigation.push({pathname:'uzenetek',params:{uid:childSnapshot.key}});
                    }
                })
            }
        })
    }

    useEffect(() => {
        if (list.length)
        setFilteredList(list
            .filter(el=>{
                console.log(el);
                return search=='' || el.name?.toLowerCase().includes(search.toLowerCase())
            })
            .sort((a, b) => {
            const nameA = a.last.date // ignore upper and lowercase
            const nameB = b.last.date; // ignore upper and lowercase
            if (nameA < nameB) {
              return 1;
            }
            if (nameA > nameB) {
              return -1;
            }
          
            // names must be equal
            return 0;
          }));
    }, [list,search]);

    useEffect(() => {
        console.log(search);
        if (search?.length >= 3)
        axios.post('users/search',{search},config()).then(res=>{
            setExtraList(res.data);
            console.log('extra',res.data);
            console.log('normal',list);
        })
        else setExtraList([])
    }, [search]);

    useEffect(() => {
        console.log(filteredList);
    }, [filteredList]);


    useFocusEffect(
        useCallback(() => {
            if (database) {    

                if (params?.random) getRandom()
                setList([])
                onChildAdded(msgQuery,async (childSnapshot) => {
                    const last = childSnapshot.child('last').val() || null
                    const childKey = childSnapshot.key;
                    const read = !unreadMessages?.includes(childKey)
                    const name = await getNameOf(childKey);
                    if (last)
                        setList(old=>[{
                            uid:childKey,
                            name,
                            read:read,
                            last
                        },...old])
                });
            }
    
          return () => {
            console.log('off');
            off(msgQuery,'child_added')
          };
        }, [])
      );

      useEffect(() => {
        if (selected)
        if (width <= 900) {
            navigation.push({pathname:'beszelgetes', params:{uid:selected}});
        }
        else
        navigation.setParams({
            uid: selected,
        });
      }, [selected]);
    return (
    <View style={{flex:1, flexDirection:'row',backgroundColor:'#fdf6d1',zIndex:-1}}>
        <View style={{flex:1}}>
            <Row style={{}}>
                <TextInput 
                placeholder="Keresés a fifék közt"
                style={{flexGrow:1,height:50,padding:15,margin:5,backgroundColor:'#ffffff',borderRadius:8}} 
                onChangeText={setSearch} value={search} />
                <NewButton title={<Icon name="close" size={20}  style={{left:0,color:'#555555'}} />} 
                style={{position:'absolute',right:0}} icon color="#fdf7d800"
                onPress={()=>{setSearch('')}}/>
            </Row>
            <ScrollView style={{flex:1}} contentContainerStyle={{}}>

            {!!filteredList.length && <MyText style={{padding:8}}>korábbi beszélgetések</MyText>}
                {!!filteredList.length && filteredList.map((e,i)=>{
                    console.log(i)
                    return (
                        <>
                            <Item title={e?.name} selected={selected == e?.uid} last={e.last} newMessageProp={e.read} text={e?.last} uid={e?.uid} key={e?.uid} setSelected={setSelected}/>
                        </>
                    )
                })}

                {!!finalExtraList?.length && <><MyText style={{padding:8}}>egyéb találatok</MyText>
                    {finalExtraList.map(e=>{
                        return <Item title={e?.name} selected={selected == e?.uid} last={e.last} newMessageProp={e.read} text={e?.last} uid={e?.uid} key={e?.uid} setSelected={setSelected}/>
                    }
                    )}</>
                }
                {!filteredList.length && !finalExtraList?.length && 
                <MyText style={{padding:8}}>Nincs találat</MyText>}
                
            </ScrollView>
        </View>
        {(width > 900) &&
            <View style={{flex:2}}>
                <Chat propUid={selected}/>
            </View>
        }
    </View>
    )
}

function Item({title,text,last,uid,selected,setSelected,newMessageProp}) {
    const navigation = router;
    const { width } = useWindowDimensions();
    const [newMessage, setNewMessage] = useState( typeof newMessageProp == 'boolean' && !newMessageProp);
    const elapsed = elapsedTime(last?.date)
    
    const onPress = () => {
        setNewMessage(false)
        if (width > 900) {
            setSelected(uid)
            navigation.setParams({
                selected: uid,
              });
        }
        else 
            navigation.push({pathname:'beszelgetes', params:{uid:uid}});
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: 'row', backgroundColor: selected ? '#ffde7e' : '#fff'},
            {shadowOffset: {width: 2, height: 4},shadowOpacity: 0.2,shadowRadius: 1,}]}>
            <ProfileImage style={styles.listIcon} size={50} uid={uid}/>
            <View style={{marginLeft: 5,flexGrow:1}}>
              <MyText style={{ fontWeight: 'bold',flex: 1, }}>{title}</MyText>
              <MyText style={{ flex:2, }}>{last?.message}<MyText style={{color:'grey'}}> - {elapsed}</MyText></MyText>
            </View>
            {!!newMessage &&
             <View style={{marginHorizontal:30,width:10,height:10,borderRadius:10,backgroundColor:'orange',justifyContent:'flex-end'}}/>}
        </TouchableOpacity>
    );
    
  }


export default Messages