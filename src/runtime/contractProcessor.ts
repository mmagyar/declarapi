import { validate, ValidationResult } from 'yaschva'
import { map } from 'microtil'
import { ContractType, HttpMethods } from '../globalTypes'
export type ContractResultError = {
  errorType: string; data: any; code: number; errors: ValidationResult|string[];};
export type ContractResultSuccess = {result: object}
export type ContractResult = ContractResultError | ContractResultSuccess;
export const isContractInError = (tbd: any): tbd is ContractResultError =>
  Boolean(tbd.errors)
export type ProcessedContracts = {
  [key: string]: {
    name: string;
    handle: (input: any) => Promise<ContractResult>;
    method: HttpMethods;
    authentication: boolean | string[];
  };
};

export const processContracts = (
  contracts: { [key:string]: ContractType<any, any>},
  validateOutput:boolean = true
): ProcessedContracts => {
  return map(contracts, (value: ContractType<any, any>) => {
    let authentication: any = false
    if (typeof value.authentication === 'boolean' || Array.isArray(value.authentication)) {
      authentication = value.authentication
    } else if ((value.authentication as any)[value.type]) {
      authentication = (value.authentication as any)[value.type]
    } else if ((value.authentication as any).modify) {
      authentication = (value.authentication as any).modify
    } else if ((value.authentication as any).put && value.type === 'patch') {
      authentication = (value.authentication as any).put
    } else if ((value.authentication as any).delete) {
      authentication = (value.authentication as any).delete
    } else {
      console.warn(`Invalid auth: ${value.authentication}`)
      authentication = ['admin']
    }

    return {
      name: value.name,
      method: value.type,
      authentication,
      handle: async (input: any): Promise<ContractResult> => {
        const validationResult = validate(value.arguments, input)
        if (validationResult.result === 'fail') {
          return {
            errorType: 'Input validation failed',
            data: input,
            code: 400,
            errors: validationResult
          }
        }

        if (value.handle) {
          const result = await value.handle(input)
          if (validateOutput) {
            const outputValidation = validate(value.returns, result)
            if (outputValidation.result === 'fail') {
              return {
                errorType: 'Unexpected result from function',
                data: result,
                code: 500,
                errors: outputValidation
              }
            }
          }
          return { result }
        }
        return {
          errorType: 'Not implemented',
          data: value.name,
          code: 501,
          errors: [`Handler for ${value.name} was not defined`]
        }
      }
    }
  })
}
