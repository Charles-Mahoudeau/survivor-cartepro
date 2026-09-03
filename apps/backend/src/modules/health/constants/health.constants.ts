import packageJson from '../../../../package.json';

/**
 * The version this build was cut from.
 *
 * Read from the manifest rather than restated here: a literal drifts the first
 * time somebody bumps a release and forgets the controller, and a version that
 * lies is worse for a diagnosis than no version at all. Bun inlines the import
 * at build time, so the bundle carries the value with no file to find at boot.
 */
export const APP_VERSION: string = packageJson.version;
