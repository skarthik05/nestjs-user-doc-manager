import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { APP_ROUTES } from '../src/constants/app.constants';
import { type LoginPayloadDto } from '../src/modules/auth/dto/login-response.dto';
import { type UserRegisterDto } from '../src/modules/auth/dto/user-register.dto';
import { type UserLoginDto } from '../src/modules/users/dto/user-login-dto';
import { type HttpServer, type LoginResponse } from './types/test.types';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  const testUser: UserRegisterDto = {
    email: 'test@example.com',
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'User',
  };

  const loginDto: UserLoginDto = {
    email: 'test@example.com',
    password: 'Test@123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/register`)
        .send(testUser)
        .expect(200);
    });

    it('should not register user with existing email', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/register`)
        .send(testUser)
        .expect(400);
    });

    it('should not register with invalid email format', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/register`)
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should not register with weak password', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/register`)
        .send({
          ...testUser,
          password: 'weak',
        })
        .expect(400);
    });

    it('should not register with missing required fields', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/register`)
        .send({
          email: 'test@example.com',
          password: 'Test@123',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/login`)
        .send(loginDto)
        .expect(200)
        .expect((res: LoginResponse) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should not login with invalid credentials', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/login`)
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should not login with non-existent email', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@123',
        })
        .expect(401);
    });

    it('should not login with malformed request body', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/login`)
        .send({
          email: 'test@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh access token with valid refresh token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/refresh`)
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .expect((res: LoginResponse) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
          accessToken = res.body.accessToken;
          refreshToken = res.body.refreshToken;
        });
    });

    it('should not refresh with invalid refresh token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/refresh`)
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should not refresh without authorization header', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/refresh`)
        .expect(401);
    });

    it('should not refresh with expired refresh token', async () => {
      const newUser = {
        ...testUser,
        email: 'expired@example.com',
      };
      await request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/register`)
        .send(newUser);

      const loginResponse = await request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/login`)
        .send({
          email: 'expired@example.com',
          password: 'Test@123',
        });

      const loginPayload = loginResponse.body as LoginPayloadDto;

      await new Promise((resolve) => setTimeout(resolve, 3600000));

      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/refresh`)
        .set('Authorization', `Bearer ${loginPayload.refreshToken}`)
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid access token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/logout`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('should not logout with invalid access token', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/logout`)
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should not logout without authorization header', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/logout`)
        .expect(401);
    });

    it('should not be able to use refresh token after logout', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/refresh`)
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(401);
    });

    it('should not be able to use access token after logout', () => {
      return request(app.getHttpServer() as HttpServer)
        .post(`/${APP_ROUTES.AUTH}/logout`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});
