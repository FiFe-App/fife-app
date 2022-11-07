
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from '@reduxjs/toolkit'

export const userReducer = createSlice({
  name: 'user',
  initialState: {
    uid: null,
    userData: null,
    unreadMessage: [],
    settings: {
      randomTalk: false,
      fancyText: false
    }
  },
  reducers: {
    init : async (state) => {
      if (!state.uid) {
        const uid = await AsyncStorage.getItem('uid')
        console.log('async loaded uid',uid);
        if (uid) state.uid = uid
      }
    },
    login: (state,action) => {
      state.uid = action.payload
      AsyncStorage.setItem('uid',action.payload.toString())
      console.log('logged in as', action.payload.toString());
    },
    logout: (state,action) => {
      state.uid = null
      AsyncStorage.setItem('uid',null)
      console.log('logged out');
    },
    setUserData: (state,action) => {
      state.userData = action.payload;
    },
    setSettings: (state,action) => {
      state.settings = action.payload
    },
    setUnreadMessage: (state,action) => {
      if (!state.unreadMessage.includes(action.payload))
        state.unreadMessage.push(action.payload.toString())
    },
    removeUnreadMessage: (state,action) => {
      let arr = state.unreadMessage
      console.log('arr',arr);
      if (arr?.length)
        state.unreadMessage = arr.filter(function(item) {
          return item !== action.payload
        })
    }
  }
})

export const { init, login, logout, setUserData, setUnreadMessage, removeUnreadMessage, setSettings} = userReducer.actions

export default userReducer.reducer