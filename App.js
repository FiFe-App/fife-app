import { StatusBar } from 'expo-status-bar';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ErrorBoundary from 'react-native-error-boundary';
import Hotjar from '@hotjar/browser';

const siteId = 3704200;
const hotjarVersion = 6;


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
const Maps = React.lazy(()=>import("./pages/maps/MapsNew"))
const Settings = React.lazy(()=>import("./pages/settings"))
const BodyAndSoul = React.lazy(()=>import("./pages/BodyAndSoul"))
const Server = React.lazy(()=>import("./pages/server"))
const About = React.lazy(()=>import("./pages/About"))
const Forgot = React.lazy(()=>import("./pages/login/Forgot"))
const PrivacyPolicy = React.lazy(()=>import("./pages/PrivacyPolicy"))
const TermsAndServices = React.lazy(()=>import("./pages/TermsAndServices"))
const Document = React.lazy(()=>import("./pages/docs/Document"))
const Post = React.lazy(()=>import("./pages/posts/Posts"))
const AdminScreen = React.lazy(()=>import("./pages/admin/Admin"))
const CustomPage = React.lazy(()=>import("./components/custom/CustomPage"))
const EmailVerification = React.lazy(()=>import("./pages/EmailVerification"))
const Logout = React.lazy(()=>import("./pages/Logout"))


import Snowfall from 'react-snowfall';
// fonts
import { AmaticSC_700Bold, useFonts } from '@expo-google-fonts/amatic-sc';
import { Poppins_400Regular } from '@expo-google-fonts/poppins';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono';

// routes
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';


import { Provider, useDispatch } from 'react-redux';
import FirebaseProvider, { FirebaseContext } from './firebase/firebase';

import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './lib/store';

import { useSelector } from 'react-redux';

import { Helmet } from 'react-helmet';

import { LinearGradient } from 'expo-linear-gradient';
import { onMessage } from "firebase/messaging";
import { Loading, MyText, NewButton, Row } from './components/Components';
import firebaseConfig from './firebase/firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserData } from './lib/userReducer';

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL('/');
  const config = {
    screens: {
      Home:  'fooldal',
      Login: 'bejelentkezes',
      Sale:  'cserebere',
      Map:   'terkep',
      About:  'asd',
      NotFound: '*',
    },
  };

export default function app(props) {
  const linking = useState({prefixes: [prefix],config})
  Hotjar.init(siteId, hotjarVersion);

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
                  <Suspense fallback={<View style={{flex:1,backgroundColor:'#fcf3d4'}}><Loading/></View>}>
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
      <meta name="title" content="fife alkalmazás" />
      <meta name="description" content="Sokrétű online felületet a nagyvárosban élőknek." />

      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://metatags.io/"/>
      <meta property="og:title" content="fife alkalmazás"/>
      <meta property="og:description" content="Sokrétű online felületet a nagyvárosban élőknek."/>
      <meta property="og:image" content="https://fifeapp.hu/static/media/logo.d2acffec.png"/>

      <meta property="twitter:card" content="summary_large_image"/>
      <meta property="twitter:url" content="https://metatags.io/"/>
      <meta property="twitter:title" content="fife alkalmazás"/>
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
  const navigation = useNavigation();
  const user = useSelector((state) => state.user);
  const [login, setLogin] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    (async ()=>{
      console.log('LOGIN');
      setLogin(await AsyncStorage.getItem('login') || false);
    })()
  }, []);
  useEffect(() => {
    console.log('user',user);
    console.log('verified',user?.userData?.emailVerified);
    console.log('authtoke',user?.userData?.authtoken);
    if (!user.userData?.authtoken) {
      onAuthStateChanged(getAuth(),async (user) => {
        console.log('state changed',!!user);
        if (user)
        user.getIdToken(false).then(token=>{
          console.log('token got',token);
          dispatch(setUserData({
            ...{...user},
            authtoken:token
          }))
        })
      })
    }
  }, [user]);
  if (login==null) return null;
  return (
    <ErrorBoundary
            onError={(e)=>console.log('error',e)}
            FallbackComponent={(e)=>
            <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#fcf3d4'}}>
              <MyText title>Hajaj valami hiba történt!</MyText>
              <MyText>{e.error.message}</MyText>
              <Row>
                <NewButton title='Próbáld meg újra!' style={{padding:10}} onPress={()=>location.reload()}/>
                <NewButton title='Vissza a főoldalra' style={{padding:10}} onPress={()=>location.href = 'fooldal'}/>
              </Row>
            </View>}
          >
      <Stack.Navigator  initialRouteName={login?"bejelentkezes":"rolunk"} 
      
      fallback={<View style={{backgroundColor:'#FDEEA2',flex:1}}></View>} 
      screenOptions={{ header: () => <LogoTitle />,headerStyle:{zIndex:100,elevation:100,position:'absolute'}, title:"fife app",}}>
          <>
            { !user?.uid && <>
            <Stack.Screen name="bejelentkezes" component={LoginScreen} options={{ headerShown: false, title:'Bejelentkezés' }} />
            <Stack.Screen name="rolunk" component={About} options={{ headerShown: false, title:"A fife appról" }} />
            <Stack.Screen name="regisztracio" component={First} options={{ headerShown: false, title:'Regisztráció' }} />
            <Stack.Screen name="elfelejtett-jelszo" component={Forgot} options={{ headerShown: false, title:'Új jelszó' }} />
            </>
            }
              {!!user?.uid && <>
              {user.userData.emailVerified ? <>
                <Stack.Screen name="fooldal" component={HomeScreen} options={{title:'fife főoldal'}} />
                <Stack.Screen name="kereses" component={Search} options={{title:'fife keresés'}} />

                <Stack.Screen name="beallitasok" component={Settings} options={{title:'fife beállítások'}}/>
                
                <Stack.Screen name="profil" component={Profile} options={{ title: "fife profil" }} />
                <Stack.Screen name="profil-szerkesztese" component={Edit} options={{ title: "profil szerkesztése" }} />
                <Stack.Screen name="uzenetek" component={Messages} options={{ title: "chatek" }} />
                <Stack.Screen name="beszelgetes" component={Chat} options={{ title: "chat" }} />

                <Stack.Screen name="terkep" component={Maps} options={{title:'fife térkép'}} />

                <Stack.Screen name="esemenyek" component={Events} options={{ title: "események" }} />
                <Stack.Screen name="esemeny" component={Event} />
                <Stack.Screen name="uj-esemeny" component={NewEvent} options={{ title: "új esemény" }} />
                
                <Stack.Screen name="cserebere" component={Sale} options={{ title: "cserebere" }} />
                <Stack.Screen name="uj-cserebere" component={Item} options={{ title: "új cserebere" }} />

                <Stack.Screen name="cikkek" component={Document} options={{ title: "cikkek" }} />
                <Stack.Screen name="blog" component={Post} options={{ title: "blog" }} />
                <Stack.Screen name="test-es-lelek" component={BodyAndSoul} options={{ title: "test és lélek" }} />
                <Stack.Screen name="custom" component={CustomPage} options={{ title: "teszt" }} />
                <Stack.Screen name="*" component={CustomPage} options={{ title: "teszt" }} />

              </>:<>
                <Stack.Screen name="email-ellenorzes" component={EmailVerification} options={{headerShown: false,title:'email ellenőrzés'}} />
              </> }

              <Stack.Screen name="kijelentkezes" component={Logout} options={{ headerShown: false }} />
            
            </>}

            { user?.uid == '26jl5FE5ZkRqP0Xysp89UBn0MHG3' && <>
            <Stack.Screen name="admin" component={AdminScreen} options={{ headerShown: false, title:'admin' }} />
            </>
            }
            <Stack.Screen name="adatvedelem" component={PrivacyPolicy} options={{ headerShown: false }} />
            <Stack.Screen name="hasznalati-feltetelek" component={TermsAndServices} options={{ headerShown: false }} />
          </>
        
      </Stack.Navigator>
    </ErrorBoundary>
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