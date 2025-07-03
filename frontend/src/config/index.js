import productionConfig from './production';
import developmentConfig from './development';

const config = process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;

export default config; 