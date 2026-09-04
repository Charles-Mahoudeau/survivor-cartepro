import { z } from 'zod';

import { AUTH_CONTENT } from '@/content/auth';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/constants';

const { name, email, password } = AUTH_CONTENT.fields;

export const signUpSchema = z.object({
  name: z.string().trim().min(1, name.required),
  email: z.string().trim().min(1, email.required).pipe(z.email(email.invalid)),
  password: z
    .string()
    .min(1, password.required)
    .min(MIN_PASSWORD_LENGTH, password.tooShort(MIN_PASSWORD_LENGTH)),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
