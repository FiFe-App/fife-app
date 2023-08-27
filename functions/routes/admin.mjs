import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "firebase-admin/auth";

const router = express.Router();
const prisma = new PrismaClient()

router.get("/users", async (req, res) => {

  if (req.uid != '26jl5FE5ZkRqP0Xysp89UBn0MHG3') {
    res.send({error:'You are not an admin'})
    return
  }

  const match = {
    sale: req?.query?.category != undefined ? { category: Number(req?.query?.category) } : null,
    places: null
  }

  const u = await listAllUsers()
  console.log(u);
  res.send(u)
  return "gello"
  const results = await Promise.all(req.body.map(async data=>{
    let collection = await db.collection('users');
    return await collection.aggregate([
      {"$project": { "name": 1, "description":1, "created_at": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": match[data.collection]},
      {"$limit": 3}
    ]).toArray();
  }))
  res.send(results)
  return "hello";
});

router.get("/docs", async (req, res) => {

  if (req.uid != '26jl5FE5ZkRqP0Xysp89UBn0MHG3') {
    res.send({error:'You are not an admin'})
    return
  }

  const results = await prisma.document.findMany({
  })
  res.send(results)
  return "hello";
});

export default router;

const listAllUsers = async (nextPageToken) => {
  // List batch of users, 1000 at a time.
  return (await getAuth()
    .listUsers(1000, nextPageToken)
    .catch((error) => {
      console.log('Error listing users:', error);
    })).users;
};