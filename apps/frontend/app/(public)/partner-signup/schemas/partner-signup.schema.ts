import { z } from 'zod';

import { AUTH_CONTENT } from '@/content/auth';
import { POSTAL_CODE_FORMAT } from '@/lib/address';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/constants';
import { hasSirenFormat, isValidSiren, normalizeSiren } from '@/lib/siren';

const { name, email, password } = AUTH_CONTENT.fields;
const { fields } = AUTH_CONTENT.partnerSignUp;

/** The dossier a business files, as the agent will examine it. */
export const partnerDossierSchema = z.object({
  legalName: z.string().trim().min(1, fields.legalName.required),
  tradeName: z.string().trim().min(1, fields.tradeName.required),
  siren: z
    .string()
    .refine(
      (value) => hasSirenFormat(normalizeSiren(value)),
      fields.siren.format,
    )
    .refine(
      (value) => isValidSiren(normalizeSiren(value)),
      fields.siren.checksum,
    ),
  businessPurpose: z.string().trim().min(1, fields.businessPurpose.required),
  addressLine: z.string().trim().min(1, fields.addressLine.required),
  postalCode: z
    .string()
    .trim()
    .regex(POSTAL_CODE_FORMAT, fields.postalCode.format),
  city: z.string().trim().min(1, fields.city.required),
  categories: z.array(z.string()).min(1, fields.categories.required),
});

/** The dossier plus the account fields, which are only checked when no session exists yet. */
export function buildPartnerSignUpSchema(requiresAccount: boolean) {
  return partnerDossierSchema.extend({
    name: requiresAccount
      ? z.string().trim().min(1, name.required)
      : z.string(),
    email: requiresAccount
      ? z.string().trim().min(1, email.required).pipe(z.email(email.invalid))
      : z.string(),
    password: requiresAccount
      ? z
          .string()
          .min(1, password.required)
          .min(MIN_PASSWORD_LENGTH, password.tooShort(MIN_PASSWORD_LENGTH))
      : z.string(),
  });
}

export type PartnerDossierInput = z.infer<typeof partnerDossierSchema>;
export type PartnerSignUpInput = z.infer<
  ReturnType<typeof buildPartnerSignUpSchema>
>;
