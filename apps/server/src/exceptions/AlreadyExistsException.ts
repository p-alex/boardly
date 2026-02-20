import Exception from "./Expcetion.js";

class AlreadyExistsException extends Exception {
  constructor(message: string) {
    super(message);
  }
}

export default AlreadyExistsException;
