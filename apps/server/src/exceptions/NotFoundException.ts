import Exception from "./Expcetion.js";

class NotFoundException extends Exception {
  constructor(message: string) {
    super(message);
  }
}

export default NotFoundException;
