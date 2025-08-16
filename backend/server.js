import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'API running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JeevanDhara backend listening on port ${PORT}`);
});
