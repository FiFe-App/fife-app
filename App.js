import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// routes
const HomeScreen = React.lazy(()=>import("./pages/home/HomeScreen"))
const LogoTitle = React.lazy(()=>import("./components/LogoTitle").then(module=>({default:module.LogoTitle})))
const LoginScreen = React.lazy(()=>import("./pages/login/Login"))
const Search = React.lazy(()=>import("./pages/Search"))
const Profile = React.lazy(()=>import("./pages/profile/Profile"))
const First = React.lazy(()=>import("./pages/first/First"))
const Edit = React.lazy(()=>import("./pages/profile/Edit"))
const Messages = React.lazy(()=>import("./pages/Messages"))
const Chat = React.lazy(()=>import("./pages/Chat"))
const Sale = React.lazy(()=>import("./pages/sale/Sale"))
const Item = React.lazy(()=>import("./pages/sale/NewItem"))
const Events = React.lazy(()=>import("./pages/events/Events"))
const Event = React.lazy(()=>import("./pages/events/Event"))
const NewEvent = React.lazy(()=>import("./pages/events/NewEvent"))
const New = React.lazy(()=>import("./pages/New"))
const Maps = React.lazy(()=>import("./pages/maps/Maps"))
const Settings = React.lazy(()=>import("./pages/settings"))
const BodyAndSoul = React.lazy(()=>import("./pages/BodyAndSoul"))
const Server = React.lazy(()=>import("./pages/server"))
const About = React.lazy(()=>import("./pages/About"))
const Forgot = React.lazy(()=>import("./pages/login/Forgot"))

import Snowfall from 'react-snowfall';

// fonts
import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

// routes
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';


import { Provider } from 'react-redux';
import FirebaseProvider, { FirebaseContext } from './firebase/firebase';

import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './lib/store';

import { useSelector } from 'react-redux';

import { Helmet } from 'react-helmet';

import { LinearGradient } from 'expo-linear-gradient';
import { onMessage } from "firebase/messaging";
import { Loading, MyText } from './components/Components';

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL('/');

export default function App(props) {
  const linking = useState({prefixes: [prefix]})

  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_400Regular,SpaceMono_400Regular
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
      style={{position:'absolute',zIndex:10,elevation: 10}}
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
          <Stack.Screen name="elfelejtett-jelszo" component={Forgot} options={{ headerShown: false }} />
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
          
          <Stack.Screen name="cserebere" component={Sale} options={{ title: "Cserebere" }} />
          <Stack.Screen name="uj-cserebere" component={Item} options={{ title: "Cserebere" }} />

          <Stack.Screen name="test-es-lelek" component={BodyAndSoul} options={{ title: "Test és lélek" }} />
          <Stack.Screen name="server" component={Server} options={{ title: "Teszt" }} />
          
          <Stack.Screen name="rolunk" component={About} options={{ title: "Rólunk" }} />

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