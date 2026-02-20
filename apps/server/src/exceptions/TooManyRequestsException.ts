import Exception from "./Expcetion.js";

class TooManyRequestsException extends Exception {
  constructor(
    message: string,
    public readonly headers: Record<string, string>,
  ) {
    super(message);
  }
}

export default TooManyRequestsException;
