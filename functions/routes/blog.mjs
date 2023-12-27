import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.patch("/", async (req, res) => {
    const db = await adb
    const blog = db.collection('blog')
    const {q='',skip,take,recommended,buziness} = req.body;
    console.log( buziness?.map(b=>`/^${b}/`));
    let query = { 
      title: {
        $in: buziness.map(function (e) { return new RegExp(e, "i"); })
      }
    }
    const results = await blog.find(query,{})
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

router.post("/",async (req, res) => {
    const result = await prisma.blog.create({
        data: {
            author: req.uid,
            title: req.body.title,
            text: req.body.text
        }
    })
    if (result)
    res.send(result).status(200);
})

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