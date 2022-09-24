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
import {Profile} from './Profile'
import { Edit } from './Edit'
import { Events } from './Events'
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";
import { global } from './global';
import { Row, Col } from './Components'
import Icon from 'react-native-vector-icons/Ionicons'

import { SearchBar } from "./Components"
import { FirebaseContext } from '../firebase/firebase';
import { useSelector } from 'react-redux'
import { child, get, ref } from 'firebase/database';

import { useDispatch } from 'react-redux';
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
  const navigation = useNavigation();
  const width = Dimensions.get('window').width
  const unreadMessage = useSelector((state) => state.user.unreadMessage)

  return (
    <LinearGradient colors={['#f5d142', "rgba(255,175,0,0.7)"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
      <SafeAreaView>
        <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
          { navigation.canGoBack && 
            <Pressable onPress={()=>navigation.goBack()} style={{justifyContent:'center'}}><Icon name='arrow-back' size={40} color="#000"/></Pressable>
          }
          <Pressable onPress={()=>navigation.navigate('home')}>
            <Text style={[styles.title,{fontFamily:'AmaticSC_700Bold'}]}>FiFe. a közösség</Text>
          </Pressable>
          { width >  950 &&
          <View style={{flexDirection:'row',marginRight:20,marginBottom:5}}>
            <SearchBar/>
            <MenuLink title="Profilom" text="" color="#509955" link={"profile"} icon="person-outline" />
            <MenuLink title="Üzeneteim" color="#0052ff" icon="mail-outline" link={"messages"} number={unreadMessage?.length}/>
            <MenuLink title="Térképek" color="#f4e6d4" icon="map" link={"maps"}/>
            <MenuLink title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
            <MenuLink title="Unatkozom" text="" color="#b51d1d" link={"new"} icon="bulb" />
            <MenuLink title="Kijelentkezés" text="" color="black" link="login" with={{ logout: true }} icon="exit-outline" />
          </View>}
        </View>
      </SafeAreaView>
    </LinearGradient>)
}

const Menu = ({ navigation, route }) => {
  return(
    <View style={styles.modules}>
        <Module title="Profilom" text="" color="#D8FFCD" to={"profile"} icon="person-outline" />
        <Module title="Üzeneteim" color="#CDEEFF" icon="mail-outline" to={"messages"} number={'unreadMessage'}/>
        <Module title="Térképek" color="#f4e6d4" icon="map-outline" to={"maps"}/>
        <Module title="Beállítások" text="" color="#FDCDFF" icon="flower-outline" />
        <Module title="Unatkozom" text="" color="#FF9D9D" to={"new"} icon="bulb-outline" />
        <Module title="Kijelentkezés" text="" color="#ECECEC" to="login" with={{ logout: true }} icon="exit-outline" />
    </View>
  );
}

const MenuLink = ({title,link,number}) => {
  const ref = useRef(null);

  const isHovered = useHover(ref);
  const navigation = useNavigation()
  const route = useRoute()
  return (
    <Pressable ref={ref}
      style={!isHovered && route.name != link ? styles.menuLink : [styles.menuLink,styles.menuLinkHover]}
      onPress={()=>navigation.navigate(link)}>
      <Row>
        <Text>{title}</Text>
        {!!number && <Text style={styles.number}>{number}</Text>}
      </Row>
    </Pressable>
  )
}

function Module(props) {
  const number = props?.number ? useSelector((state) => state.user[props.number]).length : 0
  const navigation = useNavigation();
  const onPress = (to) => {
    navigation.push(to, props.with);
  }
  return (
    <TouchableOpacity onPress={() => onPress(props.to)}>
      <View style={moduleStyle(props.color)}>
        <Row style={{height:'100%'}}>
            <Text style={{ textAlignVertical: 'center', marginHorizontal: 12 }}><Icon name={props.icon} size={25} color="#000" /></Text>
            {!!number && <Text style={styles.number}>{number}</Text>}  
          <Col>
            <Text style={{ fontWeight: 'bold', color: isBright(props.color) }}>{props.title}</Text>
            <Text style={{ color: isBright(props.color) }}>{props.text}</Text>
          </Col>
        </Row>
      </View>
    </TouchableOpacity>
  );
  
}

var moduleStyle = function(color) {
  return {
    width: widthPercentageToDP(47),
    height: heightPercentageToDP(25),
    
    marginVertical: 3,
    backgroundColor: color,
    borderWidth: 2,
    padding: 10,
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

