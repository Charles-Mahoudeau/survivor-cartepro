import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PartnerCategory } from '@/modules/partners/categories/entities/partner-category.entity';
import { Repository } from 'typeorm';
import { Partner } from '@/modules/partners/core/entities/partner.entity';
import { PartnerCategoryResponseDto } from '@/modules/partners/categories/dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PartnerCategoriesService {
  constructor(
    @InjectRepository(PartnerCategory)
    private readonly categoryRepository: Repository<PartnerCategory>,
  ) {}

  async findAllWithPartnerCount(): Promise<PartnerCategoryResponseDto[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.partners', 'partner')
      .select('category.slug', 'slug')
      .addSelect('category.displayName', 'displayName')
      .addSelect('COUNT(partner.id)', 'partnerCount')
      .groupBy('category.slug')
      .addGroupBy('category.displayName')
      .getRawMany<{
        slug: string;
        displayName: string;
        partnerCount: string | number;
      }>();

    const categoryWithPartnersArray = categories.map(
      ({ slug, displayName, partnerCount }) => ({
        slug,
        displayName,
        partnerCount: Number(partnerCount),
      }),
    );

    return plainToInstance(
      PartnerCategoryResponseDto,
      categoryWithPartnersArray,
    );
  }

  async findOneWithPartnerCount(
    slug: string,
  ): Promise<PartnerCategoryResponseDto | null> {
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

    const categoryWithPartners = {
      ...category,
      partnerCount,
    };

    return plainToInstance(PartnerCategoryResponseDto, categoryWithPartners);
  }
}
