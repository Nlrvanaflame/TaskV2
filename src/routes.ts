import {
  type AverageExamplar,
  type AddExemplar,
  type GetItem,
  type CustomRequest,
  type UpdateExemplar
} from './types/types'
import { type Response, Router } from 'express'
import uuid from 'uniqid'
import logger from './middleware/logger'

import { validateBody } from './middleware/validator'
import { removeOldAndExpiredKeys } from './utils'
import {
  AddExemplarSchema,
  UpdateExemplarSchema
} from './types/schemas'

const maxKeyNumber = 10

const store: Record<string | number, AverageExamplar> = {}
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
      removeOldAndExpiredKeys(store, maxKeyNumber)
      const id = uuid()
      const { key, name, proffesion, ttl } = req.body
      store[key] = {
        id,
        name,
        proffesion,
        ttl,
        createdAt: Date.now(),
        timesUsed: 0
      }

      logger.info('Request successfull')
      res.status(201).send(store[key])
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send('Unexpected error occured')
    }
  }
)

router.get('/getAll', (req: CustomRequest<any>, res: Response) => {
  const storeArray = Object.entries(store).map(([key, value]) => ({
    key,
    value
  }))

  res.send(storeArray)
})

router.get(
  '/getValue/:key',
  (req: CustomRequest<GetItem>, res: Response) => {
    try {
      logger.info(
        { requestBody: req.body, queryParams: req.query },
        'Handling request to return a single item based on key'
      )
      const { key } = req.params
      const item = store[key]

      if (item?.ttl && item.ttl <= Date.now() - item.createdAt) {
        delete store[key]
        logger.info('Expired or not existing')
        return res.status(404).send('Time expired')
      }

      item.timesUsed += 1
      res.status(200).send(item)
      logger.info('Request successfull')
    } catch (e) {
      logger.error('Unexpected error occured', e)
      res.status(500).send(e)
    }
  }
)

router.delete(
  '/terminate/:key',
  (req: CustomRequest<GetItem>, res: Response) => {
    logger.info(
      { requestBody: req.body, queryParams: req.query },
      'Handle  request to delete a single item'
    )

    try {
      const { key } = req.params
      const subjectToTerminate = store[key]

      if (subjectToTerminate) {
        delete store[key]
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
      const updates = req.body
      const itemToUpdate = store[key]

      if (!itemToUpdate) {
        logger.info('No such item')
        return res.status(404).send('nqma takuv chovek')
      }

      store[key] = {
        ...itemToUpdate,
        ...updates
      }
      res.status(200).send(store[key])
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send(e)
    }
  }
)

export default router
