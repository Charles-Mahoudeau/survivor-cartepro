/**
 * Public surface of this module: the service, and the type it hands back.
 * Repositories and entities stay in, so a consumer cannot bind itself to the
 * way accounts happen to be stored.
 */
export { UserService } from './services/user.service';
export { UserModule } from './user.module';
export type { User } from './entities';
