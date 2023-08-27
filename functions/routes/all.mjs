import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient()

router.get("/latest", async (req, res) => {

  const match = {
    sale: req?.query?.category != undefined ? { category: Number(req?.query?.category) } : null,
    places: null
  }

  const results = await Promise.all(req.body.map(async data=>{
    let collection = await db.collection(data.collection);
    return await collection.aggregate([
      {"$project": { "title": 1, "description":1, "created_at": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": match[data.collection]},
      {"$limit": 3}
    ]).toArray();
  }))
  res.send(results)
  return "hello";
});


export default router;
