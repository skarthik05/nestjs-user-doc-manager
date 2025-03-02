import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { APP_ROUTES } from '../../constants/app.constants';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { JwtRolesGuard } from '../../guards/auth.guard';
import { User } from '../users/domain/user';
import { DocumentsService } from './documents.service';
import { Document } from './domain/document';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@ApiTags(APP_ROUTES.DOCUMENTS)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), JwtRolesGuard)
@Controller({
  path: APP_ROUTES.DOCUMENTS,
  version: '1',
})
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a new document' })
  @ApiResponse({ status: 201, type: Document })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @AuthUser() user: User,
  ): Promise<Document> {
    return this.documentsService.create(createDocumentDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, type: [Document] })
  async findAll(@AuthUser() user: User): Promise<Document[]> {
    return this.documentsService.findAll(user);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200 })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @AuthUser() user: User,
  ): Promise<void> {
    return this.documentsService.update(id, updateDocumentDto, user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a document by id' })
  @ApiResponse({ status: 200, type: Document })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
  ): Promise<Document> {
    return this.documentsService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200 })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @AuthUser() user: User,
  ): Promise<void> {
    return this.documentsService.remove(id, user);
  }
}
