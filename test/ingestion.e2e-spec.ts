import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { APP_ROUTES } from '../src/constants/app.constants';
import {
  type HttpServer,
  type IngestionTestResponse,
  type LoginResponse,
} from './types/test.types';

describe('IngestionController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let documentId: string;
  let ingestionId: string;

  const testUser = {
    email: 'test@example.com',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a test user and get auth token
    await request(app.getHttpServer() as HttpServer)
      .post(`/${APP_ROUTES.AUTH}/register`)
      .send(testUser);

    const loginResponse = await request(app.getHttpServer() as HttpServer)
      .post(`/${APP_ROUTES.AUTH}/login`)
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const loginData = loginResponse.body as LoginResponse['body'];
    authToken = loginData.accessToken;

    // Create a test document
    const documentResponse = await request(app.getHttpServer() as HttpServer)
      .post(`/${APP_ROUTES.DOCUMENTS}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Document',
        description: 'Test Description',
      });

    const documentData = documentResponse.body as { id: string };
    documentId = documentData.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /ingestion', () => {
    it('should create a new ingestion', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.INGESTION}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId,
          file: {
            buffer: Buffer.from('test content'),
            originalname: 'test.txt',
            mimetype: 'text/plain',
          },
        })
        .expect(201)
        .expect((res: IngestionTestResponse) => {
          const ingestion = Array.isArray(res.body) ? res.body[0] : res.body;
          expect(ingestion).toHaveProperty('id');
          expect(ingestion).toHaveProperty('status');
          expect(ingestion.document.id).toBe(documentId);
          ingestionId = ingestion.id;
        });
    });

    it('should not create ingestion without auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.INGESTION}`)
        .send({
          documentId,
          file: {
            buffer: Buffer.from('test content'),
            originalname: 'test.txt',
            mimetype: 'text/plain',
          },
        })
        .expect(401);
    });

    it('should not create ingestion with invalid document id', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.INGESTION}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: 'invalid-id',
          file: {
            buffer: Buffer.from('test content'),
            originalname: 'test.txt',
            mimetype: 'text/plain',
          },
        })
        .expect(404);
    });
  });

  describe('GET /ingestion', () => {
    it('should get all ingestions', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.INGESTION}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: IngestionTestResponse) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should not get ingestions without auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.INGESTION}`)
        .expect(401);
    });
  });

  describe('GET /ingestion/:id', () => {
    it('should get ingestion by id', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.INGESTION}/${ingestionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: IngestionTestResponse) => {
          const ingestion = Array.isArray(res.body) ? res.body[0] : res.body;
          expect(ingestion.id).toBe(ingestionId);
        });
    });

    it('should not get ingestion with invalid id', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.INGESTION}/invalid-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('DELETE /ingestion/:id', () => {
    it('should delete ingestion by id', () => {
      return request(app.getHttpServer() as HttpServer)
        .delete(`/${APP_ROUTES.INGESTION}/${ingestionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should not delete ingestion with invalid id', () => {
      return request(app.getHttpServer() as HttpServer)
        .delete(`/${APP_ROUTES.INGESTION}/invalid-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
