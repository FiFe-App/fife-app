import { StatusBar } from 'expo-status-bar';
import React, { Component, } from 'react';
import { Image, Text, View, Button, TextInput } from 'react-native';

//firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth, signOut, setPersistence, signInWithEmailAndPassword, browserSessionPersistence, onAuthStateChanged } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// routes
import { HomeScreen } from './components/HomeScreen';

import { styles } from './components/styles'
import { Search } from './components/Search';
import { Profile } from "./components/Profile";
import { Edit } from "./components/Edit";
import { Events } from "./components/Events";
import { Event } from "./components/Event";
import { NewEvent } from "./components/NewEvent";
import { New } from "./components/New";

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'


import { Loading } from './components/Components'
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from 'expo-splash-screen';
import { global } from './components/global.js'

// routes
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { NavigationContainer, useNavigation, StackActions } from '@react-navigation/native';

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 5000);

const firebaseConfig = {
  apiKey: "AIzaSyDtxKGHmZsnpg2R7CKdkLl8oNSag9lHykI",
  authDomain: "fife-app.firebaseapp.com",
  databaseURL: "https://fife-app-default-rtdb.firebaseio.com",
  projectId: "fife-app",
  storageBucket: "fife-app.appspot.com",
  messagingSenderId: "235592798960",
  appId: "1:235592798960:web:39d151f49b45c29ef82835",
  measurementId: "G-10X8R8XT3L"
};

const app = initializeApp(firebaseConfig);
global.database = getDatabase(app);
const auth = getAuth();

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL('/');


const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcSls0bAAAAAKWFaKLih15y7dPDqp9qMqFU1rgG'),
  isTokenAutoRefreshEnabled: true
});

function updateState(isLoggedIn) {
  this.setState({ isLoggedIn })
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: null,
      linking: {
        prefixes: [prefix],
      },
      config: {
        screens: {
          Chat: 'feed/:sort',
          Profile: 'user',
        },
      }

    };
    updateState = updateState.bind(this)

    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        //
        return signInWithEmailAndPassword(auth, email, password);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });

    auth.onAuthStateChanged(function (user) {
      if (user) {
        updateState(true)
      } else {
        //updateState(false)
      }
      console.log("user", user ? true : false);
    });
  }

  render() {

    return (
      <NavigationContainer linking={this.state.linking} config={this.state.config} fallback={<Text>Loading...</Text>}>
        {false && "loggen in:" + this.state.isLoggedIn}
        <Stack.Navigator initialRouteName="login">
          {true ? (
            <>
              <Stack.Screen name="profile" component={Profile} options={{ title: "profil" }} />
              <Stack.Screen name="event" component={Event} />
              <Stack.Screen name="search" component={Search} />
              <Stack.Screen name="events" component={Events} options={{ title: "Események" }} />
              <Stack.Screen name="new-event" component={NewEvent} options={{ title: "Új esemény" }} />
              <Stack.Screen name="edit-profile" component={Edit} />
              <Stack.Screen name="home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="new" component={New} options={{ headerShown: false }} />
              <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

const LoginScreen = ({ navigation, route }) => {
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [loginError, onChangeLoginError] = React.useState("");
  const [canLogin, setCanLogin] = React.useState(route.params?.logout ? route.params.logout : false);


  React.useEffect(() => {
    console.log(route);
    auth.onAuthStateChanged(function (user) {
      if (user && !canLogin) {
        navigation.push('home')
      } else {
        setCanLogin(true)
        signOut(auth).then(() => {
          console.log('signed Out');
        }).catch((error) => {
          // An error happened.
        })
      }
    });
  }, [auth, route]);


  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold, Poppins_200ExtraLight
  });
  return (
    
    (canLogin) &&
    <LinearGradient colors={["rgba(255,196,0,1)", "rgba(255,242,207,1)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <Text style={styles.title} >FiFe. a közösség</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={onChangeUsername}
        editable
        placeholder="Felhasználónév"
        />
        <TextInput
        style={styles.searchInput}
        onChangeText={onChangePassword}
        editable
          textContentType="password"
          secureTextEntry
          placeholder="Jelszó"
        />
        <Text style={styles.error} >{loginError}</Text>
        <Button style={styles.headline} title="Bejelentkezés" color="black" onPress={() =>
          signIn(username, password, onChangeLoginError)
        } />
        <Loading color="yellow" />
      </LinearGradient>

  );
};

function signIn(email, password, printMessage) {
  console.log(auth);
  signInWithEmailAndPassword(auth, "macos.acos@gmail.com", "LEGOlego2000")
    .then((userCredential) => {
      console.log(auth);
  // Signed in
      navigation.navigate('home')
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      if (errorCode == "auth/invalid-email")
        printMessage("Nem működik ez az email cím :(");
      else if (errorCode == "auth/internal-error")
        printMessage("Valami hiba történt");
      else if (errorCode == "auth/wrong-password")
        printMessage("Rossz jelszavat adtál meg :/");
      else
        printMessage("error: " + errorCode + " - " + errorMessage);
    });
}



