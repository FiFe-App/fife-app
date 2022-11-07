  import { StatusBar } from 'expo-status-bar';
  import React, { useEffect, useState, useRef, useContext } from 'react';

  import { useHover } from 'react-native-web-hooks';

  import { Text, View, TextInput, ScrollView, Pressable, Button, TouchableOpacity, Dimensions} from 'react-native';
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
  import { Row, Col } from './Components'
  import Icon from 'react-native-vector-icons/Ionicons'

  import { SearchBar, OpenNav } from "./Components"
  import { FirebaseContext } from '../firebase/firebase';
  import { useSelector } from 'react-redux'
  import { child, get, ref } from 'firebase/database';

  import { useDispatch } from 'react-redux';
  import { TextFor } from '../textService/textService';
  const Stack = createNativeStackNavigator();

  export const HomeScreen = ({ navigation, route }) => {
    const {database, app, auth} = useContext(FirebaseContext);
    const uid = route?.params?.uid || useSelector((state) => state.user.uid)
    
    const dispatch = useDispatch()

    useEffect(() => {
      if (database) {
        const dbRef = ref(database);
        get(child(dbRef, `users/${uid}/data`)).then((snapshot) => {
          if (!snapshot.exists()) {
            navigation.push('about')
          }
        }).catch((error) => {
          console.error(error);
        });
      }
    }, [database]);

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
    const width = Dimensions.get('window').width
    const unreadMessage = useSelector((state) => state.user.unreadMessage)
    const [open, setOpen] = useState(false);

    const logout = () => {
      console.log('logout');
      api.logout()
    }

    return (
      <LinearGradient colors={['#FDE6A2', "#FDF5A2"]} style={{borderBottomWidth:2}} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
        <SafeAreaView>
          <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
            { navigation.canGoBack && 
              <Pressable onPress={()=>navigation.goBack()} style={{justifyContent:'center',alignItems:'center',flex:1}}><Icon name='arrow-back' size={30} color="#000"/></Pressable>
            }
            <Pressable onPress={()=>navigation.navigate('home')}>
              { width >  1230 && <Text style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe. <TextFor text="web_title"/></Text>}
              { width <=  1230 && width > 470 && <Text style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe App</Text>}
            </Pressable>
            { width >  1120 ?
            <View style={{flexDirection:'row',marginRight:20,marginBottom:5,flex:8}}>
              <Pressable style={{justifyContent:'center',alignItems:'center'}} onPress={()=>navigation.navigate('home')}>
              </Pressable>
              <SearchBar/>
              <MenuLink title="profile" text="" color="#509955" link={"profile"} icon="person-outline" />
              <MenuLink title="messages" color="#0052ff" icon="mail-outline" link={"messages"} number={unreadMessage?.length}/>
              <MenuLink title="sale" color="#f4e6d4" icon="shirt-outline" link={"sale"}/>
              <MenuLink title="places" color="#f4e6d4" icon="map" link={"maps"}/>
              <MenuLink title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
              <MenuLink title="Unatkozom" text="" color="#b51d1d" link={"new"} icon="bulb" />
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
            <MenuLink setOpen={setOpen} title="Főoldal" text="" color="#509955" link={"home"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="profile" text="" color="#509955" link={"profile"} icon="person-outline" />
            <MenuLink setOpen={setOpen} title="messages" color="#0052ff" icon="mail-outline" link={"messages"} number={unreadMessage?.length}/>
            <MenuLink setOpen={setOpen} title="sale" color="#f4e6d4" icon="shirt-outline" link={"sale"}/>
            <MenuLink setOpen={setOpen} title="places" color="#f4e6d4" icon="map" link={"maps"}/>
            <MenuLink setOpen={setOpen} title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
            <MenuLink setOpen={setOpen} title="Unatkozom" text="" color="#b51d1d" link={"new"} icon="bulb" />
            <MenuLink setOpen={setOpen} title="logout" text="" color="black" onPress={()=>logout()} icon="exit-outline" />
          </OpenNav>
        </SafeAreaView>
      </LinearGradient>)
  }

  const Menu = ({ navigation, route }) => {
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

  const MenuLink = ({title,link,number,setOpen,onPress}) => {
    const ref = useRef(null);
    const width = Dimensions.get('window').width

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
          {!!number && <Text style={styles.number}>{number}</Text>}
      </Pressable>
    )
  }

  function Module(props) {
    const { flat } = props;
    const number = useSelector((state) => state.user)[props?.number]?.length || 0
    const navigation = useNavigation();
    const onPress = (to) => {
      navigation.push(to, props.with);
    }
    return (
      <TouchableOpacity onPress={() => onPress(props.to)}>
        <View style={moduleStyle(props.color,flat)}>
          <Row style={{height: '80%' }}>
              <Text style={{ marginHorizontal: 12 }}><Icon name={props.icon} size={25} color={isBright(props.color)} /></Text>
              {!!number && <Text style={styles.number}>{number}</Text>}  
            <Col>
              <TextFor style={{ fontWeight: 'bold', color: isBright(props.color) }} text={props.title}/>
              <Text style={{ color: isBright(props.color) }}>{props.text}</Text>
            </Col>
          </Row>
        </View>
      </TouchableOpacity>
    );
    
  }

  var moduleStyle = function(color,flat) {
    return {
      width: flat ? widthPercentageToDP(97) : widthPercentageToDP(50),
      flex:1,
      
      backgroundColor: color,
      borderWidth: 1,
      padding: 10,
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
        margin:0,
      },
      hover: {
        backgroundColor:'white',
        borderRadius: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        margin:0,
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

