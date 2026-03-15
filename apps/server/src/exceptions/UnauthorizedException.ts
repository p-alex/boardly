import Exception from "./Expcetion.js";

class UnauthorizedException extends Exception {
  constructor(message: string) {
    super(message);
  }
}

export default UnauthorizedException;
