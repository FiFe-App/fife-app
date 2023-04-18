// firebase.js
// contains the Firebase context and provider

import React, { createContext, useEffect, useState } from 'react'
import firebaseConfig from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged,
    FacebookAuthProvider, signInWithPopup, fetchSignInMethodsForEmail, sendPasswordResetEmail } from "firebase/auth";

import { initializeApp } from 'firebase/app';
import { get, getDatabase, ref, set } from "firebase/database";
import { useDispatch, useSelector } from 'react-redux';
import { login as sliceLogin, logout as sliceLogout, removeUnreadMessage, setName, setSettings, setUnreadMessage, setUserData } from '../lib/userReducer';
import { Platform } from 'react-native';

import { getMessaging, getToken, deleteToken } from "firebase/messaging";
import { getStorage } from 'firebase/storage';
import { getFirestore } from '@firebase/firestore';

const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");

// we create a React Context, for this to be accessible
// from a component later
const FirebaseContext = createContext(null)
export { FirebaseContext }

export default ({ children }) => {
    const [app,setApp] = useState(null)
    const [auth,setAuth] = useState(null)
    const [database,setDatabase] = useState(null)
    const [storage,setStorage] = useState(null)
    const [firestore, setFirestore] = useState(null);
    const [api,setApi] = useState(null)
    const dispatch = useDispatch()
    const [messaging, setMessaging] = useState(null);
    const uid = useSelector((state) => state.user.uid);


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

            const appNew = initializeApp(firebaseConfig);

            setApi({
                    login,loadUid,register,facebookLogin,logout,forgotPassword
                })
            setApp(appNew)
            appCheck(appNew)
            setDatabase(getDatabase(appNew))
            setFirestore(getFirestore(appNew))
            setStorage(getStorage(appNew))
            setAuth(getAuth(appNew))
            return appNew;
        }
    }

    const initMessaging = async () => {
        const messaging = getMessaging();
        const db = getDatabase()
        console.log('msg init');
        await Notification.requestPermission().then((permission) => {
            console.log(permission);
          if (permission !== 'granted') {
            dispatch(removeUnreadMessage('notification'))
          } else {
            setMessaging(messaging);
            getToken(messaging, { 
                vapidKey: 'BInTt__OonGUhBNBdQA57cu-VRHBm6N7vcsJBe_Q3o1Ei_2UgPSfM0ZzxyXsxohdrV_qooAywYzRilIv5OJ6VQE' ,
                //serviceWorkerRegistration: ''
            }).then((currentToken) => {
            if (currentToken) {
                console.log(currentToken);
                console.log(uid);
                set(ref(db,'/users/'+uid+'/data/fcm'),{token:currentToken}).catch(err=>{
                    console.log(err);
                }).then(res=>{
                    console.log(res);
                })
            } else {
                // Show permission request UI
                //alert('Valami miatt nem lehet neked üzeneteket küldeni, talán le van tiltva a szolgáltatás?')
                console.log('No registration token available. Request permission to generate one.');
                // ...
            }
            }).catch((err) => {
                console.log('An error occurred while retrieving token. ', err);
                //alert('Valami miatt nem lehet neked üzeneteket küldeni, talán le van tiltva a szolgáltatás?')
            // ...
            });
          }
        }).catch(err=>{
            console.error(err);
        })
    }

    const appCheck = (app) => {

        // Pass your reCAPTCHA v3 site key (public key) to activate(). Make sure this
        // key is the counterpart to the secret key you set in the Firebase console.
        const appCheckObj = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LcSls0bAAAAAKWFaKLih15y7dPDqp9qMqFU1rgG'),

        // Optional argument. If true, the SDK automatically refreshes App Check
        // tokens as needed.
        isTokenAutoRefreshEnabled: true
        });
    }

    const forgotPassword = async (email) => {
        const retApp = await init()
        const a = getAuth(retApp)
        if (!email || email == '') return 'Email nélkül nem tudjuk visszaállítani a jelszavad'
        return sendPasswordResetEmail(a,email).then(res=>{
            return "Küldtünk egy emailt, amivel vissza tudod állítani a fiókodat a rendes kerékvágásba!\n(Nézd meg a spam mappát is!)"
        }).catch(err=>{
            console.log(err);
            console.log(err.code);
            if (err.code == 'auth/invalid-email')
                return 'Ez az email-cím nem szerepel a rendszerben:(';
            return 'Aj-aj hiba történt! Próbáld meg később légyszi'
        })
    }

    const logout = () => {
        const msg = getMessaging()
        if (msg) {
            deleteToken(msg).then(e=>console.log('token deleted?',e))
            .catch(err=>console.error(err))
            .finally(()=>{
                dispatch(sliceLogout())
            })
        }
    }

    const login = async (email, password, firstLogin) => {
        let newEmail = email
        let newPass = password
        let response = null
        if (!auth) {
            const retApp = await init()
            const a = getAuth(retApp)
            await signInWithEmailAndPassword(a, newEmail, newPass)
            .then((userCredential) => {
                const user = userCredential.user
                userCredential.user.getIdToken().then(token=>{
                    console.log(token);

                    dispatch(setUserData({
                        authtoken:token,
                        email:user.email,
                        emailVerified:user.emailVerified,
                        providerData:user.providerData,
                        createdAt:user.createdAt,
                        lastLoginAt:user.lastLoginAt
                    }))

                })
                if (firstLogin) {
                    response = {success:true}
                    return
                } 
                console.log(userCredential);

                dispatch(sliceLogin(user.uid))

                const dbRef = ref(getDatabase(retApp),'users/' + user.uid + "/settings");
                get(dbRef).then((snapshot) => {
                if (snapshot.exists()) {
                    dispatch(setSettings(snapshot.val()))
                }
                
                })
                const nameRef = ref(getDatabase(retApp),'users/' + user.uid + "/data/name");
                get(nameRef).then((snapshot) => {
                if (snapshot.exists()) {
                    dispatch(setName(snapshot.val()))
                    console.log(snapshot.val());
                }
                
                })
                response = {success:true}
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(error);
            
                if (errorCode == "auth/invalid-email" || errorCode == "auth/user-not-found")
                    response = {error:"Bakfitty! Nem jó az email cím, amit megadtál!"};
                else if (errorCode == "auth/internal-error")
                    response = {error:"Bocsi, a szerveren hiba történt!"};
                else if (errorCode == "auth/wrong-password")
                    response = {error:"Bakfitty! Lehet elírtad a jelszavad"};
                else
                    response = {error:"error: " + errorCode + " - " + errorMessage};
            });
        } else {
            await signInWithEmailAndPassword(auth, newEmail, newPass)
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
        }

        return response

    }

    const register = async (email,password,data) => {
        const app = auth ? app : await init()
        let response = null
        const auth = getAuth();
        const db = getDatabase();
        await createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                // Signed in 
                console.log('signed in as ',userCredential.user.email);
                const LoginRes = await login(email,password,true);
                if (LoginRes?.success) {
                    dispatch(sliceLogin(userCredential.user.uid))
                    await set(ref(db,`users/${userCredential.user.uid}/data`),data).then(()=>{
                        response = {success:true}
                    })
                }
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                if (errorCode == "auth/invalid-email")
                    response = {error:"Nem jó az email, amit megadtál :("};
                else if (errorCode == "auth/weak-password")
                    response = {error:"A jelszavad nem elég bonyi\nlegyen legalább 6 karakter"};
                else if (errorCode == "auth/wrong-password")
                    response = {error:"Rossz jelszavat adtál meg :/"};
                else
                    response = {error:"error: " + errorCode + " - " + errorMessage};
                console.log(response);
            });
        return response
    }

    const facebookLogin = async () => {
        const auth = getAuth();
        let response = null
        auth.languageCode = 'hu';
        console.log('fb-login');
        const provider = new FacebookAuthProvider();
        await signInWithPopup(auth, provider)
            .then((result) => {
                // The signed-in user info.
                const user = result.user;
                dispatch(sliceLogin(result.user.uid))

                response = {success:true}

                // This gives you a Facebook Access Token. You can use it to access the Facebook API.
                const credential = FacebookAuthProvider.credentialFromResult(result);
                const accessToken = credential.accessToken;

                // ...
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                //const email = error.customData.email;
                // The AuthCredential type that was used.
                const credential = FacebookAuthProvider.credentialFromError(error);
                response = {error:"error: " + errorCode + " - " + errorMessage};
                if (errorCode === 'auth/account-exists-with-different-credential') {
                    var pendingCred = error.credential;
                    var email = error.email;
                    // Get sign-in methods for this email.
                    fetchSignInMethodsForEmail(auth,email).then(function(methods) {
                      // Step 3.
                      // If the user has several sign-in methods,
                      // the first method in the list will be the "recommended" method to use.
                      if (methods[0] === 'password') {
                        // Asks the user their password.
                        // In real scenario, you should handle this asynchronously.
                        var password = "password"//promptUserForPassword(); // TODO: implement promptUserForPassword.
                        auth.signInWithEmailAndPassword(email, password).then(function(result) {
                          // Step 4a.
                          return result.user.linkWithCredential(pendingCred);
                        }).then(function() {
                          // Facebook account successfully linked to the existing Firebase user.
                          response = {success:true}
                        });
                        return;
                      }
                      response = {error:'facebook login error'}
                    });
                  }

                // ...
            });
        return response;
    }

    return (
        <FirebaseContext.Provider value={{app,auth,database,api,messaging,storage,firestore,initMessaging}}>
            {children}
        </FirebaseContext.Provider>
    )

}