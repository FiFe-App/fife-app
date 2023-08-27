import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// routes
const HomeScreen = React.lazy(()=>import("./pages/home/HomeScreenOld"))
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
const Maps = React.lazy(()=>import("./pages/maps/MapsNew"))
const Settings = React.lazy(()=>import("./pages/settings"))
const BodyAndSoul = React.lazy(()=>import("./pages/BodyAndSoul"))
const Server = React.lazy(()=>import("./pages/server"))
const About = React.lazy(()=>import("./pages/About"))
const Forgot = React.lazy(()=>import("./pages/login/Forgot"))
const PrivacyPolicy = React.lazy(()=>import("./pages/PrivacyPolicy"))
const TermsAndServices = React.lazy(()=>import("./pages/TermsAndServices"))
const Document = React.lazy(()=>import("./pages/docs/Document"))
const AdminScreen = React.lazy(()=>import("./pages/admin/Admin"))
const CustomPage = React.lazy(()=>import("./components/custom/CustomPage"))

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
              <FirebaseProvider>
            <PersistGate loading={<MyText>Loading...</MyText>} persistor={persistor}>
                <Messaging/>
                <SafeAreaProvider>
                  <StatusBar style="dark" translucent/>
                  <Suspense fallback={<View style={{flex:1,backgroundColor:'#fcf3d4'}}><Loading/></View>}>
                    <NavigationContainer linking={linking} 
                    
                      fallback={<LinearGradient colors={["#fcf3d4", "#fcf3d4"]} style={{flex:1}} start={{ x: 1, y: 0.5 }} end={{ x: 1, y: 1 }} />}>
                      {fontsLoaded ? ( <Navigator/> ) : (<></>)}
                    </NavigationContainer>
                  </Suspense>
                </SafeAreaProvider>
            </PersistGate>
              </FirebaseProvider>
        </Provider>
    );
}


const MetaHeader = () => {

  if (Platform.OS == 'web') {
    console.log('theme color');
    return (<Helmet>
      <meta name="theme-color" content="#FDEEA2"/>
      <meta name="title" content="FiFe Alkalmazás" />
      <meta name="description" content="Sokrétű online felületet a nagyvárosban élőknek." />

      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://metatags.io/"/>
      <meta property="og:title" content="FiFe Alkalmazás"/>
      <meta property="og:description" content="Sokrétű online felületet a nagyvárosban élőknek."/>
      <meta property="og:image" content="https://fifeapp.hu/static/media/logo.d2acffec.png"/>

      <meta property="twitter:card" content="summary_large_image"/>
      <meta property="twitter:url" content="https://metatags.io/"/>
      <meta property="twitter:title" content="FiFe Alkalmazás"/>
      <meta property="twitter:description" content="Sokrétű online felületet a nagyvárosban élőknek."/>
      <meta property="twitter:image" content="https://fifeapp.hu/static/media/logo.d2acffec.png"/>
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
  useEffect(() => {
    console.log('user.uid',user);
  }, [user]);
  return (
    <Stack.Navigator initialRouteName="rolunk" 
    
    fallback={<View style={{backgroundColor:'#FDEEA2',flex:1}}></View>} 
    screenOptions={{ header: () => <LogoTitle />,headerStyle:{zIndex:100,elevation:100,position:'absolute'}, title:"FiFe App",}}>
        <>
          { !user?.uid && <>
          <Stack.Screen name="bejelentkezes" component={LoginScreen} options={{ headerShown: false, title:'Bejelentkezés' }} />
          <Stack.Screen name="rolunk" component={About} options={{ headerShown: false, title:"A FiFe Appról" }} />
          <Stack.Screen name="regisztracio" component={First} options={{ headerShown: false, title:'Regisztráció' }} />
          <Stack.Screen name="elfelejtett-jelszo" component={Forgot} options={{ headerShown: false, title:'Új jelszó' }} />
          </>
          //  <Stack.Screen name="firebase-messaging-sw.js" component={ServiceWorkerRegistration} options={{ headerShown: false }} />
          }
          { user?.uid == '26jl5FE5ZkRqP0Xysp89UBn0MHG3' && <>
          <Stack.Screen name="admin" component={AdminScreen} options={{ headerShown: false, title:'Admin' }} />
          </>
          //  <Stack.Screen name="firebase-messaging-sw.js" component={ServiceWorkerRegistration} options={{ headerShown: false }} />
          }
            {user?.uid && <>
          <Stack.Screen name="fooldal" component={HomeScreen} options={{title:'FiFe Főoldal'}} />
          <Stack.Screen name="kereses" component={Search} options={{title:'FiFe Keresés'}} />

          <Stack.Screen name="beallitasok" component={Settings} options={{title:'FiFe Beállítások'}}/>
          
          <Stack.Screen name="profil" component={Profile} options={{ title: "FiFe Profil" }} />
          <Stack.Screen name="profil-szerkesztese" component={Edit} options={{ title: "Profil szerkesztése" }} />
          <Stack.Screen name="uzenetek" component={Messages} options={{ title: "Beszélgetések" }} />
          <Stack.Screen name="beszelgetes" component={Chat} options={{ title: "Beszélgetés" }} />

          <Stack.Screen name="terkep" component={Maps} options={{title:'FiFe Térkép'}} />

          <Stack.Screen name="esemenyek" component={Events} options={{ title: "Események" }} />
          <Stack.Screen name="esemeny" component={Event} />
          <Stack.Screen name="uj-esemeny" component={NewEvent} options={{ title: "Új esemény" }} />
          
          <Stack.Screen name="cserebere" component={Sale} options={{ title: "Cserebere" }} />
          <Stack.Screen name="uj-cserebere" component={Item} options={{ title: "Cserebere" }} />

          <Stack.Screen name="cikkek" component={Document} options={{ title: "Cikkek" }} />
          <Stack.Screen name="test-es-lelek" component={BodyAndSoul} options={{ title: "Test és lélek" }} />
          <Stack.Screen name="custom" component={CustomPage} options={{ title: "Teszt" }} />
          

          </>}
          <Stack.Screen name="adatvedelem" component={PrivacyPolicy} options={{ headerShown: false }} />
          <Stack.Screen name="hasznalati-feltetelek" component={TermsAndServices} options={{ headerShown: false }} />
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