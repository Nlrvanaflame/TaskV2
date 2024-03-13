import {
  type AddExemplar,
  type CustomRequest,
  type UpdateExemplar,
  type GetExamplar
} from './types/types'
import { type Response, Router } from 'express'
import uuid from 'uniqid'
import logger from './middleware/logger'

import { validateBody } from './middleware/validator'
import {
  AddExemplarSchema,
  UpdateExemplarSchema
} from './types/schemas'
import { store } from './config/default'

// export const store: Record<string | number, AverageExamplar> = {}

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
      store.set(key, {
        id,
        name,
        proffesion,
        ttl,
        createdAt: Date.now(),
        timesUsed: 0
      })

      logger.info('Request successfull')
      res.status(201).send(store.get(key))
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
      const item = store.get(key)

      if (((item?.ttl) != null) && item.ttl <= Date.now() - item.createdAt) {
        store.delete(key)
        logger.info('Expired or not existing')
        return res.status(404).send('Time expired')
      }

      if (item != null) item.timesUsed += 1
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
  (req: CustomRequest<GetExamplar>, res: Response) => {
    logger.info(
      { requestBody: req.body, queryParams: req.query },
      'Handle  request to delete a single item'
    )

    try {
      const { key } = req.params
      const subjectToTerminate = store.get(key)

      if (subjectToTerminate != null) {
        store.delete(key)
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
      const itemToUpdate = store.get(key)

      if (itemToUpdate == null) {
        logger.info('No such item')
        return res.status(404).send('nqma takuv chovek')
      }

      store.set(key, {
        ...itemToUpdate,
        ...updates
      })
      res.status(200).send(store.get(key))
    } catch (e) {
      logger.error('Unexpected error occured:', e)
      res.status(500).send(e)
    }
  }
)
// dev requests
router.get('/getAll', (req: CustomRequest<any>, res: Response) => {
  const storeArray = Array.from(store).map(([key, value]) => ({
    key,
    value
  }))

  res.send(storeArray)
})

export default router
