import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import type { EntityManager } from 'typeorm';
import { QueryFailedError } from 'typeorm';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
  type PaginationQueryDto,
} from '@/common/pagination';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { ROLES } from '@/config/auth/auth.constants';
import { UserService } from '@/modules/user';
import {
  CreatePartnerDto,
  ListPartnersQueryDto,
  PartnerProfileResponseDto,
  PartnerResponseDto,
  UpdatePartnerProfileDto,
} from '@/modules/partners/core/dto';
import { PartnerRepo } from '@/modules/partners/core/repos';
import type { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';

/** Postgres unique-constraint names from the `partner` table's migration. */
const SIREN_UNIQUE_CONSTRAINT = 'UQ_446e72eaf26f806375d832fe897';
const OWNER_UNIQUE_CONSTRAINT = 'REL_0c34acbc91d4ac6b200969f5ff';

@Injectable()
export class PartnerService {
  constructor(
    private readonly partnerRepo: PartnerRepo,
    private readonly userService: UserService,
  ) {}

  /**
   * Deposits a new dossier for the calling account: inserts the `Partner` row
   * (status `PENDING`) and promotes the account to role `partner`, atomically.
   * The role changes here, at deposit time, not when an admin approves the
   * dossier — a frontend routing on role sees the partner space immediately.
   */
  async createForOwner(
    ownerId: string,
    dto: CreatePartnerDto,
  ): Promise<PartnerProfileResponseDto> {
    const categories = await this.partnerRepo.findCategoriesBySlugs(
      dto.categories,
    );
    if (categories.length !== dto.categories.length) {
      throw new BadRequestException(ERROR_CODES.PARTNER_CATEGORY_NOT_FOUND);
    }

    // The RolesGuard already blocks an already-partner/admin account with 403
    // in the common case. This only turns the narrow concurrent-request race
    // into a clean 409 instead of a raw constraint violation.
    const existing = await this.partnerRepo.findByOwnerId(ownerId);
    if (existing) {
      throw new ConflictException(ERROR_CODES.PARTNER_ALREADY_EXISTS);
    }

    let partner: Partner;
    try {
      partner = await this.partnerRepo.transaction(async (manager) => {
        const created = await this.partnerRepo.createPending(
          {
            owner: { id: ownerId },
            legalName: dto.legalName,
            tradeName: dto.tradeName,
            siren: dto.siren,
            businessPurpose: dto.businessPurpose,
            addressLine: dto.addressLine,
            postalCode: dto.postalCode,
            city: dto.city,
            latitude: dto.latitude,
            longitude: dto.longitude,
            categories,
          },
          manager,
        );

        await this.userService.setRole(ownerId, ROLES.PARTNER, manager);

        return created;
      });
    } catch (error) {
      throw this.translateCreationConflict(error);
    }

    return this.toProfileResponse({ ...partner, applications: [] });
  }

  /**
   * Maps the two unique-constraint violations the creation transaction can
   * hit into the same clean conflict codes the pre-checks use, instead of a
   * raw 500. This is what closes the check-then-act race the pre-checks in
   * `createForOwner` can't close by themselves.
   */
  private translateCreationConflict(error: unknown): unknown {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as {
        code?: string;
        constraint?: string;
      };

      if (driverError?.code === '23505') {
        if (driverError.constraint === SIREN_UNIQUE_CONSTRAINT) {
          return new ConflictException(
            ERROR_CODES.PARTNER_SIREN_ALREADY_REGISTERED,
          );
        }
        if (driverError.constraint === OWNER_UNIQUE_CONSTRAINT) {
          return new ConflictException(ERROR_CODES.PARTNER_ALREADY_EXISTS);
        }
      }
    }

    return error;
  }

  async findPublicById(id: string): Promise<PartnerResponseDto> {
    const partner = await this.partnerRepo.findActiveById(id);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toPublicResponse(partner);
  }

  async getProfileByOwnerId(
    ownerId: string,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByOwnerId(ownerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toProfileResponse(partner);
  }

  async getProfileByPartnerId(
    partnerId: string,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByIdWithDetails(partnerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toProfileResponse(partner);
  }

  async updateProfileByOwnerId(
    ownerId: string,
    dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByOwnerId(ownerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.applyProfileUpdate(partner, dto);
  }

  async updateProfileByPartnerId(
    partnerId: string,
    dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    const partner = await this.partnerRepo.findByIdWithDetails(partnerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.applyProfileUpdate(partner, dto);
  }

  private async applyProfileUpdate(
    partner: Partner,
    dto: UpdatePartnerProfileDto,
  ): Promise<PartnerProfileResponseDto> {
    if (dto.categories !== undefined) {
      const categories = await this.partnerRepo.findCategoriesBySlugs(
        dto.categories,
      );
      if (categories.length !== dto.categories.length) {
        throw new BadRequestException(ERROR_CODES.PARTNER_CATEGORY_NOT_FOUND);
      }
      partner.categories = categories;
    }

    if (dto.legalName !== undefined) partner.legalName = dto.legalName;
    if (dto.tradeName !== undefined) partner.tradeName = dto.tradeName;
    if (dto.addressLine !== undefined) partner.addressLine = dto.addressLine;
    if (dto.postalCode !== undefined) partner.postalCode = dto.postalCode;
    if (dto.city !== undefined) partner.city = dto.city;
    if (dto.latitude !== undefined) partner.latitude = dto.latitude;
    if (dto.longitude !== undefined) partner.longitude = dto.longitude;

    const saved = await this.partnerRepo.savePartner(partner);
    return this.toProfileResponse(saved);
  }

  async listPublic(
    query: ListPartnersQueryDto,
  ): Promise<CursorPage<PartnerResponseDto>> {
    let partners: Awaited<ReturnType<PartnerRepo['findActivePage']>>;
    try {
      partners = await this.partnerRepo.findActivePage(query);
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    const page = paginate<
      Awaited<ReturnType<PartnerRepo['findActivePage']>>[number]
    >(partners, query.limit);

    return {
      ...page,
      items: page.items.map((partner) => this.toPublicResponse(partner)),
    };
  }

  private toProfileResponse(partner: Partner): PartnerProfileResponseDto {
    const latestApplication = partner.applications?.[0] ?? null;

    return plainToInstance(
      PartnerProfileResponseDto,
      {
        id: partner.id,
        legalName: partner.legalName,
        tradeName: partner.tradeName,
        siren: partner.siren,
        businessPurpose: partner.businessPurpose,
        status: partner.status,
        addressLine: partner.addressLine,
        postalCode: partner.postalCode,
        city: partner.city,
        latitude: Number(partner.latitude),
        longitude: Number(partner.longitude),
        categories: partner.categories.map(({ slug, displayName }) => ({
          slug,
          displayName,
        })),
        lastDecision: latestApplication
          ? {
              reason: latestApplication.reason,
              toStatus: latestApplication.toStatus,
              createdAt: latestApplication.createdAt,
            }
          : null,
      },
      { excludeExtraneousValues: true },
    );
  }

  async listByStatus(
    status: PartnerStatus,
    pagination: PaginationQueryDto,
  ): Promise<CursorPage<Partner>> {
    let partners: Partner[];
    try {
      partners = await this.partnerRepo.findPageByStatus(status, pagination);
    } catch (error) {
      if (error instanceof InvalidCursorError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    return paginate<Partner>(partners, pagination.limit);
  }

  async findForReview(id: string): Promise<Partner> {
    const partner = await this.partnerRepo.findByIdWithRelations(id);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return partner;
  }

  async findMineForReview(ownerId: string): Promise<Partner> {
    const partner = await this.partnerRepo.findByOwnerId(ownerId);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return partner;
  }

  async activate(id: string, manager?: EntityManager): Promise<Partner> {
    return this.transitionFromPending(id, PartnerStatus.ACTIVE, manager);
  }

  async refuse(id: string, manager?: EntityManager): Promise<Partner> {
    return this.transitionFromPending(id, PartnerStatus.REFUSED, manager);
  }

  private async transitionFromPending(
    id: string,
    toStatus: PartnerStatus,
    manager?: EntityManager,
  ): Promise<Partner> {
    const partner = await this.partnerRepo.findByIdWithRelations(id, manager);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    if (partner.status !== PartnerStatus.PENDING) {
      throw new ConflictException(ERROR_CODES.PARTNER_NOT_PENDING);
    }

    const transitioned = await this.partnerRepo.transitionIfPending(
      id,
      toStatus,
      manager,
    );

    if (!transitioned) {
      throw new ConflictException(ERROR_CODES.PARTNER_NOT_PENDING);
    }

    partner.status = toStatus;

    return partner;
  }

  private toPublicResponse(
    partner: NonNullable<Awaited<ReturnType<PartnerRepo['findActiveById']>>>,
  ): PartnerResponseDto {
    return plainToInstance(
      PartnerResponseDto,
      {
        id: partner.id,
        legalName: partner.legalName,
        tradeName: partner.tradeName,
        addressLine: partner.addressLine,
        postalCode: partner.postalCode,
        city: partner.city,
        latitude: Number(partner.latitude),
        longitude: Number(partner.longitude),
        categories: partner.categories.map(({ slug, displayName }) => ({
          slug,
          displayName,
        })),
      },
      { excludeExtraneousValues: true },
    );
  }
}
