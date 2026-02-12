function ReCaptchaFormMessage() {
  return (
    <p className="text-xs text-textMuted">
      This site is protected by reCAPTCHA and the Google{" "}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener">
        Privacy Policy
      </a>{" "}
      and{" "}
      <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer noopener">
        Terms of Service
      </a>{" "}
      apply.
    </p>
  );
}

export default ReCaptchaFormMessage;
