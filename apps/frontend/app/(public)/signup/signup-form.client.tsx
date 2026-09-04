'use client';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Button } from '@codegouvfr/react-dsfr/Button';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { PasswordField } from '@/components/composites/forms/password-field';
import { TextField } from '@/components/composites/forms/text-field';
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
            small
            severity="error"
            description={errors.root.message ?? AUTH_CONTENT.errorSummary}
            className="fr-mb-3w"
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

        <Button
          type="submit"
          priority="primary"
          disabled={busy}
          className="fr-mt-2w"
        >
          {busy ? signUp.submitting : signUp.submit}
        </Button>
      </form>

      <p className="fr-text--sm fr-mt-4w text-center text-[color:var(--muted-foreground)]">
        {signUp.hasAccount}{' '}
        <Link href="/login" className="fr-link">
          {signUp.signIn}
        </Link>
      </p>
    </>
  );
}
