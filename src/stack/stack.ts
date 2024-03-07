// import { Response, Router } from "express";

// const router = Router();

// const stack = ["item1", "item2", "item3"];

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
