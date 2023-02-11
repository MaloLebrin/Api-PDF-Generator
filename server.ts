import type { Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { useLogger } from './loggerService'
import { hbs } from './src/handleBarConfig'
import { ViewController } from './src/controller/ViewController'
import path from 'path'

async function startApp() {
  const { loggerMiddleware, logger } = useLogger()

  const app = express()

  dotenv.config()
  app.use(cors())
  app.use(helmet())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(loggerMiddleware)

  app.engine('handlebars', hbs.engine)
  app.set('view engine', 'handlebars')
  // app.set('views', '/app/src/views')
  app.set("views", path.resolve(__dirname, "./src/views"));

  app.get('/', (_req: Request, res: Response) => {
    return res.send('Hello World')
  })

  // Routes
  app.get('/pages/download', new ViewController().SendView)

  const port = parseInt(process.env.PORT!) || 5555
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Application is running in ${process.env.NODE_ENV} mode on port : ${port}`)
  })
}
startApp()
