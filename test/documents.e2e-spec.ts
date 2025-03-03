import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { APP_ROUTES } from '../src/constants/app.constants';
import {
  type DocumentTestResponse,
  type HttpServer,
  type LoginResponse,
} from './types/test.types';

describe('DocumentsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let documentId: string;

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

    const documentData = documentResponse.body as DocumentTestResponse['body'];
    documentId = documentData.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /documents', () => {
    it('should create a new document', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.DOCUMENTS}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Document',
          description: 'New Description',
        })
        .expect(201)
        .expect((res: DocumentTestResponse) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('New Document');
          expect(res.body.description).toBe('New Description');
        });
    });

    it('should not create document without auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.DOCUMENTS}`)
        .send({
          name: 'New Document',
          description: 'New Description',
        })
        .expect(401);
    });

    it('should not create document with invalid auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.DOCUMENTS}`)
        .set('Authorization', 'Bearer invalid_token')
        .send({
          name: 'New Document',
          description: 'New Description',
        })
        .expect(401);
    });

    it('should not create document with missing required fields', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.DOCUMENTS}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Document',
        })
        .expect(400);
    });
  });

  describe('GET /documents', () => {
    it('should get all documents', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.DOCUMENTS}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: DocumentTestResponse) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should not get documents without auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.DOCUMENTS}`)
        .expect(401);
    });

    it('should not get documents with invalid auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.DOCUMENTS}`)
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('GET /documents/:id', () => {
    it('should get document by id', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.DOCUMENTS}/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: DocumentTestResponse) => {
          expect(res.body.id).toBe(documentId);
        });
    });

    it('should not get document with invalid id', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.DOCUMENTS}/invalid-id`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not get document without auth token', () => {
      return request(app.getHttpServer() as HttpServer)
        .get(`/${APP_ROUTES.DOCUMENTS}/${documentId}`)
        .expect(401);
    });
  });
});
