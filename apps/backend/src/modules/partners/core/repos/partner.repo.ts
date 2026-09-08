import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { In, Repository } from 'typeorm';
import { decodeCursor, type PaginationQueryDto } from '@/common/pagination';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';
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
    @InjectRepository(PartnerCategory)
    private readonly categories: Repository<PartnerCategory>,
  ) {}

  findActiveById(id: string): Promise<Partner | null> {
    return this.partners.findOne({
      where: { id, status: PartnerStatus.ACTIVE },
      relations: { categories: true },
    });
  }

  findByOwnerId(ownerId: string): Promise<Partner | null> {
    return this.partners.findOne({
      where: { owner: { id: ownerId } },
      relations: { owner: true, categories: true, applications: true },
      order: { applications: { createdAt: 'DESC' } },
    });
  }

  findByIdWithRelations(
    id: string,
    manager?: EntityManager,
  ): Promise<Partner | null> {
    const repo = manager ? manager.getRepository(Partner) : this.partners;
    return repo.findOne({
      where: { id },
      relations: { owner: true, categories: true },
    });
  }

  async transitionIfPending(
    id: string,
    toStatus: PartnerStatus,
    manager?: EntityManager,
  ): Promise<boolean> {
    const repo = manager ? manager.getRepository(Partner) : this.partners;
    const result = await repo
      .createQueryBuilder()
      .update(Partner)
      .set({ status: toStatus })
      .where('id = :id AND status = :pending', {
        id,
        pending: PartnerStatus.PENDING,
      })
      .execute();

    return result.affected === 1;
  }

  findByIdWithDetails(id: string): Promise<Partner | null> {
    return this.partners.findOne({
      where: { id },
      relations: { categories: true, applications: true },
      order: { applications: { createdAt: 'DESC' } },
    });
  }

  findCategoriesBySlugs(slugs: string[]): Promise<PartnerCategory[]> {
    if (slugs.length === 0) {
      return Promise.resolve([]);
    }
    return this.categories.findBy({ slug: In(slugs) });
  }

  savePartner(partner: Partner): Promise<Partner> {
    return this.partners.save(partner);
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

  findPageByStatus(
    status: PartnerStatus,
    pagination: PaginationQueryDto,
  ): Promise<Partner[]> {
    const builder = this.partners
      .createQueryBuilder('partner')
      .where('partner.status = :status', { status })
      .orderBy('partner.id', 'DESC')
      .take(pagination.limit + 1);

    if (pagination.cursor) {
      builder.andWhere('partner.id < :cursor', {
        cursor: decodeCursor(pagination.cursor),
      });
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
