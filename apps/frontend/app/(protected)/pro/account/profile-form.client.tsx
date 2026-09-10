'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { TextField } from '@/components/composites/forms/text-field';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { PRO_CONTENT } from '@/content/pro';
import { POSTAL_CODE_LENGTH } from '@/lib/address';
import type { PartnerProfile } from '@/lib/api/schemas/backend/partner';
import type { PartnerCategory } from '@/lib/api/schemas/backend/partner-category';

import { updateProfileAction } from './actions/update-profile.action';
import {
  type ProfileFormInput,
  profileFormSchema,
} from './schemas/profile.schema';

const { form } = PRO_CONTENT.account;

/** Edits the trade name, the address and the categories the catalogue shows. */
export function ProfileForm({
  profile,
  categories,
}: {
  profile: PartnerProfile;
  categories: PartnerCategory[];
}) {
  const { executeAsync } = useAction(updateProfileAction);

  const {
    register,
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      tradeName: profile.tradeName,
      addressLine: profile.addressLine,
      postalCode: profile.postalCode,
      city: profile.city,
      categories: profile.categories.map((category) => category.slug),
    },
  });

  async function onSubmit(values: ProfileFormInput) {
    const result = await executeAsync(values);

    if (result.data) {
      reset(values);
      toast.success(form.saved);
      return;
    }

    const addressError = result.validationErrors?.addressLine?._errors?.[0];
    if (addressError) {
      setError('addressLine', { message: addressError });
    }
    toast.error(result.serverError ?? addressError ?? form.failed);
  }

  return (
    <Card className="p-5">
      <h2 className="mb-4 font-medium">{form.title}</h2>
      <form
        method="post"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={isSubmitting}
      >
        <TextField
          label={form.fields.tradeName.label}
          error={errors.tradeName?.message}
          registration={register('tradeName')}
          input={{ type: 'text' }}
        />
        <TextField
          label={form.fields.addressLine.label}
          error={errors.addressLine?.message}
          registration={register('addressLine')}
          input={{ type: 'text', autoComplete: 'street-address' }}
        />
        <div className="grid grid-cols-[7rem_1fr] gap-3">
          <TextField
            label={form.fields.postalCode.label}
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
            label={form.fields.city.label}
            error={errors.city?.message}
            registration={register('city')}
            input={{ type: 'text', autoComplete: 'address-level2' }}
          />
        </div>

        <Controller
          control={control}
          name="categories"
          render={({ field, fieldState }) => (
            <fieldset className="mb-6">
              <legend className="mb-1 block text-sm font-medium text-foreground">
                {form.fields.categories.label}
              </legend>
              <p className="mb-2 text-xs text-muted-foreground">
                {form.fields.categories.hint}
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
                <p className="mt-1 text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              ) : null}
            </fieldset>
          )}
        />

        <Button type="submit" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? form.submitting : form.submit}
        </Button>
      </form>
    </Card>
  );
}
