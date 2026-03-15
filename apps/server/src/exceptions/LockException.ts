import Exception from "./Expcetion.js";

class LockException extends Exception {
  constructor(message: string) {
    super(message);
  }
}

export default LockException;
