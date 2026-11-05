export const APP_NAME = 'Listo';

export interface HealthResponse {
  status: 'ok';
  app: typeof APP_NAME;
}
