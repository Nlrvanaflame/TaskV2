import request from 'supertest'
import express from 'express'
import router from '../routes/storeRoutes'

const app = express()

app.use(express.json())
app.use('/', router)

const expectedItem = {
  createdAt: expect.any(Number),
  id: expect.any(String),
  name: 'whatever',
  proffesion: 'raboti',
  ttl: 15000
}
const testItem = {
  key: 'testExemplar',
  name: 'whatever',
  proffesion: 'raboti',
  ttl: 15000
}

describe('API CALLS TEST', () => {
  beforeEach(async () => {
    await request(app).post('/add').send(testItem)
  })

  afterEach(async () => {
    await request(app).delete(`/terminate/${testItem.key}`)
  })

  test('Terminating an exemplar /terminate', async () => {
    const response = await request(app).delete(`/terminate/${testItem.key}`)
    expect(response.status).toBe(200)
  })

  // test('Getting the parameters of an exemplar /getValue', async () => {
  //   const response = await request(app).get(`/getValue/${testItem.key}`)
  //   expect(response.status).toBe(200)
  //   expect(response.body).toMatchObject(expectedItem)
  // })

  // test('Updating the paramteres of an existing exemplar /update', async () => {
  //   const updates = {
  //     name: 'newName',
  //     proffesion: 'bezraboten'
  //   }
  //   const response = await request(app).put(`/update/${testItem.key}`).send(updates)

  //   expect(response.body).toMatchObject({
  //     createdAt: expect.any(Number),
  //     id: expect.any(String),
  //     name: 'newName',
  //     proffesion: 'bezraboten',
  //     ttl: 15000
  //   })
  // })
})

describe('Add API call', () => {
  // test('Adding a new exemplar /add', async () => {
  //   const response = await request(app).post('/add').send(testItem)
  //   expect(response.status).toBe(201)
  //   expect(response.body).toMatchObject(expectedItem)
  // })
})
