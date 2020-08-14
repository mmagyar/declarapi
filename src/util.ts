import { promises as fs } from 'fs'
import path from 'path'

export const loadJSON = async (path:string):Promise<object> => {
  return JSON.parse(await fs.readFile(path, { encoding: 'utf8' }))
}

// This is required for both es6 and commonjs support
if (!global?.['__dirname']) {
  (global as any).__dirname = undefined
}

export const baseSchemaLocation = async () => {
  if (!__dirname) {
    return (await import('./url.js')).es6SchemaLocation
  }
  return path.join(__dirname, '/../schema/')
}
