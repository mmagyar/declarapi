import Ajv, { ErrorObject } from 'ajv'
import fetch from 'node-fetch'
export const jsonValidatorInit = () => {
  const baseSchemaLocation = `${__dirname}/../../src/schema/`
  return new Ajv({
    loadSchema: async (uri: any) => {
      if (typeof uri === 'string' && uri.startsWith('node_modules')) {
        return require(uri.replace('node_modules/', ''))
      }
      return typeof uri === 'string' && uri.startsWith('http')
        ? fetch(uri).then(x => x.json())
        : new Promise<Record<string, any>>(resolve => resolve(require(baseSchemaLocation + uri)))
    }
  })
}

export type jsonValidationSuccess = {type:'success', errors? : ErrorObject[]};
export type jsonValidationError = {type:'error', errors : ErrorObject[]};
export type validateResult = jsonValidationSuccess | jsonValidationError;
export const isValidationError = (input:validateResult) : input is jsonValidationError => input && input.type === 'error'
export const validate = async (jsonInput: string| Object, data:any):
 Promise<validateResult> => {
  const json = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput
  const validator = await jsonValidatorInit().compileAsync(json)
  const result = validator(data)

  if (!result) return { type: 'error', errors: validator.errors || [] }
  return { type: 'success' }
}
