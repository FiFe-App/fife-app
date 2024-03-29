import Icon from '@expo/vector-icons/Ionicons';
import { child, get, onChildAdded, ref } from "firebase/database";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Auto, Col, MyText, NewButton, Row } from "../../components/Components";
import { FirebaseContext } from "../../firebase/firebase";
import { emptyUnreadMessages, removeHelp, setUnreadMessage } from "../../lib/userReducer";
import { styles } from "../../styles/styles";
import Chat from "../Chat";

export const HomeSide = ({tabProp})  => {
    const { width } = useWindowDimensions();
    const [tab, setTab] = useState('navigation');

    useEffect(() => {
      if (tabProp && width <= 900) setTab(tabProp)
    }, [tabProp]);

    useEffect(() => {
      if (width > 900 && tab == 'navigation')
        setTab('messenger')
      else if (width <= 900 && tab != 'none') setTab('navigation')
    }, [width]);

    return (
        <View style={{flex:tab == 'none' ? 0 : 1}}>
            <Row style={{width:'100%'}}>
                {width <= 900 && <NewButton style={{flex:1,margin:0}} color={tab=='navigation'?'white':'#fdeea2'} title="Gombok" onPress={()=>setTab('navigation')}/>}
                <NewButton style={{flex:1,margin:0}} color={tab=='messenger'?'white':'#fdeea2'} title="Üzenőfal" onPress={()=>setTab('messenger')}/>
                <NewButton style={{flex:1,margin:0}} color={tab=='notifications'?'white':'#fdeea2'} title="Értesítések" onPress={()=>setTab('notifications')}/>
            </Row>
            <View style={{flex:1}}>
               {tab=='navigation' && <Navigation />}
               {tab=='messenger' && <Messenger />}
               {tab=='notifications' && <Notifications style={{padding:10,backgroundColor:'white',flex:1}}/>}
            </View>
        </View>
    )
}


const Notifications = ({style}) => {

    const [notifications, setNotifications] = useState([
    ]);
    const {database, app, auth} = useContext(FirebaseContext);
    const navigator = router
    const uid = useSelector((state) => state.user.uid)
    const dispatch = useDispatch()

    const removePopup = (index) => {
      setPopups(popups.filter((p,i)=>i!=index))
      console.log('remove');
    }

    useEffect(() => {
      if (database) {
          const dbRef = ref(database,`users/${uid}/messages`);
          const userRef = ref(database,`users`);

          console.log('onChilAdded attatched');

          const getMessages = () => {
            //console.log('listening');
            dispatch(emptyUnreadMessages())
            onChildAdded(dbRef, (childSnapshot) => {
              console.log('new message:',childSnapshot.val());
              const childKey = childSnapshot.key;
              console.log(childKey
                );
              const read = childSnapshot.child('read').exists()
              const last = childSnapshot.child('last').val() 
              if (!read && last?.from != uid) {
                get(child(userRef,childKey+'/data/name')).then((snapshot) => {
                    const name = snapshot.val()
                    setNotifications(old=>[...old,{link:'beszelgetes',params:{uid:childKey},title:'Új üzenet '+name+'tól',text:last?.message}])
                  });
                  dispatch(setUnreadMessage(childKey))
              }
          });

          setTimeout(() => {
            //getMessages()
          }, 1000)

          } 

          getMessages()



      }
    }, [database]);
    return (
      <View style={style}>
        <ScrollView>
          {notifications.length ? notifications.map(
            (n,i)=>
              <Pressable 
                key={'msg'+i} 
                onPress={()=>navigator.push(n.link,n.params)}
                style={{backgroundColor:'white',flexDirection:'row',padding:5}}>
                  <Auto style={{flexGrow:1}}>
                    <MyText style={{fontWeight:'bold'}}>{n.title}{n?.text && <MyText>{': '}</MyText>}</MyText>
                    {n?.text && <MyText>{n.text}</MyText>}
                  </Auto>
                  <Icon name="arrow-forward-outline" size={15}/>
              </Pressable>)
            : <MyText style={{textAlign:'center',marginTop:30}}>Nincs most új értesítésed</MyText>}

        </ScrollView>
      </View>
    )
}

const Messenger = () => {
    const uid = useSelector((state) => state.user.uid)
    const help = useSelector((state) => state.user.help.messenger);
    const dispatch = useDispatch()
  
    if (help) return(
      <View style={{flex:1,justifyContent:'center',backgroundColor:'#ffdb5b00'}}>
        <View style={{textAlign:'center',flexGrow:1,justifyContent:'center'}}>
          <MyText style={{fontSize:30}}>Ez itt egy üzenőfal, ahova bárki regisztrált tag írhat.</MyText>
        </View>
        <NewButton title="Oksi, értettem!" onPress={()=>dispatch(removeHelp('messenger'))}/>
      </View>
    )
    return (
        <Chat propUid={uid} global/>
    )
}

const Navigation = () => {
  const { width } = useWindowDimensions();
  const navigation = router

  return (
    <Col>
      <Pressable style={[styles.bigButton,{flex:width<=900?0:1}]}  onPress={()=>navigation.push('cserebere')}>
        <MyText style={styles.bigButtonText}>Cserebere</MyText>
        <Icon name="shirt" color="#71bbff" size={60}/>
      </Pressable>
      <Pressable style={[styles.bigButton,{flex:width<=900?0:1}]}  onPress={()=>navigation.push('terkep')}>
        <MyText style={styles.bigButtonText}>Térkép</MyText>
        <Icon name="map" color="#8de264" size={60}/>
      </Pressable>
      <Pressable style={[styles.bigButton,{flex:width<=900?0:1}]} onPress={()=>navigation.push('esemenyek')}>
        <MyText style={styles.bigButtonText}>Programok</MyText>
        <Icon name="calendar" color="#ff3e6f" size={60}/>
      </Pressable>
    </Col>
  )
}