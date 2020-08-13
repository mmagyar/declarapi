export declare class RequestHandlingError extends Error {
    readonly code: number;
    constructor(message: string, code: number);
}
