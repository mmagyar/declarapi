import { AuthInput } from '../globalTypes'
import { generate } from 'yaschva'
import { Expressable } from '../runtime/registerRestMethods'

export const generateRandomCall =
 async <Input, Output>(input: Expressable, auth: AuthInput = {}):
  Promise<{output: Output, generatedInput:Input}> => {
   const generated = generate(input.contract.arguments)
   return {
     output: (await input.handle(generated, undefined, auth)).response,
     generatedInput: generated
   }
 }
