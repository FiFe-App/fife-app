const functions = require("firebase-functions");
const admin = require('firebase-admin');

var serviceAccount = require("./firebase-service-key.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://fife-app-default-rtdb.firebaseio.com"
});

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started

// from uid -> to uid2
// --'/users/{uid}/messages/{uid2}/last'
// '/users/{uid2}/messages/{uid}/last'


exports.newMessage = functions.database.ref('/users/{uid}/messages/{uid2}/last')
    .onUpdate((change, context) => {
        // Exit when the data is deleted.
        if (!change.after.exists()) {
        return null;
        }
        const newMsg = change.after.val()
        if (newMsg.from == context.params.uid) return null;
        const db = admin.database();
        const ref = db.ref('users/'+context.params.uid+'/data/fcm/token');
        const name = db.ref('users/'+context.params.uid2+'/data/name');
        ref.once("value", function(snapshot) {
            name.once("value", function(nameSnapshot) {
            const token = snapshot.val();
            const name = nameSnapshot.val();
            const payload = {
                token: token,
                notification: {
                    title: 'Új üzenet egy fifétől!',
                    body: name+': '+newMsg.message,
                    image: 'https://i.ibb.co/KxgW84L/logo.png',
                },
                webpush: {
                  fcmOptions: {
                    link: "https://fifeapp.hu/uzenetek?selected="+newMsg.from
                  }
                },
                data: {
                    body: newMsg.message,
                }
            };

            admin.messaging().send(payload).then((response) => {
                // Response is a message ID string.
                return {success: true};
            }).catch((error) => {
                return {error: error.code};
            });
            })
        });

        //const token = 'fsBpyHigNXdS4tzjgSGKnj:APA91bHTOULlweGdtG6Oc6jdOjDdhaGr3DNR-KRhliE1e6RzRPukjNwHvBaYpzDM6Qb7HsrsHGjuKFqI5sP3gKg1ebeWTUKpkb8XuX9jkh_miEp2rd3BFreVdajFmnk-y_4yBJXvF5lM'

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
          // writing to the Firebase Realtime Database.
          // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
          return //change.after.ref.parent.child('uppercase').set(uppercase);
    });
