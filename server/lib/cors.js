import cors from 'cors';

const whitelist = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

const middleware = cors(corsOptions);
export default middleware;
export { corsOptions };
