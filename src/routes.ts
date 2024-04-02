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
import { store, unlimitedTtlStore } from './config/default'

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

      let timeoutId: NodeJS.Timeout | undefined
      if (ttl != null) {
        timeoutId = setTimeout(() => {
          store.delete(key)
        }, ttl)
        clearTimeout(store.get(key)?.timeoutId)
        store.set(key, {
          id,
          name,
          proffesion,
          ttl,
          createdAt: Date.now(),
          timesUsed: 0,
          timeoutId
        })
      }
      if (ttl === null) {
        unlimitedTtlStore.set(key, {
          id,
          name,
          proffesion,
          createdAt: Date.now(),
          timesUsed: 0,
          timeoutId
        })
      }

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
      const item = store.get(key)
      const unlimitedStoreItem = unlimitedTtlStore.get(key)

      if (item != null) {
        item.timesUsed += 1
        logger.info('Request successfull')
        return res.status(200).json('Get request successfull')
      }
      if (unlimitedStoreItem != null) {
        unlimitedStoreItem.timesUsed += 1
        logger.info('Request successful')
        return res.status(200).json('Get request successful')
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
      const subjectToTerminate = store.get(key)
      const unlimitedSubjectToTerminate = unlimitedTtlStore.get(key)

      if (subjectToTerminate != null) {
        store.delete(key)
        logger.info('Request successful')
        return res.status(200).send('rabotata e svurshena')
      }
      if (unlimitedSubjectToTerminate != null) {
        unlimitedTtlStore.delete(key)
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

    // TODO - if ttl removed or added should be moved to the other store (difficulty - 💀)
    try {
      const { key } = req.params
      const updates = req.body
      const itemToUpdate = store.get(key)
      const unlimitedItemToUpdate = unlimitedTtlStore.get(key)

      if (itemToUpdate != null) {
        store.set(key, {
          ...itemToUpdate,
          ...updates
        })
        res.status(200).send(store.get(key))
      }

      if (unlimitedItemToUpdate != null) {
        unlimitedTtlStore.set(key, {
          ...itemToUpdate,
          ...updates,
          id: unlimitedItemToUpdate.id,
          createdAt: unlimitedItemToUpdate.createdAt,
          timesUsed: unlimitedItemToUpdate.timesUsed
        })
      }

      logger.info('No such item')
      return res.status(404).send('nqma takuv chovek')
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
