import { DefaultNamingStrategy, type NamingStrategyInterface } from 'typeorm';

/**
 * Byte-for-byte the transformation TypeORM applies internally
 * (`typeorm/util/StringUtils`). Reproduced here rather than imported: that path
 * is not a declared export of the package, it only resolves through a wildcard
 * that carries no types, and reaching into a dependency's internals is how a
 * patch release turns into a broken build.
 *
 * The two passes matter in order — `ABc` becomes `a_bc` before `aC` becomes
 * `a_c`, which is what makes an acronym like `SIRETNumber` land on
 * `siret_number` rather than `s_i_r_e_t_number`.
 */
export function snakeCase(str: string): string {
  return str
    .replaceAll(/([A-Z])([A-Z])([a-z])/g, '$1_$2$3')
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase();
}

/**
 * Maps camelCase TypeScript identifiers onto snake_case SQL identifiers, so an
 * entity property `createdAt` becomes a column `created_at` without a manual
 * `@Column({ name })` on every field.
 *
 * Written here rather than pulled from `typeorm-naming-strategies`: that package
 * declares a peer range of `^0.2.0 || ^0.3.0` and has no release supporting
 * TypeORM 1.x. Vendoring the handful of overrides it provided is cheaper than
 * pinning an unmaintained dependency behind a peer override.
 */
export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string | undefined): string {
    return customName || snakeCase(className);
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return (
      snakeCase(embeddedPrefixes.concat('').join('_')) +
      (customName || snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return snakeCase(
      `${firstTableName}_${firstPropertyName.replace(/\./gi, '_')}_${secondTableName}`,
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(`${tableName}_${columnName || propertyName}`);
  }

  eagerJoinRelationAlias(alias: string, propertyPath: string): string {
    return `${alias}__${propertyPath.replace('.', '_')}`;
  }
}
