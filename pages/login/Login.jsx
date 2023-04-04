import React, { useContext, useEffect, useState } from 'react';
import { Animated, Button, Dimensions, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
// routes

import { styles } from '../../styles/styles';

// fonts
import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
import { Raleway_800ExtraBold } from '@expo-google-fonts/raleway';

import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from "expo-linear-gradient";
import { Helmet } from 'react-helmet';
import { useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { B, MyText, TextInput } from '../../components/Components';
import { FirebaseContext } from '../../firebase/firebase';
import First from '../first/First';


const LoginScreen = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
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
            navigation.push('fooldal') 
            console.log('auto singed in');
          }
        })
    }, []);

    const handleMoreInfo = () => {
      console.log('more');
      if (width <= 900)
        navigation.navigate('az-approl')
      else
        scrollView.scrollToEnd(true)
    }
  
  
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

      <Helmet>
        <meta name="theme-color" content="rgba(255,196,0,1)"/>
      </Helmet>
      <LinearGradient colors={["rgba(255,196,0,1)", "#fcf3d4"]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={localStyle.container}>
        {width > 900 ?
          <MyText style={{fontSize:'10vw', fontFamily:'Raleway_800ExtraBold',color:'black',flex:2,marginTop:100}}>
          FiFe App
        </MyText>
        : 
        <MyText style={{fontSize:100, fontFamily:'Raleway_800ExtraBold',color:'black',flex:2,marginTop:100,textAlign:'center'}}>
          FiFe App
        </MyText>
        }
        <MyText style={{fontSize:60, fontFamily:'SpaceMono_400Regular',color:'rgb(255, 217, 90)',backgroundColor:'black',textAlign:'right',paddingLeft:30,paddingRight:30}}>cserebere buzinessz</MyText>

        <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center',flex:3}}>
            {!true ?
            <MyText onClick={()=>{setShowLogin(true);setShowRegister(false)}} style={[localStyle.title,{marginTop:'0%',cursor:'pointer',borderWidth:5,backgroundColor:'rgba(255,196,0,1)'}]}>Bejelentkezés</MyText>:
            <LoginForm/>}
        </View>
        <View style={{alignItems:'center', justifyContent:'center',flex:1,cursor:'pointer'}} onClick={handleMoreInfo}>
          <MyText style={{fontSize:30}}>Csatlakozz!</MyText>
          <Icon name="chevron-down-outline" size={30}/>
        </View>
      </LinearGradient>
      {width > 900 &&
        <View style={{height:'100%'}}>
          <First scrollView={scrollView}/>
        </View>}
      </ScrollView>
      
    );
  };


const  LoginForm = () => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false);
  const [username, onChangeUsername] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [loginError, onChangeLoginError] = React.useState(null);
  const context  = useContext(FirebaseContext);
  const user = useSelector((state) => state.user)

  const signIn = (email, password, printMessage) => {
    console.log('sign in');
    setLoading(true)
    console.log(context);
    context?.api?.login(email,password).then((res) => {
      if (res?.success) {
        navigation.push('fooldal') 
        console.log('user',user);
      } else {
        onChangeLoginError(res?.error)
      }
    }).catch((error) => {
      console.error(error);
    }).finally(()=>{
      setLoading(false)
    })
    
  }

  const forgot = () => {
    navigation.push('elfelejtett-jelszo')
  }

  return (
    <View style={{justifyContent:'center',alignSelf:'center',alignItems:"center",flex:1}}>
      <View style={{flexDirection:'row',flex:1}}>
        <View style={{flexWrap:'wrap'}}>
          <TextInput
            style={[styles.searchInput,{width: width <= 900 ? 200 : 'none'} ]}
            onChangeText={onChangeUsername}
            editable
            placeholder="Email-cím"
          />
          <TextInput
            style={[styles.searchInput,{width: width <= 900 ? 200 : 'none'} ]}
            onChangeText={onChangePassword}
            editable
            textContentType="password"
            secureTextEntry
            placeholder="Jelszó"
            onSubmitEditing={()=>signIn(username, password, onChangeLoginError)}
          />
      </View>
      <Pressable style={{width:70,backgroundColor:'black',justifyContent:'center',alignItems:"center",margin:5}} 
        onPress={() => signIn(username, password, onChangeLoginError)}>
        {!loading ?
        <Icon name="arrow-forward-outline" color="white" size={40}/>
        :<Loading/>}
      </Pressable>
      </View>
      {!!loginError && <View style={styles.error}>
        <MyText style={{color:'#942400',fontSize:25}} >{loginError}</MyText>
        <Pressable onPress={forgot} style={{padding:10,borderRadius:8,backgroundColor:'black',marginTop:16}}>
          <MyText style={{color:'white'}}><B>Aj-aj nem tudok bejelentkezni!</B></MyText>
        </Pressable>
      </View>}
    </View>
  )
}
export const RegisterForm = ({setData,dataToAdd}) => {
  const navigation = useNavigation()
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [passwordAgain, onChangePasswordAgain] = React.useState("");
  const [loginError, onChangeLoginError] = React.useState("");
  const {app, auth, user, api}  = useContext(FirebaseContext);

  useEffect(() => {
    console.log(dataToAdd);
  }, []);

  const signUp = (email, password, printMessage) => {
    console.log('sign in');

    api.register(email,password,dataToAdd).then((res) => {
      console.log('res',res);
      if (res?.success) {
        api.login(email,password,true) 
        //setData(true)
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
        navigation.push('fooldal') 
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
      <MyText style={styles.error} >{loginError}</MyText>
      <Button style={styles.headline} title="Kész!" disabled={password != passwordAgain || password == ""} color="black" onPress={() =>
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
    setData({name,bio})
  }, [name,bio]);
  return (
    <View style={{flex:1}}>
      <View style={{}}>
        <TextInput
          style={styles.searchInput}
          onChangeText={onChangeName}
          editable
          placeholder="Neved, vagy ahogy szeretnéd, hogy szólítsanak:)"
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

const Loading = () => {
  const spinValue = new Animated.Value(0);

    // First set up animation 
    Animated.loop(
      Animated.timing(
        spinValue,
        {
         toValue: 1,
         duration: 600,
         easing: Easing.linear,
         useNativeDriver: false
        }
      )
     ).start();

  // Next, interpolate beginning and end values (in this case 0 and 1)
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (<Animated.View
    style={{transform: [{rotate: spin}] }}>
      <Icon name="arrow-forward-outline" color="white" size={40}/>
    </Animated.View>)
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