import {
  type AddExemplar,
  type CustomRequest,
  type UpdateExemplar,
  type GetExamplar,
  type AverageExamplar
} from './types/types'
import { type Response, Router } from 'express'
import logger from './middleware/logger'

import { validateBody } from './middleware/validator'
import {
  AddExemplarSchema,
  UpdateExemplarSchema
} from './types/schemas'
import PriorityQueue from './dataStructures/PriorityQueue'

const storeWithTtl = new Map<string | number, AverageExamplar>()
const storeWithoutTtl = new Map<string | number, AverageExamplar>()
const priorityQueue = new PriorityQueue((key) => {
  storeWithTtl.delete(key)
  storeWithoutTtl.delete(key)
})

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
      const { key, name, proffesion, ttl } = req.body

      const item = storeWithTtl.get(key) ?? storeWithoutTtl.get(key)
      if (item !== undefined) return res.status(400).send('Item already exists')

      const store = (ttl !== undefined) ? storeWithTtl : storeWithoutTtl

      const data: AverageExamplar = {
        name,
        proffesion,
        ttl,
        createdAt: Date.now(),
        timesUsed: 0
      }

      // if (ttl !== undefined) {
      //   const timeoutId = setTimeout(() => {
      //     storeWithTtl.delete(key)
      //   }, ttl)
      //   data.timeoutId = timeoutId
      // }

      store.set(key, data)
      priorityQueue.enqueue(key, data)

      logger.info('Request successfull')
      res.status(201).json(data)
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
      const item = storeWithTtl.get(key) ?? storeWithoutTtl.get(key)

      if (item !== undefined) {
        item.timesUsed += 1
        priorityQueue.update(key, item)
        logger.info('Request successfull')
        return res.status(200).json('Request successfull')
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
        clearTimeout(storeWithTtl.get(key)?.timeoutId)
        storage.delete(key)
        priorityQueue.remove(key)
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
      const itemToUpdate = storeWithTtl.get(key) ?? storeWithoutTtl.get(key)

      if (itemToUpdate === undefined) {
        logger.info('No such item')
        return res.status(404).send('nqma takuv chovek')
      }

      itemToUpdate.name = name
      itemToUpdate.proffesion = proffesion
      res.status(200).send(itemToUpdate)
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send(e)
    }
  }
)

// dev
router.get('/getAll', (req, res) => {
  logger.info('Handling request to get all items with TTL')

  try {
    const itemsWithTtl: Record<string | number, AverageExamplar> = {}

    storeWithTtl.forEach((value, key) => {
      itemsWithTtl[key] = value
    })

    logger.info('Successfully retrieved all items with TTL')
    res.status(200).json(itemsWithTtl)
  } catch (e) {
    logger.error('Unexpected error occurred:', e)
    res.status(500).send('Unexpected error occurred')
  }
})

// clearStore(storeWithTtl, 1)
// clearStore(storeWithoutTtl, 1)

export default router
