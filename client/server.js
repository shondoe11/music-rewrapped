import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import compression from 'compression';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = 3000;

//~ gzip compression fr faster load times
app.use(compression());

//~ serve static files frm dist dir
app.use(express.static(join(__dirname, 'dist')));

//~ redirect all requests to index.html fr SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
