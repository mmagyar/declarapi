#!/usr/bin/env node
import { Command } from 'commander'
import fs from 'fs'
import path from 'path'
import transform from '../transform/transform'
import server from '../generate/server'
const npmjson = fs.readFileSync(path.join(__dirname, '/../../package.json'), 'utf8')

const cliProgram = async (input:string, output:string) => {
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

  const result = server(out.results)
  const serverOutPath = path.join(outPath, `${outBasename}-server.ts`)
  console.log(serverOutPath)
  await fs.promises.writeFile(serverOutPath, result, { encoding: 'utf8' })
  console.log(result)
}

const program = new Command()
program.version(JSON.parse(npmjson).version)

program.arguments('<input_file> <output_dir>')
program.action(async (inputFileArg, outputDirArg) => {
  cliProgram(inputFileArg, outputDirArg)
    .then(() => process.exit(0))
    .catch((e) => console.error(e.message, e.stack, e))
})

program.parse(process.argv)
