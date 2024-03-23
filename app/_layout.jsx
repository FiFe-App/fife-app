import React, { useContext, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Snowfall from 'react-snowfall';

import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

import { Redirect, Slot, Stack, usePathname } from 'expo-router';
import { Provider, useDispatch } from 'react-redux';
import FirebaseProvider, { FirebaseContext } from '../firebase/firebase';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../lib/store';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import { LinearGradient } from 'expo-linear-gradient';
import { onMessage } from 'firebase/messaging';
import BugModal from '../components/BugModal';
import { MyText } from '../components/Components';
import { LogoTitle } from '../components/LogoTitle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../lib/userReducer';
import Error from '../components/tools/Error';
import {ErrorBoundary} from 'react-error-boundary';
import BasePage from '../components/BasePage';
import Footer from '../components/Footer';


export const unstable_settings = {
  
  initialRouteName: 'index',
};

export default function Layout(props) {
  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_400Regular,SpaceMono_400Regular
  });

  const ErrorPage = () => {
    return (
        <BasePage>
          <Error/>
        </BasePage>
    )
  }



  if (!fontsLoaded)
  return <LinearGradient colors={['#fcf3d4', '#fcf3d4']} style={{flex:1}} start={{ x: 1, y: 0.5 }} end={{ x: 1, y: 1 }} />
  return (
        <ErrorBoundary FallbackComponent={ErrorPage}>
          <Provider store={store}>
            <SnowfallWrap />
              <FirebaseProvider>
                <MetaHeader />
                <BugModal/>
                <Navigator />
              </FirebaseProvider>
          </Provider>
        </ErrorBoundary>
  );
}


const MetaHeader = () => {

  if (Platform.OS == 'web') {
    return (<Helmet>
      <meta name="theme-color" content="#FDEEA2"/>
      <meta name="title" content="fife alkalmazás" />
      <meta name="description" content="A biztonságos online tér" />

      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://metatags.io/"/>
      <meta property="og:title" content="fife alkalmazás"/>
      <meta property="og:description" content="A biztonságos online tér"/>

      <meta property="twitter:card" content="summary_large_image"/>
      <meta property="twitter:url" content="https://metatags.io/"/>
      <meta property="twitter:title" content="fife alkalmazás"/>
      <meta property="twitter:description" content="A biztonságos online tér"/>
      
      <meta property="og:image" content="/web_splash.png"/>
      <meta property="twitter:image" content="/web_splash.png"/>
    </Helmet>)
  }
    
}

const SnowfallWrap = () => {
  const settings = useSelector((state) => state.user.settings)
  if (settings.snowfall) 
  return (
    <Snowfall
      style={{position:'absolute',zIndex:10,elevation: 10}}
      snowflakeCount={200}
      color="#fafafa"/>
  )
  else return null
}

const Messaging = () => {
  const {messaging} = useContext(FirebaseContext);
  useEffect(() => {
    console.log(!!messaging);
    if (messaging)
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // ...
    });  
  }, [messaging]);
  

}

const Navigator = () => {

  const noAuth = {'/bejelentkezes':false,'/rolunk':true,'/regisztracio':true}
  const route = usePathname();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch()

  useEffect(() => {

    (async ()=>{
      const loginAt = await AsyncStorage.getItem('loginAt')

      console.log('Login compute',Date.now()-loginAt);
      if (Date.now()-loginAt > 3600000) {
        dispatch(logout())
      }
      
    })()
  }, []);

  console.log('email',);
  if (!noAuth[route]) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    //return <Redirect href="/bejelentkezes" />;
  }

  return (
    <Stack
    screenOptions={{
      header: ()=><LogoTitle/>,
      
    }}/>
  )
}