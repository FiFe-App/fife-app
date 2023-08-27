import { PrismaClient } from "@prisma/client";
import express from "express";
import { getDatabase } from "firebase-admin/database";

const router = express.Router();
const prisma = new PrismaClient();

// New user data
router.post("/", async (req, res) => {
  console.log('create');
  const result = await prisma.user.create({
    data: {
      ...req.body,
      page: {
        create: {
          uid: req.uid
        }
      },
      uid: req.uid,
      id: undefined,
      pageId: undefined,
      buziness: undefined,
    }
  })
  console.log(result);
  if (!result) res.send("could not create").status(404);
  res.send(result.id);
});

router.get("/all/:uid", async (req, res) => {

  const prisma = new PrismaClient();
  const result = await prisma.user.findFirst({
    where: {
      uid: req.params.uid
    },
    include: {
      page: {
        include: {
          buziness:  true
        }
      }
    }
  })
  console.log(result);
  if (!result) {
    res.send("Not found").status(404);
    return
  }
//  res.send(result)
  res.send(result)
  return "hello"; 

});

router.patch("/", async (req, res) => {
  const prisma = new PrismaClient();


  if (req.body.page.buziness?.length > 5) {
    res.send({error:'Maximum 5 biniszed lehet!'})
    return;
  }

  const location = req.body.page?.location;

  const result = await prisma.user.upsert({
    where: {
      uid: req.uid
    },
    update: {
      ...req.body.data,
      id: undefined,
      placeId: undefined,
      page: {
        upsert: {
          create: {
            uid: req.uid,
            location: location?.length==2 ? location : null
          },
          update: {
            uid: req.uid,
            location: location?.length==2 ? location : null
          }
        }
      },
      pageId: undefined,
      buziness: undefined
    },
    create: {
      ...req.body.data,
      page: {
        create: {
          uid: req.uid,
          location: location?.length==2 ? location : null
        }
      },
      uid: req.uid,
      id: undefined,
      pageId: undefined,
      placeId: undefined,
      buziness: undefined,
    },
    include: {
      page: {
        include: {
          buziness:  true
        }
      }
    }
  })

  const f = await getDatabase().ref('users/'+req.uid+'/data/name').set(req.body.data.name)
  console.log('f',f);
  console.log(req.body.page);

  const newB = req.body.page.buziness
  const diff = newB.filter(x => x?.removed==true);

/*  console.log(newB);
  console.log(oldB);
  console.log('diff',diff);
  return*/

  const result2 = await Promise.all(newB.map(async (buzi,ind)=>{
    if (buzi)
    return await prisma.buziness.upsert({
      where: {
        id: result.page.buziness[ind]?.id || '000000000000000000000000'
      },
      create: {
        num: ind,
        uid: req.uid,
        ...buzi,
        removed: undefined,
        page: {
          connect: {
            id: result.pageId
          }
        }
      },
      update: {
        num: ind,
        uid: req.uid,
        ...buzi,
        removed: undefined,
        id: undefined
      }
    })
  }))
  if (diff.length) {
  const deleteOld = await Promise.all(diff.map(async (buzi,ind)=>{
    if (buzi)
    return await prisma.buziness.delete({
      where: {
        id: buzi.id
      }
    })
  }))
  console.log('deleteOld',deleteOld);
  }
  if (!result) {
    res.send("Not found").status(404);
    return
  }
  res.send(JSON.parse(JSON.stringify(result)))
  return "hello"; 

});

router.get("/name/:uid", async (req, res) => {

  const prisma = new PrismaClient();
  const result = await prisma.user.findFirst({
    where: {
      uid: req.params.uid
    },
    select: {
      name: true
    },
  })
  console.log(result);
  if (!result) {
    res.send("Not found").status(404);
    return
  }
  res.send(JSON.parse(JSON.stringify({...result,buziness:[{
    name:'buzi1',
    description:'ez vagyok igen bizu'
  }]})))
  return "hello"; 

});

export default router;