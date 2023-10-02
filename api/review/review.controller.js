import { loggerService } from '../../services/logger.service.js'
import { userService } from '../user/user.service.js'
import { authService } from '../auth/auth.service.js'
import { reviewService } from './review.service.js'
import { toyService } from '../toy/toy.service.js'

export async function getReviews(req, res) {
  try {
    const reviews = await reviewService.query(req.query)

    res.send(reviews)
  } catch (err) {
    loggerService.error('Cannot get reviews', err)
    res.status(400).send({ err: 'Failed to get reviews' })
  }
}

export async function deleteReview(req, res) {
  try {
    const deletedCount = await reviewService.remove(req.params.id)
    if (deletedCount === 1) {
      res.send({ msg: 'Deleted successfully' })
    } else {
      res.status(400).send({ err: 'Cannot remove review' })
    }
  } catch (err) {
    loggerService.error('Failed to delete review', err)
    res.status(400).send({ err: 'Failed to delete review' })
  }
}

export async function addReview(req, res) {
  var { loggedinUser } = req

  try {
    var review = req.body
    review.byUserId = loggedinUser._id
    review = await reviewService.add(review)

    review.aboutToy = await toyService.getById(review.aboutToyId)

    loggedinUser = await userService.update(loggedinUser)
    review.byUser = loggedinUser

    const loginToken = authService.getLoginToken(loggedinUser)
    res.cookie('loginToken', loginToken)

    delete review.aboutToyId
    delete review.byUserId

    res.send(review)
  } catch (err) {
    loggerService.error('Failed to add review', err)
    res.status(400).send({ err: 'Failed to add review' })
  }
}
