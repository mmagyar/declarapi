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
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseSchemaLocation = exports.loadJSON = void 0;
const fs_1 = require("fs");
// import { dirname } from 'path'
// import { fileURLToPath } from 'url'
exports.loadJSON = (path) => __awaiter(void 0, void 0, void 0, function* () {
    return JSON.parse(yield fs_1.promises.readFile(path, { encoding: 'utf8' }));
});
// export const baseSchemaLocation = `${dirname(fileURLToPath(import.meta.url))}/../schema/`
exports.baseSchemaLocation = './schema/';
//# sourceMappingURL=util.js.map