import { loggerService } from '../../services/logger.service.js'
import { toyService } from './toy.service.js'

// app.get('/api/getconfig', (req, res) => {
//   const config = {
//     apiKey: APIKEY,
//   }

//   res.send(config)
// })

export async function getToys(req, res) {
  try {
    const { name, price, labels, createdAt, inStock, type, desc } = req.query
    const filterBy = { name, price: +price, inStock, labels, createdAt }
    const sortBy = { type, desc }

    const toys = await toyService.query(filterBy, sortBy)
    res.json(toys)
  } catch (err) {
    loggerService.error('Cannot load toys', err)
    res.status(400).send('Cannot load toys')
  }
}

// Edit
export async function saveToy(req, res) {
  try {
    const toy = {
      name: req.body.name,
      labels: req.body.labels,
      inStock: req.body.inStock,
      price: +req.body.price,
    }

    if (req.body._id) {
      toy._id = req.body._id
    }

    const savedToy = await toyService.save(toy)
    res.json(savedToy)
  } catch (err) {
    const action = req.body._id ? 'update' : 'add'
    loggerService.error(`Cannot ${action} toy`, err)
    res.status(400).send(`Cannot ${action} toy`)
  }
}

// Read - getById
export async function getToyById(req, res) {
  try {
    const { toyId } = req.params

    const toy = await toyService.getById(toyId)
    res.json(toy)
  } catch (err) {
    loggerService.error('Cannot get toy', err)
    res.status(400).send('Cannot get toy')
  }
}
//remove
export async function removeToy(req, res) {
  try {
    const { toyId } = req.params
    await toyService.remove(toyId)
    res.json({ msg: 'Toy removed', toyId })
  } catch (err) {
    loggerService.error('Cannot delete toy', err)
    res.status(400).send('Cannot delete toy')
  }
}
