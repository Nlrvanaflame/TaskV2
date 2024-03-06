import z from "zod"

export const AddExemplarSchema = z.object({
    key: z.string(),
    name: z.string(),
    proffesion: z.string(),
    ttl: z.number().optional(),
  });
