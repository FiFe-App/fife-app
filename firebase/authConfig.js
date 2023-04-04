import { store } from "../lib/store"
import Constants from 'expo-constants';

export const config = () => {
    const data = store.getState()
    console.log();
    return ({
      baseURL: 
      (process.env.NODE_ENV=='development' ? 'http://localhost:8888' : 'https://fifeapp.hu')
      +'/.netlify/functions/index',
      headers: {
        'authtoken': data.user.userData.authtoken,


      }
    })
}