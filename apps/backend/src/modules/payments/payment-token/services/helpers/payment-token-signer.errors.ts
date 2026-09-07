export class PaymentTokenSignatureInvalidError extends Error {
  constructor() {
    super('Payment token signature does not match its payload');
    this.name = 'PaymentTokenSignatureInvalidError';
  }
}

export class PaymentTokenExpiredError extends Error {
  constructor() {
    super('Payment token has expired');
    this.name = 'PaymentTokenExpiredError';
  }
}

export class PaymentTokenUnsupportedVersionError extends Error {
  constructor(version: number) {
    super(`Payment token version ${version} is not supported`);
    this.name = 'PaymentTokenUnsupportedVersionError';
  }
}
