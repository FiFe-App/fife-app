import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { query, ref } from "firebase/database";
import { getDatabase } from "firebase-admin/database";

const router = express.Router();
const prisma = new PrismaClient()

router.get("/latest", async (req, res) => {

  const filters = req.query;

  console.log('filters',filters);
  const db = await adb

  const results = {
    places: filters?.places=='true' ? {
        title: "Helyek amiket megismerhetsz",
        link: 'terkep',
        id: 'places',
        data: await (await db.collection("place")).aggregate([
        {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
        {"$sort": {"created_at": -1}},
        {"$limit": 3}
      ]).toArray()
    } : undefined,
    saleSeek: filters?.saleSeek=='true' ? {
      title: "Tárgyakat keresnek",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1,"image":1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":0}},
      {"$limit": 3}
    ]).toArray(),
    } : undefined,
    saleGive: filters?.saleGive=='true' ? {
      title: "Eladó cuccok",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1,"image":1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":1}},
      {"$limit": 3}
    ]).toArray(),
    } : undefined,
    rentSeek: filters?.rentSeek=='true' ? {
      title: "Lakást keresek",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":2}},
      {"$limit": 3}
    ]).toArray()
    } : undefined,
    rentGive: filters?.rentGive=='true' ? {
      title: "Elérhető lakások",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":3}},
      {"$limit": 3}
    ]).toArray()
    } : undefined,
    workSeek: filters?.workSeek=='true' ? {
      title: "Álláshirdetések",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":4}},
      {"$limit": 3}
    ]).toArray()
    } : undefined,
    workGive: filters?.workGive=='true' ? {
      title: "Álláskeresők",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":5}},
      {"$limit": 3}
    ]).toArray()
    } : undefined,
    news: 'true'=='true' ? {
      title: "Hírek, cikkek",
      link: 'cikkek',
      id: 'docs',
      data: await (async ()=>{
        const db = getDatabase()
        const ref = db.ref('/docs')
        let list=[];
        
        await ref.limitToFirst(3).once('value').then((snapshot) => {
          list = snapshot.val();
          const entries = Object.entries(snapshot.val())
          list = Object.values(snapshot.val()).map((e,i)=>{
            return {
              key: entries[i],
              ...e
            }
          })
        })
        return list;
      })()
    } : undefined
  }

  console.log('length:',Object.entries(results).length);
  res.send(results)
  return "hello";
});


export default router;
