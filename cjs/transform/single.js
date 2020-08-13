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
const jsonSchema_js_1 = require("./jsonSchema.js");
const util_js_1 = require("../util.js");
exports.transform = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const valid = yield jsonSchema_js_1.validate(yield util_js_1.loadJSON(`${util_js_1.baseSchemaLocation}singleContractSchema.json`), data);
    if (jsonSchema_js_1.isValidationError(valid))
        return valid;
    const contractData = data;
    return {
        type: 'result',
        key: contractData.name,
        results: [
            {
                name: contractData.name,
                authentication: contractData.authentication,
                manageFields: {},
                method: contractData.type || 'GET',
                arguments: data.arguments,
                returns: data.returns
            }
        ]
    };
});
exports.default = exports.transform;
//# sourceMappingURL=single.js.map