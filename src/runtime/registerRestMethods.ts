import { ContractResult, ContractWithValidatedHandler, isContractInError } from './contractValidation'
import { ValidationResult } from 'yaschva'
import { map } from 'microtil'
import { HttpMethods, AuthInput, ContractType } from '../globalTypes'

export type ErrorResponse ={
  errorType: string; data: any; code: number; errors: ValidationResult| string[];}

export type reqType = {
  /** Must contain the parameters for get request */
  query: { [key: string]: any} & {id?:string|string[]},
  /** Must contain the parameters for any other type of request */
  body: { [key: string]: any} & {id?:string|string[]},
  /** Route parameters */
  params: {id?:string},
  /** User must be populated based on authentication, JWT is recommended */
  user?: AuthInput
}

export type resType = {
  status : (code:number) => {json: (input:any)=> void}
}
export type HandleResponse = {code:number, response:any}
export type HandleType = (body: { [key: string]: any} & {id?:string|string[]}, id?: string, user?: AuthInput) => Promise<HandleResponse>
export type Expressable = {
  route: string;
  method: HttpMethods;
  handle: HandleType,
  handler: (req:reqType, res: resType)=> Promise<void>;
  contract: ContractType<any, any>
}
export const registerRestMethods = (input:ContractWithValidatedHandler):Expressable[] =>
  Object.values(input).map(x => {
    const handle:HandleType = async (body, id?, user?) => {
      const { authentication, manageFields } = x.contract

      if (authentication) {
        if (!user?.sub) {
          return {
            code: 401,
            response: {
              code: 401,
              errorType: 'unauthorized',
              data: { id },
              errors: ['Only logged in users can do this']
            }
          }
        }

        if (Array.isArray(authentication)) {
          const perm: string[] = user.permissions || []

          const hasPerm = perm.some(y => authentication.some(z => z === y))
          const canUserAccess = manageFields.createdBy
          if (!hasPerm && !canUserAccess) {
            return {
              code: 403,
              response: {
                code: 403,
                errorType: 'unauthorized',
                data: { id },
                errors: ["You don't have permission to do this"]
              }
            }
          }
        }
      }

      if (id !== undefined) {
        if (body && body.id !== undefined) {
          if (id !== body.id) {
            return {
              code: 400,
              response: {
                code: 400,
                errorType: 'id mismatch',
                data: { query: body, id },
                errors: ['Mismatch between the object Id in the body and the URL']
              }
            }
          }
        } else {
          body.id = id
        }
      }

      try {
        const result: ContractResult =
          await x.handle(body, { ...user, authentication }, manageFields)
        if (isContractInError(result)) { return { code: result.code, response: result } }

        const statusCode = x.contract.type === 'post' ? 201 : 200
        if (id && Array.isArray(result.result)) {
          if (result.result.length > 1) { console.warn('Results contained more than one entry for single return by id') }

          return { code: statusCode, response: result.result[0] }
        }
        return { code: statusCode, response: result.result }
      } catch (e) {
        const data = e && map(e, y => y)
        const code = e?.code || e?.statusCode || 500
        return {
          code: code >= 400 && code < 600 ? code : 500,
          response: {
            errorType: 'exception',
            code,
            data,
            errors: [e?.message]
          }
        }
      }
    }

    return {
      route: `/api/${x.contract.name}/:id?`,
      method: x.contract.type,
      contract: x.contract,
      handle,
      handler: async (req:reqType, res:resType) => {
        const body = x.contract.type === 'get' ? req.query : req.body

        const result = await handle(body, req.params?.id, req.user)
        res.status(result.code).json(result.response)
      }
    }
  })

export default registerRestMethods
