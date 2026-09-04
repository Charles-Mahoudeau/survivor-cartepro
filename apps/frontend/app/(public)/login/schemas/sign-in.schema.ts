import { z } from 'zod';

import { AUTH_CONTENT } from '@/content/auth';

const { email, password } = AUTH_CONTENT.fields;

export const signInSchema = z.object({
  email: z.string().trim().min(1, email.required).pipe(z.email(email.invalid)),
  password: z.string().min(1, password.required),
});

export type SignInInput = z.infer<typeof signInSchema>;
