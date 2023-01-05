import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useContext } from 'react';
//import { Image, MyText, View, Button, TextInput } from 'react-native';
import { View, Button, TextInput } from 'react-native';
// routes

import { styles } from '../styles'

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'

import { LinearGradient } from "expo-linear-gradient";
import { FirebaseContext } from '../../firebase/firebase';
import { getAuth, signOut, setPersistence, signInWithEmailAndPassword, browserSessionPersistence, onAuthStateChanged } from "firebase/auth";
import { MyText } from '../Components';

const LoginScreen = ({ navigation, route }) => {
    const {app, auth, user, api}  = useContext(FirebaseContext);
    const [email, onChangeUsername] = React.useState("");
    const [password, onChangePassword] = React.useState("");
    const [loginError, onChangeLoginError] = React.useState("");
    const [canLogin, setCanLogin] = React.useState(route.params?.logout ? route.params.logout : false);
  
    const signIn = (email, password, printMessage) => {
      console.log('sign in');
      
      api.login(email, password).then((res) => {
        if (res?.success) {
          navigation.push('fooldal') 
        } else {
          onChangeLoginError(res?.error)
        }
      }).catch((error) => {
        console.error(error);
      })
     
    }
  
    React.useEffect(() => {
      if (api && !canLogin)
        api.login().then((res)=>{
          if (res?.success) {
            navigation.push('fooldal') 
            console.log('auto singed in');
          }
        })
      if (false) {
        onAuthStateChanged(auth,function (user) {
          if (user && !canLogin) {
            //api.login(user)
            navigation.push('fooldal')
          } else {
            setCanLogin(true)
            signOut(auth).then(() => {
              console.log('signed Out');
            }).catch((error) => {
              // An error happened.
            })
          }
        });
  
        setPersistence(auth, browserSessionPersistence)
        .then(() => {
          //
          console.log('auto sign in');
          signIn(email, password,'auto sign in');
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
      }
    }, []);
  
  
    let [fontsLoaded] = useFonts({
      AmaticSC_700Bold, Poppins_200ExtraLight
    });
    return (
      (fontsLoaded) &&
      <LinearGradient colors={["rgba(255,196,0,1)", "rgba(255,242,207,1)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
        <MyText style={styles.title} >FiFe. a közösség</MyText>
        <View style={{flexWrap:'wrap'}}>
          <TextInput
            style={styles.searchInput}
            onChangeText={onChangeUsername}
            autoCapitalize='none'
            editable
            placeholder="Email-cím"
            />
            <TextInput
            style={styles.searchInput}
            onChangeText={onChangePassword}
            autoCapitalize='none'
            editable
              textContentType="password"
              secureTextEntry
              placeholder="Jelszó"
            />
          </View>
          <MyText style={styles.error} >{loginError}</MyText>
          <Button style={styles.headline} title="Bejelentkezés" color="black"
          disabled={!email || !password}
          onPress={() =>
            signIn(email, password, onChangeLoginError)
          } />
          <MyText style={{margin:20,fontSize:20}}>Először vagy itt?</MyText>
          <Button style={styles.headline} title="Regisztráció" color="black"
          onPress={() =>
            navigation.navigate('az-approl')
          } />
        </LinearGradient>
  
    );
  };

export default LoginScreen