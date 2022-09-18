import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';

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
import {  } from 'react-native';

const Stack = createNativeStackNavigator();

export const HomeScreen = ({ navigation, route }) => {
  const [showHeader, setShowHeader] = useState(true);

  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_200ExtraLight
  });

  if (!fontsLoaded) {
    return <View />;
  }

  return (
  <Menu/>
  );
};

export function LogoTitle() {
  const navigation = useNavigation();
  const width = Dimensions.get('window').width

  return (
    <LinearGradient colors={['#f5d142', "rgba(255,175,0,0.7)"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
      <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
        { navigation.canGoBack && 
        <Pressable onPress={()=>navigation.goBack()} style={{justifyContent:'center'}}><Icon name='arrow-back' size={40} color="#000"/></Pressable>
        }
        <Pressable onPress={()=>navigation.navigate('home')}>
          <Text  style={[styles.title]}>FiFe. a közösség</Text>
        </Pressable>
        { width >  950 &&
        <View style={{flexDirection:'row',marginRight:20}}>
          <MenuLink title="Profilom" text="" color="#509955" link={"profile"} icon="person-outline" />
          <MenuLink title="Üzeneteim" color="#0052ff" icon="mail-outline" link={"messages"}/>
          <MenuLink title="Térképek" color="#f4e6d4" icon="map" link={"maps"}/>
          <MenuLink title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
          <MenuLink title="Unatkozom" text="" color="#b51d1d" link={"new"} icon="bulb" />
          <MenuLink title="Kijelentkezés" text="" color="black" link="login" with={{ logout: true }} icon="exit-outline" />
        </View>}
      </View>
      <View >
        <SearchBar/>
      </View>
    </LinearGradient>)
}

const Menu = ({ navigation, route }) => {
  return(
    <View style={styles.modules}>
        <Module title="Profilom" text="" color="#509955" to={"profile"} icon="person-outline" />
        <Module title="Üzeneteim" color="#0052ff" icon="mail-outline" to={"messages"}/>
        <Module title="Térképek" color="#f4e6d4" icon="map" to={"maps"}/>
        <Module title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
        <Module title="Unatkozom" text="" color="#b51d1d" to={"new"} icon="bulb" />
        <Module title="Kijelentkezés" text="" color="black" to="login" with={{ logout: true }} icon="exit-outline" />
    </View>
  );
}

const MenuLink = ({title,link}) => {
  const ref = useRef(null);

  const isHovered = useHover(ref);
  const navigation = useNavigation()
  const route = useRoute()
  return (
    <Pressable ref={ref}
      style={!isHovered && route.name != link ? styles.menuLink : [styles.menuLink,styles.menuLinkHover]}
      onPress={()=>navigation.navigate(link)}>
      <Text>{title}</Text>
    </Pressable>
  )
}


function Module(props) {
  const navigation = useNavigation();
  const onPress = (to) => {
    navigation.push(to, props.with);
  }
  return (
    <TouchableOpacity onPress={() => onPress(props.to)}>
      <LinearGradient colors={[props.color, "rgba(255,175,0,0.7)"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={moduleStyle(props.color)}>
        <Row style={{height:'100%'}}>
          <Text style={{ textAlignVertical: 'center', marginHorizontal: 12 }}><Icon name={props.icon} size={25} color="#fff" /></Text>
          <Col>
            <Text style={{ fontWeight: 'bold', color: isBright(props.color) }}>{props.title}</Text>
            <Text style={{ color: isBright(props.color) }}>{props.text}</Text>
          </Col>
        </Row>
      </LinearGradient>
    </TouchableOpacity>
  );
  
}

var moduleStyle = function(color) {
  return {
    width: widthPercentageToDP(47),
    height: heightPercentageToDP(17),
    marginVertical: 3,
    backgroundColor: color,
    borderWidth: 0,
    borderRadius: 10,
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

