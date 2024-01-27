import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient()

const replace = (text) => {
  return text
  .replace(/[aáeéoóöőiíuúüű]/g, '.')
}

const getBuziness = async (key,myLocation) => {
  const db = await adb
  const b = await db.collection('buziness')
  console.log('myLocation',myLocation);
  const results = await b.aggregate( [
    {
      $lookup: {
        from: "page",
        let: { pageId: "$pageId", name: "$name" },
        pipeline: [{
          $geoNear: {
            near: {
              type: "Point", coordinates: myLocation
            },
            distanceMultiplier:0.001,
            distanceField: "distance",
            includeLocs: "location",
            spherical: true,
          }
        },
        { $match: { $expr:
            { $eq: [ "$_id",  "$$pageId" ] }
          }
        }
      ],
        as: "distance"
      }
    },
    { $sort : { "distance.0.distance" : 1 } },
    { $limit : 1000000 },
    { $match: { name: { $regex: key} } }
 ] ).toArray();

  return results

}

// Get a list of 50 posts
router.post("/", async (req, res) => {
    const db = await adb
    const {key,skip=0,take=5,myLocation} = req.body;
    console.log('search',key,myLocation);  
    const search = replace(key);
    console.log(search);
    // query for movies that have a runtime less than 15 minutes
    if (key.length < 3) {
      res.send({error:'Adj meg legalább három karaktert!'})
      return 
    }

    const results = {
      sale: await prisma.sale.findMany({
        where: {
              title: {
              contains: search,
              mode: 'insensitive',
            }
          },
        }),
      users: await prisma.user.findMany({
        where: {
          OR: [
            {name: {
              contains: search,
              mode: 'insensitive',
            }},
            {username: {
              contains: search,
              mode: 'insensitive',
            }},
          ]
        }
      }),
      maps: await prisma.place.findMany({
        where: {
          title: {
            contains: search,
            mode: 'insensitive',
          }
        }
      }),
      buziness: myLocation ? await getBuziness(search,myLocation) : 
      await prisma.buziness.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          }
        }
      })
    }

    /**
      buziness: await prisma.buziness.findMany({
        where: {
          name: {
            contains: key,
            mode: 'insensitive',
          }
        }
      }) */
    


    //res.send('latestqd')
    res.send(results).status(202);

});

export default router;

