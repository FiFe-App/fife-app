import { useState, useContext, useEffect } from "react";
import {View, Text, TextInput, Pressable, ScrollView, StyleSheet, TouchableOpacity} from 'react-native'
import { useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { ref, child, get, set, onValue, onChildAdded, push } from "firebase/database";
import Icon from 'react-native-vector-icons/Ionicons'
import { Loading, LoadImage } from "./Components";

export const Chat = ({props,route, navigation}) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [header, setHeader] = useState(null);
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const uid2 = props?.uid || route?.params?.uid

    const send = () => {
        console.log(message);
        if (database) {
            const messageListRef = ref(database, `users/${uid}/messages/${uid2}`);
            const messageListRef2 = ref(database, `users/${uid2}/messages/${uid}`);
            const newMessageRef = push(messageListRef);
            const newMessageRef2 = push(messageListRef2);
            set(newMessageRef, {
                text: message,
                uid: uid,
                time: Date.now()
            })
            set(newMessageRef2, {
                text: message,
                uid: uid,
                time: Date.now()
            })
            setMessage('');
        }
    }
    
    useEffect(() => {
        console.log(route.params);
        console.log('chat with',uid2);
        if (database && uid2) {
            if (navigation) {
                const profileListRef = ref(database, `users/${uid2}/data`);
                onValue(profileListRef, (snapshot) => {
                    setHeader(
                        <TouchableOpacity onPress={()=>navigation.navigate('profile',{uid:uid2})} style={{flexDirection:'row',alignItems:'center',margin:5,padding:10}}>
                            <LoadImage style={styles.listIcon} uid={uid2}/>
                            <Text style={{margin:5,fontSize:16,fontWeight:'400'}}>{snapshot.child('name').val()}</Text>
                        </TouchableOpacity>
                    )
                });
            }


            
            const messageListRef = ref(database, `users/${uid}/messages/${uid2}`);
            onChildAdded(messageListRef, (data) => {
                console.log(data.val());
                setMessages(old => [...old,data.val()])
            });
        }
    }, [database]);
    
    return (
    <View style={{flex:1}}>
        {uid2 && !!messages.length ? 
        <View style={{flex:1}}>
            {header && header}
            <ScrollView style={{flex:1,backgroundColor:'white'}} contentContainerStyle={styles.messages}>
                {messages.map((e,i)=> {
                    return (
                        <Message text={e.text} isMine={e.uid == uid} key={i}/>
                    )
                })}
            </ScrollView>
        </View> : 
        <View style={{flex:1, backgroundColor:'white'}}>
            <Loading color="blue"/>
        </View>}
        <View style={styles.input}>
            <TextInput 
                style={styles.textInput} 
                onChangeText={setMessage}
                value={message}
                placeholder="Írj valami kedveset..."
            />
            <Pressable onPress={send} style={styles.textButton}>
                <Icon name="send" color="white" size={20}/>
            </Pressable>
        </View>
    </View>)

}

const Message = (props) => {
    const {text,time,isMine} = props
    return (
        <View style={styles.messageContainer}>
            <Text style={[styles.messageText, isMine ? styles.mine : styles.other]}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    messages: {
        flex:1,
        backgroundColor: 'white',
        paddingVertical:20,
        paddingHorizontal:10,
    },
    messageContainer: {
        flexWrap: 'wrap',
        margin:1
    },
    messageText: {
        padding: 4,
        paddingHorizontal:10,
        borderRadius: 20,
        color: 'white',
        maxWidth: '80%',
        fontSize:20
    },
    mine: {
        backgroundColor: 'gray',
        alignSelf:'flex-end'
    },
    other: {
        backgroundColor: 'red',
        alignSelf:'flex-start'
    },
    input: {
        flexDirection: 'row',
        height: 50,
    },
    textInput: {
        flex:1,
        padding: 10,
        margin:5,
        fontSize:20,
        backgroundColor: 'white'
    },
    textButton: {
        width: 40,
        height: 40,
        margin: 5,
        fontSize:20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue',
    }
})