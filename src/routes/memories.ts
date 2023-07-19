import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma'

export async function memoriesRoutes(app: FastifyInstance) {
  /**
   * Verificar token JWT antes da execução dos métodos
   *
   * @author Darllinson Azevedo
   */
  app.addHook('preHandler', async (req) => {
    await req.jwtVerify()
  })

  /**
   * Recuperar as memórias de um usuário
   *
   * @author Darllinson Azevedo
   */
  app.get('/memories', async (req) => {
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.user.sub,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return memories.map((memory) => {
      return {
        id: memory.id,
        coverUrl: memory.coverUrl,
        excerpt:
          memory.content.length > 115
            ? memory.content.substring(0, 115).concat('...')
            : memory.content,
      }
    })
  })

  /**
   * Recuperar detalhes de uma memória
   *
   * @author Darllinson Azevedo
   */
  app.get('/memories/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    })

    if (!memory.isPublic && memory.userId !== req.user.sub) {
      return reply.status(401).send()
    }

    return memory
  })

  /**
   * Cadastrar uma memória de um usuário
   *
   * @author Darllinson Azevedo
   */
  app.post('/memories', async (req) => {
    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

    const memory = await prisma.memory.create({
      data: {
        content,
        coverUrl,
        isPublic,
        userId: req.user.sub,
      },
    })

    return memory
  })

  /**
   * Atualizar os dados e informações da memória de um usuário
   *
   * @author Darllinson Azevedo
   */
  app.put('/memories/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = paramsSchema.parse(req.params)

    const bodySchema = z.object({
      content: z.string(),
      coverUrl: z.string(),
      isPublic: z.coerce.boolean().default(false),
    })
    const { content, coverUrl, isPublic } = bodySchema.parse(req.body)

    let memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    })

    if (memory.userId !== req.user.sub) {
      return reply.status(401).send()
    }

    memory = await prisma.memory.update({
      where: {
        id,
      },
      data: {
        content,
        coverUrl,
        isPublic,
      },
    })

    return memory
  })

  /**
   * Excluir memória de um usuário
   *
   * @author Darllinson Azevedo
   */
  app.delete('/memories/:id', async (req, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = paramsSchema.parse(req.params)

    const memory = await prisma.memory.findUniqueOrThrow({
      where: { id },
    })

    if (memory.userId !== req.user.sub) {
      return reply.status(401).send()
    }

    await prisma.memory.delete({
      where: { id },
    })
  })
}
