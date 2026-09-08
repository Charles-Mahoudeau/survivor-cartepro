'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PasswordField } from '@/components/composites/forms/password-field';
import { TextField } from '@/components/composites/forms/text-field';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AUTH_CONTENT } from '@/content/auth';
import { authClient } from '@/lib/auth/client';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/constants';
import { AUTH_ERROR_MESSAGES, toAuthError } from '@/lib/auth/errors';
import { roleHome } from '@/lib/auth/guard';

import { type SignUpInput, signUpSchema } from './schemas/sign-up.schema';

export function SignUpForm() {
  const router = useRouter();
  const { fields, signUp } = AUTH_CONTENT;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  async function onSubmit(values: SignUpInput) {
    const { data, error } = await authClient.signUp.email(values);

    if (error || !data) {
      const code = toAuthError(error);
      if (code === 'USER_ALREADY_EXISTS') {
        setError('email', { message: AUTH_ERROR_MESSAGES[code] });
      } else {
        setError('root', { message: AUTH_ERROR_MESSAGES[code] });
      }
      return;
    }

    router.replace(roleHome(data.user.role));
    router.refresh();
  }

  const busy = isSubmitting || isSubmitSuccessful;

  return (
    <>
      <form
        method="post"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={busy}
      >
        {errors.root ? (
          <Alert
            severity="error"
            description={errors.root.message ?? AUTH_CONTENT.errorSummary}
            className="mb-6"
          />
        ) : null}

        <TextField
          label={fields.name.label}
          error={errors.name?.message}
          registration={register('name')}
          input={{
            type: 'text',
            autoComplete: 'name',
            autoCapitalize: 'words',
            placeholder: fields.name.placeholder,
          }}
        />

        <TextField
          label={fields.email.label}
          hint={fields.email.hint}
          error={errors.email?.message}
          registration={register('email')}
          input={{
            type: 'email',
            autoComplete: 'email',
            inputMode: 'email',
            autoCapitalize: 'none',
            spellCheck: false,
            placeholder: fields.email.placeholder,
          }}
        />

        <PasswordField
          label={fields.password.label}
          hint={fields.password.hint(MIN_PASSWORD_LENGTH)}
          error={errors.password?.message}
          registration={register('password')}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
        />

        <Button type="submit" size="lg" disabled={busy} className="mt-2 w-full">
          {busy ? signUp.submitting : signUp.submit}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[color:var(--muted-foreground)]">
        {signUp.hasAccount}{' '}
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          {signUp.signIn}
        </Link>
      </p>
    </>
  );
}
