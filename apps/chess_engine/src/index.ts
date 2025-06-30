import express from 'express';
import moveRoute from './route/route'; // Adjust path accordingly

const app = express();
app.use(express.json());
app.use('/', moveRoute);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Bot service running on port ${PORT}`);
});
