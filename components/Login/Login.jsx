import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useContext, useEffect } from 'react';
//import { Image, Text, View, Button, TextInput } from 'react-native';
import { Text, View, Button, TextInput, StyleSheet, Dimensions, ScrollView } from 'react-native';
// routes

import { styles } from '../styles'

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Raleway_800ExtraBold } from '@expo-google-fonts/raleway';

import { LinearGradient } from "expo-linear-gradient";
import { FirebaseContext } from '../../firebase/firebase';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons'
import First from '../First/First';

const LoginScreen = ({ navigation, route }) => {
  const [canLogin, setCanLogin] = React.useState(route.params?.logout || false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const {app, auth, user, api}  = useContext(FirebaseContext);
  const height = Dimensions.get('window').height;
  const [scrollView, setScrollView] = useState(null);

  
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
      <ScrollView 
      ref={ref=>{setScrollView(ref)}}
      pagingEnabled={true}
      scrollsToTop={false}
      scrollEventThrottle={100}
      automaticallyAdjustContentInsets={false}
      directionalLockEnabled={true}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <LinearGradient colors={["rgba(255,196,0,1)", "rgba(255,242,207,1)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={localStyle.container}>
        <Text style={{fontSize:'12.85vw', fontFamily:'Raleway_800ExtraBold',color:'black',flex:2,marginTop:100}}>FiFe. A közösség</Text>
        <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center',flex:3}}>
            {!showLogin ?
            <Text onClick={()=>{setShowLogin(true);setShowRegister(false)}} style={[localStyle.title,{marginTop:'0%',cursor:'pointer',borderWidth:5,backgroundColor:'rgba(255,196,0,1)'}]}>Bejelentkezés</Text>:
            <LoginForm/>}
        </View>
        <View style={{alignItems:'center', justifyContent:'center',flex:1,cursor:'pointer'}} onClick={()=>{scrollView.scrollToEnd(true)}}>
          <Text style={{fontSize:30}}>Mi ez?</Text>
          <Icon name="chevron-down-outline" size={30}/>
        </View>
      </LinearGradient>
      <View style={{height:'100%'}}>
        <First scrollView={scrollView}/>
      </View>
      </ScrollView>
      
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
    <View style={{justifyContent:'center',alignSelf:'center',flex:1,maxWidth:300}}>
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
            onSubmitEditing={()=>signIn(username, password, onChangeLoginError)}
        />
      </View>
      <Text style={styles.error} >{loginError}</Text>
      <Button style={styles.headline} title="Bejelentkezés" color="black" onPress={() =>
        signIn(username, password, onChangeLoginError)
      } />
    </View>
  )
}
export const RegisterForm = ({setData}) => {
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
        //navigation.push('home') 
        setData(true)
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
    <View style={{alignSelf:'center',flex:1}}>
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

export const MoreInfoForm = ({setData}) => {
  const navigation = useNavigation()
  const [name, onChangeName] = useState('');
  const [bio, onChangeBio] = useState('');
  const [loginError, onChangeLoginError] = React.useState("");
  const {app, auth, user, api}  = useContext(FirebaseContext);

  useEffect(() => {
    console.log(name & bio);
    setData(name && bio)
  }, [name,bio]);
  return (
    <View style={{alignSelf:'center',flex:1}}>
      <View style={{flexWrap:'wrap'}}>
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangeName}
          editable
          placeholder="Neved"
        />
        <TextInput
          style={[styles.searchInput,{height:200}]}
          onChangeText={onChangeBio}
          editable
          numberOfLines={5}
          multiline
          placeholder="Rólad"
        />
      </View>
    </View>
  )
}

const localStyle = StyleSheet.create({
  container: {
    alignItems:'center',
    justifyContent:'flex-start',
    height:Dimensions.get('window').height,

    backgroundColor: '#fff',
  },
  title: {
    fontFamily: "Raleway_800ExtraBold",
    fontSize:'4.0vw', 
    marginHorizontal:27,
    color:'black',
    alignItems:'center'
  }
})

export default LoginScreen