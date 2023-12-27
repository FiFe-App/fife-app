import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient()

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

router.post("/nearby", async (req, res) => {

  const {myLocation, category} = req.body;
  const db = await adb
  const b = await db.collection('place')
  console.log('category',category);
  const results = await b.aggregate( [
    {
      $geoNear: {
            distanceMultiplier:0.001,
      
            as: "distance",
            maxDistance: 3000,

            near: { 
              type: "Point", coordinates: myLocation },
            distanceField: "dist.calculated",
            includeLocs: "dist.location",
            spherical: true
        },
    },
    { 
      $sort : { "dist.calculated" : 1 } 
    },
    { 
      $limit : 5
    },
    { $match:
          category? { category: Number(category) }: {},
    }
 ] ).toArray();

  res.send(results).status(202);
});
// search by id
router.get("/search", async (req, res) => {
  const {key,secure} = req.params;

  const result = await prisma.place.groupBy({
    by: ['category'],
    where: {
      title: {
        contains: key,
      },
    },
  })  
  if (!result) res.send("Not found").status(404);
  else res.send(result)

});

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

  const {secure} = req.query;
  console.log(req.params);
  const result = await prisma.place.findMany({
    where: secure=='true' ? {
      category: Number(req.params.id),
      like: {
        some: {}
      }
    }:{
      category: Number(req.params.id)
    }
  })  
  console.log(true ? 'false' : 'true');
  console.log('secure',secure,secure ? {
    category: Number(req.params.id),
    like: {
      some: {}
    }
  }:{
    category: Number(req.params.id)
  },result.length);
  if (!result) res.send("Not found").status(404);
  else res.send(result)

});


// Add a new document to the collection
router.post("/:id", async (req, res) => {
  console.log('create',req.body);
  const cat = Number(req.params.id)
  if (!(cat >= 0 && cat <= 20)) {
    res.send({
      error:'Category not allowed!'
    }).status(401)
    return 
  }

  const result = await prisma.place.create({
    data: {
      ...req.body,
      category: cat,
      uploaded_by: req.uid
    },
  })
  console.log(result);
  res.send(result.id)
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
