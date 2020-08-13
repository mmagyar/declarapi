#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cliProgram = exports.writeFile = exports.generate = void 0;
const commander_1 = __importDefault(require("commander"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const transform_js_1 = __importDefault(require("../transform/transform.js"));
const server_js_1 = __importDefault(require("../generate/server.js"));
const client_js_1 = __importDefault(require("../generate/client.js"));
const { Command } = commander_1.default;
const npmjson = fs_1.default.readFileSync('./package.json', 'utf8');
exports.generate = (parts, schema, tokenPath) => __awaiter(void 0, void 0, void 0, function* () {
    const out = yield transform_js_1.default(schema);
    if (out.type === 'error') {
        console.error(JSON.stringify(out, null, 2));
        throw out.errors;
    }
    return {
        server: parts === 'all' || parts === 'server' ? server_js_1.default(out.results) : undefined,
        client: parts === 'all' || parts === 'client' ? client_js_1.default(out.results, tokenPath) : undefined
    };
});
const loadFile = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const realPath = yield fs_1.default.promises.realpath(input);
    const basename = path_1.default.parse(realPath).name;
    return { filename: basename, data: JSON.parse(yield fs_1.default.promises.readFile(realPath, 'utf8')) };
});
exports.writeFile = (input, outputFilename, outputDir) => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs_1.default.existsSync(outputDir)) {
        yield fs_1.default.promises.mkdir(outputDir);
    }
    const outPath = yield fs_1.default.promises.realpath(outputDir);
    if (!(yield fs_1.default.promises.stat(outputDir)).isDirectory()) {
        throw new Error(`output_dir: "${outputDir}" must be a directory`);
    }
    if (input.server) {
        const serverOutPath = path_1.default.join(outPath, `${outputFilename}-server.ts`);
        yield fs_1.default.promises.writeFile(serverOutPath, input.server, { encoding: 'utf8' });
    }
    if (input.client) {
        const clientOutPath = path_1.default.join(outPath, `${outputFilename}-client.ts`);
        yield fs_1.default.promises.writeFile(clientOutPath, input.client, { encoding: 'utf8' });
    }
});
exports.cliProgram = (input, output, parts = 'all', tokenPath) => __awaiter(void 0, void 0, void 0, function* () {
    const loadFiles = yield loadFile(input);
    const out = yield exports.generate(parts, loadFiles.data, tokenPath);
    yield (exports.writeFile(out, loadFiles.filename, output));
});
const program = new Command();
program.version(JSON.parse(npmjson).version);
program.option('-p, --parts <all|server|client>', 'Select which parts to generate: all, server or client', 'all');
program.arguments('<input_file> <output_dir> [get_token_path]');
program.action((inputFileArg, outputDirArg, getTokenPathArg) => {
    if (!(program.parts || '').match(/(all|server|client)/gm)) {
        throw new Error('parts options must be either all or server or client');
    }
    exports.cliProgram(inputFileArg, outputDirArg, program.parts, getTokenPathArg || undefined)
        .then(() => process.exit(0))
        .catch((e) => console.error(e.message, e.stack, e));
});
program.parse(process.argv);
//# sourceMappingURL=generate.js.map