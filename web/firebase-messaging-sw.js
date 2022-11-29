importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDtxKGHmZsnpg2R7CKdkLl8oNSag9lHykI",
  authDomain: "fife-app.firebaseapp.com",
  databaseURL: "https://fife-app-default-rtdb.firebaseio.com",
  projectId: "fife-app",
  storageBucket: "fife-app.appspot.com",
  messagingSenderId: "235592798960",
  appId: "1:235592798960:web:39d151f49b45c29ef82835",
  measurementId: "G-10X8R8XT3L"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
});
