import { fileURLToPath } from 'url'
import { dirname } from 'path'

const getDirName = () => {
  // @ts-ignore
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  return __dirname
}
export const es6SchemaLocation = getDirName() + '/schema/'
