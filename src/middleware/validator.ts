import { NextFunction,Response, Request } from "express";
import { z } from "zod";
import { AddExemplarSchema } from "../types/schemas";



  export const validateBody = (req: Request, res: Response, next: NextFunction) => {
    try {
        AddExemplarSchema.parse(req.body);
        next();
    } catch (error) {
      if (error instanceof z.ZodError){
        console.error("errors in validation", error.errors)
        res.send("Check terminal for more info")
      }
    };
  }