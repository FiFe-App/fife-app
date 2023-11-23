import { store } from "../lib/store"
import Constants from 'expo-constants';
import { setUserData } from "../lib/userReducer";
import { getAuth } from "firebase/auth";
import { Platform } from "react-native";

export const config = () => {
    const data = store.getState()

    return ({
      baseURL: 
      (process.env.NODE_ENV=='development' && Platform.OS == 'web' 
       ? 'http://localhost:8888' : 'https://fifeapp.hu')
      +'/.netlify/functions/index',
      headers: {
        'authtoken': data?.user?.userData?.authtoken,
      }
    })
}