import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
  ) {}

  async create(
    createInventoryDto: CreateInventoryDto,
    companyId: string,
  ): Promise<Inventory> {
    // Check if stock code already exists for this company
    const existing = await this.inventoryRepository.findOne({
      where: { stockCode: createInventoryDto.stockCode, companyId },
    });

    if (existing) {
      throw new ConflictException('Stock code already exists for this company');
    }

    const inventory = this.inventoryRepository.create({
      ...createInventoryDto,
      companyId,
    });

    return this.inventoryRepository.save(inventory);
  }

  async findAll(companyId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id, companyId },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory item not found');
    }

    return inventory;
  }

  async update(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    companyId: string,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id, companyId);

    // If updating stock code, check for conflicts
    if (
      updateInventoryDto.stockCode &&
      updateInventoryDto.stockCode !== inventory.stockCode
    ) {
      const existing = await this.inventoryRepository.findOne({
        where: { stockCode: updateInventoryDto.stockCode, companyId },
      });

      if (existing) {
        throw new ConflictException(
          'Stock code already exists for this company',
        );
      }
    }

    Object.assign(inventory, updateInventoryDto);
    return this.inventoryRepository.save(inventory);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const inventory = await this.findOne(id, companyId);
    await this.inventoryRepository.remove(inventory);
  }
}
