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
    news: 'true'=='true' ? {
      title: "Hírek, cikkek",
      link: 'cikkek',
      id: 'docs',
      data: await (await db.collection("document")).aggregate([
        {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1,"image":1,"color":1}},
        {"$sort": {"created_at": -1}},
        {"$limit": 3}
      ]).toArray()
    } : undefined,
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
      title: "Álláskeresők",
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
      title: "Álláshirdetések",
      link: 'cserebere',
      id: 'sale',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":5}},
      {"$limit": 3}
    ]).toArray()
    } : undefined
  }
  const number = await Promise.all([
    await prisma.friendship.count({
      where: {
        uid2: req.uid
      }
    }),
    await prisma.saleInterest.count({
      where: {
        sale: {
          author:req.uid
        }
    }
  })])

  console.log('length:',Object.entries(results).length);
  res.send({
    latest:results,
    notifications:number.reduce((partialSum, a) => partialSum + a, 0)
  })
  return "hello";
});

router.get("/notifications", async (req, res) => {

  const results = await Promise.all([
    await prisma.friendship.findMany({
      where: {
        uid2: req.uid
      }
    }),
    await prisma.saleInterest.findMany({
      where: {
        sale: {
          author:req.uid
        }
    }
  })])
  const dataToSort = [
    ...results[0].map(e=>{return{...e,type:'friend'}}),
    ...results[1].map(e=>{return{...e,type:'interest'}})];
    console.log(dataToSort);
  const sortedData = dataToSort.sort((itemA, itemB) => {
    return new Date(itemB.created_at).getTime() - new Date(itemA.created_at).getTime()
  });

  console.log('results',sortedData);

  res.send(sortedData || [])
})



export default router;
