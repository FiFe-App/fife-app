import Icon from '@expo/vector-icons/Ionicons';
import { child, limitToLast, off, onChildAdded, onValue, orderByValue, push, query, ref, set } from 'firebase/database';
import { useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { MyText, NewButton, ProfileImage, Row, TextInput, getNameOf } from '../components/Components';
import { FirebaseContext } from '../firebase/firebase';
import { removeUnreadMessage } from '../lib/userReducer';

import axios from 'axios';
import { TouchableRipple } from 'react-native-paper';
import GoBack from '../components/Goback';
import { config } from '../firebase/authConfig';
import chatStyles from '../styles/chatDesign';
import { SaleListItem } from './sale/SaleListItem';
import { router, useLocalSearchParams, usePathname } from 'expo-router';
import Loading from '../components/Loading';

const color = '#ffde9e'

const Chat = ({ propUid, global}) => {
    const small = useWindowDimensions().width <= 900;
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [header, setHeader] = useState(null);
    const nav = router
    const navigation = router
    const params = useLocalSearchParams();
    const route = usePathname();
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = useSelector((state) => state.user.uid)
    const myName = useSelector((state) => state.user.name)
    const [uid2, setUid2] = useState(propUid || params?.uid);
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
                time: Date.now(),
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
            const messageListRef = ref(database, 'globalChat');
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
            console.log(params);
            console.log('chat with',uid2);
            if (database) {
                if (!global) {
                    const profileListRef = ref(database, `users/${uid2}/data`);
                    onValue(profileListRef, (snapshot) => {
                        setHeader(
                            <TouchableRipple onPress={()=>nav.push({pathname:'profil',params:{uid:uid2}})} style={chatStyles.header}>
                                <>{route == '/beszelgetes' &&<GoBack breakPoint={10000} text={null} style={{backgroundColor:'#FFC372',left:0,top:0,marginRight:10}} color='black'/>}

                                <Row style={{justifyContent:'center',alignItems:'center',flexGrow:1}}>
                                    <ProfileImage style={styles.listIcon} size={70} uid={uid2}/>
                                    <MyText style={{margin:5,marginLeft:20,fontSize:24,fontWeight:'400'}}>{snapshot.child('name').val()}</MyText>
                                </Row></>
                            </TouchableRipple>
                        )
                    });
                }

                if (uid2) {
                    dispatch(removeUnreadMessage(uid2))

                }
                
                const messageListRef = 
                global ? ref(database, 'globalChat')
                : query(ref(database, `users/${uid}/messages/${uid2}`),limitToLast(40),orderByValue('time'));
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
        <View style={{flex:1,backgroundColor:'#fdf6d1'}}>
            <View style={{flex:1,backgroundColor:'#FDEEA2',margin:10,borderRadius:30,justifyContent:'center',alignItems:'center'}}>
                <Image source={require('../assets/img-prof.jpg')} style={{height:200,width:200,borderRadius:20,marginBottom:20}}/>
                <MyText size={20}>Válassz ki valakit, akivel beszélnél.</MyText>
            </View>
        </View>
    )

    return (
    <View style={{flex:1,backgroundColor:'#fdf6d1'}}>
        <View style={[{flex:1,backgroundColor:'#FDEEA2'},small?{}:{margin:10,borderRadius:30}]}>
            <View style={{flex:1,backgroundColor:'#fdf6d1'}}>
                {!global && header}
                <ScrollView
                snapToEnd
                ref={(scroll) => {setScrollView(scroll)}}
                style={{flex:1,backgroundColor:global?'transparent':'#fff'}} contentContainerStyle={styles.messages}>
                    <View style={{flex:1}}>
                        {!loading ?
                        messages.length ?
                        messages.map((e,i,arr)=> {
                            return (
                                <View key={i}>
                                    {(!(new Date(arr[i-1]?.time).getDate()) || new Date(arr[i-1]?.time).getDate() != new Date(e?.time).getDate())
                                    && <MyText style={{width:'100%',textAlign:'center'}}>{new Date(e?.time).toLocaleDateString('hu-HU')}</MyText>}
        
                                    {!!global && (!arr[i-1]?.uid || arr[i-1]?.uid != e?.uid)
                                    && <MyText style={{width:'100%',paddingHorizontal:10,textAlign:e?.uid != uid ? 'left' : 'right'}}>{e?.name || null}</MyText>}
        
                                    {e?.saleId ? <AutoMessage text={e.text} saleId={e.saleId} title={e.title} uid={e.uid} isMine={e.uid == uid}/> :
                                    <Message text={e.text} isMine={e.uid == uid}/>}
                                </View>
                            )}):
                            <View style={{flex:1, backgroundColor:'white',alignItems:'center',justifyContent:'center'}}>
                                <MyText>Írj üzenetet ... számára!</MyText>
                            </View>
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
                    <Icon name="send" color={message ? 'black' : 'gray'} size={20}/>
                </TouchableOpacity>
            </View>
        </View>
    </View>)

}
const AutoMessage = (props) => {
    const {text,title,time,uid,isMine,saleId} = props
    const [saleData, setSaleData] = useState(null);
    const [name, setName] = useState('');
    const [toLoad, setToLoad] = useState(false);
    useEffect(() => {
        if (toLoad)
            load();
    },[toLoad]);

    const load = async () => {
        setName(await getNameOf(uid))
        axios.get('sale/'+saleId,config()).then(res=>{
            console.log(res);
            setSaleData(res.data)
        }).catch(err=>{
            console.log(err);
        })
    }
    return (
        <View style={[styles.autoMessageContainer,{alignSelf:isMine?'flex-end':'flex-start'}]}>
        <MyText>{text}</MyText>
        {!toLoad && <>
            <NewButton onPress={()=>setToLoad(true)}
            title="Adatok betöltése" />
        </>}
        { toLoad && <>{saleData ? <>
            {saleData && <SaleListItem data={saleData} readOnly/>}
            </>
            : <ActivityIndicator size='large' color='rgba(255,175,0,0.7)' />}
            </>
        }</View>
    )
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
        backgroundColor: '#fff',
        paddingVertical:20,
        paddingHorizontal:10,
    },
    messageContainer: {
        margin:1,
    },
    autoMessageContainer: {
        alignSelf:'center',
        margin:1,
        padding: 4,
        paddingHorizontal:10,
        color: 'white',
        maxWidth: '80%',
        minWidth: '50%',
        fontSize:17,
        borderRadius:8,
        borderWidth:1,
        borderColor: '#dcdcc4'
    },
    messageText: {
        padding: 4,
        paddingHorizontal:10,
        color: 'white',
        maxWidth: '80%',
        fontSize:17,
        borderRadius:8
    },
    mine: {
        backgroundColor: '#FDEEA2',
        color: 'black',
        alignSelf:'flex-end',
    },
    other: {
        backgroundColor: color,
        color: 'black',
        alignSelf:'flex-start'
    },
    center: {
        color: 'black',
        alignSelf:'center'
    },
    input: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: 'white',
        borderBottomLeftRadius:8,
        borderBottomRightRadius:8
    },
    textInput: {
        flex:1,
        padding: 10,
        margin:5,
        fontSize:17,
        backgroundColor: '#ffffff',
        borderRadius:8
    },
    textButton: {
        width: 40,
        height: 40,
        margin: 5,
        fontSize:17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listIcon: {
        borderRadius:8
    }
})


export default Chat