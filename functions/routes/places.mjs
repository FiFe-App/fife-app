import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient()

const categories = [
  "Adományboltok",
  "Turik",
  "Nyilvános vécék",
  "Ivóvíz lelőhelyek",
  "FiFe kocsmák",
  "Csomagolásmentes boltok",
  "Piacok",
  "Bulihelyek",
  "Ruhaleadó helyek",
  "Szelektív gyűjtők",
  "Komposztok",
  "Közösségi helyek, kertek",
  "Fotóboltok",
  "Biszbasz boltok, régiség boltok",
  "Galériák",
  "Művészmozik",
  "Kifőzdék",
  "Biztonságos biciklitárolók"
]

// Get a list of 50 posts
router.get("/", async (req, res) => {
  res.send(JSON.parse(JSON.stringify(categories))).status(200);
  return "HELO"
});

router.get("/latest", async (req, res) => {
  const db = await adb
  let collection = await db.collection("place");
  let results = await collection.aggregate([
    {"$project": {"title": 1, "description":1, "category":1, "created_at": 1}},
    {"$sort": {"created_at": -1}},
    {"$limit": 3}
  ]).toArray();
  console.log('sending '+results.length+' data');
  res.send(results)
  return "hello"; 
  res.send(results).status(202);
});

// search by id
router.get("/:id/search", async (req, res) => {

  const result = await prisma.place.findFirst({
    where: {
      id: req.params.id
    }
  })  
  if (!result) res.send("Not found").status(404);
  else res.send(result)

});

// Get a single post
router.get("/:id", async (req, res) => {

  const result = await prisma.place.findMany({
    where: {
      category: Number(req.params.id)
    }
  })  
  if (!result) res.send("Not found").status(404);
  else res.send(result)

});

// Add a new document to the collection
router.post("/:id", async (req, res) => {
  console.log('create',req.body);
  const cat = Number(req.params.id)
  if (!(cat >= 0 && cat < categories.length)) return 

  const result = await prisma.place.create({
    data: {
      ...req.body,
      category: cat,
      uploaded_by: req.uid
    },
  })
  console.log(result);
  res.send(result).status(204);
});

router.get("/:id/like", async (req, res) => {
  console.log('create',req.body);
  const result = await prisma.like.findMany({
    where: {
      uid: req.uid,
      placeId: req.params.id 
    }
  });
  console.log(result);
  res.send(!!result.length);
  return "asd"
});

router.post("/:id/like", async (req, res) => {
  console.log('create',req.body);
  const test = await prisma.like.findMany({
    where: {
      uid: req.uid,
      placeId: req.params.id 
    }
  });
  console.log('test',test);
  const result =
  !test.length ? await prisma.like.create({
    data: {
      uid: req.uid,
      placeId: req.params.id 
    }
  }) : await prisma.like.deleteMany({
    where: {
      uid: req.uid,
      placeId: req.params.id 
    }
  })
  console.log(result);
  res.send(result).status(204);
});

export default router;
