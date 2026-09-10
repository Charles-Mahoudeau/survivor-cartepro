'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { PasswordField } from '@/components/composites/forms/password-field';
import { TextAreaField } from '@/components/composites/forms/text-area-field';
import { TextField } from '@/components/composites/forms/text-field';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { AUTH_CONTENT } from '@/content/auth';
import type { PartnerCategory } from '@/lib/api/schemas/backend/partner-category';
import { POSTAL_CODE_LENGTH } from '@/lib/address';
import { authClient } from '@/lib/auth/client';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/constants';
import { AUTH_ERROR_MESSAGES, toAuthError } from '@/lib/auth/errors';

import { registerPartnerAction } from './actions/register-partner.action';
import {
  buildPartnerSignUpSchema,
  type PartnerSignUpInput,
} from './schemas/partner-signup.schema';

const DOSSIER_PAGE = '/pro/account';
const BUSINESS_PURPOSE_ROWS = 4;

interface PartnerSignUpFormProps {
  categories: PartnerCategory[];
  signedInEmail: string | null;
}

/** Creates the account when none exists yet, then files the dossier it will manage. */
export function PartnerSignUpForm({
  categories,
  signedInEmail,
}: PartnerSignUpFormProps) {
  const router = useRouter();
  const { fields, partnerSignUp } = AUTH_CONTENT;
  const dossier = partnerSignUp.fields;
  const [accountEmail, setAccountEmail] = useState(signedInEmail);
  const [schema] = useState(() =>
    buildPartnerSignUpSchema(signedInEmail === null),
  );
  const { executeAsync } = useAction(registerPartnerAction);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<PartnerSignUpInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      legalName: '',
      tradeName: '',
      siren: '',
      businessPurpose: '',
      addressLine: '',
      postalCode: '',
      city: '',
      categories: [],
    },
  });

  async function onSubmit(values: PartnerSignUpInput) {
    if (accountEmail === null) {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        const code = toAuthError(error);
        if (code === 'USER_ALREADY_EXISTS') {
          setError('email', { message: AUTH_ERROR_MESSAGES[code] });
        } else {
          setError('root', { message: AUTH_ERROR_MESSAGES[code] });
        }
        return;
      }

      setAccountEmail(values.email);
    }

    const result = await executeAsync({
      legalName: values.legalName,
      tradeName: values.tradeName,
      siren: values.siren,
      businessPurpose: values.businessPurpose,
      addressLine: values.addressLine,
      postalCode: values.postalCode,
      city: values.city,
      categories: values.categories,
    });

    if (result.data) {
      router.replace(DOSSIER_PAGE);
      router.refresh();
      return;
    }

    const sirenError = result.validationErrors?.siren?._errors?.[0];
    const addressError = result.validationErrors?.addressLine?._errors?.[0];

    if (sirenError) {
      setError('siren', { message: sirenError });
    }
    if (addressError) {
      setError('addressLine', { message: addressError });
    }
    setError('root', {
      message: result.serverError ?? AUTH_CONTENT.errorSummary,
    });
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

        <h2 className="mb-1 text-sm font-semibold">
          {partnerSignUp.accountSection}
        </h2>
        {accountEmail === null ? (
          <>
            <p className="text-muted-foreground mb-4 text-xs">
              {partnerSignUp.accountHelp}
            </p>
            <TextField
              label={dossier.name.label}
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
          </>
        ) : (
          <Alert
            description={partnerSignUp.signedInAs(accountEmail)}
            className="mb-4"
          />
        )}

        <h2 className="mt-6 mb-4 text-sm font-semibold">
          {partnerSignUp.dossierSection}
        </h2>
        <TextField
          label={dossier.legalName.label}
          hint={dossier.legalName.hint}
          error={errors.legalName?.message}
          registration={register('legalName')}
          input={{ type: 'text', autoComplete: 'organization' }}
        />
        <TextField
          label={dossier.tradeName.label}
          hint={dossier.tradeName.hint}
          error={errors.tradeName?.message}
          registration={register('tradeName')}
          input={{ type: 'text' }}
        />
        <TextField
          label={dossier.siren.label}
          hint={dossier.siren.hint}
          error={errors.siren?.message}
          registration={register('siren')}
          input={{
            type: 'text',
            inputMode: 'numeric',
            autoComplete: 'off',
            spellCheck: false,
            className: 'font-mono tabular-nums',
          }}
        />
        <TextAreaField
          label={dossier.businessPurpose.label}
          hint={dossier.businessPurpose.hint}
          error={errors.businessPurpose?.message}
          registration={register('businessPurpose')}
          textarea={{ rows: BUSINESS_PURPOSE_ROWS }}
        />
        <TextField
          label={dossier.addressLine.label}
          hint={dossier.addressLine.hint}
          error={errors.addressLine?.message}
          registration={register('addressLine')}
          input={{
            type: 'text',
            autoComplete: 'street-address',
            placeholder: dossier.addressLine.placeholder,
          }}
        />
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <TextField
            label={dossier.postalCode.label}
            error={errors.postalCode?.message}
            registration={register('postalCode')}
            input={{
              type: 'text',
              inputMode: 'numeric',
              autoComplete: 'postal-code',
              maxLength: POSTAL_CODE_LENGTH,
            }}
          />
          <TextField
            label={dossier.city.label}
            error={errors.city?.message}
            registration={register('city')}
            input={{ type: 'text', autoComplete: 'address-level2' }}
          />
        </div>

        <Controller
          control={control}
          name="categories"
          render={({ field, fieldState }) => (
            <fieldset
              className="mb-6"
              aria-describedby={
                fieldState.error
                  ? 'categories-hint categories-error'
                  : 'categories-hint'
              }
            >
              <legend className="mb-1 block text-sm font-medium text-foreground">
                {dossier.categories.label}
              </legend>
              <p
                id="categories-hint"
                className="mb-2 text-xs text-muted-foreground"
              >
                {dossier.categories.hint}
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const pressed = field.value.includes(category.slug);

                  return (
                    <Chip
                      key={category.slug}
                      pressed={pressed}
                      className="border-input border"
                      onClick={() =>
                        field.onChange(
                          pressed
                            ? field.value.filter(
                                (slug) => slug !== category.slug,
                              )
                            : [...field.value, category.slug],
                        )
                      }
                    >
                      {category.displayName}
                    </Chip>
                  );
                })}
              </div>
              {fieldState.error ? (
                <p
                  id="categories-error"
                  className="mt-1 text-xs text-destructive"
                >
                  {fieldState.error.message}
                </p>
              ) : null}
            </fieldset>
          )}
        />

        <Button type="submit" size="lg" disabled={busy} className="w-full">
          {busy ? partnerSignUp.submitting : partnerSignUp.submit}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-[color:var(--muted-foreground)]">
        {partnerSignUp.hasAccount}{' '}
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          {partnerSignUp.signIn}
        </Link>
      </p>
    </>
  );
}
