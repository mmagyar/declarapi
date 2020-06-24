import { ContractType } from '../globalTypes'
import { generate } from 'yaschva'

export const generateRandomCall =
 async <Output>(input: ContractType<any, Output>): Promise<Output> => {
   if (input.handle) {
     return input.handle(generate(input.arguments))
   } else {
     throw new Error('handle must be defined to call it with randomly generated arguments')
   }
 }
