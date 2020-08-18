#!/usr/bin/env node
import pkg from 'commander'
import fs from 'fs'
import { cliProgram } from '../index.js'

const { Command } = pkg
const npmjson = fs.readFileSync('./package.json', 'utf8')

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
    .catch((e) => {
      console.error(e.message, e.stack, e)
      process.exit(1)
    })
})

program.parse(process.argv)
