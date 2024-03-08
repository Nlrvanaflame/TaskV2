import { type NextFunction, type Response, type Request } from 'express'
import { z } from 'zod'
import logger from './logger'

export const validateBody =
  (schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>) =>
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        schema.parse(req.body)
        next()
      } catch (error) {
        if (error instanceof z.ZodError) {
          logger.error('Zod Error', error.errors)
          return res.status(500).send({ message: 'Check terminal for more info', errors: error.errors })
        }
        logger.error('Non Zod Error', error)
        return res.status(500).send('An Unexepcted error occured. Check Terminal for more info')
      }
    }

export const validatePathParams = (schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error('Zod Error: ', error.errors)
        return res.status(500).send({ message: 'Check terminal for more info', errors: error.errors })
      }
      logger.error('Unexpected Error', error)
      return res.status(500).send('An unexpected error occurred. Check terminal for more info.')
    }
  }
}
