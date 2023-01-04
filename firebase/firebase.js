// firebase.js
// contains the Firebase context and provider

import React, { createContext, useEffect, useState } from 'react'
import firebaseConfig from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, FacebookAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from "firebase/auth";

import { initializeApp } from 'firebase/app';
import { get, getDatabase, ref, set } from "firebase/database";
import { useDispatch } from 'react-redux';
import { login as sliceLogin, logout as sliceLogout, setName, setSettings, setUserData } from '../userReducer';
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

            setApp(appNew)
            appCheck(appNew)
            setDatabase(getDatabase(appNew))
            setFirestore(getFirestore(appNew))
            setStorage(getStorage(appNew))
            setAuth(getAuth(appNew))
            setApi({
                    login,loadUid,register,facebookLogin,logout
                })
            return appNew;
        }
    }

    const initMessaging = async (app,uid) => {
        const messaging = getMessaging(app);
        const db = getDatabase(app)
        await Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          }
        })
        setMessaging(messaging);
        getToken(messaging, { 
            vapidKey: 'BInTt__OonGUhBNBdQA57cu-VRHBm6N7vcsJBe_Q3o1Ei_2UgPSfM0ZzxyXsxohdrV_qooAywYzRilIv5OJ6VQE' ,
            //serviceWorkerRegistration: ''
        }).then((currentToken) => {
        if (currentToken) {
            console.log(currentToken);
            set(ref(db,'/users/'+uid+'/data/fcm'),{token:currentToken})
        } else {
            // Show permission request UI
            alert('Valami miatt nem lehet neked üzeneteket küldeni, talán le van tiltva a szolgáltatás?')
            console.log('No registration token available. Request permission to generate one.');
            // ...
        }
        }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
            alert('Valami miatt nem lehet neked üzeneteket küldeni, talán le van tiltva a szolgáltatás?')
        // ...
        });
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

    const logout = () => {
        const msg = getMessaging()
        if (msg) {
            deleteToken(msg).then(e=>console.log('token deleted?',e))
            dispatch(sliceLogout())
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
                dispatch(setUserData({
                    email:user.email,
                    emailVerified:user.emailVerified,
                    providerData:user.providerData,
                    createdAt:user.createdAt,
                    lastLoginAt:user.lastLoginAt
                }))
                if (firstLogin) {
                    response = {success:true}
                    return
                } 
                console.log(userCredential);

                dispatch(sliceLogin(user.uid))
                initMessaging(retApp,user.uid)

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
            
                if (errorCode == "auth/invalid-email")
                    response = {error:"Ez nem is egy email-cím!"};
                else if (errorCode == "auth/internal-error")
                    response = {error:"Hát... nem tudom mi történt bocs!"};
                else if (errorCode == "auth/wrong-password")
                    response = {error:"Lehet elírtad a jelszavad"};
                else if (errorCode == "auth/user-not-found")
                    response = {error:"Haver, nincs ilyen felhasználó!"}
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
                      return;
                      // All the other cases are external providers.
                      // Construct provider object for that provider.
                      // TODO: implement getProviderForProviderId.
                      var provider = getProviderForProviderId(methods[0]);
                      // At this point, you should let the user know that they already have an account
                      // but with a different provider, and let them validate the fact they want to
                      // sign in with this provider.
                      // Sign in to provider. Note: browsers usually block popup triggered asynchronously,
                      // so in real scenario you should ask the user to click on a "continue" button
                      // that will trigger the signInWithPopup.
                      auth.signInWithPopup(provider).then(function(result) {
                        // Remember that the user may have signed in with an account that has a different email
                        // address than the first one. This can happen as Firebase doesn't control the provider's
                        // sign in flow and the user is free to login using whichever account they own.
                        // Step 4b.
                        // Link to Facebook credential.
                        // As we have access to the pending credential, we can directly call the link method.
                        result.user.linkAndRetrieveDataWithCredential(pendingCred).then(function(usercred) {
                          // Facebook account successfully linked to the existing Firebase user.
                          goToApp();
                        });
                      });
                    });
                  }

                // ...
            });
        return response;
    }

    return (
        <FirebaseContext.Provider value={{app,auth,database,api,messaging,storage,firestore}}>
            {children}
        </FirebaseContext.Provider>
    )

}