import crypto from "node:crypto";

function timingSafeEqual(value1: string, value2: string) {
  return crypto.timingSafeEqual(Buffer.from(value1), Buffer.from(value2));
}

export default timingSafeEqual;
