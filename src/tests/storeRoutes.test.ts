import request from "supertest"
import express from "express";
import router from '../routes'

const app = express()

app.use(express.json())
app.use("/",router)

describe('API CALLS TEST', ()=>{

    
   const expectedItem = {
      createdAt: expect.any(Number),
      id: expect.any(String),
      name: "whatever",
      proffesion: "raboti", 
      ttl: 15000 
  } 
  const testItem = {
    key: 'testExemplar',
    name: "whatever",
    proffesion: "raboti",
    ttl: 15000
}

beforeEach(async () => {
    
    await request(app).post('/add').send(testItem);
  });
  
  afterEach(async () => {
    await request(app).delete(`/terminate/${testItem.key}`);
  });


  test('DELETE /terminate',async () => {
    const key = 'testExemplar'
    const response = await request(app).delete(`/terminate/${testItem.key}`)
    expect(response.status).toBe(200)
})

    test('POST /add' ,async()=>{
       
        const response = await request(app).post('/add').send(testItem)
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(expectedItem)
    })
    

    test('GET /getValue',async () => {
        const key = 'testExemplar'
        const response = await request(app).get(`/getValue/${testItem.key}`)
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject(expectedItem)
    })

    test('PUT /update',async()=>{
        const key = 'testExemplar';
        const updates = {
            name: "newName",
            proffesion: "bezraboten",
        }
        const response = await request(app).put(`/update/${testItem.key}`).send(updates)
        
        

        expect(response.body).toMatchObject({
            createdAt: expect.any(Number),
            id: expect.any(String),
            name: "newName",
            proffesion: "bezraboten", 
            ttl: 15000
        })
    })

   
    
})

