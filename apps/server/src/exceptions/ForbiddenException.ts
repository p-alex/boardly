import Exception from "./Expcetion.js";

class ForbiddenException extends Exception {
  constructor(message: string) {
    super(message);
  }
}

export default ForbiddenException;
