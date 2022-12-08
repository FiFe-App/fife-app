  import { StatusBar } from 'expo-status-bar';
  import React, { useEffect, useState, useRef, useContext } from 'react';

  import { useHover } from 'react-native-web-hooks';

  import { Text, View, TextInput, ScrollView, Pressable, Button, TouchableOpacity, Dimensions, Image} from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { widthPercentageToDP,  heightPercentageToDP} from 'react-native-responsive-screen';

  import { styles } from './styles';
  import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import { useFonts, AmaticSC_700Bold  } from '@expo-google-fonts/amatic-sc';
  import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'
  import { LinearGradient } from "expo-linear-gradient";
  import { Animated } from "react-native";
  import { global } from './global';
  import { Row, Col, Auto } from './Components'
  import Icon from 'react-native-vector-icons/Ionicons'

  import { SearchBar, OpenNav } from "./Components"
  import { FirebaseContext } from '../firebase/firebase';
  import { useSelector } from 'react-redux'
  import { child, get, onChildAdded, ref, off, onValue } from 'firebase/database';

  import { useDispatch } from 'react-redux';
  import { getGreeting, TextFor } from '../textService/textService';
  import { setUnreadMessage } from '../userReducer';
  import { useWindowSize } from '../hooks/window';
  import { Helmet } from 'react-helmet';
  import HomeBackground from './home/HomeBackground';
  

  const Stack = createNativeStackNavigator();

  export const HomeScreen = ({ navigation, route }) => {
    const {database, app, auth} = useContext(FirebaseContext);
    const width = useWindowSize().width;
    const uid = useSelector((state) => state.user.uid)
    
    const dispatch = useDispatch()

    let [fontsLoaded] = useFonts({
      AmaticSC_700Bold
    });

    if (!fontsLoaded) 
      return <View />;

    return <Menu />;
  };

  export function LogoTitle() {
    const {api} = useContext(FirebaseContext);
    const navigation = useNavigation();
    const route = useRoute();

    const width = useWindowSize().width;
    const unreadMessage = useSelector((state) => state.user.unreadMessage)
    const [open, setOpen] = useState(false);

    const logout = () => {
      console.log('logout');
      api.logout()
    }

    return (
      <LinearGradient colors={['#FDEEA2', "#FDEEA2"]} style={{borderBottomWidth:2}} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
        <Helmet>
          <meta name="theme-color" content="#FDEEA2"/>
        </Helmet>
        <SafeAreaView>
          <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
            { navigation.canGoBack && 
              <Pressable onPress={()=>navigation.goBack()} style={{justifyContent:'center',alignItems:'center',flex:1}}>
                {route.name != 'home' && <Icon name='arrow-back' size={30} color="#000"/>}
              </Pressable>
            }
            <Pressable onPress={()=>navigation.navigate('fooldal')}>
              { width >  1230 && <Text style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe. <TextFor text="web_title"/></Text>}
              { width <=  1230 && width > 470 && <Text style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe App</Text>}
            </Pressable>
            { width >  1120 ?
            <View style={{flexDirection:'row',marginRight:20,marginBottom:5,flex:8}}>
              <Pressable style={{justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.navigate('fooldal')}>
              </Pressable>
              <SearchBar/>
              <MenuLink title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
              <MenuLink title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
              <MenuLink title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
              <MenuLink title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
              <MenuLink title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
              <MenuLink title="Unatkozom" text="" color="#b51d1d" link={"unatkozom"} icon="bulb" />
              <MenuLink title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
            </View>
            :
            <Row style={{flex:8}}>
              <SearchBar/>
              <TouchableOpacity onPress={()=>setOpen(!open)} style={{justifyContent:'center',width:70}}>
                {open ? <Text style={{justifyContent:'center',textAlign:'center'}}><Icon name='caret-up-outline' size={30}/></Text>
                      : <Text style={{justifyContent:'center',textAlign:'center'}}><Icon name='menu-outline' size={30}/></Text>}
              </TouchableOpacity>
            </Row>}
          </View>
          <OpenNav open={open} style={{width:'100%'}}>
            <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
            <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
            <MenuLink setOpen={setOpen} title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
            <MenuLink setOpen={setOpen} title="Unatkozom" text="" color="#b51d1d" link={"unatkozom"} icon="bulb" />
            <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
          </OpenNav>
        </SafeAreaView>
      </LinearGradient>)
  }

  const Menu = ({ navigation, route }) => {
    const name = useSelector((state) => state.user.name)
    const width = useWindowSize().width;
    const [greeting, setGreeting] = useState(getGreeting);
    return (
      <ScrollView style={{flex:1}} contentContainerStyle={{flex:1}}>
        <HomeBackground style={{flex:2,justifyContent:'flex-end'}} >
          <Row style={{alignItems:'center',paddingLeft:50,paddingVertical:20}}>
            <Text style={{fontSize:40}}><TextFor text={greeting} embed={name}/></Text>
            <Smiley/>
          </Row>
        </HomeBackground>
        <Auto style={{flex:3,zIndex:-1}}>
          <Row style={{flex: width <= 900 ? 'none' : 1,padding:20,flexWrap:'wrap'}}>
            <Module title="profile" text="" color="#D8FFCD" to={"profil"} icon="person-outline" />
            <Module title="messages" color="#CDEEFF" icon="mail-outline" to={"uzenetek"} number={'unreadMessage'}/>
            <Module title="sale" color="#fffbc9" icon="shirt-outline" to={"cserebere"}/>
            <Module title="places" color="#f4e6d4" icon="map-outline" to={"terkep"}/>
            <Module title="Beállítások" text="" color="#FDCDFF" icon="flower-outline" />
            <Module title="Unatkozom" text="" color="#FF9D9D" to={"unatkozom"} icon="bulb-outline" />
          </Row>
          <Messages style={{flex: width <= 900 ? 'none' : 1,padding:30}}/>
        </Auto>
      </ScrollView>
    );
    return(
      <View style={styles.modules}>
          {/*<Module title="Segélykérés" text="" color="#ffb0b0" to={"help"} icon="alert-outline" flat/>*/}
          <Module title="profile" text="" color="#D8FFCD" to={"profile"} icon="person-outline" />
          <Module title="messages" color="#CDEEFF" icon="mail-outline" to={"messages"} number={'unreadMessage'}/>
          <Module title="sale" color="#fffbc9" icon="shirt-outline" to={"sale"}/>
          <Module title="places" color="#f4e6d4" icon="map-outline" to={"maps"}/>
          <Module title="Beállítások" text="" color="#FDCDFF" icon="flower-outline" />
          <Module title="Unatkozom" text="" color="#FF9D9D" to={"new"} icon="bulb-outline" />
      </View>
    );
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
        <Image source={require('../assets/logo.png')} style={{position:'absolute',top:-22,left:-15,width:50,height:50,zIndex:10}}/>
      </Pressable>
    </Animated.View>
    )
  }

  const Messages = ({style}) => {

    const [notifications, setNotifications] = useState([
      {title:'Új üzenet Ákostól!',text:'Szia!!',link:'messages',params:{selected:'PM2T0TVoaeZIVxuoAPPrVBofwQE2'}}
    ]);
    const {database, app, auth} = useContext(FirebaseContext);
    const navigator = useNavigation()
    const uid = useSelector((state) => state.user.uid)
    const dispatch = useDispatch()

    const removePopup = (index) => {
      setPopups(popups.filter((p,i)=>i!=index))
      console.log('remove');
    }

    useEffect(() => {
      return
      getMessages(ROOM_ID, (messages) => {
        setData(messages);
      });
      const refToRoom = ref(getDatabase(app), `messages/room_${ROOM_ID}`);
      const myQuery = query(refToRoom);
      
      // wrap your function inside setTimeout
       setTimeout(() => {
      
        onChildAdded(
          myQuery,(data) => {
            console.log(data);
          },
          (error) => {
            console.log(error);
          }
        );
        return myQuery.off('child_added');
      }, 1000) //add this ,1000 mean 1 second delay.
    }, []);
    useEffect(() => {
      if (database) {
          const dbRef = ref(database,`users/${uid}/messages`);
          const userRef = ref(database,`users`);

          console.log('onChilAdded attatched');

          const getMessages = () => {
            //console.log('listening');
            onChildAdded(dbRef, (childSnapshot) => {
              console.log('new message:',childSnapshot.val());
              const childKey = childSnapshot.key;
              console.log(childKey
                );
              const read = childSnapshot.child('read').val() 
              const last = childSnapshot.child('last').val() 
              if (!read && last?.from != uid) {
                get(child(userRef,childKey+'/data/name')).then((snapshot) => {
                    const name = snapshot.val()
                    setNotifications(old=>[...old,{link:'beszelgetes/'+childKey,title:'Új üzenet '+name+'tól',text:last?.message}])
                  });
                  dispatch(setUnreadMessage(childKey))
              }
          });

          setTimeout(() => {
            //getMessages()
          }, 1000)

          return off(dbRef,'child_added')
          } 

          getMessages()



      }
    }, [database]);
    return (
      <View style={style}>
        <Text style={{fontSize:40}}>Értesítések</Text>
        <ScrollView>
          {notifications.map(
            (n,i)=><Row key={'msg'+i} style={{backgroundColor:'white',padding:20,margin:5}}>
                  <Auto>
                    <Text style={{fontWeight:'bold'}}>{n.title}</Text>
                    {n?.text && <Text>{': '+n.text}</Text>}
                  </Auto>
                  <Pressable onPress={()=>navigator.navigate(n.link,n.params)}>
                    <Icon name="arrow-forward-outline" size={15}/>
                  </Pressable>
              </Row>)}

        </ScrollView>
      </View>
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
          <Text style={{fontWeight:'bold',flexGrow:1}}>{title}</Text>
          <Pressable onPress={handleClose}>
            <Text>
              <Icon name='close' size={25}/>
            </Text>
          </Pressable>
        </View>
        <Text>{description}</Text>
      </Pressable>
    )
  }


function onContextCreate(gl) {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0, 1, 1, 1);

  // Create vertex shader (shape & position)
  const vert = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(
    vert,
    `
    void main(void) {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 150.0;
    }
  `
  );
  gl.compileShader(vert);

  // Create fragment shader (color)
  const frag = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(
    frag,
    `
    void main(void) {
      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
  `
  );
  gl.compileShader(frag);

  // Link together into a program
  const program = gl.createProgram();
  gl.attachShader(program, vert);
  gl.attachShader(program, frag);
  gl.linkProgram(program);
  gl.useProgram(program);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, 1);

  gl.flush();
  gl.endFrameEXP();
}

  const MenuLink = ({title,link,number,setOpen,onPress}) => {
    const ref = useRef(null);
    const width = useWindowSize().width;

    const isHovered = useHover(ref);
    const navigation = useNavigation()
    const route = useRoute()
    return (
      <Pressable ref={ref}
        style={(!isHovered && route.name != link ? menuLink(width).default : 
          [menuLink(width).default,menuLink(width).hover])}
        onPress={()=>{
          if (onPress)
            onPress()
          else
            navigation.navigate(link)

          if (setOpen)
            setOpen(false)
        }}>

          <TextFor style={{fontWeight:'500'}} text={title}/>
          {!!number && <Text style={[styles.number,{right:50,top:60}]}>{number}</Text>}
      </Pressable>
    )
  }

  function Module(props) {
    const { flat } = props;
    const number = useSelector((state) => state.user)[props?.number]?.length || 0
    const navigation = useNavigation();
    const onPress = (to) => {
      navigation.navigate(to, props.with);
    }
    return (
        <TouchableOpacity style={moduleStyle(props.color,flat)} onPress={() => onPress(props.to)}>
          <Row>
            <TextFor style={{ fontWeight: 'bold', color: isBright(props.color) }} text={props.title}/>
          </Row> 
            <Icon name={props.icon} size={50} style={{alignSelf:'center'}} color={isBright(props.color)} />
            {!!number && <Text style={styles.number}>{number}</Text>}  
        </TouchableOpacity>
    );
    
  }

  var moduleStyle = function(color,flat) {
    return {
      
      backgroundColor: color,
      justifyContent:'center',
      margin:10,
      padding: 10,
      paddingHorizontal:30,
      height:100,
      width:150
    }
  }

  var menuLink =  function(width) {
    if (width >  1120)
    return {
      default:{
        justifyContent:'center',
        padding:10,
        paddingRight:15,
        marginBottom:10,
        marginLeft:15,
        marginBottom:-7,
      },
      hover: {
        backgroundColor:'white',
        borderWidth: 2,
        borderTopWidth:0,
        borderRadius: 0,
        marginLeft:11,
        marginBottom:-7,
      }
    }
    else
    return {
      default:{
        elevation: 10,
        justifyContent:'center',
        backgroundColor: '#FDE6A2',
        padding:15,
        paddingRight:15,
        borderTopWidth:2,
        borderBottomWidth:2,
        margin:0,
        marginTop:-2,
      },
      hover: {
        backgroundColor:'white',
        borderRadius: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginTop:-2,
      }
    }
  }

  var isBright = function(color) { // #FF00FF
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

