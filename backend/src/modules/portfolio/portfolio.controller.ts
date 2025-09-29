import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('portfolio')
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @ApiOperation({ summary: 'Get user portfolio' })
  async getPortfolio(@Request() req) {
    return await this.portfolioService.getUserPortfolio(req.user.id);
  }

  @Get('position/:propertyId')
  @ApiOperation({ summary: 'Get specific position' })
  async getPosition(@Param('propertyId') propertyId: string, @Request() req) {
    return await this.portfolioService.getPosition(req.user.id, propertyId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top investors' })
  async getLeaderboard() {
    return await this.portfolioService.getTopInvestors();
  }
}