import { RealtimeRelay } from './lib/relay.js';
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { createServer } from 'http';
import { getProductByTitle, getOrderByName } from './lib/shopify.js';

dotenv.config({ override: true });

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error(
    `Environment variable "OPENAI_API_KEY" is required.\n` +
      `Please set it in your .env file.`,
  );
  process.exit(1);
}

const PORT = parseInt(process.env.PORT) || 8081;

const app = express();
app.use(bodyParser.json());
app.use(cors());
// Define the API endpoint
app.post('/api/getProductByTitle', async (req, res) => {
  const { product_title } = req.body;
  try {
    const product = await getProductByTitle(product_title);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/getOrderByName', async (req, res) => {
  const { order_name } = req.body;
  try {
    const order = await getOrderByName(order_name);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create HTTP server
const server = createServer(app);

// Start WebSocket server on the same HTTP server
const relay = new RealtimeRelay(OPENAI_API_KEY);
relay.listen(server);

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
