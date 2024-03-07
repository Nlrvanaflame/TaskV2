import {
  AverageExamplar,
  AddExemplar,
  GetItem,
  CustomRequest,
  UpdateExemplar,
} from "./types/types";
import { Response, Router } from "express";
import uuid from "uniqid";
import pino from "pino";

import { validateBody } from "./middleware/validator";
import { removeOldKeys } from "./utils";
import {
  AddExemplarSchema,
  GetExemplarSchema,
  UpdateExemplarSchema,
} from "./types/schemas";
const logger = pino();

const maxKeyNumber = 10;

const store: Record<string | number, AverageExamplar> = {};
const router = Router();

const random = "please add to git now";

router.post(
  "/add",
  validateBody(AddExemplarSchema),
  (req: CustomRequest<AddExemplar>, res: Response) => {
    try {
      logger.info(
        { requestBody: req.body, queryParams: req.query },
        "POST REQUEST"
      );
      removeOldKeys(store, maxKeyNumber);
      const id = uuid();
      const { key, name, proffesion, ttl } = req.body;
      store[key] = {
        id,
        name,
        proffesion,
        ttl,
        createdAt: Date.now(),
      };
      logger.info("Request successfull");
      res.status(201).send(store[key]);
    } catch (e) {
      logger.error("error:", e);
      res.status(400).send("opsie daisy");
    }
  }
);

router.get("/getAll", (req: CustomRequest<any>, res: Response) => {
  const storeArray = Object.entries(store).map(([key, value]) => ({
    key,
    value,
  }));

  res.send(storeArray);
});

router.get(
  "/getValue/:key",
  validateBody(GetExemplarSchema),
  (req: CustomRequest<GetItem>, res: Response) => {
    try {
      logger.info(
        { requestBody: req.body, queryParams: req.query },
        "GET REQUEST SINGLE"
      );
      const { key } = req.params;
      const item = store[key];

      if (item?.ttl && item.ttl <= Date.now() - item.createdAt) {
        delete store[key];
        logger.info("Expired or not existing");
        return res.status(404).send("Time expired");
      }
      res.status(200).send(item);
      logger.info("Request successfull");
    } catch (e) {
      logger.error("Error", e);
      res.send("No such item exists");
    }
  }
);

router.delete(
  "/terminate/:key",
  (req: CustomRequest<GetItem>, res: Response) => {
    try {
      logger.info(
        { requestBody: req.body, queryParams: req.query },
        "DELETE REQUEST"
      );
      const { key } = req.params;
      const subjectToTerminate = store[key];
      if (subjectToTerminate) {
        delete store[key];
        logger.info("Request successful");
        return res.status(200).send("rabotata e svurshena");
      }
      res.status(404).send("oturva se");
      logger.info("Nqma takuv exemplar");
    } catch (e) {
      logger.error("error:", e);
      res.status(400).send(e);
    }
  }
);

router.put(
  "/update/:key",
  validateBody(UpdateExemplarSchema),
  async (req: CustomRequest<UpdateExemplar>, res: Response) => {
    try {
      logger.info(
        { requestBody: req.body, queryParams: req.query },
        "UPDATE REQUEST"
      );
      const { key } = req.params;
      const updates = req.body;
      const itemToUpdate = store[key];
      if (!itemToUpdate) {
        logger.info("No such item");
        return res.status(404).send("nqma takuv chovek");
      }
      store[key] = {
        ...itemToUpdate,
        ...updates,
      };
      res.status(200).send(store[key]);
    } catch (e) {
      logger.error("error:", e);
      res.status(400).send(e);
    }
  }
);

export default router;
