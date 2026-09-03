import { Injectable, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ERROR_CODES } from '@/common/constants/error-codes.constant';
import { PartnerResponseDto } from '@/modules/partners/core/dto';
import { PartnerRepo } from '@/modules/partners/core/repos';

@Injectable()
export class PartnerService {
  constructor(private readonly partnerRepo: PartnerRepo) {}

  async findPublicById(id: string): Promise<PartnerResponseDto> {
    const partner = await this.partnerRepo.findActiveById(id);

    if (!partner) {
      throw new NotFoundException(ERROR_CODES.PARTNER_NOT_FOUND);
    }

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
