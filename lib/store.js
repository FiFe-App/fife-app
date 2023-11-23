import userReducer from './userReducer'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistStore, persistReducer } from 'redux-persist'
import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './searchReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
}

const persistedReducerU = persistReducer(persistConfig, userReducer)
const persistedReducerS = persistReducer(persistConfig, searchReducer)

export const store = configureStore({reducer: { user: persistedReducerU, search: persistedReducerS}})
export const persistor = persistStore(store)