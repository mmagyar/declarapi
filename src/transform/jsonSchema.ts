import Ajv, { ErrorObject } from 'ajv'
export const jsonValidatorInit = () => {
  return new Ajv({
    loadSchema: async (uri: any) => require(uri.replace('node_modules/', ''))
  })
}

export type jsonValidationSuccess = {type:'success', errors? : (ErrorObject | string)[]};
export type jsonValidationError = {type:'error', errors : (ErrorObject | string)[]};
export type validateResult = jsonValidationSuccess | jsonValidationError;
export const isValidationError = (input:validateResult) : input is jsonValidationError => input && input.type === 'error'
export const validate = async (json: Object, data:any):
 Promise<validateResult> => {
  const validator = await jsonValidatorInit().compileAsync(json)
  const result = validator(data)

  const errors: (ErrorObject | string)[] = validator.errors || []
  errors.push(JSON.stringify(json, null, 2))
  if (!result) return { type: 'error', errors }
  return { type: 'success' }
}
