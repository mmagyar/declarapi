import { ContractResult, ContractWithValidatedHandler, isContractInError } from './contractValidation'
import { ValidationResult } from 'yaschva'
import { map } from 'microtil'
import { HttpMethods, Auth } from '../globalTypes'

export type ErrorResponse ={
  errorType: string; data: any; code: number; errors: ValidationResult| string[];}

const shouldReturnSingle = (req: any): boolean => req.params?.id || req.query?.id

export type reqType = {
  /** Must contain the parameters for get request */
  query: { [key: string]: any} & {id?:string},
  /** Must contain the parameters for any other type of request */
  body: { [key: string]: any} & {id?:string},
  /** Route parameters */
  params: {id?:string},
  /** User must be populated based on authenticatin, JWT is recommended */
  user?: Auth
}

export type resType = {
  status : (code:number) => {json: (input:any)=> void}
}

export type Expressable = {
  route: string;
  method: HttpMethods;
  handler: (req:reqType, res: resType)=> void;
}
export const registerRestMethods = (input:ContractWithValidatedHandler):Expressable[] =>
  Object.values(input).map(x => {
    return {
      route: `/api/${x.name}/:id?`,
      method: x.method,
      handler: async (req:reqType, res:resType) => {
        const { authentication } = x

        if (authentication && Array.isArray(authentication)) {
          const perm: string[] = req.user?.permissions || []

          const hasPerm = perm.some(y => authentication.some(z => z === y))
          if (!hasPerm) {
            return res.status(401).json({
              code: 401,
              errorType: 'unauthorized',
              data: { params: req.params },
              errors: ["You don't have permission to do this"]
            })
          }
        } else if (authentication && !req.user) {
          return res.status(401).json({
            code: 401,
            errorType: 'unauthorized',
            data: { params: req.params },
            errors: ['Only logged in users can do this']
          })
        }

        const error = (code: number, value: ErrorResponse) => res.status(code).json(value)
        const resultSend = (code: number, value: any) => res.status(code).json(value)
        const query = x.method === 'get' ? req.query : req.body
        if (req.params && req.params.id !== undefined) {
          if (query && query.id !== undefined) {
            if (req.params.id !== query.id) {
              return error(400, {
                code: 400,
                errorType: 'id mismatch',
                data: { query, params: req.params },
                errors: ['Mismatch between the object Id in the body and the URL']
              })
            }
          } else {
            query.id = req.params.id
          }
        }

        try {
          const result: ContractResult = await x.handle(query, req.user)

          if (isContractInError(result)) { return error(result.code, result) }

          const statusCode = x.method === 'post' ? 201 : 200
          if (shouldReturnSingle(req) && Array.isArray(result.result)) {
            if (result.result.length > 1) { console.warn('Results contained more than one entry for single return by id') }

            return resultSend(statusCode, result.result[0])
          }
          return resultSend(statusCode, result.result)
        } catch (e) {
          const data = e && map(e, y => y)
          const code = e?.code || 500
          return error(code >= 400 && code < 600 ? code : 500, {
            errorType: 'exception',
            code,
            data,
            errors: [e?.message]
          })
        }
      }
    }
  })

export default registerRestMethods
