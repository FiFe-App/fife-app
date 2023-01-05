    import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';

  import { useHover } from 'react-native-web-hooks';

  import { View, ScrollView, Pressable, TouchableOpacity, Image} from 'react-native';
  import { SafeAreaView } from 'react-native-safe-area-context';

  import { styles } from './styles';
  import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
  import { createNativeStackNavigator } from '@react-navigation/native-stack';
  import { useFonts, AmaticSC_700Bold  } from '@expo-google-fonts/amatic-sc';
  import { LinearGradient } from "expo-linear-gradient";
  import { Animated } from "react-native";
  import { Row, Col, Auto, TextInput, MyText } from './Components'
  import Icon from 'react-native-vector-icons/Ionicons'

  import { SearchBar, OpenNav } from "./Components"
  import { FirebaseContext } from '../firebase/firebase';
  import { useSelector } from 'react-redux'

  import { useDispatch } from 'react-redux';
  import { getGreeting, TextFor } from '../textService/textService';
  import { useWindowSize } from '../hooks/window';
  import { Helmet } from 'react-helmet';
  import HomeBackground from './home/HomeBackground';
import { HomeSide } from './home/HomeSide';
import Snowfall from 'react-snowfall';
import Search from './Search';
  

  const Stack = createNativeStackNavigator();

  const HomeScreen = ({ navigation, route }) => {
    const {database, app, auth} = useContext(FirebaseContext);
    const width = useWindowSize().width;
    const uid = useSelector((state) => state.user.uid)
    
    const dispatch = useDispatch()

    let [fontsLoaded] = useFonts({
      AmaticSC_700Bold
    });

    if (!fontsLoaded) 
      return <View />;

    return <Menu route={route}/>;
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
            { width < 900 &&
              <Pressable onPress={()=>navigation.navigate('fooldal')} style={{justifyContent:'center',alignItems:'center',flex:1}}>
                {route.name != 'home' && <Icon name='home' size={30} color="#000"/>}
              </Pressable>
            }
            <Pressable onPress={()=>navigation.navigate('fooldal')}>
              { width >  1230 && <MyText style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe. <TextFor text="web_title"/></MyText>}
              { width <=  1230 && width > 470 && <MyText style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe App</MyText>}
            </Pressable>
            { width >  1120 ?
            <View style={{flexDirection:'row',marginRight:20,marginBottom:5,flex:8}}>
              <SearchBar/>
              <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
              <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
              <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
              <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
              <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
              <MenuLink setOpen={setOpen} title="Unatkozom" text="" color="#b51d1d" link={"unatkozom"} icon="bulb" />
              <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
            </View>
            :
            <Row style={{flex:8}}>
              <SearchBar/>
              <TouchableOpacity onPress={()=>setOpen(!open)} style={{justifyContent:'center',width:70}}>
                {open ? <MyText style={{justifyContent:'center',textAlign:'center'}}><Icon name='caret-up-outline' size={30}/></MyText>
                      : <MyText style={{justifyContent:'center',textAlign:'center'}}><Icon name='menu-outline' size={30}/></MyText>}
              </TouchableOpacity>
            </Row>}
          </View>
          <OpenNav open={open} style={{width:'100%'}}>
            <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"fooldal"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profil"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"uzenetek"} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"cserebere"}/>
            <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"terkep"}/>
            <MenuLink setOpen={setOpen} title="Unatkozom" text="" color="#b51d1d" link={"unatkozom"} icon="bulb" />
            <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
          </OpenNav>
        </SafeAreaView>
      </LinearGradient>)
  }

  const Menu = ({route}) => {
    const navigation = useNavigation()
    const name = useSelector((state) => state.user.name)
    const opacity = useRef(new Animated.Value(1)).current 
    const opacity2 = useRef(new Animated.Value(0)).current 
    const height = useRef(new Animated.Value(0)).current 
    const [searchText, setSearchText] = useState('');
    const width = useWindowSize().width;
    const [greeting, setGreeting] = useState(getGreeting);


    useFocusEffect(
      useCallback(() => {
        return () => {
          setSearchText('')
        };
      }, [route.params])
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
      <ScrollView style={{flex:1}} contentContainerStyle={{flex:1}}>
        <HomeBackground style={{flex:2}} >
          <Auto style={{flex:3,zIndex:-1,justifyContent:'center'}}>
            <Col style={{flex:width<900?1:2}}>
              <Animated.View style={{opacity:opacity,flex:opacity}}>
                <Row style={{alignItems:'flex-end',flexGrow:1,paddingLeft:50,paddingVertical:20}}>
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
                value={searchText}
                style={{width:'100%',height:100,fontSize:width>900?40:20,padding:20,margin:0,backgroundColor:'#fff7'}}/>
              { !!searchText && <TouchableOpacity onPress={()=>setSearchText('')} style={{position:'absolute',right:0,bottom:0,width:100,height:100,zIndex:1,justifyContent:'center',alignItems:'center'}}>
                <Icon style={{justifyContent:'center'}} name="close" size={60}/>
              </TouchableOpacity>}
            </Col>
            <HomeSide tabProp={searchText?'none':'navigation'} />
          </Auto>
        </HomeBackground>
          {width > 900 && 
          <Auto style={{flex:1}}>
            <Pressable style={[styles.bigButton,{flex:width<900?'none':1}]}  onPress={()=>navigation.navigate('cserebere')}>
              <MyText style={styles.bigButtonText}>Cserebere</MyText>
              <Icon name="shirt" color="#71bbff" size={60}/>
            </Pressable>
            <Pressable style={[styles.bigButton,{flex:width<900?'none':1}]}  onPress={()=>navigation.navigate('terkep')}>
              <MyText style={styles.bigButtonText}>Térkép</MyText>
              <Icon name="map" color="#8de264" size={60}/>
            </Pressable>
            <Pressable style={[styles.bigButton,{flex:width<900?'none':1}]} onPress={()=>navigation.navigate('esemenyek')}>
              <MyText style={styles.bigButtonText}>Programok</MyText>
              <Icon name="calendar" color="#ff3e6f" size={60}/>
            </Pressable>
          </Auto>}
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

  const MenuOLD = ({ navigation, route }) => {
    const name = useSelector((state) => state.user.name)
    const width = useWindowSize().width;
    const [greeting, setGreeting] = useState(getGreeting);
    return (
      <ScrollView style={{flex:1}} contentContainerStyle={{flex:1}}>
        <HomeBackground style={{flex:2,justifyContent:'flex-end'}} >
          <Row style={{alignItems:'center',paddingLeft:50,paddingVertical:20}}>
            <MyText style={{fontSize:40}}><TextFor text={greeting} embed={name}/></MyText>
            <Smiley/>
          </Row>
        </HomeBackground>
        <Auto style={{flex:3,zIndex:-1}}>
          <Row style={{flex: width <= 900 ? 'none' : 1,padding:20,flexWrap:'wrap'}}>
            <Module title="profile" text="" color="#D8FFCD" to={"profil"} icon="person-outline" />
            <Module title="messages" color="#CDEEFF" icon="mail-outline" to={"uzenetek"} number={'unreadMessage'}/>
            <Module title="sale" color="#fffbc9" icon="shirt-outline" to={"cserebere"}/>
            <Module title="places" color="#f4e6d4" icon="map-outline" to={"terkep"}/>
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
        <Image source={require('../assets/logo.png')} style={{width:50,height:50,zIndex:10}}/>
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

          <TextFor style={{fontWeight:'500'}} fixed text={title}/>
          {!!number && <MyText style={[styles.number,{right:50,top:60}]}>{number}</MyText>}
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
            <TextFor style={{ fontWeight: 'bold', color: isBright(props.color) }} fixed text={props.title}/>
          </Row> 
            <Icon name={props.icon} size={50} style={{alignSelf:'center'}} color={isBright(props.color)} />
            {!!number && <MyText style={styles.number}>{number}</MyText>}  
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

export default HomeScreen;