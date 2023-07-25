import 'dotenv/config'

import fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import { memoriesRoutes } from './routes/memories'
import { authRoutes } from './routes/auth'
import { uploadRoutes } from './routes/upload'
import { resolve } from 'path'

const app = fastify()

app.register(cors, {
  origin: true /** Todas as aplicações frontend terão acesso a este backend */,
})

app.register(multipart)

app.register(jwt, {
  secret: 'spacetime',
})

// eslint-disable-next-line @typescript-eslint/no-var-requires
app.register(require('@fastify/static'), {
  root: resolve(__dirname, '../uploads'),
  prefix: '/uploads',
})

app.register(authRoutes)
app.register(memoriesRoutes)
app.register(uploadRoutes)

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('🚀 HTTP server running!')
  })
