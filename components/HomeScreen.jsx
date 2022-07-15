import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, ScrollView, Pressable, Button} from 'react-native';
import { styles } from './styles';
import { NavigationContainer, useNavigation, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useForm, Controller } from "react-hook-form";
import AppLoading from 'expo-app-loading';
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


import { Search } from "./Search"

const Stack = createNativeStackNavigator();

export const HomeScreen = () => {
  const [showHeader, setShowHeader] = useState(true);
  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_200ExtraLight
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View>
      <Menu />
    </View>

  );
};


function LogoTitle() {
  const [header,setHeader] = React.useState("block");
  const navigation = useNavigation();
  const onPress = () => navigation.navigate("Menu");

  useEffect(() => {
    if (global.showHeader) setHeader("block")
    else setHeader("none");
  }, [global.showHeader]);
//
  return (
    <LinearGradient colors={['#f5d142', "rgba(255,175,0,0.7)"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} >
      <Pressable onPress={onPress} >
        <Text  style={[styles.title,styles.body,{display:{header}}]}>
        FiFe. a közösség
        </Text>
      </Pressable>
      <View style={styles.body} >
        <SearchBar/>
      </View>
    </LinearGradient>
  );
}

const SearchBar = () => {
  const allMethods = useForm();
  const { setFocus } = allMethods;
  const navigation = useNavigation();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      text: ''
    }
  });
  const onSubmit = data => {
    if (global.searchList.includes(data.text))
      global.searchList.splice(global.searchList.indexOf(data.text), 1);
    global.searchList.push(data.text);
    setShowHistory(false);
    navigation.push("search", { key: data.text });
  };
  const [showHistory,setShowHistory] = React.useState(false);
  const listItems = global.searchList.reverse().map((element) =>
    <Row key={element.toString()} style={styles.searchList}>
      <Icon name="time-outline" size={25} color="black" style={{ marginHorizontal: 5 }} />
      <Text>{element}</Text>
    </Row>
  );
  return (
    <View>
      <View style={{flexDirection: 'row',alignItems: 'center'}}>
        <Controller control={control} rules={{ required: true, }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.searchInput,{flex:7}]}
              onBlur={onBlur}
              onChangeText={onChange}
              placeholder="Keress valamire..."
              onSubmitEditing={handleSubmit}
              value={value}
              onClick={()=>setShowHistory(true)}
            />
          )}
          name="text"
        />

        <Pressable style={{ flex: 1, width: '100px' }} onPress={handleSubmit(onSubmit)} >
          <Icon name="search-outline" size={25} color="black" />
        </Pressable>
      </View>
      {(showHistory && global.searchList.length > 0) && listItems}
    </View>
  );

}


function open(screen) {
  if (screen == undefined)
  global.screen = null;
  else
  global.screen = screen;
  console.log(global.screen)
}
  
const Menu = ({ navigation, route }) => {
  return(
    <>
      <LogoTitle />
    <View style={styles.modules}>
        <Module title="Profilom" text="" color="#9bde7c" to={"profile"} icon="person-outline" />
        <Module title="Üzeneteim" color="#0052ff" icon="mail-outline" />
        <Module title="Események" color="#f7316a" icon="today-outline" to={"events"}/>
        <Module title="Beállítások" text="" color="#bd05ff" icon="flower-outline" />
        <Module title="Unatkozom" text="" color="#135c46" to={"new"} icon="bulb" />
        <Module title="Kijelentkezés" text="" color="black" to="login" with={{ logout: true }} icon="exit-outline" />
    </View>
    </>
  );
}


function Module(props) {
  const navigation = useNavigation();
  const onPress = (to) => {
    navigation.push(to, props['with']);
  }
  return (
    <LinearGradient colors={[props.color, "rgba(255,175,0,0.7)"]} start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }} style={moduleStyle(props.color)}>
      <Pressable onPress={() => onPress(props.to)}>
        <Row>
          <Text style={{ textAlignVertical: 'center', marginHorizontal: 12 }}><Icon name={props.icon} size={25} color="#fff" /></Text>
          <Col>
            <Text style={{ fontWeight: 'bold', color: isBright(props.color) }}>{props.title}</Text>
            <Text style={{ color: isBright(props.color) }}>{props.text}</Text>
          </Col>
        </Row>
        </Pressable>
      </LinearGradient>
  );
  
}

var moduleStyle = function(color) {
  return {
    marginVertical: 3,
    backgroundColor: color,
    borderWidth: 0,
    borderRadius: 10,
    padding: 10,
    width: '47%'
  }
}

var isBright = function(color) {
  var textCol = "black";
  var c = color.substring(1);      // strip #
  var rgb = parseInt(c, 16);   // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff;  // extract red
  var g = (rgb >>  8) & 0xff;  // extract green
  var b = (rgb >>  0) & 0xff;  // extract blue

  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

  if (luma < 100) {
      textCol = "white";
  }

  return textCol;
}

