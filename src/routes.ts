import {
  type AddExemplar,
  type CustomRequest,
  type UpdateExemplar,
  type GetExamplar,
  type AverageExamplar
} from './types/types'
import { type Response, Router } from 'express'
import uuid from 'uniqid'
import logger from './middleware/logger'

import { validateBody } from './middleware/validator'
import {
  AddExemplarSchema,
  UpdateExemplarSchema
} from './types/schemas'
import { clearStore } from './utils'

const storeWithTtl = new Map<string | number, AverageExamplar>()
const storeWithoutTtl = new Map<string | number, AverageExamplar>()

const router = Router()

router.post(
  '/add',
  validateBody(AddExemplarSchema),
  (req: CustomRequest<AddExemplar>, res: Response) => {
    logger.info(
      { requestBody: req.body, queryParams: req.query },
      'Handling request to add new exemplar'
    )

    try {
      const id = uuid()
      const { key, name, proffesion, ttl } = req.body

      let timeoutId: NodeJS.Timeout | undefined
      if (ttl !== undefined) {
        timeoutId = setTimeout(() => {
          storage.delete(key)
        }, ttl)
        clearTimeout(storeWithTtl.get(key)?.timeoutId)
      }

      const item = storeWithTtl.get(key) ?? storeWithoutTtl.get(key)
      if (item !== undefined) return res.status(400).send('Item already exists')

      const storage = (ttl !== undefined) ? storeWithTtl : storeWithoutTtl

      storage.set(key, {
        id,
        name,
        proffesion,
        ttl,
        createdAt: Date.now(),
        timesUsed: 0,
        timeoutId
      })

      logger.info('Request successfull')
      res.status(200).json({
        data: {
          key,
          name,
          proffesion,
          ttl,
          createdAt: Date.now(),
          timesUsed: 0
        }
      })
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send('Unexpected error occured')
    }
  }
)
router.get(
  '/getValue/:key',
  (req: CustomRequest<GetExamplar>, res: Response) => {
    try {
      logger.info(
        { requestBody: req.body, queryParams: req.query },
        'Handling request to return a single item based on key'
      )
      const { key } = req.params
      const item = storeWithTtl.get(key) ?? storeWithoutTtl
        .get(key)

      if (item != null) {
        item.timesUsed += 1
        logger.info('Request successfull')
        return res.status(200).json('Get request successfull')
      }
    } catch (e) {
      logger.error('Unexpected error occured', e)
      res.status(500).send(e)
    }
  }
)

router.delete(
  '/terminate/:key',
  (req: CustomRequest<GetExamplar>, res: Response) => {
    logger.info(
      { requestBody: req.body, queryParams: req.query },
      'Handle  request to delete a single item'
    )

    try {
      const { key } = req.params
      const itemToTerminate = storeWithTtl.get(key) ?? storeWithoutTtl.get(key)
      const storage = ((itemToTerminate?.ttl) !== null) ? storeWithTtl : storeWithoutTtl

      if (itemToTerminate !== null) {
        storage.delete(key)
        logger.info('Request successful')
        return res.status(200).send('rabotata e svurshena')
      }
      res.status(404).send('oturva se')
      logger.info('Nqma takuv exemplar')
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send(e)
    }
  }
)

router.put(
  '/update/:key',
  validateBody(UpdateExemplarSchema),
  async (req: CustomRequest<UpdateExemplar>, res: Response) => {
    logger.info(
      { requestBody: req.body, queryParams: req.query },
      'Handle request to update an existing item'
    )
    try {
      const { key } = req.params
      const { name, proffesion } = req.body
      const itemToUpdate = storeWithTtl.get(key) ?? storeWithoutTtl
        .get(key)

      if (itemToUpdate === undefined) {
        logger.info('No such item')
        return res.status(404).send('nqma takuv chovek')
      }

      itemToUpdate.name = name
      itemToUpdate.proffesion = proffesion
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send(e)
    }
  }
)

clearStore(storeWithTtl, storeWithoutTtl)

export default router
