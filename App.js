import { StatusBar } from 'expo-status-bar';
import React, { useState, useContext, useEffect, Suspense } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// routes
const HomeScreen = React.lazy(()=>import("./components/HomeScreen"))
const LogoTitle = React.lazy(()=>import("./components/HomeScreen").then(module=>({default:module.LogoTitle})))
const LoginScreen = React.lazy(()=>import("./components/login/Login"))
const Search = React.lazy(()=>import("./components/Search"))
const Profile = React.lazy(()=>import("./components/profile/Profile"))
const First = React.lazy(()=>import("./components/first/First"))
const Edit = React.lazy(()=>import("./components/profile/Edit"))
const Messages = React.lazy(()=>import("./components/Messages"))
const Chat = React.lazy(()=>import("./components/Chat"))
const Sale = React.lazy(()=>import("./components/sale/Sale"))
const Item = React.lazy(()=>import("./components/sale/NewItem"))
const Events = React.lazy(()=>import("./components/events/Events"))
const Event = React.lazy(()=>import("./components/events/Event"))
const NewEvent = React.lazy(()=>import("./components/NewEvent"))
const New = React.lazy(()=>import("./components/New"))
const Maps = React.lazy(()=>import("./components/maps/Maps"))
const Settings = React.lazy(()=>import("./components/settings"))


import Snowfall from 'react-snowfall'

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Poppins_400Regular } from '@expo-google-fonts/poppins'
import { Lato_400Regular } from '@expo-google-fonts/lato'
import { Mulish_400Regular } from '@expo-google-fonts/mulish'


// routes
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';


import { Provider } from 'react-redux'
import FirebaseProvider from './firebase/firebase'
import { FirebaseContext } from './firebase/firebase';

import {store,persistor} from './components/store'
import { PersistGate } from 'redux-persist/integration/react'

import { useSelector } from 'react-redux'

import { Helmet } from 'react-helmet';

import { onMessage } from "firebase/messaging";
import { LinearGradient } from 'expo-linear-gradient';
import { Loading, MyText } from './components/Components';

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL('/');

export default function App(props) {
  const linking = useState({prefixes: [prefix]})

  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_400Regular,Mulish_400Regular
  });

  if (!fontsLoaded)
  return <LinearGradient colors={["#fcf3d4", "#fcf3d4"]} style={{flex:1}} start={{ x: 1, y: 0.5 }} end={{ x: 1, y: 1 }} />
    return (
          <Provider store={store}>
            <MetaHeader />
            <SnowfallWrap />
            <PersistGate loading={<MyText>Loading...</MyText>} persistor={persistor}>
              <FirebaseProvider>
                <Messaging/>
                  <SafeAreaProvider>
                    <StatusBar style="dark" translucent/>
                    <Suspense fallback={<Loading/>}>
                      <NavigationContainer linking={linking} 
                        fallback={<LinearGradient colors={["#fcf3d4", "#fcf3d4"]} style={{flex:1}} start={{ x: 1, y: 0.5 }} end={{ x: 1, y: 1 }} />}>
                        {fontsLoaded ? ( <Navigator/> ) : (<></>)}
                      </NavigationContainer>
                    </Suspense>
                  </SafeAreaProvider>
              </FirebaseProvider>
            </PersistGate>
        </Provider>
    );
}


const MetaHeader = () => {

  if (Platform.OS == 'web') {
    console.log('theme color');
    return (<Helmet>
      <meta name="theme-color" content="#FDEEA2"/>
      <title>FiFe App</title>
    </Helmet>)
  }
    
}

const SnowfallWrap = () => {
  const settings = useSelector((state) => state.user.settings)
  if (settings.snowfall) 
  return (
    <Snowfall
      style={{position:'absolute',zIndex:10}}
      snowflakeCount={200}
      color="#ffffff"/>
  )
  else return null
}

const Navigator = () => {
  const user = useSelector((state) => state.user);
  return (
    <Stack.Navigator initialRouteName="bejelentkezes" screenOptions={{ header: () => <LogoTitle />, title:"FiFe App"}}>
        <>
          <Stack.Screen name="bejelentkezes" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="az-approl" component={First} options={{ headerShown: false }} />
          {
          //  <Stack.Screen name="firebase-messaging-sw.js" component={ServiceWorkerRegistration} options={{ headerShown: false }} />
          }
            {user?.uid && <>
          <Stack.Screen name="fooldal" component={HomeScreen} />
          <Stack.Screen name="kereses" component={Search} />

          <Stack.Screen name="beallitasok" component={Settings} />
          
          <Stack.Screen name="profil" component={Profile} options={{ title: "Profil" }} />
          <Stack.Screen name="profil-szerkesztese" component={Edit} options={{ title: "Profil szerkesztése" }} />
          <Stack.Screen name="uzenetek" component={Messages} options={{ title: "Beszélgetések" }} />
          <Stack.Screen name="beszelgetes" component={Chat} options={{ title: "Beszélgetés" }} />

          <Stack.Screen name="terkep" component={Maps} />

          <Stack.Screen name="esemenyek" component={Events} options={{ title: "Események" }} />
          <Stack.Screen name="esemeny" component={Event} />
          <Stack.Screen name="uj-esemeny" component={NewEvent} options={{ title: "Új esemény" }} />

          <Stack.Screen name="unatkozom" component={New} options={{ title: "Unatkozom" }} />
          
          <Stack.Screen name="cserebere" component={Sale} options={{ title: "Cserebere" }} />
          <Stack.Screen name="uj-cserebere" component={Item} options={{ title: "Cserebere" }} />

          </>}
        </>
      
    </Stack.Navigator>
  )
}

const Messaging = () => {
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