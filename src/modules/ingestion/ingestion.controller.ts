import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthUser } from '../../decorators/auth-user.decorator';
import { JwtRolesGuard } from '../../guards/auth.guard';
import { User } from '../users/domain/user';
import { Ingestion } from './domain/ingestion';
import { TriggerIngestionDto } from './dto/trigger-ingestion.dto';
import { UpdateIngestionDto } from './dto/update-ingestion.dto';
import { IngestionService } from './ingestion.service';

@ApiTags('ingestion')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), JwtRolesGuard)
@Controller({
  path: 'ingestion',
  version: '1',
})
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  @ApiOperation({ summary: 'Trigger document ingestion' })
  @ApiResponse({ status: 201, type: Ingestion })
  async triggerIngestion(
    @Body() dto: TriggerIngestionDto,
    @AuthUser() user: User,
  ): Promise<Ingestion> {
    return this.ingestionService.triggerIngestion(dto, user);
  }

  @Get(':ingestionId/status')
  @ApiOperation({ summary: 'Get ingestion status' })
  @ApiResponse({ status: 200, type: Ingestion })
  async getIngestionStatus(
    @Param('ingestionId', ParseIntPipe) ingestionId: number,
    @AuthUser() user: User,
  ): Promise<Ingestion> {
    return this.ingestionService.getIngestionStatus(ingestionId, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all ingestions' })
  @ApiResponse({ status: 200, type: [Ingestion] })
  async listIngestion(@AuthUser() user: User): Promise<Ingestion[]> {
    return this.ingestionService.listIngestion(user);
  }

  @Put(':ingestionId')
  @ApiOperation({ summary: 'Update ingestion status' })
  @ApiResponse({ status: 200, type: Ingestion })
  async updateIngestion(
    @Param('ingestionId', ParseIntPipe) ingestionId: number,
    @Body() dto: UpdateIngestionDto,
    @AuthUser() user: User,
  ): Promise<Ingestion> {
    return this.ingestionService.updateIngestion(ingestionId, dto, user);
  }

  @Post(':ingestionId/abort')
  @ApiOperation({ summary: 'Abort an ongoing ingestion' })
  @ApiResponse({ status: 200, type: Ingestion })
  async abortIngestion(
    @Param('ingestionId', ParseIntPipe) ingestionId: number,
    @AuthUser() user: User,
  ): Promise<Ingestion> {
    return this.ingestionService.abortIngestion(ingestionId, user);
  }

  @Delete(':ingestionId')
  @ApiOperation({ summary: 'Delete an ingestion' })
  @ApiResponse({ status: 204 })
  async deleteIngestion(
    @Param('ingestionId', ParseIntPipe) ingestionId: number,
    @AuthUser() user: User,
  ): Promise<void> {
    await this.ingestionService.deleteIngestion(ingestionId, user);
  }
}
