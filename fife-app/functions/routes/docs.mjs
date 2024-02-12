import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/latest", async (req, res) => {
    const documentsCount = await prisma.document.count();
    const skip = documentsCount <= 3 ? 0 : Math.floor(Math.random() * documentsCount);
    const result = await prisma.document.findMany({
        take: 3,
        skip: skip,
        where: {
            active: true
        },
        orderBy: {
            authorId: 'desc',
        },
        select: {
            id: true,
            title: true,
            text: true,
            category: true,
            image: true,
            color: true
        }
    });

    if (!result) {
        res.send("Not found").status(404);
        return
    }
    res.send(JSON.parse(JSON.stringify(result)))
    return "hello"; 

});

router.get("/", async (req, res) => {
    const db = await adb
    const document = db.collection('document')
    const {q='',skip,take} = req.query;
    let query = { 
      title: {$regex: q},
      active: true
    }
    const results = await document.find(query,{})
    .sort({created_at:-1})
    .skip( Number(skip) )
    .limit( Number(take) ).toArray();
    console.log(results.length);

    if (!results) {
        res.send("Not found").status(404);
        return
    }
    res.send(results)

});

router.get("/:id", async (req, res) => {
    const result = await prisma.document.findFirst({
        where: {
            id: req.params.id,
            active: true
        }
    });

    if (!result) {
        res.send("Not found").status(404);
        return
    }
    res.send(result)
    return "hello"; 

});

export default router;