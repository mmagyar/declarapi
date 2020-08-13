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
exports.generateRandomCall = void 0;
const yaschva_1 = require("yaschva");
exports.generateRandomCall = (handle, contract, auth) => __awaiter(void 0, void 0, void 0, function* () {
    const generated = yaschva_1.generate(contract.arguments);
    const handled = yield handle(generated, undefined, auth);
    if (!handled || handled.code > 299) {
        const error = new Error(`Random data generation returned with error: ${handled === null || handled === void 0 ? void 0 : handled.code}, ${JSON.stringify(handled === null || handled === void 0 ? void 0 : handled.response)}`);
        error.code = handled === null || handled === void 0 ? void 0 : handled.code;
        error.response = handled === null || handled === void 0 ? void 0 : handled.response;
        throw error;
    }
    return {
        output: handled.response,
        generatedInput: generated
    };
});
//# sourceMappingURL=generateRandomCall.js.map