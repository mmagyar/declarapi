#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import transform from '../transform/transform'
import server from '../generate/server'
import client from '../generate/client'
const npmjson = fs.readFileSync(path.join(__dirname, '/../../package.json'), 'utf8')

export const cliProgram = async (input:string, output:string, generate: 'all'| 'client'|'server' = 'all', tokenPath?: string) => {
  const outPath = await fs.promises.realpath(output)
  if (!(await fs.promises.lstat(outPath)).isDirectory()) {
    throw new Error(`output_dir: "${output}" must be a directory`)
  }

  const realPath = await fs.promises.realpath(input)
  const outBasename = path.parse(realPath).name
  const file = JSON.parse(await fs.promises.readFile(realPath, 'utf8'))
  const out = await transform(file)
  if (out.type === 'error') {
    console.error(JSON.stringify(out, null, 2))
    throw out.errors
  }

  let serverWrite = {}
  if (generate === 'all' || generate === 'server') {
    const result = server(out.results)
    const serverOutPath = path.join(outPath, `${outBasename}-server.ts`)
    serverWrite = fs.promises.writeFile(serverOutPath, result, { encoding: 'utf8' })
  }

  let clientWrite = {}
  if (generate === 'all' || generate === 'server') {
    const clientResult = client(out.results, tokenPath)
    const clientOutPath = path.join(outPath, `${outBasename}-client.ts`)
    clientWrite = fs.promises.writeFile(clientOutPath, clientResult, { encoding: 'utf8' })
  }

  await Promise.all([serverWrite, clientWrite])
}

if (require.main === module) {
  const program = new Command()
  program.version(JSON.parse(npmjson).version)
  program.option('-p, --parts <all|server|client>', 'Select which parts to generate: all, server or client', 'all')
  program.arguments('<input_file> <output_dir> [get_token_path]')
  program.action((inputFileArg, outputDirArg, getTokenPathArg) => {
    if (!(program.parts || '').match(/(all|server|client)/gm)) {
      throw new Error('parts options must be either all or server or client')
    }
    cliProgram(inputFileArg, outputDirArg, program.parts, getTokenPathArg || undefined)
      .then(() => process.exit(0))
      .catch((e) => console.error(e.message, e.stack, e))
  })

  program.parse(process.argv)
}
