import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get a list of 50 posts
router.get("/", async (req, res) => {
  const db = await adb
  const sale = db.collection('sale')
  console.log(req.query);
  const { author, search, minDate, maxDate, category, take=5, skip=0 } = req.query
  // query for movies that have a runtime less than 15 minutes
  
  let query = { 
    title: {$regex: search || ''}
  }
  if (category != -1) query.category =  Number(category)
  if (author) query.author =  author
  const options = {};
  const results = await sale.find(query, options)
  .sort({created_at:-1})
  .skip( Number(skip) )
  .limit( Number(take) ).toArray();
  
  //res.send('latestqd')
  res.send(results).status(202);
  return "hello2"; 
  
});

router.get("/latest", async (req, res) => {
  const db = await adb
  let collection = await db.collection("sale");
  let results = await collection.aggregate([
    {"$project": {"author": 1, "title": 1, "category":1, "description":1, "created_at": 1}},
    {"$sort": {"created_at": -1}},
    {"$limit": 3}
  ]).toArray();
  console.log('sending '+results.length+' data');
  res.send(results)
  return "hello"; 
  res.send(results).status(202);
});

router.get("/:id", async (req, res) => {
  const prisma = new PrismaClient();
  const result = await prisma.sale.findFirst({
    where: {
      id: req.params.id
    }
  })
  console.log(result);
  if (!result) {
    res.send("Not found").status(404);
    return
  }
  else {
    res.send({data:result}).status(200);
    return "sad"
  }

});

router.patch("/:id/images", async (req, res) => {
  
  const result = await prisma.sale.update({
    where: {
      id: req.params.id
    },
    data: {
      imagesDesc: req.body.descriptions,
      imagesBookable: req.body.bookables
    }
  })

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

router.patch("/:id/book", async (req, res) => {
  const { booked, bookedBy } = req.body;
  const result = await prisma.sale.updateMany({
    where: {
      OR: [
        {
          id: req.params.id,
          booked: false
        },
        {
          id: req.params.id,
          booked: true,
          bookedBy: req.uid
        },
      ]
    },
    data: {
      booked,
      bookedBy: booked ? req.uid : null
    }
  })

  if (!result) res.send("Not found").status(404);
  else res.send(!!result.count).status(200);
});

// Add a new document to the collection
router.post("/", async (req, res) => {
  console.log('create',req.body);
  const result = await prisma.sale.create({
    data: req.body
  })
  console.log(result);
  res.send(result.id).status(204);
});

// Update the post with a new comment
router.patch("/comment/:id", async (req, res) => {
  const query = { _id: ObjectId(req.params.id) };
  const updates = {
    $push: { comments: req.body }
  };

  let collection = await db.collection("sale");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});

// Delete an entry
router.patch("/:id", async (req, res) => {
  const result = await prisma.sale.update({
    where: {
      id: req.params.id,
      author: req.uid
    },
    data: req.data
  })

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});
// Delete an entry
router.delete("/:id", async (req, res) => {
  const result = await prisma.sale.delete({
    where: {
      id: req.params.id,
      author: req.uid
    }
  })

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

export default router;
