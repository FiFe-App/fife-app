import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import { MongoClient } from "mongodb";

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)

let db = {}

const loadDb = async () => {
    initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://fife-app-default-rtdb.firebaseio.com'
    });
    
    const mongoClient = new MongoClient(process.env.ATLAS_URI);
    
    const clientPromise = mongoClient.connect();
    db = (await clientPromise).db('fifeapp');
    //db = database.collection('fifeapp');
}

export default loadDb().then(() => db)
