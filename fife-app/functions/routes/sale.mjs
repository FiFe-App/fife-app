import { PrismaClient } from "@prisma/client";
import express from "express";
import { database, storage } from "firebase-admin";
import adb from "../db/conn.mjs";
import { checkAuth } from "../lib/auth.mjs";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const db = await adb
  const sale = db.collection('sale')
  const { author, searchText, category, take=6, skip=0 } = req.query
  
  let query = { 
    title: {$regex: searchText || ''}
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

router.patch("/:id/images", checkAuth, async (req, res) => {
  
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

router.patch("/:id/interest",checkAuth, async (req, res) => {
  const { message } = req.body;
  const id = req.params.id

  //author: akinek megy az üzenet
  // érdeklődő: req.uid

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
  const sale = await prisma.sale.findFirst({
    where: {
      id
    }
  })
  
  const db = getDatabase();
  const ref = db.ref('users/'+sale.author+'/data/fcm/token');
  const name = db.ref('users/'+req.uid+'/data/name');
  ref.once("value", function(snapshot) {
      name.once("value", function(nameSnapshot) {
      const token = snapshot.val();
      const name = nameSnapshot.val();
      const payload = {
          token: token,
          notification: {
              title: name+' érdeklődik a(z) '+sale.title+' hirdetésed iránt!',
              body: message,
              image: 'https://i.ibb.co/KxgW84L/logo.png',
          },
          webpush: {
            fcmOptions: {
              link: "https://fifeapp.hu/uzenetek?uid="+req.uid
            }
          }
      };
      getMessaging().send(payload).then(res=>{
        console.log('siker',res,payload);
      }).catch(err=>{
        console.log('vmi mem jo',err);
      })
      })
  });

  if (!result) res.send("Not found").status(404);
  res.send(result);
});

router.delete("/:id/interest",checkAuth, async (req, res) => {
  const { message } = req.body;
  const id = req.params.id

  //author: akinek megy az üzenet
  // érdeklődő: req.uid

  const result = await prisma.saleInterest.deleteMany({
    where: {
      id: id,
      author: req.uid
    }
  })

  if (!result) res.send("Not found").status(404);
  res.send(result);
});

// Add a new document to the collection
router.post("/",checkAuth,  async (req, res) => {
  console.log('create',req.body);
  const result = await prisma.sale.create({
    data: req.body
  })
  console.log(result);
  if (!result) res.send("could not create").status(404);
  res.send(result.id);
});

router.patch("/:id",checkAuth, async (req, res) => {
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
router.delete("/:id",checkAuth, async (req, res) => {
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
