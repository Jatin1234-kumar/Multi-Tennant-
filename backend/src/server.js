// Server bootstrap block: starts Express app on configured port.
const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`API server listening on port ${env.port}`);
});
