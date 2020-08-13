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
exports.transform = void 0;
const crud_js_1 = require("./crud.js");
const single_js_1 = require("./single.js");
exports.transform = (contract) => __awaiter(void 0, void 0, void 0, function* () {
    const data = contract;
    if (!data.$schema) {
        return { type: 'error', errors: "Schema files must contain $schema that point to it's type" };
    }
    if (data.$schema.endsWith('singleContractSchema.json')) {
        return single_js_1.transform(data);
    }
    else if (data.$schema.endsWith('crudContractSchema.json')) {
        return crud_js_1.transform(data);
    }
    return { type: 'error', errors: `Unsupported schema for declaration: ${data.$schema}` };
});
exports.default = exports.transform;
//# sourceMappingURL=transform.js.map