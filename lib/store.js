import userReducer from './userReducer'


import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist'


import { configureStore } from '@reduxjs/toolkit'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const persistedReducer = persistReducer(persistConfig, userReducer)

export const store = configureStore({reducer: { user: persistedReducer}})
export const persistor = persistStore(store)