import { StatusBar } from 'expo-status-bar';
import React, {Component,  } from 'react';
import { Image, Text, View, Button, TextInput} from 'react-native';

//firebase
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { getAuth, setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

import {HomeScreen} from './components/HomeScreen'
import {styles} from './components/styles'
import { database, loggedIn, user } from './components/global'
import { Search } from './components/Search';
import { useFonts, AmaticSC_700Bold  } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'
import {Loading} from './components/Effects'
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';

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
database = getDatabase(app);
const auth = getAuth();


const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcSls0bAAAAAKWFaKLih15y7dPDqp9qMqFU1rgG'),
  isTokenAutoRefreshEnabled: true
});

function updateState(isLoggedIn){
  this.setState({isLoggedIn})
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
    updateState = updateState.bind(this)
  }
  render() {
    let {isLoggedIn} = this.state;


    const renderAuthButton = () => {
      
      if (isLoggedIn) {
        return <HomeScreen/>;
      } else {
        return <LoginScreen loggedIn={isLoggedIn}/>;
      }
    }

    setPersistence(auth, browserSessionPersistence)
    .then(() => {
      //
      return signInWithEmailAndPassword(auth, email, password);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });
    //options={{ headerTitle: (props) => <LogoTitle {...props} />, headerBackVisible: false}}/>
    return renderAuthButton();
  }
}

const LoginScreen = (props) => {
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [loginError, onChangeLoginError] = React.useState("");
  

  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_200ExtraLight
  });
  return (
    
  <LinearGradient colors={["rgba(255,196,0,1)", "rgba(255,242,207,1)"]} start={{ x: 0, y: 0}} end={{ x: 1, y: 1}} style={styles.container}>
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
        textContentType = "password"
        secureTextEntry
        placeholder="Jelszó"
    />
    <Text style={styles.error} >{loginError}</Text>
    <Button style={styles.headline} title="Bejelentkezés" color="black" onPress={() =>
                    signIn(username,password,onChangeLoginError,props.loggedIn)
                  }/>
    <Loading color="yellow"/>
  </LinearGradient>
    );
};

function signIn(email,password,printMessage) {
  signInWithEmailAndPassword(auth, "macos.acos@gmail.com", "LEGOlego2000")
  .then((userCredential) => {
    // Signed in 
    user = userCredential.user;
    console.log(user.uid);
    updateState(true)
    // ...
  })
  .catch((error) => {
    if (error.code == "auth/invalid-email")
      printMessage("Nem működik ez az email cím :(");
    if (error.code == "auth/internal-error")
      printMessage("Sikertelen bejelentkezés");
    if (error.code == "auth/wrong-password")
      printMessage("Rossz jelszavat adtál meg :/");
    const errorCode = error.code;
    updateState(true);
    console.log(loggedIn)
    const errorMessage = error.message;
  });
}



