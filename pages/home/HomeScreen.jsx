import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'expo-fast-image';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Animated } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import { Auto, B, Col, MyText, NewButton, Row, getUri } from '../../components/Components';
import { useSelector } from 'react-redux';
import { FirebaseContext } from '../../firebase/firebase';
import axios from 'axios';
import { child, get, getDatabase, limitToFirst, onChildAdded, query, ref, set } from 'firebase/database';
import { useWindowDimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import Module from '../../components/homeComponents/Module';
import { config } from '../../firebase/authConfig';
import { saleCategories } from '../../lib/categories';
import { TextFor, getGreeting } from '../../lib/textService/textService';
import { removeUnreadMessage, setTempData, setUnreadMessage } from '../../lib/userReducer';
import HomeBackground from './HomeBackground';
import HelpModal from '../../components/help/Modal';

  
  const EventData = [
    { 
      id:'w4ifm8m948emm',
      title: 'MORNING YOGA a Manyiban!',
      text: 'MANYI - Kulturális Műhely',
      category: 'Test és lélek',
      date: Date.now(),
      image: 'https://scontent.fbud7-3.fna.fbcdn.net/v/t39.30808-6/321673215_5848982685198666_209761172298717480_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=340051&_nc_ohc=eEGnkSafpcoAX-46eqz&_nc_ht=scontent.fbud7-3.fna&oh=00_AfAOkREX-VOBpkLgoz7gAD051IbrQoOqd5_5rT49pFyXDg&oe=63EF2A6F'
    },
    { 
      id:'49k9fk43iofmwe',
      title: 'Farsang // Bánkitó x Auróra',
      text: 'Auróra',
      category: 'Buli',
      date: Date.now(),
      image: 'https://scontent.fbud7-3.fna.fbcdn.net/v/t39.30808-6/328133400_938505357142186_7978671228144834840_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=340051&_nc_ohc=7TibZcvx8bkAX8zg-4u&_nc_ht=scontent.fbud7-3.fna&oh=00_AfA6VcrXp6zOc6Xe6sfsOzqEtUEHyR4JrReG81xU-FXLMg&oe=63EF2172'
    },
    { 
      id:'59ge9jefimefromk',
      title: 'HIPERKARMA VALENTIN-NAPI KONCERT',
      text: 'A38 HAJÓ',
      category: 'Koncert',
      date: Date.now(),
      image: 'https://scontent.fbud7-3.fna.fbcdn.net/v/t39.30808-6/325778181_890244938767674_5098273371750338140_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=340051&_nc_ohc=WcDJrHAuREEAX-LNcK6&_nc_ht=scontent.fbud7-3.fna&oh=00_AfCwXx8EjOJ7hjj5fEe6d3JVKqdxiKJ3AdaehJEajb8dAw&oe=63F02D32'
    }
  ]

  const FunctionsData = [
    { 
      id:'w4ifm8m948emm',
      title: 'Oszd meg a pisikódod!',
      text: 'Pislini kell? Van megoldás!',
      category: 'Térkép',
      image: 'https://media.wired.co.uk/photos/606d9cdadbc4c121710a3ebe/master/w_1600%2Cc_limit/wired-pee.jpg'
    },
    { 
      id:'59ge9jefimefromk',
      title: 'Van ötleted a apphoz?',
      text: 'Írd le nekünk és szívesen elkészítjük!',
      category: 'Visszajelzés',
      image: 'https://www.upvoty.com/wp-content/uploads/2020/01/how-to-saas-idea.png'
    },
    { 
      id:'49k9fk43iofmwe',
      title: 'Szeretnéd kiönteni a lelked?',
      text: 'Lépj be a safespacebe!',
      category: 'Segítségnyújtás',
      image: 'https://hips.hearstapps.com/hmg-prod/images/gettyimages-1660669048.jpg?resize=1200:*'
    },
  ]

  const GroupsData = [
    { 
      id:'w4ifm8m948emm',
      title: 'Pesti túrázók',
      text: 'Hetente kirándulni megyünk!',
      category: 'Kiszakadás',
      image: 'https://www.mozgasvilag.hu/media_mv/10219/2021/other/85641-turatippek_during_SLIDER.jpg'
    },
    { 
      id:'59ge9jefimefromk',
      title: 'Csoportos lelkizés',
      text: 'Vezetett csoport bárkinek',
      category: 'Test és lélek',
      image: 'https://www.benceganti.com/wp-content/uploads/2021/04/korvezetes_tabor1-1024x683.jpg'
    },
    { 
      id:'49k9fk43iofmwe',
      title: 'Kezdő webfejlesztés',
      text: 'Tanulj meg csudi dolgokat készíteni a foteledből!',
      category: 'Tanulás',
      image: 'https://www.educative.io/api/page/6096075812241408/image/download/6443342641496064'
    },
  ]
  const HomeScreen = () => {
    const name = useSelector((state) => state.user.name)
    const uid = useSelector((state) => state.user.uid)
    const { api, database } = useContext(FirebaseContext);
    const nav = useNavigation()
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
      places: false,
    });

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

    const saleModule = <Module title="Friss, ropogós cuccok" link="cserebere" params={{category:0}}
    serverPath='/sale/latest?category=0'/>

    const workModule = <Module title="Új munkák" link="cserebere" params={{category:3}} 
    serverPath='/sale/latest?category=3'
    />

    const apartmentModule = <Module title="Új kiadó lakások" link="cserebere" params={{category:2}} 
    serverPath='/sale/latest?category=2'
    />

    const newsModule =<Module title="Cikkek" data={docsList}  link="cikk"
      firebasePath='docs'
    />
    const [list, setList] = useState([saleModule,workModule]);

    useEffect(() => {
      console.log(filter);
      setList(
        [saleModule,workModule,apartmentModule].filter((e,i)=>{
          console.log(i,!![filter.sale,filter.work,filter.places][i]);
          return !![filter.sale,filter.work,filter.places][i]
        })
      )
      console.log([1,2,3].filter((e,i)=>!![filter.sale,filter.work,filter.places][i]))
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
                  <MyText style={{fontSize:small?24:40,marginRight:20}} bold><TextFor text={greeting} embed={name}/></MyText>
                  <Smiley/>
                </Row>
              </Animated.View> 
            </Col>
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
              {type:'checkbox',attribute:'places',label:'Kiadó lakások',data:filter,setData:setFilter,style:{backgroundColor:'#fbf1e0'}}
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