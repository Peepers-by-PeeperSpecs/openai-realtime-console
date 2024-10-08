import { WebSocketServer } from 'ws';
import { RealtimeClient } from '@openai/realtime-api-beta';
import { getProductByTitle, getOrderByName } from './shopify.js';

export class RealtimeRelay {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.sockets = new WeakMap();
    this.wss = null;
  }

  listen(server) {
    this.wss = new WebSocketServer({ server });
    this.wss.on('connection', this.connectionHandler.bind(this));
    this.log(`Listening on ws://localhost`);
  }

  async connectionHandler(ws, req) {
    if (!req.url) {
      this.log('No URL provided, closing connection.');
      ws.close();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (pathname !== '/') {
      this.log(`Invalid pathname: "${pathname}"`);
      ws.close();
      return;
    }

    // Instantiate new client
    this.log(`Connecting with key "${this.apiKey.slice(0, 3)}..."`);
    const client = new RealtimeClient({ apiKey: this.apiKey });

    // Add the tool
    client.addTool(
      {
        name: 'get_product_by_title',
        description: 'Fetches a product from Shopify by its title.',
        parameters: {
          type: 'object',
          properties: {
            product_title: {
              type: 'string',
              description: 'The title of the product to fetch.',
            },
          },
          required: ['product_title'],
        },
      },
      async ({ product_title }) => {
        return await getProductByTitle(product_title);
      },
    );

    client.addTool(
      {
        name: 'get_order_by_name',
        description: 'Fetches an order from Shopify by its name.',
        parameters: {
          type: 'object',
          properties: {
            order_name: {
              type: 'string',
              description: 'The name of the order to fetch.',
            },
          },
          required: ['order_name'],
        },
      },
      async ({ order_name }) => {
        return await getOrderByName(order_name);
      },
    );

    // Relay: OpenAI Realtime API Event -> Browser Event
    client.realtime.on('server.*', (event) => {
      this.log(`Relaying "${event.type}" to Client`);
      ws.send(JSON.stringify(event));
    });
    client.realtime.on('close', () => ws.close());

    // Relay: Browser Event -> OpenAI Realtime API Event
    // We need to queue data waiting for the OpenAI connection
    const messageQueue = [];
    const messageHandler = (data) => {
      try {
        const event = JSON.parse(data);
        this.log(`Relaying "${event.type}" to OpenAI`);
        client.realtime.send(event.type, event);
      } catch (e) {
        console.error(e.message);
        this.log(`Error parsing event from client: ${data}`);
      }
    };
    ws.on('message', (data) => {
      if (!client.isConnected()) {
        messageQueue.push(data);
      } else {
        messageHandler(data);
      }
    });
    ws.on('close', () => client.disconnect());

    // Connect to OpenAI Realtime API
    try {
      this.log(`Connecting to OpenAI...`);
      await client.connect();
    } catch (e) {
      this.log(`Error connecting to OpenAI: ${e.message}`);
      ws.close();
      return;
    }
    this.log(`Connected to OpenAI successfully!`);
    while (messageQueue.length) {
      messageHandler(messageQueue.shift());
    }
  }

  log(...args) {
    console.log(`[RealtimeRelay]`, ...args);
  }
}
