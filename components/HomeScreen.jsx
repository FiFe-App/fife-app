import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, View, TextInput, ScrollView, Pressable, Button} from 'react-native';
import {styles} from './styles'
import global from './global'
import { NavigationContainer, useNavigation, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useForm, Controller } from "react-hook-form";
import AppLoading from 'expo-app-loading';
import { useFonts, AmaticSC_700Bold  } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'
import {Profile} from './Profile'
import { LinearGradient } from "expo-linear-gradient";
import { Animated } from "react-native";


import { Search } from "./Search"

const Stack = createNativeStackNavigator();

export const HomeScreen = () => {
  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_200ExtraLight
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View>
      <NavigationContainer>
        <LogoTitle/>
        <Stack.Navigator initialRouteName="Profilom">
          <Stack.Screen name="Menu" component={Menu} options={{ headerShown:false}}/>
          <Stack.Screen name="Profilom" component={Profile} options={{ headerShown:false}}/>
          <Stack.Screen name="Kereses" component={Search} options={{ headerShown:false}}/>
        </Stack.Navigator>
      </NavigationContainer>
      <ScrollView contentContainerStyle={[styles.container, { flexDirection: "column" }]}>

      </ScrollView>
      <StatusBar style="auto" />
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
    <View>
      <Pressable onPress={onPress} >
        <Text  style={[styles.title,styles.body,{display:{header}}]}>
        FiFe. a közösség
        </Text>
      </Pressable>
      <View style={styles.body} >
        <SearchBar/>
      </View>
    </View>
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
    const pushAction = StackActions.push("Kereses", {key: data.text});
    navigation.dispatch(pushAction);
  };
  const [showHistory,setShowHistory] = React.useState(false);
  const listItems = global.searchList.reverse().map((element) =>
    <View key={element.toString()} style={styles.searchList}>
      <Text>{element}</Text>
    </View>
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

        <Button style={{flex:1}} color={"#f5d142"} title="Mehet" onPress={handleSubmit(onSubmit)} />
      </View>
      <View>{(showHistory && global.searchList.length > 0) && listItems} </View>
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
    <View style={styles.modules}>
      <Module title="Profilom" text="Szerkeszd a profilod." color="#9bde7c" to={"Profilom"} nav={navigation}/>
      <Module title="Üzeneteim" text="Beszélgess másokkal." color="#0052ff" />
      <Module title="Beállítások" text="" color="#bd05ff"/>
      <Module title="Kijelentkezés" text="" color="black"/>
    </View>
  );
}


function Module(props) {
  const onPress = () => props.nav.navigate(props.to)
  return (
      <LinearGradient colors={[props.color, "rgba(255,175,0,1)"]} start={{ x: 0, y: 0}} end={{ x: 0.5, y: 1}} style={moduleStyle(props.color)}>
        <Pressable  onPress={onPress}>
          <Text style={{ fontWeight: 'bold', color: isBright(props.color) }}>{props.title}</Text>
          <Text style={{ color: isBright(props.color) }}>{props.text}</Text>
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

