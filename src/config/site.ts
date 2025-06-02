import { isDev } from './env';

export const SITE_URL = isDev
  ? 'http://localhost:3000'
  : 'https://tree.alwalxed.com';
