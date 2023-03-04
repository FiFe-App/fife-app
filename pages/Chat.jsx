import { useState, useContext, useEffect, useRef } from "react";
import {View, Pressable, ScrollView, StyleSheet, TouchableOpacity} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { FirebaseContext } from '../firebase/firebase';
import { ref, child, get, set, onValue, onChildAdded, push, off } from "firebase/database";
import Icon from 'react-native-vector-icons/Ionicons'
import { Loading, ProfileImage, TextInput, MyText } from "../components/Components";
import { removeUnreadMessage } from '../lib/userReducer';
import { useNavigation } from "@react-navigation/native";

import chatStyles from '../styles/chatDesign'

const color = '#ffde9e'

const Chat = ({route, navigation, propUid, global}) => {
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [header, setHeader] = useState(null);
    const nav = navigation || useNavigation()
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const myName = useSelector((state) => state.user.name)
    const [uid2, setUid2] = useState(propUid || route?.params?.uid);
    const [scrollView, setScrollView] = useState(null);
    const input = useRef();
    const dispatch = useDispatch()


    useEffect(() => {
        if (propUid) {
            console.log('set uid2',propUid);
            setUid2(propUid)
        }
    }, [propUid]);

    const send = () => {
        console.log('global',!!global);
        if (database && message && !global) {
            const messageListRef = ref(database, `users/${uid}/messages/${uid2}`);
            const messageListRef2 = ref(database, `users/${uid2}/messages/${uid}`);
            const newMessageRef = push(messageListRef);
            const newMessageRef2 = push(messageListRef2);
            set(newMessageRef, {
                text: message,
                uid: uid,
                time: Date.now()
            })
            set(child(messageListRef,'read'),null).then(e=>{
                console.log('set!!!!');
            })
            set(child(messageListRef,'last'),{message:message,from:uid,fromName:myName,date:Date.now()})
            set(newMessageRef2, {
                text: message,
                uid: uid,
                time: Date.now()
            })
            set(child(messageListRef2,'read'),null).then(e=>{
                console.log('set!!!!');
            })
            set(child(messageListRef2,'last'),{message:message,from:uid,fromName:myName,date:Date.now()})
            setMessage('');
            if (input.current) {
                input.current.focus()
                console.log('focus');
            }
        }

        if (database && message && global) {
            const messageListRef = ref(database, `globalChat`);
            const newMessageRef = push(messageListRef);
            set(newMessageRef, {
                text: message,
                uid: uid,
                time: Date.now(),
                name: myName
            })
            setMessage('');
            if (input.current) {
                input.current.focus()
                console.log('focus');
            }
        }
    }

    useEffect(() => {
        if (scrollView) {
            scrollView.scrollToEnd({animated:false})
        }
    }, [messages,scrollView]);
    
    useEffect(() => {

        //const unsubscribe = nav.addListener('focus', () => {
            console.log(route?.params);
            console.log('chat with',uid2);
            if (database) {
                if (!global) {
                    const profileListRef = ref(database, `users/${uid2}/data`);
                    onValue(profileListRef, (snapshot) => {
                        setHeader(
                            <Pressable onPress={()=>nav.push('profil',{uid:uid2})} style={chatStyles.header}>
                                <ProfileImage style={styles.listIcon} size={70} uid={uid2}/>
                                <MyText style={{margin:5,marginLeft:20,fontSize:28,fontWeight:'400'}}>{snapshot.child('name').val()}</MyText>
                            </Pressable>
                        )
                    });
                }

                if (uid2) {
                    dispatch(removeUnreadMessage(uid2))

                }
                
                const messageListRef = 
                global ? ref(database, `globalChat`)
                : ref(database, `users/${uid}/messages/${uid2}`);
                off(messageListRef,'child_added')
                setMessages([])
                set(child(messageListRef,'read'),true)
                onChildAdded(messageListRef, (data) => {
                    if (data.key != 'read' && data.key != 'date' && data.key != 'last')
                        setMessages(old => [...old,data.val()])
                });
                console.log('loaded');
                setLoading(false)
            }
        //}) 
        //return unsubscribe
    }, [database,uid2,navigation]);
    
    if (!uid2) return (
        <View style={{flex:1,backgroundColor:'white',justifyContent:'center',alignItems:'center'}}>
            <MyText>Válassz ki valakit, akivel beszélnél.</MyText>
        </View>
    )

    return (
    <View style={{flex:1}}>
        <View style={{flex:1}}>
            {!global && header}
            <ScrollView 
            snapToEnd
            ref={(scroll) => {setScrollView(scroll)}}
            style={{flex:1,backgroundColor:'white'}} contentContainerStyle={styles.messages}>
                <View style={{flex:1}}>
                    {!loading ?
                    messages.map((e,i,arr)=> {
                        return (
                            <View key={i}>
                                {(!(new Date(arr[i-1]?.time).getDate()) || new Date(arr[i-1]?.time).getDate() != new Date(e?.time).getDate()) 
                                && <MyText style={{width:'100%',textAlign:'center'}}>{new Date(e?.time).toLocaleDateString('hu-HU')}</MyText>}
                                
                                {!!global && (!arr[i-1]?.uid || arr[i-1]?.uid != e?.uid) 
                                && <MyText style={{width:'100%',paddingHorizontal:10,textAlign:e?.uid != uid ? 'left' : 'right'}}>{e?.name || null}</MyText>}
                                
                                <Message text={e.text} isMine={e.uid == uid}/>
                            </View>
                        )})
                    :   <View style={{flex:1, backgroundColor:'white'}}>
                            <Loading color="rgba(255,175,0,0.7)"/>
                        </View>}
            </View>
        </ScrollView>
        </View>
        <View style={styles.input}>
            <TextInput
                style={styles.textInput} 
                onChangeText={setMessage}
                value={message}
                placeholder="Írj valami kedveset..."
                onSubmitEditing={send}
                ref={input}
                blurOnSubmit={false}
            />
            <TouchableOpacity onPress={send} style={styles.textButton} disabled={!message}>
                <Icon name="send" color={message ? "black" : "gray"} size={20}/>
            </TouchableOpacity>
        </View>
    </View>)

}

const Message = (props) => {
    const {text,time,isMine} = props
    return (
        <View style={styles.messageContainer}>
            <MyText style={[styles.messageText, isMine ? styles.mine : styles.other]}>{text}</MyText>
        </View>
    )
}

const styles = StyleSheet.create({
    messages: {
        backgroundColor: 'white',
        paddingVertical:20,
        paddingHorizontal:10,
    },
    messageContainer: {
        margin:1
    },
    messageText: {
        padding: 4,
        paddingHorizontal:10,
        color: 'white',
        maxWidth: '80%',
        fontSize:20,
    },
    mine: {
        backgroundColor: 'gray',
        alignSelf:'flex-end'
    },
    other: {
        backgroundColor: color,
        color: 'black',
        alignSelf:'flex-start'
    },
    input: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: 'white'
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
    }
})


export default Chat