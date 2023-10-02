import express from 'express'
import { addToyMsg, getToyById, getToys, removeToy, removeToyMsg, saveToy } from './toy.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

export const toyRoutes = express.Router()

toyRoutes.get('/', log, getToys)
toyRoutes.get('/:toyId', getToyById)
toyRoutes.post('/', requireAdmin, saveToy)
toyRoutes.put('/:toyId', requireAdmin, saveToy)
toyRoutes.delete('/:toyId', requireAuth, removeToy)

toyRoutes.post('/:id/msg', requireAuth, addToyMsg)
toyRoutes.delete('/:id/msg/:msgId', requireAuth, removeToyMsg)
