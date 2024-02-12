import React, { useCallback, useContext } from 'react';
//import { Image, MyText, View, Button, TextInput } from 'react-native';
import { Button, TextInput, View } from 'react-native';
// routes

import { styles } from '../../styles/styles';

// fonts
import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins';

import { LinearGradient } from 'expo-linear-gradient';
import { MyText } from '../../components/Components';
import { FirebaseContext } from '../../firebase/firebase';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';

const LoginScreen = () => {
    const navigation = router;
    const params = useLocalSearchParams();
    const {app, auth, user, api}  = useContext(FirebaseContext);
    const [email, onChangeUsername] = React.useState('');
    const [password, onChangePassword] = React.useState('');
    const [loginError, onChangeLoginError] = React.useState('');
    const [canLogin, setCanLogin] = React.useState(params?.logout ? params.logout : false);
  
    const signIn = (email, password, printMessage) => {
      console.log('sign in');
      
      api.login(email, password).then((res) => {
        if (res?.success) {
          navigation.push('/') 
        } else {
          onChangeLoginError(res?.error)
        }
      }).catch((error) => {
        console.error(error);
      })
     
    }
    useFocusEffect(
      useCallback(() => {
        if (api && !canLogin)
          api.login().then((res)=>{
            if (res?.success) {
              navigation.push('/') 
              console.log('auto singed in');
            }
          })
        return () => {
        };
      }, [])
    );
  
    let [fontsLoaded] = useFonts({
      AmaticSC_700Bold, Poppins_200ExtraLight
    });
    return (
      (fontsLoaded) &&
      <LinearGradient colors={['rgba(255,196,0,1)', 'rgba(255,242,207,1)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
        <MyText style={styles.title} >fife. a közösség</MyText>
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
          <MyText style={{margin:20,fontSize:17}}>Először vagy itt?</MyText>
          <Button style={styles.headline} title="Regisztráció" color="black"
          onPress={() =>
            navigation.push('regisztracio')
          } />
        </LinearGradient>
  
    );
  };

export default LoginScreen