import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useContext } from 'react';
//import { Image, Text, View, Button, TextInput } from 'react-native';
import { Text, View, Button, TextInput, StyleSheet, Dimensions } from 'react-native';
// routes

import { styles } from '../styles'

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Raleway_800ExtraBold } from '@expo-google-fonts/raleway';

import { LinearGradient } from "expo-linear-gradient";
import { FirebaseContext } from '../../firebase/firebase';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const LoginScreen = ({ navigation, route }) => {
  const [canLogin, setCanLogin] = React.useState(route.params?.logout || false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const {app, auth, user, api}  = useContext(FirebaseContext);

  
    React.useEffect(() => {
      if (api && !canLogin)
        api.login().then((res)=>{
          if (res?.success) {
            navigation.push('home') 
            console.log('auto singed in');
          }
        })
    }, []);
  
  
    let [fontsLoaded] = useFonts({
      AmaticSC_700Bold, Raleway_800ExtraBold
    });
    return (
      (fontsLoaded) &&
      <LinearGradient colors={["rgba(255,196,0,1)", "rgba(255,242,207,1)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={localStyle.container}>
        <Text style={{fontSize:'12.85vw', fontFamily:'Raleway_800ExtraBold',color:'white',flex:3,marginTop:100}}>FiFe. A közösség</Text>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',flex:5,width:'100%',display:'flex'}}>
          <View style={{flex:1}}>
            {!showLogin ?
            <Text onClick={()=>{setShowLogin(true);setShowRegister(false)}} style={[localStyle.title,{marginTop:'0%',cursor:'pointer'}]}>Bejelentkezés</Text>:
            <LoginForm/>}
            <RegisterForm/>
          </View>
          <View style={{flex:1,alignItems:'flex-end',marginTop:'10%'}}>
            {!showRegister ?
            <Text onClick={()=>{setShowLogin(false);navigation.navigate('about')}} style={[localStyle.title,{marginTop:'0%',cursor:'pointer'}]}>Regisztráció</Text>:
            <RegisterForm/>}  
          </View>      
        </View>
      </LinearGradient>
      
    );
  };


const  LoginForm = () => {
  const navigation = useNavigation()
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [loginError, onChangeLoginError] = React.useState("");
  const {api}  = useContext(FirebaseContext);
  const user = useSelector((state) => state.user)

  const signIn = (email, password, printMessage) => {
    console.log('sign in');
    api.login(email,password).then((res) => {
      if (res?.success) {
        navigation.push('home') 
        console.log('user',user);
      } else {
        onChangeLoginError(res?.error)
      }
    }).catch((error) => {
      console.error(error);
    })
    
  }
  return (
    <View style={{justifyContent:'center',alignSelf:'center',flex:1}}>
      <View style={{flexWrap:'wrap'}}>
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangeUsername}
          editable
          placeholder="Email-cím"
        />
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangePassword}
          editable
            textContentType="password"
            secureTextEntry
            placeholder="Jelszó"
        />
      </View>
      <Text style={styles.error} >{loginError}</Text>
      <Button style={styles.headline} title="Bejelentkezés" color="black" onPress={() =>
        signIn(username, password, onChangeLoginError)
      } />
    </View>
  )
}
const RegisterForm = () => {
  const navigation = useNavigation()
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [passwordAgain, onChangePasswordAgain] = React.useState("");
  const [loginError, onChangeLoginError] = React.useState("");
  const {app, auth, user, api}  = useContext(FirebaseContext);

  const signUp = (email, password, printMessage) => {
    console.log('sign in');

    api.register(email,password).then((res) => {
      console.log('res',res);
      if (res?.success) {
        navigation.push('home') 
      } else {
        onChangeLoginError(res?.error)
      }
    }).catch((error) => {
      console.error('error',error);
    })
    
  }
  const fbLogin = () => {
    api.facebookLogin().then((res) => {
      console.log('res',res);
      if (res?.success) {
        navigation.push('home') 
      } else {
        onChangeLoginError(res?.error)
      }
    }).catch((error) => {
      console.error('error',error);
    })
  }
  return (
    <View style={{justifyContent:'center',alignSelf:'center',flex:1}}>
      <View style={{flexWrap:'wrap'}}>
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangeEmail}
          editable
          placeholder="Email-cím"
        />
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangePassword}
          editable
            textContentType="password"
            secureTextEntry
            placeholder="Jelszó"
        />
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangePasswordAgain}
          editable
            textContentType="password"
            secureTextEntry
            placeholder="Jelszó újra"
        />
      </View>
      <Text style={styles.error} >{loginError}</Text>
      <Button style={styles.headline} title="Regisztráció" disabled={password != passwordAgain || password == ""} color="black" onPress={() =>
        signUp(email,password)
      } />
      <Button title="Facebook Bejelentkezés"  onPress={fbLogin} color="#4267B2"/>
    </View>
  )
}

const localStyle = StyleSheet.create({
  container: {
    alignItems:'center',
    justifyContent:'flex-start',
    flex:1,
    margin: -30,

    backgroundColor: '#fff',
  },
  title: {
    fontFamily: "Raleway_800ExtraBold",
    fontSize:'6.89vw', 
    marginHorizontal:27,
    color:'white',
    alignItems:'center'
  }
})

export default LoginScreen