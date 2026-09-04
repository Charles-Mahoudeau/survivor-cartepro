import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  ForbiddenRoleDoc,
  PaymentTokenResponseDoc,
  UnauthenticatedDoc,
} from '../commons';

export const CreatePaymentTokenDoc = () => {
  return applyDecorators(
    ApiOperation({ summary: 'Create a payment token' }),
    PaymentTokenResponseDoc(201),
    UnauthenticatedDoc(),
    ForbiddenRoleDoc(),
  );
};
