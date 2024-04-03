import express, { type Express } from 'express'
import routes from './routes'

const app: Express = express()
const PORT = (process.env.PORT != null) || 3000

app.use(express.json())

app.use('/', routes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
