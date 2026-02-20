import argon2 from "argon2";
import crypto_js from "crypto-js";

export class CryptoUtil {
  randomUUID() {
    return crypto.randomUUID();
  }

  async hashPassword(text: string) {
    return await argon2.hash(text, {
      type: argon2.argon2id,
      memoryCost: 2 ** 17, // 131072 KB = 128 MB
      timeCost: 4,
      parallelism: 2,
      hashLength: 32,
    });
  }

  async verfyPasswordHash(text: string, hash: string) {
    return await argon2.verify(hash, text);
  }

  encrypt = (text: string, secret: string): string => {
    const salt = crypto_js.lib.WordArray.random(128 / 8); // 16 bytes
    const iv = crypto_js.lib.WordArray.random(128 / 8); // 16 bytes

    const key = crypto_js.PBKDF2(secret, salt, {
      keySize: 256 / 32, // 256 bits = 32 bytes
      iterations: 1000, // Slow brute-force attempts
    });

    const encrypted = crypto_js.AES.encrypt(text, key, { iv });

    return [
      encrypted.ciphertext.toString(crypto_js.enc.Base64),
      iv.toString(crypto_js.enc.Hex),
      salt.toString(crypto_js.enc.Hex),
    ].join(".");
  };

  decrypt = (encrypted: string, secret: string): string => {
    const [ciphertext, ivHex, saltHex] = encrypted.split(".");

    const iv = crypto_js.enc.Hex.parse(ivHex);
    const salt = crypto_js.enc.Hex.parse(saltHex);

    const key = crypto_js.PBKDF2(secret, salt, {
      keySize: 256 / 32,
      iterations: 1000,
    });

    const decrypted = crypto_js.AES.decrypt(ciphertext, key, { iv });

    return decrypted.toString(crypto_js.enc.Utf8);
  };

  generateCode = (length: number) => {
    let numbers = "0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {
      const RNG = Math.floor(Math.random() * numbers.length);
      result += numbers[RNG];
    }

    return result;
  };

  hmacSHA256 = (text: string, secret: string) => {
    return crypto_js.HmacSHA256(text, secret).toString(crypto_js.enc.Hex);
  };

  sha1 = (text: string) => {
    return crypto_js.SHA1(text).toString(crypto_js.enc.Hex);
  };
}

const cryptoUtil = new CryptoUtil();

export default cryptoUtil;
