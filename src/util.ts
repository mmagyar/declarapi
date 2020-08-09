import fsAll from 'fs'

const fs = fsAll.promises

export const loadJSON = async (path:string):Promise<object> => {
  return JSON.parse(await fs.readFile(path, { encoding: 'utf8' }))
}
