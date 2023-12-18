// import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
// import { applyDecorators } from '@nestjs/common';
//
// export function Auth(
//   summary: string,
//   roles: RolesType[],
//   withNotFound = false,
//   withBadRequest = false,
//   badRequestDescription: string | null = null,
// ) {
//   const decorators: Array<
//     ClassDecorator | MethodDecorator | PropertyDecorator
//   > = [];
//
//   if (withNotFound) {
//     decorators.push(ApiNotFoundResponseCustom());
//   }
//
//   if (withBadRequest) {
//     decorators.push(ApiBadRequestResponseCustom(badRequestDescription));
//   }
//
//   return applyDecorators(
//     ApiOperation({ summary: `${summary} Roles:  [${roles}]` }),
//     ApiBearerAuth(),
//     ApiForbiddenResponseCustom(),
//     ApiUnauthorizedResponseCustom(),
//     ...decorators,
//     Roles(...roles),
//     UseGuards(AccessTokenAuthGuard, RolesGuard),
//   );
// }
//
// @Auth('summary', ['admin'], true, true, 'badRequestDescription')
