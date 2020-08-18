#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import transform from './transform/transform.js'
import server from './generate/server.js'
import client from './generate/client.js'

export const generate = async (parts: 'all' | 'client'|'server', schema:object, tokenPath?:string) => {
  const out = await transform(schema)
  if (out.type === 'error') {
    console.error(JSON.stringify(out, null, 2))
    throw out.errors
  }

  return {
    server: parts === 'all' || parts === 'server' ? server(out.results) : undefined,
    client: parts === 'all' || parts === 'client' ? client(out.results, tokenPath) : undefined
  }
}
const loadFile = async (input:string) => {
  const realPath = await fs.promises.realpath(input)
  const basename = path.parse(realPath).name
  return { filename: basename, data: JSON.parse(await fs.promises.readFile(realPath, 'utf8')) }
}

export const writeFile = async (input: {
  server: string | undefined;
  client: string | undefined;
}, outputFilename: string, outputDir: string) => {
  if (!fs.existsSync(outputDir)) {
    await fs.promises.mkdir(outputDir)
  }
  const outPath = await fs.promises.realpath(outputDir)

  if (!(await fs.promises.stat(outputDir)).isDirectory()) {
    throw new Error(`output_dir: "${outputDir}" must be a directory`)
  }

  if (input.server) {
    const serverOutPath = path.join(outPath, `${outputFilename}-server.ts`)
    await fs.promises.writeFile(serverOutPath, input.server, { encoding: 'utf8' })
  }

  if (input.client) {
    const clientOutPath = path.join(outPath, `${outputFilename}-client.ts`)
    await fs.promises.writeFile(clientOutPath, input.client, { encoding: 'utf8' })
  }
}
export const cliProgram = async (input:string, output:string, parts: 'all'| 'client'|'server' = 'all', tokenPath?: string) => {
  const loadFiles = await loadFile(input)
  const out = await generate(parts, loadFiles.data, tokenPath)

  await (writeFile(out, loadFiles.filename, output))
}
