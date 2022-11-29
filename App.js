import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useContext, useEffect, useRef } from 'react';
//import { Image, Text, View, Button, TextInput } from 'react-native';
import { Text, View, Button, TextInput, Platform, Pressable } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ref, child, get, set, onValue, onChildAdded, off, limitToFirst, query, orderByChild, limitToLast } from "firebase/database";
// routes
import { HomeScreen, LogoTitle } from './components/HomeScreen';

import { styles } from './components/styles'
import LoginScreen from './components/login/Login';
import { Search } from './components/Search';
import { Profile } from "./components/profile/Profile";
import First from "./components/first/First";
import { Edit } from "./components/Edit";
import { Messages } from "./components/Messages";
import { Chat } from "./components/Chat";
import { Sale } from "./components/sale/Sale";
import { Item } from "./components/sale/Item";
import { Events } from "./components/events/Events";
import { Event } from "./components/events/Event";
import { NewEvent } from "./components/NewEvent";
import { New } from "./components/New";
import { Maps } from "./components/maps/Maps";
import Settings from './components/settings';

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'
import Icon from 'react-native-vector-icons/Ionicons'

import * as SplashScreen from 'expo-splash-screen';

// routes
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';


import { Provider } from 'react-redux'
import FirebaseProvider from './firebase/firebase'
import { FirebaseContext } from './firebase/firebase';

import {store,persistor} from './components/store'
import { PersistGate } from 'redux-persist/integration/react'

import { useSelector } from 'react-redux'

import { useDispatch } from 'react-redux';
import { init, removeUnreadMessage, setUnreadMessage } from './userReducer';
import { toldalek } from './textService/textService';
import { Helmet } from 'react-helmet';

import { getMessaging, onMessage } from "firebase/messaging";
import { getApp } from 'firebase/app';



//SplashScreen.preventAutoHideAsync();

//import * as ServiceWorkerRegistration from "./firebase-messaging-sw";

const Stack = createNativeStackNavigator();
const prefix = Linking.createURL('/');

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App(props) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [popups, setPopups] = useState([]);
  const notificationListener = useRef();
  const responseListener = useRef();
  const linking = useState({prefixes: [prefix]})

  useEffect(() => {

    if (Platform.OS == 'android') {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
    }
  }, []);



  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_200ExtraLight
  });

    return (
          <Provider store={store}>
            <MetaHeader />
            <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
              <FirebaseProvider>
                <Messaging/>
                <SafeAreaProvider>
                  <StatusBar style="dark" translucent/>
                  <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
                    {fontsLoaded ? ( <Navigator/> ) : (<></>)}
                  </NavigationContainer>
                </SafeAreaProvider>
              </FirebaseProvider>
            </PersistGate>
        </Provider>
    );
}


const Show = (props) => {
  const {user} = useContext(FirebaseContext);

  React.useEffect(() => {
    console.log('userShow',user);
  }, [user]);

  return (
    <Text>
      {'user:' + user?.uid}
    </Text>
  )
} 

const MetaHeader = () => {

  if (Platform.OS == 'web') {
    console.log('theme color');
    return (<Helmet>
      <meta name="theme-color" content="#FDEEA2"/>
    </Helmet>)
  }
    
}


const Navigator = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch()

  useEffect(() => {
    //dispatch(init());
  }, []);

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

          <Stack.Screen name="esemenyek" component={Events} options={{ title: "Események" }} />
          <Stack.Screen name="esemeny" component={Event} />
          <Stack.Screen name="uj-esemeny" component={NewEvent} options={{ title: "Új esemény" }} />

          <Stack.Screen name="unatkozom" component={New} options={{ title: "Unatkozom" }} />
          
          <Stack.Screen name="cserebere" component={Sale} options={{ title: "Cserebere" }} />
          <Stack.Screen name="uj-cserebere" component={Item} options={{ title: "Cserebere" }} />

          <Stack.Screen name="terkep" component={Maps} />
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

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.dev/notifications
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

