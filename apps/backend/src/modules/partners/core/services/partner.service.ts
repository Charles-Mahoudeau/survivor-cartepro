import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import {
  InvalidCursorError,
  paginate,
  type CursorPage,
} from '@/common/pagination';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import {
  ListPartnersQueryDto,
  PartnerResponseDto,
} from '@/modules/partners/core/dto';
import { PartnerRepo } from '@/modules/partners/core/repos';

@Injectable()
export class PartnerService {
  constructor(private readonly partnerRepo: PartnerRepo) {}

  async findPublicById(id: string): Promise<PartnerResponseDto> {
    const partner = await this.partnerRepo.findActiveById(id);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

    return this.toPublicResponse(partner);
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
