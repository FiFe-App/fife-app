import express from "express";
import adb from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import { PrismaClient } from "@prisma/client";
import { getAuth } from "firebase-admin/auth";
import { auth } from "firebase-admin";

const router = express.Router();
const prisma = new PrismaClient()

router.get("/users", async (req, res) => {


  /*auth().updateUser('26jl5FE5ZkRqP0Xysp89UBn0MHG3',{
    emailVerified: false
  }).then(e=>{
    console.log('EMAIL UNVERIFIED');
  }).catch(err=>{
    console.log(err);
  })
  if (req.uid != '26jl5FE5ZkRqP0Xysp89UBn0MHG3') {
    res.send({error:'You are not an admin'})
    return
  }*/
  
  const match = {
    sale: req?.query?.category != undefined ? { category: Number(req?.query?.category) } : null,
    places: null
  }

  //const u = await listAllUsers()
  //console.log(u);

  const exList = await prisma.user.findMany({
    include: {
      page: true
    }
  })
  const fbList = await listAllUsers();

  const results = fbList.map(t1 => ({...t1, ...exList.find(t2 => t2.uid === t1.uid)}))
  res.send(results)
  return "hello";
});

router.get("/docs", async (req, res) => {

  if (req.uid != '26jl5FE5ZkRqP0Xysp89UBn0MHG3') {
    res.send({error:'You are not an admin'})
    return
  }


  const results = await prisma.document.findMany({
    include: {
      author:true
    }
  })
  res.send(results)
  return "hello";
});

export default router;

const listAllUsers = async (nextPageToken) => {
  // List batch of users, 1000 at a time.
  return (await getAuth()
    .listUsers(1000, nextPageToken)
    .catch((error) => {
      console.log('Error listing users:', error);
    })).users;
};
const getAllEmail = async () => {
  // List batch of users, 1000 at a time.
  return (await getAuth()
    .listUsers(1000)
    .catch((error) => {
      console.log('Error listing users:', error);
    })).users.map(e=>{
      return e.email;
    });
};