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
exports.validate = exports.isValidationError = exports.jsonValidatorInit = void 0;
const ajv_1 = __importDefault(require("ajv"));
const util_js_1 = require("../util.js");
exports.jsonValidatorInit = () => {
    return new ajv_1.default({
        loadSchema: (uri) => __awaiter(void 0, void 0, void 0, function* () { return util_js_1.loadJSON(uri); })
    });
};
exports.isValidationError = (input) => input && input.type === 'error';
exports.validate = (json, data) => __awaiter(void 0, void 0, void 0, function* () {
    const validator = yield exports.jsonValidatorInit().compileAsync(json);
    const result = validator(data);
    const errors = validator.errors || [];
    errors.push(JSON.stringify(json, null, 2));
    if (!result)
        return { type: 'error', errors };
    return { type: 'success' };
});
//# sourceMappingURL=jsonSchema.js.map