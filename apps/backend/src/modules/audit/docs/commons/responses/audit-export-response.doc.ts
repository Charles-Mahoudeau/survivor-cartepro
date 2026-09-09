import { ApiResponse } from '@nestjs/swagger';

export const AuditExportResponseDoc = () => {
  return ApiResponse({
    status: 200,
    description:
      'The period as JSON, oldest entry first, with a chain digest and an ' +
      'HMAC-SHA256 signature over the whole export. Verifiable offline with ' +
      '`scripts/audit-verify.ts`, the exported file and the signing secret.',
  });
};
