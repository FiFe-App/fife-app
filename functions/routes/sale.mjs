import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { database, storage } from "firebase-admin";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const db = await adb
  const sale = db.collection('sale')
  const { author, search, category, take=6, skip=0 } = req.query
  
  let query = { 
    title: {$regex: search || ''}
  }
  if (category != -1) query.category =  Number(category)
  if (author) query.author = author
  else query.author = { $ne: req.uid }
  const options = {};
  const results = await sale.find(query, options)
  .sort({created_at:-1})
  .skip( Number(skip) )
  .limit( Number(take) ).toArray();
  
  res.send(results).status(202);
  
});

router.get("/latest", async (req, res) => {
  console.log(req?.query?.category || -1);
  const db = await adb
  let collection = await db.collection("sale");
  let results = await collection.aggregate([
    {"$project": {"author": 1, "title": 1, "category":1, "description":1, "created_at": 1}},
    {"$sort": {"created_at": -1}},
    { "$match": req?.query?.category != undefined ? { category: Number(req?.query?.category) } : null},
    {"$limit": 3}
  ]).toArray();
  console.log('sending '+results.length+' data');
  res.send(results)
  return "hello"; 
  res.send(results).status(202);
});

router.get("/:id", async (req, res) => {

  const result = await prisma.sale.findFirst({
    where: {
      id: req.params.id
    },
    include: {
      saleInterest: true,
    },
  })
  if (!result) {
    res.send("Not found").status(404);
    return
  }
  res.send(result)
//  res.send(JSON.parse(JSON.stringify(result)))
  //return "hello"; 

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

router.patch("/:id/interest", async (req, res) => {
  const { message } = req.body;
  const id = req.params.id

  const result = await prisma.saleInterest.create({
    data:{
      author: req.uid,
      message,
      sale: {
        connect: {
          id
        }
      }
    }
  })

  if (!result) res.send("Not found").status(404);
  res.send(result);
});

router.patch("/:id/book/:ind", async (req, res) => {
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
  else {
    const updated = await prisma.sale.findFirst({
      where: {
        id: req.params.id,
      },
      select: {
        author: true
      },
    })
    console.log(result);
    if (booked) {
      await database().ref('users/'+updated.author+'/messages/'+req.uid).push({
        text: req.params.id,
        time: Date.now(),
        uid: req.uid,
        automated: true
      })
      await database().ref('users/'+req.uid+'/messages/'+updated.author).push({
        text: req.params.id,
        time: Date.now(),
        uid: req.uid,
        automated: true
      })
    }
    res.send(!!result.count).status(200)
  };
});

// Add a new document to the collection
router.post("/", async (req, res) => {
  console.log('create',req.body);
  const result = await prisma.sale.create({
    data: req.body
  })
  console.log(result);
  if (!result) res.send("could not create").status(404);
  res.send(result.id);
});

router.patch("/:id", async (req, res) => {
  console.log(req);
  const result = await prisma.sale.updateMany({
    where: {
      id: req.params.id,
      author: req.uid
    },
    data: req.body
  })

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Delete an entry
router.delete("/:id", async (req, res) => {
  const result = await prisma.sale.deleteMany({
    where: {
          id: req.params.id,
          author: req.uid
    }
  })
    
    const folder = 'sale/'+req.params.id+'/';
    const bucket = storage().bucket('gs://fife-app.appspot.com');
    async function deleteBucket() {
        await bucket.deleteFiles({ prefix: folder });
    }
    deleteBucket().catch((err) => {
        console.error(`Error occurred while deleting the folder: ${folder}`, err);
    });

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

export default router;
