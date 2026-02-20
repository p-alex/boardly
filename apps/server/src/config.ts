export type EmailEncryptionSecretVersion = "V1" | "V2";
export type EmailHashSecretVersion = "V1" | "V2";
export type PasswordPepperVersion = "V1" | "V2";

// TODO: "push changes correctly to github"

export interface IEnv {
  DATABASE_URL: string;
  ENCRYPTION_SECRETS: {
    EMAIL: Record<EmailEncryptionSecretVersion, string> & {
      VERSIONS: EmailEncryptionSecretVersion[];
      ACTIVE_VERSION: EmailEncryptionSecretVersion;
    };
  };
  HASH_SECRETS: {
    EMAIL: Record<EmailHashSecretVersion, string> & {
      VERSIONS: EmailHashSecretVersion[];
      ACTIVE_VERSION: EmailHashSecretVersion;
    };
  };
  PEPPERS: {
    PASSWORD: Record<PasswordPepperVersion, string> & {
      VERSIONS: PasswordPepperVersion[];
      ACTIVE_VERSION: PasswordPepperVersion;
    };
  };
  EMAIL_API: {
    USER: string;
    PASS: string;
    SENDER: string;
  };
}

export const env: IEnv = {
  DATABASE_URL: process.env.DATABASE_URL!,
  ENCRYPTION_SECRETS: {
    EMAIL: {
      V1: process.env.EMAIL_ENCRYPTION_SECRET_V1!,
      V2: process.env.EMAIL_ENCRYPTION_SECRET_V2!,
      VERSIONS: ["V1", "V2"],
      ACTIVE_VERSION: process.env
        .ACTIVE_EMAIL_ENCRYPTION_SECRET_VERSION! as EmailEncryptionSecretVersion,
    },
  },
  HASH_SECRETS: {
    EMAIL: {
      V1: process.env.EMAIL_HASH_SECRET_V1!,
      V2: process.env.EMAIL_HASH_SECRET_V2!,
      VERSIONS: ["V1", "V2"],
      ACTIVE_VERSION: process.env.ACTIVE_EMAIL_HASH_SECRET_VERSION! as EmailHashSecretVersion,
    },
  },
  PEPPERS: {
    PASSWORD: {
      V1: process.env.PASSWORD_PEPPER_V1!,
      V2: process.env.PASSWORD_PEPPER_V2!,
      VERSIONS: ["V1", "V2"],
      ACTIVE_VERSION: process.env.ACTIVE_PASSWORD_PEPPER_VERSION! as PasswordPepperVersion,
    },
  },
  EMAIL_API: {
    USER: process.env.EMAIL_API_USER!,
    PASS: process.env.EMAIL_API_PASS!,
    SENDER: process.env.EMAIL_API_SENDER!,
  },
};
