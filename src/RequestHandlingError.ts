export class RequestHandlingError extends Error {
  constructor (message : string, public readonly status : number) {
    super(message)
    this.name = this.constructor.name

    Error.captureStackTrace(this, this.constructor)
  }
}
