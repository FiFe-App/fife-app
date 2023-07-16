
import db from "../db/conn.mjs";

import { getAuth } from 'firebase-admin/auth';

export function checkAuth(req, res, next) {
  if (req.headers.authtoken) {
    getAuth().verifyIdToken(req.headers.authtoken)
      .then((token) => {
        const uid = token.uid;
        req.uid = uid;

        getAuth().revokeRefreshTokens(uid)
        next()
      }).catch((err) => {
        console.log(err);
        res.status(403).send('Token expired')
      });
  } else {
    res.status(403).send('Unauthorized')
  }
}