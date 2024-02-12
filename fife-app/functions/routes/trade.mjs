import { PrismaClient } from "@prisma/client";
import express from "express";

const router = express.Router();
const prisma = new PrismaClient();

// New user data
router.post("/", async (req, res) => {
  const {index, message, user2} = req.body;

  console.log(body);
  const result = await prisma.trade.create({
    data: {
      user1: req.uid,
      user2,
      bId2: index,
      accepted: false
    }
  })
  if (result) res.send(200);

});

router.post("/accept", async (req, res) => {
  const {index, message} = req.body;

  console.log(body);
  const result = await prisma.trade.updateMany({
    where: {
      id: id,
      user2: req.uid
    },
    data: {
      bId1: index,
      accepted: true,
      message2: message
    }
  })

  if (result) res.send(200);
});
export default router;