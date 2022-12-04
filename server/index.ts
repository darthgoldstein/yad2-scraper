import express from 'express';

const startApp = async () => {
  const app = express();
  app.use(express.static('./build/client'));
  app.get('/api/getStuff', (_, res) => {
    res.json({ status: true });
  });
  app.get('*', (_, res) => {
    res.sendFile('index.html');
  });
  app.listen(3001, () => {
    console.log('Listening at port 3001');
  });
};

startApp();
