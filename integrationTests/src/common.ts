import { AuthInput } from '../../src/globalTypes'
import { generateRandomCall } from '../../src/index'
import { Expressable } from '../../src/runtime/registerRestMethods'
import { CrudContract } from '../../src/transform/types'
import { promises as fs } from 'fs'
import { generate, writeFile } from '../../src/bin/generate'
import path from 'path'

export type CallArgument =[{ [key: string]: any}, string?, AuthInput?]
export type ArgumentVariations= { [key:string] :CallArgument}

export const addAuth = (callArgument: CallArgument, input:AuthInput) => {
  const result = [...callArgument]
  result[2] = input
  return input
}
export const generateContract = async (schemaFilePath:string, outputName:string, decorator : (input: CrudContract) => CrudContract = x => x) => {
  const json = await fs.readFile(schemaFilePath, { encoding: 'utf8' })
  const parsed = decorator(JSON.parse(json))
  const generated = await generate('server', parsed)
  const outPath = path.join(__dirname, '../temp')
  await writeFile(generated, outputName, outPath)
  return path.join(outPath, outputName)
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
