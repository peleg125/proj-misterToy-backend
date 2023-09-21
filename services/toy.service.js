import fs from 'fs'
import { utilService } from './util.service.js'

const toys = utilService.readJsonFile('data/toy.json')

export const toyService = {
  query,
  get,
  remove,
  save,
}

function query(filterBy = {}, sortBy) {
  let filteredToys = toys

  if (filterBy.name) {
    const regExp = new RegExp(filterBy.name, 'i')
    filteredToys = filteredToys.filter((toy) => regExp.test(toy.name))
  }

  if (filterBy.inStock !== undefined) {
    filteredToys = filteredToys.filter((toy) => toy.inStock === JSON.parse(filterBy.inStock))
  }

  if (filterBy.labels && filterBy.labels.length > 0) {
    filteredToys = filteredToys.filter((toy) => filterBy.labels.some((label) => toy.labels.includes(label)))
  }
  sortToysBy(filteredToys, sortBy)
  return Promise.resolve(filteredToys)
}

function sortToysBy(filteredToys, sortBy) {
  if (!sortBy.type) return

  filteredToys.sort((a, b) => {
    let compareValue

    if (typeof a[sortBy.type] === 'string') {
      compareValue = a[sortBy.type].localeCompare(b[sortBy.type])
    } else {
      compareValue = a[sortBy.type] - b[sortBy.type]
    }

    return sortBy.desc === '-1' ? -compareValue : compareValue
  })
}

function get(toyId) {
  const toy = toys.find((toy) => toy._id === toyId)
  if (!toy) return Promise.reject('Toy not found!')
  return Promise.resolve(toy)
}

function remove(toyId) {
  const idx = toys.findIndex((toy) => toy._id === toyId)
  if (idx === -1) return Promise.reject('No Such Toy')
  toys.splice(idx, 1)
  return _saveToysToFile()
}

function save(toy) {
  if (toy._id) {
    const toyToUpdate = toys.find((currToy) => currToy._id === toy._id)
    toyToUpdate.name = toy.name
    toyToUpdate.price = toy.price
    toyToUpdate.labels = toy.labels
    toyToUpdate.inStock = toy.inStock
  } else {
    toy._id = _makeId()
    toy.createdAt = Date.now()
    toys.push(toy)
  }

  return _saveToysToFile().then(() => toy)
  // return Promise.resolve(toy)
}

function _makeId(length = 5) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function _saveToysToFile() {
  return new Promise((resolve, reject) => {
    const toysStr = JSON.stringify(toys, null, 4)
    fs.writeFile('data/toy.json', toysStr, (err) => {
      if (err) {
        return console.log(err)
      }
      console.log('The file was saved!')
      resolve()
    })
  })
}
