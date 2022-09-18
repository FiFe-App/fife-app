import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useContext, useEffect, useRef } from 'react';
//import { Image, Text, View, Button, TextInput } from 'react-native';
import { Text, View, Button, TextInput } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// routes
import { HomeScreen, LogoTitle } from './components/HomeScreen';

import { styles } from './components/styles'
import LoginScreen from './components/Login/Login';
import { Search } from './components/Search';
import { Profile } from "./components/Profile";
import First from "./components/First/First";
import { Edit } from "./components/Edit";
import { Messages } from "./components/Messages";
import { Chat } from "./components/Chat";
import { Events } from "./components/Events";
import { Event } from "./components/Event";
import { NewEvent } from "./components/NewEvent";
import { New } from "./components/New";
import { Maps } from "./components/Maps/Maps";

// fonts
import { useFonts, AmaticSC_700Bold } from '@expo-google-fonts/amatic-sc';
import { Poppins_200ExtraLight } from '@expo-google-fonts/poppins'

import { Loading } from './components/Components'
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from 'expo-splash-screen';
import { global } from './components/global.js'

// routes
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { NavigationContainer, useNavigation, StackActions } from '@react-navigation/native';

import { Provider } from 'react-redux'
import FirebaseProvider from './firebase/firebase'
import { FirebaseContext } from './firebase/firebase';

import {store,persistor} from './components/store'
import { PersistGate } from 'redux-persist/integration/react'


import { useDispatch } from 'react-redux'
import { login, logout } from './userReducer'
import { useSelector } from 'react-redux'
import { authIsReady } from 'react-redux-firebase';

import { getAuth, signOut, setPersistence, signInWithEmailAndPassword, browserSessionPersistence, onAuthStateChanged } from "firebase/auth";


SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 1);

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
  const notificationListener = useRef();
  const responseListener = useRef();
  const linking = useState({prefixes: [prefix]})
  const config = useState({
    screens: {
      Chat: 'feed/:sort',
      Profile: 'user',
    }
  })

useEffect(() => {
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
}, []);


  let [fontsLoaded] = useFonts({
    AmaticSC_700Bold,Poppins_200ExtraLight
  });

    return (
          <Provider store={store}>
            <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
              <FirebaseProvider>
                <SafeAreaProvider>
                  <NavigationContainer linking={linking} config={config} fallback={<Text>Loading...</Text>}>
                    {fontsLoaded ? (
                      <Stack.Navigator initialRouteName="login" screenOptions={{ header: () => <LogoTitle />}}>
                          <>
                            <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="home" component={HomeScreen} />
                            <Stack.Screen name="search" component={Search} />

                            <Stack.Screen name="profile" component={Profile} options={{ title: "Profil" }} />
                            <Stack.Screen name="about" component={First} options={{ title: "A FiFe Appról" }} />
                            <Stack.Screen name="edit-profile" component={Edit} options={{ title: "Profil szerkesztése" }} />
                            <Stack.Screen name="messages" component={Messages} options={{ title: "Beszélgetések" }} />
                            <Stack.Screen name="chat" component={Chat} options={{ title: "Beszélgetés" }} />

                            <Stack.Screen name="events" component={Events} options={{ title: "Események" }} />
                            <Stack.Screen name="event" component={Event} />
                            <Stack.Screen name="new-event" component={NewEvent} options={{ title: "Új esemény" }} />

                            <Stack.Screen name="new" component={New} options={{ title: "Unatkozom" }} />

                            <Stack.Screen name="maps" component={Maps} options={{ headerShown: false }} />
                          </>
                        
                      </Stack.Navigator>) : (
                          <>
                          </>
                    )}
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