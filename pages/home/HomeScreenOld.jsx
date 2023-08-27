import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Image from 'expo-fast-image';
import { child, get, getDatabase, onChildAdded, ref, set } from 'firebase/database';
import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, View, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { Auto, B, Col, MyText, NewButton, Row } from '../../components/Components';
import HelpModal from '../../components/help/Modal';
import Module from '../../components/homeComponents/Module';
import { FirebaseContext } from '../../firebase/firebase';
import { TextFor, getGreeting } from '../../lib/textService/textService';
import { removeUnreadMessage, setTempData, setUnreadMessage } from '../../lib/userReducer';
import HomeBackground from './HomeBackground';
import styles from '../../styles/homeDesign';
import { getAuth, onAuthStateChanged } from 'firebase/auth';


  const HomeScreen = () => {
    const name = useSelector((state) => state.user.name)
    const uid = useSelector((state) => state.user.uid)
    const dispatch = useDispatch()
    const opacity = useRef(new Animated.Value(1)).current 
    const opacity2 = useRef(new Animated.Value(0)).current 
    const height = useRef(new Animated.Value(0)).current 
    const [searchText, setSearchText] = useState('');
    const { width } = useWindowDimensions();
    const small = width < 900;
    const [greeting, setGreeting] = useState(getGreeting);
    const [docsList, setDocsList] = useState([]);
    const [filterModal, setFilterModal] = useState(false);
    const [filter, setFilter] = useState({
      sale: true,
      work: true,
      rent: false,
      places: true
    });
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
      console.log('onAuthChanged');
      onAuthStateChanged(getAuth(),(user)=>{
          setLoggedIn(!!user)
          console.log('onAuthStateChanged',!!user);
          //if (!user)
          //logout()
      })
  
      
    }, []);

    useFocusEffect(
      useCallback(() => {
        dispatch(setTempData(null))
        const filterRef = ref(getDatabase(),'/users/'+uid+'/settings/homeFilter')
        get(filterRef).then(snapshot=>{
          if (snapshot.exists())
          setFilter(snapshot.val())
        })

      }, [])
    );

    useEffect(() => {
      if (searchText.length > 0) 
        open()
      else
        close()
    }, [searchText]);
    const delay = ms => new Promise(res => setTimeout(res, ms));

    const open = async () => {
      Animated.timing(height,{ toValue: 100, duration: 500, useNativeDriver: false }).start();

      await delay(1000);

      Animated.timing(opacity,{ toValue: 0, duration: 500, useNativeDriver: false }).start();
      Animated.timing(opacity2,{ toValue: 1, duration: 500, useNativeDriver: false }).start();
    }

    const close = async () => {
      Animated.timing(height,{ toValue: 0, duration: 500, useNativeDriver: false }).start();
      //await delay(1000);
      Animated.timing(opacity,{ toValue: 1, duration: 500, useNativeDriver: false }).start();
      Animated.timing(opacity2,{ toValue: 0, duration: 500, useNativeDriver: false }).start();
    }

    const modules = {
      sale: <Module title="Friss, ropogós cuccok" link="cserebere" params={{category:0}}
        serverPath='/sale/latest?category=0'/>,
      work:<Module title="Új munkák" link="cserebere" params={{category:5}} 
        serverPath='/sale/latest?category=3'/>,
      rent: <Module title="Új kiadó lakások" link="cserebere" params={{category:5}} 
        serverPath='/sale/latest?category=2' />,
      places: <Module title="Helyek amiket megismerhetsz!" link="terkep" 
        serverPath='/places/latest'/>,
    }

    const newsModule =<Module title="Cikkek" link="cikkek"
      serverPath='/docs/latest'
    />
    const [list, setList] = useState([]);

    useEffect(() => {
      console.log(filter);
      setList(
        [modules.sale,modules.work,modules.rent,modules.places].filter((e,i)=>{
          console.log(i,!![filter.sale,filter.work,filter.rent,filter.places][i]);
          return !![filter.sale,filter.work,filter.rent,filter.places][i]
        })
      )
      console.log(['saleModule','workModule','rentModule','placesModule'].filter((e,i)=>{
        return !![filter.sale,filter.work,filter.rent,filter.places][i]
      }))
    }, [filter]);

    useEffect(() => {
      console.log(list);
    }, [list]);

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
                <Stickers style={{flex:1}}/>
                <Row style={{alignItems:'center',paddingHorizontal:20,paddingVertical:20}}>
                  <MyText style={{fontSize:small?24:40,marginRight:30,backgroundColor:'white',borderWidth:2,borderRadius:100,padding:8}} bold>
                    <TextFor text={greeting} embed={name}/>
                    <View style={styles.bubble} />
                  </MyText>
                  <Smiley style={{marginTop:32}}/>
                </Row>
              </Animated.View> 
            </Col>
            {!loggedIn && <MyText size={40}>!</MyText>}
            <View style={{padding:10,alignItems:'center',justifyContent:'center'}}>
              <NewButton icon title={<Icon name="options-outline" size={30} />} onPress={()=>setFilterModal(true)}/>
            </View>
          </Row>
        </HomeBackground>
          {width > 900 ? <>
            <Auto >
              <View>
                {list?.[0]}
                {newsModule}
              </View>
              <View>
                {list?.[1]}
                {list?.[2]}
              </View>
            </Auto>
          </> : <View>
          {list?.[0]}
              {list?.[1]}
                {list?.[2]}
                  {newsModule}
          </View> }
          <HelpModal 
            title="Mi érdekel?"
            text={`Válaszd ki hogy mi jelenjen meg a főoldalon!`}
            actions={[
              {title:'mégse',onPress:()=>setFilterModal(false)},
              {title:'mentés',onPress:save,color:'#ff462b'}]}
            open={filterModal}
            setOpen={setFilterModal}
            inputs={[
              {type:'checkbox',attribute:'sale',label:'Eladó tárgyak',data:filter,setData:setFilter,style:{backgroundColor:'#fbf1e0'}},
              {type:'checkbox',attribute:'work',label:'Elérhető munkák',data:filter,setData:setFilter,style:{backgroundColor:'#fbf1e0'}},
              {type:'checkbox',attribute:'rent',label:'Kiadó lakások',data:filter,setData:setFilter,style:{backgroundColor:'#fbf1e0'}},
              {type:'checkbox',attribute:'places',label:'Felfedezendő helyek',data:filter,setData:setFilter,style:{backgroundColor:'#fbf1e0'}}
            ]}
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

    useFocusEffect(
      useCallback(() => {
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

          setTimeout(() => {
            //getMessages()
          }, 1000)
          } 
          getMessages()
        }

        if (Platform.OS == 'web' && Notification.permission === 'default') {
          dispatch(setUnreadMessage('notifications'))
        } else {
          dispatch(removeUnreadMessage('notifications'))
        }
      },[])
    )

    useEffect(() => {
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
  const Help = () => {
    function MouseOver(event) {
      event.target.style.backgroundColor = '#fff';
    }

    function MouseOut(event) {
      event.target.style.backgroundColor = '#ff9a9c';
    }
    return (
      <View onMouseOver={MouseOver} onMouseOut={MouseOut} 
      style={{position:'absolute',bottom:-370,left:0,width:'100%', height:400,backgroundColor: '#ff9a9c'}}>
      </View>
    )
  }

  const PopUps = () => {


    return (
      <View>
        {
        popups.map((popup,index)=>
        
          <Popup 
            title={popup.name + ' üzenetet küldött neked!'} 
            description={popup.text}
            key={index} 
            index={index}
            handleClose={()=>removePopup(index)}
            handlePress={()=>console.log('clicked')}
          />)
        }
      </View>)
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