import Exception from "./Expcetion.js";

class ValidationException extends Exception {
  constructor(message: string) {
    super(message);
  }
}

export default ValidationException;
