import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient()

// Get a list of 50 posts
router.get("/", async (req, res) => {
    const {s} = req.query;
    console.log(s);

    const results = db.aggregate([
        { "$limit": 10 },
        { "$facet": {
          "c1": [
            { "$lookup": {
              "from": "sale",
              "pipeline": [
                { "$match": { "title": s } }
              ],
              "as": "collection1"
            }}
          ],
          "c2": [
            { "$lookup": {
              "from": "sale",
              "pipeline": [
                { "$match": { "description": "szia" } }
              ],
              "as": "collection2"
            }}
          ]
        }},
        { "$project": {
          "data": {
            "$concatArrays": [ "$c1", "$c2" ]
          }
        }},
        { "$unwind": "$data" },
        { "$replaceRoot": { "newRoot": "$data" } }
      ])
  res.send(results).status(200);
});

export default router;
