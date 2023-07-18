import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getDatabase, off, onChildAdded, onValue, orderByChild, query, ref } from "firebase/database";
import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, TouchableOpacity, View,useWindowDimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from '../components/Components';
import { FirebaseContext } from '../firebase/firebase';
import { elapsedTime } from "../lib/textService/textService";
import { styles } from "../styles/styles";
import Chat from "./Chat";
import Icon from 'react-native-vector-icons/Ionicons';

const Messages = ({route,navigation}) => {
    const { width } = useWindowDimensions();
    
    const [list, setList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [search, setSearch] = useState('');
    const { app, auth} = useContext(FirebaseContext);
    const database = getDatabase()
    const uid = useSelector((state) => state.user.uid)
    const [selected, setSelected] = useState(route?.params?.uid);
    const msgQuery = query(ref(database,`users/${uid}/messages`),orderByChild('last/date'))
    const unreadMessages = useSelector((state) => state.user.unreadMessage)

    const getRandom = () => {
        const dbRef = ref(database,`users`);

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
                        navigation.push('uzenetek',{uid:childSnapshot.key});
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
        console.log(filteredList);
    }, [filteredList]);


    useFocusEffect(
        useCallback(() => {
            if (database) {    

                if (route?.params?.random) getRandom()
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
            navigation.push("beszelgetes", {uid:selected});
        }
        else
        navigation.setParams({
            uid: selected,
        });
      }, [selected]);
    return (
    <View style={{flex:1, flexDirection:'row',backgroundColor:'#FDEEA2'}}>
        <View style={{flex:1}}>
            <Row style={{padding:10}}>
                <TextInput 
                placeholder="Keresés a beszélgetések közt"
                style={{flexGrow:1,height:50,padding:10,margin:5,backgroundColor:'#fdf7d8'}} 
                onChangeText={setSearch} value={search} />
                <NewButton title={<Icon name="search" size={30} style={{padding:10}} />} />
            </Row>
            <ScrollView style={{flex:1}} contentContainerStyle={{paddingTop:5}}>
                {!!filteredList.length && filteredList.map((e,i)=>{
                    console.log(i)
                    return (
                        <>
                            <Item title={e?.name} selected={selected == e?.uid} last={e.last} newMessageProp={!e.read} text={e?.last} uid={e?.uid} key={e?.uid} setSelected={setSelected}/>
                        </>
                    )
                })}
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
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const [newMessage, setNewMessage] = useState(newMessageProp);
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
            navigation.push("beszelgetes", {uid:uid});
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row", backgroundColor: selected ? '#fdf8d9' : '#fff'},
            {shadowOffset: {width: 2, height: 4},shadowOpacity: 0.2,shadowRadius: 1,}]}>
            <ProfileImage style={styles.listIcon} uid={uid}/>
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