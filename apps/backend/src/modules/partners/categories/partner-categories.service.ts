import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartnerCategory } from '@/modules/partners/entities/partner-category.entity';
import { Repository } from 'typeorm';
import { Partner } from '@/modules/partners/entities/partner.entity';

export type PartnerCategoryWithPartnerCount = Omit<
  PartnerCategory,
  'partners'
> & {
  partnerCount: number;
};

@Injectable()
export class PartnerCategoriesService {
  constructor(
    @InjectRepository(PartnerCategory)
    private readonly categoryRepository: Repository<PartnerCategory>,
  ) {}

  async findAllWithPartnerCount(): Promise<PartnerCategoryWithPartnerCount[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.partners', 'partner')
      .select('category.slug', 'slug')
      .addSelect('category.displayName', 'displayName')
      .addSelect('COUNT(*)', 'partnerCount')
      .groupBy('category.slug')
      .addGroupBy('category.displayName')
      .getRawMany<{
        slug: string;
        displayName: string;
        partnerCount: string | number;
      }>();

    return categories.map(({ slug, displayName, partnerCount }) => ({
      slug,
      displayName,
      partnerCount: Number(partnerCount),
    }));
  }

  async findOneWithPartnerCount(
    slug: string,
  ): Promise<PartnerCategoryWithPartnerCount | null> {
    const category = await this.categoryRepository.findOne({
      where: {
        slug,
      },
    });

    if (!category) {
      return null;
    }

    const partnerCount = await this.categoryRepository.manager.count(Partner, {
      where: { categories: { slug: category.slug } },
    });

    return {
      ...category,
      partnerCount,
    };
  }
}
