const app = require('./app');

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`CloudPath API listening on http://localhost:${PORT}`);
});
