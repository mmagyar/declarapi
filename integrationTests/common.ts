import { AuthInput } from '../src/globalTypes'
import { generateRandomCall } from '../src/index'
import { HandleType, Expressable } from '../src/runtime/registerRestMethods'

export type CallArgument =[{ [key: string]: any}, string?, AuthInput?]
export type ArgumentVariations= { [key:string] :CallArgument}

export const addAuth = (callArgument: CallArgument, input:AuthInput) => {
  const result = [...callArgument]
  result[2] = input
  return input
}

export const checkMatchingGenerated = (generatorOut:{output: any, generatedInput:any}) => {
  if (generatorOut.output.errors) {
    throw new Error(generatorOut.output.errors)
  }
  expect(generatorOut.output.id).toBeTruthy()
  if (generatorOut.generatedInput.id) {
    expect(generatorOut.output.id).toBe(generatorOut.generatedInput.id)
  }

  const newOut = { ...generatorOut.output, id: undefined }
  const newIn = { ...generatorOut.generatedInput, id: undefined }
  expect(newOut).toStrictEqual(newIn)
  return generatorOut
}

export const checkedGenerate = async <Input, Output>(postContract: Expressable, authInput:AuthInput):
  Promise<{ output: Output; generatedInput: Input;}> => {
  return checkMatchingGenerated(await generateRandomCall(postContract.handle, postContract.contract, authInput))
}
