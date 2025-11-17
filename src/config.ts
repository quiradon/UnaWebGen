import prodConfig from './config.json';
import localConfig from './config.local.json';

type Config = typeof prodConfig;

const runtimeEnv = (import.meta.env.PUBLIC_APP_ENV || '').toLowerCase();
const isLocalLike = runtimeEnv === 'local' || runtimeEnv === 'test' || import.meta.env.DEV;

const baseConfig: Config = (isLocalLike ? localConfig : prodConfig) as Config;

const envOverrides = {
  url: import.meta.env.PUBLIC_SITE_URL,
  api_url: import.meta.env.PUBLIC_API_URL,
  discord_client_id: import.meta.env.PUBLIC_DISCORD_CLIENT_ID,
};

const resolvedConfig: Config = {
  ...baseConfig,
  url: envOverrides.url || baseConfig.url,
  api_url: envOverrides.api_url || baseConfig.api_url,
  discord_client_id: envOverrides.discord_client_id || baseConfig.discord_client_id,
} as Config;

export const configEnv = isLocalLike ? (runtimeEnv || 'local') : 'production';

export default resolvedConfig;
