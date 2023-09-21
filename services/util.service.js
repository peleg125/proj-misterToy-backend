import fs from 'fs'

export const utilService = {
  readJsonFile,
  getSortedToys,
}

function readJsonFile(path) {
  const str = fs.readFileSync(path, 'utf8')
  const json = JSON.parse(str)
  return json
}
function getSortedToys(toysToSort, sortBy) {
  if (!sortBy || !sortBy.type) return [...toysToSort]

  const sortedToys = [...toysToSort].sort((toy1, toy2) => {
    const val1 = toy1[sortBy.type]
    const val2 = toy2[sortBy.type]

    if (typeof val1 === 'string') {
      return (sortBy.desc ? -1 : 1) * val1.localeCompare(val2)
    }

    return (sortBy.desc ? -1 : 1) * (val1 - val2)
  })

  return sortedToys
}
