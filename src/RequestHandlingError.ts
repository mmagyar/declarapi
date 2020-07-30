export class RequestHandlingError extends Error {
  constructor (message : string, public readonly code : number) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}
