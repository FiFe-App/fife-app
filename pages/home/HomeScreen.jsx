import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Image from 'expo-fast-image';
import { child, get, getDatabase, onChildAdded, ref, set } from 'firebase/database';
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, View, useWindowDimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { Auto, B, Col, MyText, NewButton, Row, getNameOf } from '../../components/Components';
import HelpModal from '../../components/help/Modal';
import Module from '../../components/homeComponents/ModuleNew';
import { FirebaseContext } from '../../firebase/firebase';
import { TextFor, elapsedTime, getGreeting } from '../../lib/textService/textService';
import { removeUnreadMessage, setTempData, setUnreadMessage } from '../../lib/userReducer';
import HomeBackground from './HomeBackground';
import styles from '../../styles/homeDesign';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { config } from '../../firebase/authConfig';
import { categories } from '../../lib/categories';
import { listToMatrix } from '../../lib/functions';
import Error from '../../components/tools/Error';
import MessageModal from '../../components/help/MessageModal';
import Posting from '../../components/homeComponents/Posting';


  const HomeScreen = () => {
    const name = useSelector((state) => state.user.name)
    const uid = useSelector((state) => state.user.uid)
    const dispatch = useDispatch()
    const opacity = useRef(new Animated.Value(1)).current 
    const opacity2 = useRef(new Animated.Value(0)).current 
    const height = useRef(new Animated.Value(0)).current 
    const [searchText, setSearchText] = useState('');
    const [textWidth, setTextWidth] = useState(0); 
    const { width } = useWindowDimensions();
    const small = width < 900;
    const [greeting, setGreeting] = useState(getGreeting);
    const [docsList, setDocsList] = useState([]);
    const [mailModal, setMailModal] = useState(null);
    const [filterModal, setFilterModal] = useState(null);
    const [filter, setFilter] = useState([]);
    const [list, setList] = useState([null,null,null,null]);
    const [number, setNumber] = useState(0);

    useFocusEffect(
      useCallback(() => {
        dispatch(setTempData(null))
        const filterRef = ref(getDatabase(),'/users/'+uid+'/settings/homeFilter')
        get(filterRef).then(snapshot=>{
          if (snapshot.exists())
          setFilter(snapshot.val())
          else 
          setFilter({
            sale: true,
            work: true,
            rent: false,
            places: true
          })
        }).catch(err=>{
          setFilter({
            sale: true,
            work: true,
            rent: false,
            places: true
          })
          
        }).finally(()=>{
          setFilterModal(false)
          loadData();
        })

      }, [])
    );

    useEffect(() => {
      if (filterModal == false) {
        loadData()
      }
    }, [filterModal]);

    useEffect(() => {
      console.log(list);
    }, [list]);

    const loadData = () => {
      console.log('load latest', filter);
      if (!Object.entries(filter).length) return 
      setList([null,null,null,null]);
      axios.get('/all/latest',{...config(),params:filter}).then(res=>{
        setList(Object.values(res.data.latest))
        setNumber(res.data.notifications)
      }).catch(err=>{
        setList({error:err})
      })
    }

    useEffect(() => {
      if (mailModal == true)
      axios.get('all/notifications',config()).then(async (res)=>{
        const data = await Promise.all(res.data.map(async ({uid,author,id,created_at})=>{
          const name = await getNameOf(uid||author)
          return {
            text: author?
            'Szuper! '+name+' érdeklődik csereberéd iránt!'
            :'Jó hír! '+name+' bejelölt a pajtásának!',
            uid:author||uid,
            created_at:elapsedTime(created_at)
          }
        }))
        setMailModal(data)
      })
    }, [mailModal]);

    const save = () => {
      const saveRef = ref(getDatabase(),'users/'+uid+'/settings/homeFilter')
      set(saveRef,filter).then(()=>{
        setFilterModal(false)
      })
    }
    return (
      <ScrollView style={{flex:1,backgroundColor:'#ffffd6',zIndex:0,elevation: 0,}} >
        <HomeBackground >
          <Row style={{flex:3,zIndex:0,elevation: 0,justifyContent:'center'}}>
            <Col style={{flex:width<=900?1:2,alignItems:'center',shadowOpacity:2,}}>
              <Animated.View style={{opacity:opacity,flex:opacity}}>
                {false&&<Stickers style={{flex:1}}/>}
                {<Row style={{alignItems:'center',textAlign:'center',paddingHorizontal:20,paddingVertical:20,opacity:textWidth}}>
                  <MyText 
                  onLayout={e=>setTextWidth(e.nativeEvent.layout.width)}
                  style={{fontSize:small?20:40,marginRight:30,backgroundColor:'white',borderWidth:2,borderRadius:100,padding:8}} bold>
                    <TextFor text={greeting} embed={name}/>
                  </MyText>
                  <View style={[styles.bubble,{marginLeft:textWidth-5}]} />
                  <Smiley style={{marginTop:32}}/>
                </Row>}
              </Animated.View> 
            </Col>
            <Auto style={{padding:10,alignItems:'center',justifyContent:'center',zIndex:-1,width:'auto',flex:'none'}} >
              <View>

                <NewButton icon title={<Icon name={number?"notifications":"notifications-outline"} size={30} />} onPress={()=>setMailModal(true)}
                  info="Értesítések"
                />
                {!!number && <MyText style={{
                  position:'absolute',top:0,right:0,
                  borderRadius:10,color:'white',backgroundColor:'black',width:20,height:20,alignItems:'center',textAlign:'center'}}>
                {number}
                </MyText>}
              </View>
              <NewButton icon title={<Icon name="options-outline" size={30} />} onPress={()=>setFilterModal(true)}
                info="Beállítások"
              />
            </Auto>
          </Row>
          <Posting />
        </HomeBackground>
          <View style={{zIndex:-1}}>
            {
              list?.error ?
              <Error text={list?.error?.response?.data}/>
              :
              <>{width > 900 ? <>
              <View>
                {listToMatrix(list,2).map(row=>{
                  return <Row>
                    {row.map(e=><Module  data={e} />)}
                  </Row>
                })}
              </View>
            </> : <View>
                  {list.map(e=><Module data={e} />)}
            </View>}</>}
          </View>
          <HelpModal 
            title="Mi érdekel?"
            text={`Válaszd ki hogy mi jelenjen meg a főoldalon!
Alatta megadhatsz kulcs-szavakat, melyek alapján kapsz majd posztokat`}
            actions={[
              {title:'mégse',onPress:()=>setFilterModal(false)},
              {title:'mentés',onPress:save,color:'#ff462b'}]}
            open={filterModal}
            setOpen={setFilterModal}
            inputs={categories.options.reduce((r, e) => r.push(
              {type:'checkbox',attribute:e.key,label:e.name,data:filter,setData:setFilter,style:{backgroundColor:e.color}},  
              {type:'null',attribute:e.key+'key',placeholder:'kulcs',data:filter,setData:setFilter,render:e.key,style:{marginBottom:16}},
            ) && r, [])}
          />
          <HelpModal 
            title="Értesítések"
            actions={[
              {title:'bezár',onPress:()=>setMailModal(false)}
            ]}
            open={mailModal}
            setOpen={setMailModal}
            inputs={
              mailModal?.length ?
              mailModal?.map((e,i)=>{
                return {type:'item',attribute:e.uid,label:e.text,text:e.created_at,setData:()=>{setMailModal(false)}}
              }) : []
            }
          />
          <MessageModal
          />
      </ScrollView>
    );
  }

  const Stickers = ({style}) => {

    const [notifications, setNotifications] = useState([
    ]);
    const {database, app, initMessaging} = useContext(FirebaseContext);
    const navigator = useNavigation()
    const uid = useSelector((state) => state.user.uid)
    const allMessages = useSelector((state) => state.user.unreadMessage)
    const dispatch = useDispatch()

    const handleClose = (n) => {
      if (n.link)
        navigator.push(n.link,n.params)
      if (n?.press) {
        console.log('press');
        n.press()
      }
        //setPopups(popups.filter((p,i)=>i!=index))
      console.log('remove');
    }

    useEffect(() => {
      
      if (database) {
        const dbRef = ref(database,`users/${uid}/messages`);
        const userRef = ref(database,`users`);

        console.log('onChilAdded attatched');

        const getMessages = () => {
          //dispatch(emptyUnreadMessages())
          if (allMessages.includes('notifications')) {
            setNotifications(old=>[...old,{
              press: initMessaging,
              title:'Értesítések',
              key:'notifications',
              text:'Hali! Ha szeretnéd, hogy értesülj a pajtásaid üzeneteiről, kapcsold be az értesítéseket, úgy, hogy rám kattintasz!'
            }])
          }
          onChildAdded(dbRef, (childSnapshot) => {
            const childKey = childSnapshot.key;
            const read = childSnapshot.child('read').exists()
            const last = childSnapshot.child('last').val() 
            if (!allMessages.includes(childKey))
            if (!read && last?.from != uid) {
              get(child(userRef,childKey+'/data/name')).then((snapshot) => {
                  const name = snapshot.val()
                  setNotifications(old=>[...old,{
                    link:'beszelgetes',
                    params:{uid:childKey},
                    title:'Új üzenet '+name+'tól',
                    key:childKey,
                    text:last?.message}])
                });
                dispatch(setUnreadMessage(childKey))
            }
        });

        } 
        getMessages()
      }
      
      if (Platform.OS == 'web' && Notification.permission === 'default') {
        dispatch(setUnreadMessage('notifications'))
      } else {
        dispatch(removeUnreadMessage('notifications'))
      }
    }, []);

    useEffect(() => {
      if (Platform.OS == 'web' && Notification.permission !== 'default')
        setNotifications(notifications.filter(n=>n.key!='notifications'))
    }, [allMessages]);

    return (
      <View style={style}>
          {notifications.length ? notifications.map(
            (n,i)=>
              <Sticker key={'sticker'+i} onPress={()=>handleClose(n)}>
                <B>{n.title}</B>
                {' '+n?.text}
              </Sticker>)
            : null}
      </View>
    )
}

  const Sticker = ({children,onPress}) => {
    const getRandom = (min, max) => Math.floor(Math.random()*(max-min+1)+min);

    const width = 300;
    const [left, setLeft] = useState(null);
    const [top, setTop] = useState(null);

    const ref = useRef(null);
    useLayoutEffect(() => {
      setLeft(getRandom(10,ref.current.offsetWidth-width));
      setTop(getRandom(10,ref.current.offsetHeight-50));
      console.log(ref.current.offsetWidth);
    }, []);
    return(
      <View ref={ref} style={{
        flex:1}}>
        <Pressable onPress={onPress} style={{
          backgroundColor:'#fdf6d1',borderWidth:0,padding:10,
          width:'100%'}}>
          <MyText>{children}
          </MyText>
        </Pressable>
      </View>
    )
  } 

  export const Smiley = ({style}) => {
    const size = useRef(new Animated.Value(1)).current 

    const handleGrow = () => {
      if (size._value > 60) 
      Animated.timing(
        size,
        {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }
      ).start();
      else
      Animated.timing(
        size,
        {
          toValue: size._value*3,
          duration: 1000,
          useNativeDriver: false,
        }
      ).start();
    }
    return (
      <Animated.View                 // Special animatable View
      style={[{
        transform: [{ scale: size }],
        transformOrigin:'50% 30%'
      },style]}
      >
      <Pressable onPress={handleGrow}>
        <Image source={require('../../assets/logo.png')} style={{width:50,height:50,zIndex:10,elevation: 10}}/>
      </Pressable>
    </Animated.View>
    )
  }

  const Popup = ({title,description,handlePress,handleClose,index}) => {
    return (
      <Pressable 
        onPress={handlePress}
        style={{position:'absolute',bottom:10+105*index,right:10,width:300,borderWidth:2,height:100,backgroundColor:'white',padding:20}}>
        <View style={{flexDirection:'row'}}>
          <MyText style={{fontWeight:'bold',flexGrow:1}}>{title}</MyText>
          <Pressable onPress={handleClose}>
            <MyText>
              <Icon name='close' size={25}/>
            </MyText>
          </Pressable>
        </View>
        <MyText>{description}</MyText>
      </Pressable>
    )
  }


  export const isBright = function(color) { // #FF00FF
    var textCol = "black";
    var c = color.substring(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma < 150) {
        textCol = "white";
    }

    return textCol;
  }

export default HomeScreen;