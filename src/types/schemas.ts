import z from 'zod'

export const AddExemplarSchema = z.object({
  key: z.string(),
  name: z.string(),
  proffesion: z.string(),
  ttl: z.number().optional()
})

export const UpdateExemplarSchema = z.object({
  name: z.string().optional(),
  proffesion: z.string().optional()
})

export const GetExemplarSchema = z.object({
  key: z.string()
})
