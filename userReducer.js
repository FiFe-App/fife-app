
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice } from '@reduxjs/toolkit'

//let initialState = {uid: await AsyncStorage.getItem('uid')}
/*
export const userSlice = createSlice({
  name: 'user',
  initialState: {
    uid: ''
  },
  reducers: {
    getUid: async (state) => {
      const uid = await AsyncStorage.getItem('uid');
      if (uid)
        state.uid = uid.toString()
    },
    login: (state,action) => {
      state.uid = action.payload
      AsyncStorage.setItem('uid',action.payload.toString())
    },
    logout: (state,action) => {
      state.uid = action.payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { login, getUid } = userSlice.actions

export default userSlice.reducer
*/

export const userReducer = createSlice({
  name: 'user',
  initialState: {
    uid: null,
    unreadMessage: []
  },
  reducers: {
    login: (state,action) => {
      state.uid = action.payload
      AsyncStorage.setItem('uid',action.payload.toString())
    },
    logout: (state,action) => {
      state.uid = action.payload
      AsyncStorage.setItem('uid',null)
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

export const { login, logout, setUnreadMessage, removeUnreadMessage } = userReducer.actions

export default userReducer.reducer