// Migration CLI block: runs public migrations and exits with status code.
const { runPublicMigrations } = require('./migrationRunner');

runPublicMigrations()
  .then(() => {
    console.log('Public migrations completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Public migrations failed', error);
    process.exit(1);
  });
