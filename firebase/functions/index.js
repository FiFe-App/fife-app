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
        if (!change.after.exists()) return null;
        const newMsg = change.after.val()
        if (newMsg.from == context.params.uid) return null;
        const db = admin.database();
        const ref = db.ref('users/'+context.params.uid+'/data/fcm/token');
        ref.once("value", function(snapshot) {
            const token = snapshot.val();
            const payload = {
                token: token,
                notification: {
                    title: 'Új üzenet egy fifétől!',
                    body: newMsg.message,
                    icon: 'https://i.ibb.co/KxgW84L/logo.png',
                    click_action: "https://fifeapp.hu/uzenetek?selected="+context.params.uid,
                },
                data: {
                    body: newMsg.message,
                }
            };
            admin.messaging().send(payload).then((response) => {
                return {success: true};
            }).catch((error) => {
                return {error: error.code};
            });
        });
        return
    });

