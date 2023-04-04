
import db from "../db/conn.mjs";

import { getAuth } from 'firebase-admin/auth';

export function checkAuth(req, res, next) {
  if (req.headers.authtoken) {
    getAuth().verifyIdToken(req.headers.authtoken)
      .then((token) => {
        const uid = token.uid;
        req.uid = uid;
        next()
      }).catch((err) => {
        console.log(err);
        res.status(403).send('Token expired')
      });
  } else {
    res.status(403).send('Unauthorized')
  }
}

export const listAllUsers = (nextPageToken) => {
    // List batch of users, 1000 at a time.
    getAuth()
      .listUsers(1000, nextPageToken)
      .then((listUsersResult) => {
        listUsersResult.users.forEach(async (userRecord) => {

          let collection = await db.collection("users");
          let newDocument = userRecord;
          newDocument.date = new Date();
          let result = await collection.insertOne(newDocument);
          console.log(result);
        });
        if (listUsersResult.pageToken) {
          // List next batch of users.
          listAllUsers(listUsersResult.pageToken);
        }
      })
      .catch((error) => {
        console.log('Error listing users:', error);
      });
  };

