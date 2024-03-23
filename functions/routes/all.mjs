import { PrismaClient } from "@prisma/client";
import express from "express";
import adb from "../db/conn.mjs";
import { checkAuth, checkAuthIf, checkAuthNoVer } from "../lib/auth.mjs";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";


const router = express.Router();
const prisma = new PrismaClient()

/**
 * Update every user

  const getUri = async () => {
    const fileRef = getStorage().bucket();

    return url
  }

  const listAllUsers = async (nextPageToken) => {
    // List batch of users, 1000 at a time.
    return (await getAuth()
      .listUsers(1000, nextPageToken)
      .catch((error) => {
        console.log('Error listing users:', error);
      })).users;
    }

    listAllUsers().then(async res=>{
      console.log(res[0]);
      res.map(async user=>{
        const img = await getUri(user.uid)
        prisma.user.update({
          where: {
            uid: user.uid
          },
          data: {
            image: img
          }
        }).then(res=>{
          console.log('success',user.uid);
        })
  
      })
    })
  return
   */
router.get("/latest",checkAuthIf,async (req, res) => {

  const filters = req.query;

  console.log('filters',filters);
  const db = await adb

  const results = {
    newPeople: 'true'=='true' ? {
      title: "Frissen regisztrált fifék!",
      link: 'profil',
      id: 'heeeee',
      data: await (await db.collection("user")).aggregate([
        {"$project": {"title": '$name', "created_at": 1, "category":'szia!','author':'$uid','_id':'$uid','image':undefined}},
        {"$sort": {"created_at": -1}},
        {"$limit": 3}
      ]).toArray()
    } : undefined,
    news: 'true'=='true' ? {
      title: "Hírek, cikkek",
      link: 'cikk',
      id: 'docs',
      newLink: 'uj-cikk',
      data: await (await db.collection("document")).aggregate([
        {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1,"image":1,"color":1,"active":1}},
        {"$sort": {created_at: -1}},
        {"$match": {'active': true}},
        {"$limit": 3}
      ]).toArray()
    } : undefined,
    saleSeek: filters?.saleSeek=='true' ? {
      title: "Tárgyakat keresnek",
      link: 'cserebere',
      id: 'sale',
      newLink: 'uj-cserebere',
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
      newLink: 'uj-cserebere',
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
      newLink: 'uj-cserebere',
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
      newLink: 'uj-cserebere',
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
      newLink: 'uj-cserebere',
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
      newLink: 'uj-cserebere',
      data: await (await db.collection("sale")).aggregate([
      {"$project": {"title": 1, "category":1, "created_at": 1, "author": 1}},
      {"$sort": {"created_at": -1}},
      {"$match": {"category":5}},
      {"$limit": 3}
    ]).toArray()
    } : undefined
  }
  const number = req?.uid ? await Promise.all([
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
  })]) : []

  console.log('length:',Object.entries(results).length);
  res.send({
    latest:results,
    notifications:number.reduce((partialSum, a) => partialSum + a, 0)
  })
  return "hello";
});

router.get("/notifications",checkAuth, async (req, res) => {

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

  res.send(sortedData || [])
})



export default router;
