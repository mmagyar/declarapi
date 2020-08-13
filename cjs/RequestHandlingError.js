"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestHandlingError = void 0;
class RequestHandlingError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.RequestHandlingError = RequestHandlingError;
//# sourceMappingURL=RequestHandlingError.js.map