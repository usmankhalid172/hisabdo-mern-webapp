const { createApp, initializeApp } = require('./app');

const port = Number(process.env.PORT || 4000);
const app = createApp();

initializeApp(app)
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((error) => {
    console.error('Unable to initialize API:', error.message);
    process.exitCode = 1;
  });
