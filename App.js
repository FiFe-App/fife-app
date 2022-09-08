import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useContext } from 'react';
//import { Image, Text, View, Button, TextInput } from 'react-native';
import { Text, View, Button, TextInput } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// routes
import { HomeScreen, LogoTitle } from './components/HomeScreen';

import { styles } from './components/styles'
import LoginScreen from './components/Login/Login';
import { Search } from './components/Search';
import { Profile } from "./components/Profile";
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

export default function App(props) {
  const linking = useState({prefixes: [prefix]})
  const config = useState({
    screens: {
      Chat: 'feed/:sort',
      Profile: 'user',
    }
  })

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
                            <Stack.Screen name="home" component={HomeScreen} options={{ headerShown: false }} />
                            <Stack.Screen name="search" component={Search} />

                            <Stack.Screen name="profile" component={Profile} options={{ title: "Profil" }} />
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





