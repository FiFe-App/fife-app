import { PrismaClient } from '@prisma/client';
import express from 'express';
import { database, storage } from 'firebase-admin';
import adb from '../db/conn.mjs';
import { checkAuth } from '../lib/auth.mjs';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';

const router = express.Router();
const prisma = new PrismaClient();

const getBuziness = async (key='',myLocation,skip,take) => {
  const db = await adb
  const b = await db.collection('buziness')
  console.log('key',key)
  const results = await b.aggregate( [
    {
      $lookup: {
        from: 'page',
        let: { pageId: '$pageId', name: '$name' },
        pipeline: [{
          $geoNear: {
            near: {
              type: 'Point', coordinates: myLocation.map(e=>Number(e))
            },
            distanceMultiplier:0.001,
            distanceField: 'distance',
            includeLocs: 'location',
            spherical: true,
          }
        },
        { $match: { $expr:
            { $eq: [ '$_id',  '$$pageId' ] }
          }
        }
      ],
        as: 'distance'
      }
    },
    { $sort : { 'distance.0.distance' : -1 } },
    //{ $limit : Number(take)+Number(skip) },
    //{ $skip : Number(skip) },
    { $match: { 'name': { $regex: key }, 'distance.0': {$ne:null} } }
 ] ).toArray();

  return results

}

router.get('/', async (req, res) => {
  //const db = await adb
  //const sale = db.collection('buziness')
  const { author, searchText, category, take=6, skip=0 } = req.query
  const search = searchText;
  const myLocation = req.query.myLocation.splice(0,2)
  
  console.log('searchText',search);
  let query = { 
    name: {$regex: search || ''}
  }
  //if (category != -1) query.category =  Number(category)
  if (author) query.uid = author
  else query.uid = { $ne: req.uid }
  const options = {};

  const results = myLocation ? await getBuziness(search,myLocation,skip,take) : 
      await prisma.buziness.findMany({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          }
        }
      })
  res.send(results).status(202);
});


router.get('/:id', async (req, res) => {

  const result = await prisma.buziness.findFirst({
    where: {
      id: req.params.id
    },
    include: {
      //buzinessInterest
    },
  })
  if (!result) {
    res.send('Not found').status(404);
    return
  }
  res.send(result)
//  res.send(JSON.parse(JSON.stringify(result)))
  //return "hello"; 

});

router.patch('/:id/images', checkAuth, async (req, res) => {
  
  const result = await prisma.sale.update({
    where: {
      id: req.params.id
    },
    data: {
      imagesDesc: req.body.descriptions,
      imagesBookable: req.body.bookables
    }
  })

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

router.patch('/:id/interest',checkAuth, async (req, res) => {
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
  ref.once('value', function(snapshot) {
      name.once('value', function(nameSnapshot) {
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
              link: 'https://fifeapp.hu/uzenetek?uid='+req.uid
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

  if (!result) res.send('Not found').status(404);
  res.send(result);
});

router.delete('/:id/interest',checkAuth, async (req, res) => {
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

  if (!result) res.send('Not found').status(404);
  res.send(result);
});

// Add a new document to the collection
router.post('/',checkAuth,  async (req, res) => {
  console.log('create',req.body);
  const result = await prisma.buziness.create({
    data: {
      uid: req.uid,
      ...req.body
    }
  })
  console.log(result);
  if (!result) res.send('could not create').status(404);
  res.send(result.id);
});

router.patch('/:id',checkAuth, async (req, res) => {
  console.log(req);
  const result = await prisma.sale.updateMany({
    where: {
      id: req.params.id,
      author: req.uid
    },
    data: req.body
  })

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

// Delete an entry
router.delete('/:id',checkAuth, async (req, res) => {
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

  if (!result) res.send('Not found').status(404);
  else res.send(result).status(200);
});

export default router;
