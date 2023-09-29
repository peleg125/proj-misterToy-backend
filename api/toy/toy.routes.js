import express from 'express'
import { getToyById, getToys, removeToy, saveToy } from './toy.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

export const toyRoutes = express.Router()

toyRoutes.get('/', log, getToys)
toyRoutes.get('/:id', getToyById)
toyRoutes.post('/', saveToy)
toyRoutes.put('/:id', saveToy)
toyRoutes.delete('/:id', requireAuth, removeToy)

// toyRoutes.post('/:id/msg', requireAuth, addToyMsg)
// toyRoutes.delete('/:id/msg/:msgId', requireAuth, removeToyMsg)
