"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeDef = exports.name = exports.capitalize = void 0;
const yaschva_1 = require("yaschva");
exports.capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
exports.name = (x) => `${x.name}${exports.capitalize(x.method)}`;
exports.typeDef = (contracts) => contracts.map(x => `/** ${x.name} types for ${x.method} method **/
export type ${exports.name(x)}Argument = ${yaschva_1.validationToType(x.arguments)}
export type ${exports.name(x)}Returns = ${yaschva_1.validationToType(x.returns)}\n`).join('\n');
//# sourceMappingURL=common.js.map