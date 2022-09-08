// firebase.js
// contains the Firebase context and provider

import React, { createContext, useEffect, useState } from 'react'
import firebaseConfig from './firebaseConfig';
import { getAuth, signOut, setPersistence, signInWithEmailAndPassword, browserSessionPersistence, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { getDatabase } from "firebase/database";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { useDispatch } from 'react-redux';
import { getUid, login as sliceLogin } from '../userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';


// we create a React Context, for this to be accessible
// from a component later
const FirebaseContext = createContext(null)
export { FirebaseContext }

export default ({ children }) => {
    const [app,setApp] = useState(null)
    const [auth,setAuth] = useState(null)
    const [database,setDatabase] = useState(null)
    const [api,setApi] = useState(null)
    const dispatch = useDispatch()

    useEffect(()=>{init()},[])

    const loadUid = async () => {
        const app = auth ? app : await init()
        const auth = getAuth()
        onAuthStateChanged(auth,(user)=>{
            const uid = user.uid
            return uid
        })
    }

    const init = async () => {
        if (!app?.apps?.length) {
            //getUid();
            AsyncStorage.getItem('uid').then(uid=>console.log(uid))

            console.log("main uef")
            const appNew = initializeApp(firebaseConfig);
            /*const appcheck = initializeAppCheck(appNew, 
                { provider: new ReCaptchaV3Provider('6LcSls0bAAAAAKWFaKLih15y7dPDqp9qMqFU1rgG'),
                isTokenAutoRefreshEnabled: true}
            )*/

            setApp(appNew)
            setDatabase(getDatabase(appNew))
            setAuth(getAuth(appNew))
            setApi({
                    login,loadUid
                })
            return appNew;
        }
    }

    const login = async (user) => {
        let response = null
        if (!auth) {
            const retApp = await init()
            const a = getAuth(retApp)
            await signInWithEmailAndPassword(a, "macos.acos@gmail.com", "LEGOlego2000")
            .then((userCredential) => {
                console.log('signed in as ',userCredential.user.email);
                dispatch(sliceLogin(userCredential.user.uid))

                response = {success:true}
                
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(error);
            
                if (errorCode == "auth/invalid-email")
                    response = {error:"Rossz email adtál meg :("};
                else if (errorCode == "auth/internal-error")
                    response = {error:"Bejelentkezési hiba!"};
                else if (errorCode == "auth/wrong-password")
                    response = {error:"Rossz jelszavat adtál meg :/"};
                else
                    response = {error:"error: " + errorCode + " - " + errorMessage};
            });
        } else {
            onAuthStateChanged(auth,(user)=>{
                console.log('signed in as ',user.email);
                const uid = user.uid
                dispatch(sliceLogin(uid.toString()))
            })
            response = {success:true}
        }

        return response

    }

    return (
        <FirebaseContext.Provider value={{app,auth,database,api}}>
            {children}
        </FirebaseContext.Provider>
    )

}