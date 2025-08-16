const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
	return res.json({ status: 'API running' });
});

app.listen(PORT, () => {
	console.log(`Backend listening on port ${PORT}`);
});