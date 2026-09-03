import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { decodeCursor } from '@/common/pagination';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerStatus } from '@/modules/partners/core/enums/partner-status.enum';
import type { ListPartnersQueryDto } from '@/modules/partners/core/dto';

const SEARCH_ACCENT_CHARS =
  'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÝŸýÿ';
const SEARCH_PLAIN_CHARS =
  'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOOooooooUUUUuuuuYYyy';

@Injectable()
export class PartnerRepo {
  constructor(
    @InjectRepository(Partner)
    private readonly partners: Repository<Partner>,
  ) {}

  findActiveById(id: string): Promise<Partner | null> {
    return this.partners.findOne({
      where: { id, status: PartnerStatus.ACTIVE },
      relations: { categories: true },
    });
  }

  findActivePage(query: ListPartnersQueryDto): Promise<Partner[]> {
    const builder = this.partners
      .createQueryBuilder('partner')
      .leftJoinAndSelect('partner.categories', 'categories')
      .where('partner.status = :status', { status: PartnerStatus.ACTIVE })
      .orderBy('partner.id', 'DESC')
      .take(query.limit + 1);

    if (query.cursor) {
      builder.andWhere('partner.id < :cursor', {
        cursor: decodeCursor(query.cursor),
      });
    }

    if (query.category) {
      builder.innerJoin(
        'partner.categories',
        'filterCategory',
        'filterCategory.slug = :category',
        { category: query.category },
      );
    }

    if (query.search) {
      const search = `%${normalizeSearch(query.search)}%`;
      builder.andWhere(
        `(
          lower(translate(partner.legalName, :accentChars, :plainChars)) LIKE :search
          OR lower(translate(partner.tradeName, :accentChars, :plainChars)) LIKE :search
          OR lower(translate(partner.city, :accentChars, :plainChars)) LIKE :search
        )`,
        {
          accentChars: SEARCH_ACCENT_CHARS,
          plainChars: SEARCH_PLAIN_CHARS,
          search,
        },
      );
    }

    return builder.getMany();
  }
}

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
