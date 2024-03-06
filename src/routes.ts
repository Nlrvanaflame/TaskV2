import { AverageExamplar, AddExemplar, GetItem, CustomRequest, UpdateExemplar } from "./types/types";
import { Response, Router } from "express";
import uuid from "uniqid";
import { pino } from "pino"
import { validateBody } from "./middleware/validator";
import { removeOldKeys } from "./utils";



// req/response interfaces should have been done better. On a second look after completing it i could have done something with
// request payload (not sure)
// struggled a bit on tests, edge cases not done, i feel like they should have been done better
// about the maxKeyCap and deleting old keys. Code could have looked different if:
// 1: I made the store an array of objects in the first place (wouldnt have to use function to convert)
// 2: There could be a property for times used or smth like that so we could check for least used ones
// 3: The alternative i implemented was deleting the key with lowest ttl left
// Benefit from that is for example if we have a key which is about to expire, since its older it should have been used more times.
// So basiclly if we are about to reach key cap we wont delete the new keys which havent been used much ,
// but rather delete the old ones that are about to expire anyway.
// Demerit would be that if an important key which is used a lot, has the least ttl left , its gonna get deleted
// ofc there is the counterplay we  just use the endpoint to update important keys

const maxKeyNumber = 10
// const stack = ["item1", "item2", "item3"];
const store: Record<string | number, AverageExamplar> = {};
const router = Router();
const logger = pino()


router.post("/add",validateBody, (req: CustomRequest<AddExemplar>, res: Response) => {
  try {
    logger.info({ requestBody: req.body, queryParams: req.query }, "Received request")
    removeOldKeys(store,maxKeyNumber)
    const id = uuid();
    const { key, name, proffesion, ttl } = req.body;
    store[key] = {
      id,
      name,
      proffesion,
      ttl,
      createdAt: Date.now(),
    };
    logger.info("Request successfull")
    res.status(200).send(store[key]);
  } catch (e) {
    logger.error("error:" , e)
      res.send("opsie daisy");
    }    
  }
);

router.get("/getAll", (req: CustomRequest<any>, res: Response) => {
  const storeArray = Object.entries(store).map(([key, value]) => ({
    key,
    value
  }));
  
  res.send(storeArray);
});

router.get("/getValue/:key", (req: CustomRequest<GetItem>, res: Response) => {
  try {
    logger.info({ requestBody: req.body, queryParams: req.query }, "Received request")
    const { key } = req.params;
    const item = store[key];

    if (item.ttl && item.ttl <= Date.now() - item.createdAt) {
      delete store[key];
      res.status(200).send("Time expired");
    }
    res.send(item);
    logger.info("Request successfull")
  } catch (e) {
    logger.error("error:" , e)
    res.send("No such item exists");
  }
});

router.delete("/terminate/:key", (req: CustomRequest<GetItem>, res: Response) => {
  try {
    logger.info({ requestBody: req.body, queryParams: req.query }, "Received request")
    const { key } = req.params;
    const subjectToTerminate = store[key];
    if (subjectToTerminate) {
      delete store[key]
      res.status(200).send("rabotata e svurshena");
    }
     res.status(200).send("oturva se");
     logger.info("Request successfull")
  } catch (e) {
    logger.error("error:" , e)
    res.send(e);
  }
});

router.put("/update/:key", async (req: CustomRequest<UpdateExemplar>, res: Response)=>{
  try{
    logger.info({ requestBody: req.body, queryParams: req.query }, "Received request")
    const {key} = req.params;
    const updates = req.body
    const itemToUpdate = store[key];
    if (!itemToUpdate) return res.status(404).send("nqma takuv chovek")

    store[key]={
      ...itemToUpdate,
      ...updates
    }
    res.status(200).send(store[key])
  }
  catch(e){
    logger.error("error:" , e)
    res.status(404).send(e)
  }
} )



// router.post("/addItem", (req: Request, res: Response) => {
//   try {
//     const itemtoAdd = req.body.name;
//     stack.push(itemtoAdd);
//     res.send(stack);
//   } catch (e) {
//     res.status(404).send(e);
//   }
// });

// router.delete("/popItem", (req: Request, res: Response) => {
//   if (stack.length == 0) res.send("nothing to pop");
//   try {
//     stack.pop();
//     res.send(stack);
//   } catch (e) {
//     res.status(404).send(e);
//   }
// });

export default router;