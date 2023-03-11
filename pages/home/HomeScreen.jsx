  import { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

  import { Image, ImageBackground, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';

  import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
  import { useFocusEffect, useNavigation } from '@react-navigation/native';
  import { Animated } from "react-native";
  import Icon from 'react-native-vector-icons/Ionicons';
  import { Auto, Col, getUri, MyText, Row, TextInput } from '../../components/Components';
  import homeDesign from '../../styles/homeDesign';

  import { useSelector } from 'react-redux';
  import firebase, { FirebaseContext } from '../../firebase/firebase';

  import axios from 'axios';
  import { child, get, onChildAdded, ref } from 'firebase/database';
  import { useDispatch } from 'react-redux';
  import { config } from '../../firebase/authConfig';
  import {useWindowDimensions} from 'react-native';
  import { getGreeting, TextFor } from '../../lib/textService/textService';
  import { removeUnreadMessage, setUnreadMessage } from '../../lib/userReducer';
  import Search from '../Search';
  import HomeBackground from './HomeBackground';
import Module from '../../components/homeComponents/Module';
import { saleCategories } from '../../lib/categories';
  
  const EventData = [
    { 
      id:'w4ifm8m948emm',
      title: 'MORNING YOGA a Manyiban!',
      place: 'MANYI - Kulturális Műhely',
      category: 'Test és lélek',
      date: Date.now(),
      image: 'https://scontent.fbud7-3.fna.fbcdn.net/v/t39.30808-6/321673215_5848982685198666_209761172298717480_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=340051&_nc_ohc=eEGnkSafpcoAX-46eqz&_nc_ht=scontent.fbud7-3.fna&oh=00_AfAOkREX-VOBpkLgoz7gAD051IbrQoOqd5_5rT49pFyXDg&oe=63EF2A6F'
    },
    { 
      id:'49k9fk43iofmwe',
      title: 'Farsang // Bánkitó x Auróra',
      place: 'Auróra',
      category: 'Buli',
      date: Date.now(),
      image: 'https://scontent.fbud7-3.fna.fbcdn.net/v/t39.30808-6/328133400_938505357142186_7978671228144834840_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=340051&_nc_ohc=7TibZcvx8bkAX8zg-4u&_nc_ht=scontent.fbud7-3.fna&oh=00_AfA6VcrXp6zOc6Xe6sfsOzqEtUEHyR4JrReG81xU-FXLMg&oe=63EF2172'
    },
    { 
      id:'59ge9jefimefromk',
      title: 'HIPERKARMA VALENTIN-NAPI KONCERT',
      place: 'A38 HAJÓ',
      category: 'Koncert',
      date: Date.now(),
      image: 'https://scontent.fbud7-3.fna.fbcdn.net/v/t39.30808-6/325778181_890244938767674_5098273371750338140_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=340051&_nc_ohc=WcDJrHAuREEAX-LNcK6&_nc_ht=scontent.fbud7-3.fna&oh=00_AfCwXx8EjOJ7hjj5fEe6d3JVKqdxiKJ3AdaehJEajb8dAw&oe=63F02D32'
    }
  ]

  const FunctionsData = [
    { 
      id:'w4ifm8m948emm',
      title: 'Oszd meg a pisikódod!',
      place: 'Pislini kell? Van megoldás!',
      category: 'Térkép',
      image: 'https://media.wired.co.uk/photos/606d9cdadbc4c121710a3ebe/master/w_1600%2Cc_limit/wired-pee.jpg'
    },
    { 
      id:'59ge9jefimefromk',
      title: 'Van ötleted a apphoz?',
      place: 'Írd le nekünk és szívesen elkészítjük!',
      category: 'Visszajelzés',
      image: 'https://www.upvoty.com/wp-content/uploads/2020/01/how-to-saas-idea.png'
    },
    { 
      id:'49k9fk43iofmwe',
      title: 'Szeretnéd kiönteni a lelked?',
      place: 'Lépj be a safespacebe!',
      category: 'Segítségnyújtás',
      image: 'https://hips.hearstapps.com/hmg-prod/images/gettyimages-1660669048.jpg?resize=1200:*'
    },
  ]

  const GroupsData = [
    { 
      id:'w4ifm8m948emm',
      title: 'Pesti túrázók',
      place: 'Hetente kirándulni megyünk!',
      category: 'Kiszakadás',
      image: 'https://www.mozgasvilag.hu/media_mv/10219/2021/other/85641-turatippek_during_SLIDER.jpg'
    },
    { 
      id:'59ge9jefimefromk',
      title: 'Csoportos lelkizés',
      place: 'Vezetett csoport bárkinek',
      category: 'Test és lélek',
      image: 'https://www.benceganti.com/wp-content/uploads/2021/04/korvezetes_tabor1-1024x683.jpg'
    },
    { 
      id:'49k9fk43iofmwe',
      title: 'Kezdő webfejlesztés',
      place: 'Tanulj meg csudi dolgokat készíteni a foteledből!',
      category: '',
      image: 'https://www.educative.io/api/page/6096075812241408/image/download/6443342641496064'
    },
  ]
  const HomeScreen = () => {
    const name = useSelector((state) => state.user.name)
    const nav = useNavigation()
    const opacity = useRef(new Animated.Value(1)).current 
    const opacity2 = useRef(new Animated.Value(0)).current 
    const height = useRef(new Animated.Value(0)).current 
    const [searchText, setSearchText] = useState('');
    const { width } = useWindowDimensions();
    const [greeting, setGreeting] = useState(getGreeting);
    const [list, setList] = useState([]);
    useFocusEffect(
      useCallback(() => {
        console.log('res');
        const fn = async () => {

          try {
            let res = (await axios.get('/sale/latest',config())).data

            res = await Promise.all(res.map( async (el,i)=> {
              return {...el,image: await getUri('sale/'+el._id+'/'+0)}
            }))
            console.log('res',res);
            setList(res)
          } catch (error) {
            if (error?.response?.data == 'Token expired') {
              firebase.logout()
            }
            console.log('server not reachable',error);
          }

        }
        fn();
        return () => {
          setList([])
        };
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

    return (
      <ScrollView style={{flex:1}} >
        <HomeBackground >
          <Auto style={{flex:3,zIndex:-1,justifyContent:'center'}}>
            <Col style={{flex:width<900?1:2}}>
              <Animated.View style={{opacity:opacity,flex:opacity}}>
                <Stickers style={{flex:1}}/>
                <Row style={{alignItems:'flex-end',paddingLeft:50,paddingVertical:20}}>
                  <MyText style={{fontSize:40}}><TextFor text={greeting} embed={name}/></MyText>
                  <Smiley/>
                </Row>
              </Animated.View> 
              <Animated.View style={{opacity:opacity2,flex:opacity2}}>
                <Search route={{params:{key:searchText}}} style={{flex:1}} />
              </Animated.View>
              
              <TextInput
                placeholder={TextFor({pureText:true,text:'search_text'})}
                onChangeText={setSearchText}
                onFocus={open}
                onBlur={close}
                value={searchText}
                style={{width:'100%',height:100,fontSize:width>900?40:20,padding:20,margin:0,backgroundColor:'#fbf7f0'}}/>
              { !!searchText && <TouchableOpacity onPress={()=>setSearchText('')} style={{position:'absolute',right:0,bottom:0,width:100,height:100,zIndex:1,justifyContent:'center',alignItems:'center'}}>
                <Icon style={{justifyContent:'center'}} name="close" size={60}/>
              </TouchableOpacity>}
            </Col>
            {width < 900 && 
            <Auto style={{flex:1}}>
              <Module title="events" link="esemenyek" data={EventData}/>
              <Module title="Funkciók" data={FunctionsData} />
              <Module title="sale" link="cserebere" 
                data={list.map(el=>{return{
                  id:el._id,
                  title:el.title,
                  date:el.date,
                  image:el.image,
                  place:el.description,
                  category: saleCategories[el.category].name,
                  color: saleCategories[el.category].color
                }})}/>
              
            </Auto>}
          </Auto>
        </HomeBackground>
          {width > 900 && <>
            <Auto >
              <Module title="Közösségek" data={GroupsData} />
              <Module title="sale" link="cserebere" 
              data={list.map(el=>{
                console.log('el',Object.keys(el))
                return{
                  id:el._id,
                  title:el.title,
                  date:el.date,
                  image:el.image,
                  place:el.description,
                  category: saleCategories[el.category].name,
                  color: saleCategories[el.category].color
                }})}/>
            </Auto>
            <Auto >
              <Module title="Funkciók" data={FunctionsData} />
              <Module title="events" link="esemenyek" data={EventData}/>
            </Auto>
          </>}
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
        navigator.navigate(n.link,n.params)
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
                title:'Üzenetek',
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

        if (Notification.permission === 'default') {
          dispatch(setUnreadMessage('notifications'))
        } else {
          dispatch(removeUnreadMessage('notifications'))
        }
      },[])
    )

    useEffect(() => {
    }, []);

    useEffect(() => {
      if (Notification.permission !== 'default')
        setNotifications(notifications.filter(n=>n.key!='notifications'))
    }, [allMessages]);
    return (
      <View style={style}>
          {notifications.length ? notifications.map(
            (n,i)=>
              <Sticker onPress={()=>handleClose(n)}>
                {n.title}
                {'\n'}
                {n?.text}
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
          width:width,position:'absolute',left:left,top:top}}>
          <MyText>{children}
          </MyText>
        </Pressable>
      </View>
    )
  } 

  const Smiley = () => {
    const size = useRef(new Animated.Value(1)).current 

    const handleGrow = () => {
      if (size._value > 60) 
      Animated.timing(
        size,
        {
          toValue: 1,
          duration: 1000,
        }
      ).start();
      else
      Animated.timing(
        size,
        {
          toValue: size._value*3,
          duration: 1000,
        }
      ).start();
    }
    return (
      <Animated.View                 // Special animatable View
      style={{
        marginLeft:30,
        transform: [{ scale: size }]
      }}
      >
      <Pressable onPress={handleGrow}>
        <Image source={require('../../assets/logo.png')} style={{width:50,height:50,zIndex:10}}/>
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