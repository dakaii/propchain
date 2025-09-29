import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PropertyType } from '../../entities/property.entity';

@ApiTags('properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties' })
  async findAll() {
    return await this.propertiesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active properties' })
  async getActive() {
    return await this.propertiesService.getActiveProperties();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  async findOne(@Param('id') id: string) {
    return await this.propertiesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new property (admin only)' })
  async create(
    @Body() createPropertyDto: {
      name: string;
      description: string;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      type: PropertyType;
      totalValue: number;
      totalShares: number;
      metrics: {
        monthlyRent: number;
        annualYield: number;
        occupancyRate: number;
        squareFootage: number;
        yearBuilt: number;
        bedrooms?: number;
        bathrooms?: number;
      };
    }
  ) {
    return await this.propertiesService.create(createPropertyDto);
  }
}