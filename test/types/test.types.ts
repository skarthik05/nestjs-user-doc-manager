import { type Server } from 'http';

import { type LoginPayloadDto } from '../../src/modules/auth/dto/login-response.dto';

export interface DocumentResponse {
  id: string;
  name: string;
  description: string;
}

export interface IngestionResponse {
  id: string;
  status: string;
  document: {
    id: string;
  };
  error?: string;
}

export interface TestResponse<T> {
  body: T;
  status: number;
}

export type LoginResponse = TestResponse<LoginPayloadDto>;
export type DocumentTestResponse = TestResponse<DocumentResponse>;
export type IngestionTestResponse = TestResponse<
  IngestionResponse | IngestionResponse[]
>;

export type HttpServer = Server;
