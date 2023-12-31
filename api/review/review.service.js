import { dbService } from '../../services/db.service.js'
import { loggerService } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'
import mongodb from 'mongodb'
const { ObjectId } = mongodb

async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy)

    const collection = await dbService.getCollection('review')

    let reviews = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            localField: 'byUserId',
            from: 'user',
            foreignField: '_id',
            as: 'byUser',
          },
        },
        {
          $unwind: '$byUser',
        },
        {
          $lookup: {
            localField: 'aboutToyId',
            from: 'toy',
            foreignField: '_id',
            as: 'aboutToy',
          },
        },
        {
          $unwind: '$aboutToy',
        },
      ])
      .toArray()

    reviews = reviews.map((review) => {
      review.byUser = { _id: review.byUser._id, fullname: review.byUser.fullname }
      review.aboutToy = { _id: review.aboutToy._id, name: review.aboutToy.name }
      delete review.userId
      delete review.aboutToyId
      return review
    })

    return reviews
  } catch (err) {
    loggerService.error('cannot find reviews', err)
    throw err
  }
}

async function remove(reviewId) {
  try {
    const store = asyncLocalStorage.getStore()
    const { loggedinUser } = store
    const collection = await dbService.getCollection('review')
    // remove only if user is owner/admin
    const criteria = { _id: ObjectId(reviewId) }
    if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
    const { deletedCount } = await collection.deleteOne(criteria)
    return deletedCount
  } catch (err) {
    loggerService.error(`cannot remove review ${reviewId}`, err)
    throw err
  }
}

async function add(review) {
  try {
    const reviewToAdd = {
      byUserId: ObjectId(review.byUserId),
      aboutToyId: ObjectId(review.aboutToyId),
      txt: review.txt,
    }
    const collection = await dbService.getCollection('review')
    await collection.insertOne(reviewToAdd)
    return reviewToAdd
  } catch (err) {
    loggerService.error('cannot insert review', err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
  if (filterBy.toyId) criteria.toyId = ObjectId(filterBy.toyId)
  return criteria
}

export const reviewService = {
  query,
  remove,
  add,
}
