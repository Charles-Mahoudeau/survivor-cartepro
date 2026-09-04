'use client';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PasswordField } from '@/components/composites/forms/password-field';
import { TextField } from '@/components/composites/forms/text-field';
import { AUTH_CONTENT } from '@/content/auth';
import { authClient } from '@/lib/auth/client';
import { AUTH_ERROR_MESSAGES, toAuthError } from '@/lib/auth/errors';
import { safeRedirect } from '@/lib/auth/guard';

import { type SignInInput, signInSchema } from './schemas/sign-in.schema';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fields, signIn } = AUTH_CONTENT;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: SignInInput) {
    const { data, error } = await authClient.signIn.email(values);

    if (error || !data) {
      const code = toAuthError(error);
      setError('root', {
        message:
          code === 'BANNED_USER'
            ? (error?.message ?? AUTH_ERROR_MESSAGES[code])
            : AUTH_ERROR_MESSAGES[code],
      });
      return;
    }

    router.replace(safeRedirect(searchParams.get('next'), data.user.role));
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
            small
            severity="error"
            description={errors.root.message ?? AUTH_CONTENT.errorSummary}
            className="fr-mb-3w"
          />
        ) : null}

        <TextField
          label={fields.email.label}
          error={errors.email?.message}
          registration={register('email')}
          input={{
            type: 'email',
            autoComplete: 'username',
            inputMode: 'email',
            autoCapitalize: 'none',
            spellCheck: false,
            placeholder: fields.email.placeholder,
          }}
        />

        <PasswordField
          label={fields.password.label}
          error={errors.password?.message}
          registration={register('password')}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          priority="primary"
          disabled={busy}
          className="fr-mt-2w"
        >
          {busy ? signIn.submitting : signIn.submit}
        </Button>
      </form>

      <p className="fr-text--sm fr-mt-4w text-center text-[color:var(--muted-foreground)]">
        {signIn.noAccount}{' '}
        <Link href="/signup" className="fr-link">
          {signIn.createAccount}
        </Link>
      </p>
    </>
  );
}
