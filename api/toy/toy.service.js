import mongodb from 'mongodb'
const { ObjectId } = mongodb

import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'

async function query(filterBy = {}, sortBy = {}) {
  try {
    const criteria = {}

    if (filterBy.name) {
      criteria.name = { $regex: filterBy.name, $options: 'i' }
    }

    if (filterBy.inStock !== undefined) {
      criteria.inStock = JSON.parse(filterBy.inStock)
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
      criteria.labels = { $in: filterBy.labels }
    }

    const collection = await dbService.getCollection('toy')

    let sortCriteria = {}
    if (sortBy.type) {
      const direction = sortBy.desc === '-1' ? -1 : 1
      sortCriteria[sortBy.type] = direction
    }

    const toys = await collection.find(criteria).sort(sortCriteria).toArray()

    return toys
  } catch (err) {
    loggerService.error('cannot find toys', err)
    throw err
  }
}

async function getById(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    const toy = await collection.findOne({ _id: ObjectId(toyId) })
    if (!toy) loggerService.error(`no toy ${toyId}`)
    if (toy) loggerService.info(`while finding toy ${toyId}`, toy)
    return toy
  } catch (err) {
    loggerService.error(`while finding toy ${toyId}`, err)
    throw err
  }
}

async function remove(toyId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.deleteOne({ _id: ObjectId(toyId) })
  } catch (err) {
    loggerService.error(`cannot remove toy ${toyId}`, err)
    throw err
  }
}

async function save(toy) {
  try {
    const collection = await dbService.getCollection('toy')

    if (toy._id) {
      const toyToSave = {
        name: toy.name,
        price: toy.price,
        labels: toy.labels,
        inStock: toy.inStock,
      }
      await collection.updateOne({ _id: ObjectId(toy._id) }, { $set: toyToSave })
    } else {
      toy.createdAt = Date.now()
      const result = await collection.insertOne(toy)
      toy._id = result.insertedId
    }

    return toy
  } catch (err) {
    loggerService.error(`cannot save toy ${toy._id}`, err)
    throw err
  }
}

async function addToyMsg(toyId, msg) {
  try {
    msg.id = utilService.makeId()
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId(toyId) }, { $push: { msgs: msg } })
    return msg
  } catch (err) {
    loggerService.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

async function removeToyMsg(toyId, msgId) {
  try {
    const collection = await dbService.getCollection('toy')
    await collection.updateOne({ _id: ObjectId(toyId) }, { $pull: { msgs: { id: msgId } } })
    return msgId
  } catch (err) {
    loggerService.error(`cannot add toy msg ${toyId}`, err)
    throw err
  }
}

export const toyService = {
  remove,
  query,
  getById,
  save,
  addToyMsg,
  removeToyMsg,
}
