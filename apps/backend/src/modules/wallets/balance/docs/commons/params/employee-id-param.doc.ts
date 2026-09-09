import { ApiParam } from '@nestjs/swagger';

export const EmployeeIdParamDoc = () => {
  return ApiParam({
    name: 'id',
    description: 'The employee account id.',
    example: '0199a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b',
  });
};
