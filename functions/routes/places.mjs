import express from "express";
import db from "../db/conn.mjs";
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

// Get a single post
router.get("/:id", async (req, res) => {
  const result = await prisma.place.find({
    where: {
      category: req.params.id
    }
  })

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Add a new document to the collection
router.post("/", async (req, res) => {
  console.log('create',req.body);
  if (!(req.body.category >= 0 && req.body.category < categories.length)) return 

  const result = await prisma.palce.create({
    data: req.body
  })
  console.log(result);
  res.send(result).status(204);
});

export default router;
