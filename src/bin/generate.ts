#!/usr/bin/env node
import { Command } from "commander"
import fs, { realpath } from "fs"
import  transform from "../transform/transform";
const npmjson = fs.readFileSync(__dirname + '/../../package.json', 'utf8')

const program = new Command();
program.version(JSON.parse(npmjson).version);
program.option('-F, --file <path>', "Input json yaschva schema to transform")
program.option('-D, --directory <path>', "Input folder containing multiple yaschva schema json files to transform")
program.option('-O, --output <path>', "Output directory for transformed files")
program.option('-W, --overwrite', "Output directory for transformed files")

program.parse(process.argv);


if (!(program.file || program.directory)) {
  console.error("Either file or directory input needs to be set")
  process.exit(-1)
}

const cliProgram = async () => {
  if (program.file) {
    const realPath = await fs.promises.realpath(program.file)
    const file = JSON.parse(await fs.promises.readFile(realPath, 'utf8'))
    const out = await transform(file)
    console.log(out)
  }
}

cliProgram()
  .then(() => process.exit(0))
  .catch((e) => console.error(e.message, e.stack, e))
