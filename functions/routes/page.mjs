import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.patch("/", async (req, res) => {
  console.log('update');

  const result = await prisma.page.upsert({
    where: {
      uid: req.uid
    },
    update: req.body,
    create: {
      ...req.body,
      uid: req.uid
    }
  })

  if (!result) {
    res.send("Not found").status(404);
    return
  }
  res.send(JSON.parse(JSON.stringify(result)))
  return "hello"; 

});

export default router;