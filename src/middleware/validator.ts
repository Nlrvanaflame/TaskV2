import { NextFunction, Response, Request } from "express";
import { z } from "zod";

export const validateBody =
  (schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Zod Error", error.errors);
        return res.status(500).send("Check terminal for more info");
      }
      if (error) {
        console.error("Non Zod Error", error);
        return res.status(500).send("Check Terminal for more info");
      }
    }
  };
