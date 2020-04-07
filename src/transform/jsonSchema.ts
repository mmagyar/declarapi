import Ajv, { ErrorObject } from 'ajv'
export const jsonValidatorInit = () => {
  return new Ajv({
    loadSchema: async (uri: any) => require(uri.replace('node_modules/', ''))
  })
}

export type jsonValidationSuccess = {type:'success', errors? : ErrorObject[]};
export type jsonValidationError = {type:'error', errors : ErrorObject[]};
export type validateResult = jsonValidationSuccess | jsonValidationError;
export const isValidationError = (input:validateResult) : input is jsonValidationError => input && input.type === 'error'
export const validate = async (json: Object, data:any):
 Promise<validateResult> => {
  const validator = await jsonValidatorInit().compileAsync(json)
  const result = validator(data)

  const errors = validator.errors || []
  if (!result) return { type: 'error', errors }
  return { type: 'success' }
}
