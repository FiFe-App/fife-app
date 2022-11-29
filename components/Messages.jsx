import { useState, useContext, useEffect } from "react";
import {View, Text, TouchableOpacity, ScrollView, Platform, Dimensions} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { ref, child, get, set, onValue, onChildAdded, off, onChildChanged, query, orderByChild } from "firebase/database";
import { ProfileImage } from './Components'
import { useNavigation } from '@react-navigation/native';
import { styles } from "./styles";
import { Chat } from "./Chat";
import { elapsedTime } from "../textService/textService";
import { useWindowSize } from "../hooks/window";

export const Messages = ({route,navigation}) => {
    const width = useWindowSize().width;
    
    const [list, setList] = useState([]);
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const [selected, setSelected] = useState(route?.params?.selected);
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
                        navigation.navigate('uzenetek',{selected:childSnapshot.key});
                    }
                })
            }
        })
    }

    useEffect(() => {
        console.log('list:',list);
        setList(list.sort((a,b)=>(a.date > b.date ? -1 : 1)))
    }, [list]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (database) {
                if (route?.params?.random) getRandom()
                const dbRef = ref(database,`users/${uid}/messages`);
                const userRef = ref(database,`users`);

                let arr = []

                setList([])
                onChildAdded(query(dbRef,orderByChild('date','desc')), (childSnapshot) => {
                    const childData = childSnapshot.val();
                    const last = childSnapshot.child('last').val() || null
                    const read = !unreadMessages?.includes(childKey)
                    const childKey = childSnapshot.key;
                    if (last)
                    get(child(userRef,childKey+'/data/name')).then((snapshot) => {
                        console.log(snapshot.val());
                        setList(old=>[...old,{uid:childKey,name:snapshot.val(),read:read,last:last}])
                    });
                });

            }
        });

        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);
    

      useEffect(() => {
        if (selected && Dimensions.get('window').width <= 900) {
            navigation.navigate("beszelgetes", {uid:selected});
        }else
            navigation.setParams({
                selected: selected,
            });
      }, [selected]);
    return (
    <View style={{flex:1, flexDirection:'row'}}>
        <ScrollView style={{flex:1}}>
            {!!list.length && list.map((e,i)=>{
                return (
                    <Item title={e?.name} selected={selected == e?.uid} last={e.last} newMessageProp={!e.read} text={e?.last} uid={e?.uid} key={i} setSelected={setSelected}/>
                )
            })}
        </ScrollView>
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
    const width = useWindowSize().width;
    const [newMessage, setNewMessage] = useState(newMessageProp);
    const elapsed = elapsedTime(last?.date)
    
    const onPress = () => {
        setNewMessage(false)
        if (width > 900)
            setSelected(uid)
        else 
            navigation.push("beszelgetes", {uid:uid});
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.list, {flexDirection: "row", backgroundColor: selected ? '#fdfdfd' : '#f6f6f6'}]}>
            <ProfileImage style={styles.listIcon} uid={uid}/>
            <View style={{marginLeft: 5,flexGrow:1}}>
              <Text style={{ fontWeight: 'bold',flex: 1, }}>{title}</Text>
              <Text style={{ flex:2, }}>{last?.message}<Text style={{color:'grey'}}> - {elapsed}</Text></Text>
            </View>
            {!!newMessage &&
             <View style={{marginHorizontal:30,width:10,height:10,borderRadius:10,backgroundColor:'orange',justifyContent:'flex-end'}}/>}
        </TouchableOpacity>
    );
    
  }