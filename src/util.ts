import { promises as fs } from 'fs'
// import { dirname } from 'path'
// import { fileURLToPath } from 'url'

export const loadJSON = async (path:string):Promise<object> => {
  return JSON.parse(await fs.readFile(path, { encoding: 'utf8' }))
}

// export const baseSchemaLocation = `${dirname(fileURLToPath(import.meta.url))}/../schema/`
export const baseSchemaLocation = './schema/'
