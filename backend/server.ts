import app from './src/app';
import { config } from './src/config/env';

app.listen(config.PORT, () => {
  console.log(`Backend server securely listening at http://localhost:${config.PORT}`);
});
