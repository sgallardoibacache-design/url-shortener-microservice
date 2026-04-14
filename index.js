const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

const urls = [];
let idCounter = 1;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>URL Shortener Microservice</title>
      </head>
      <body>
        <h1>URL Shortener Microservice</h1>
        <form action="/api/shorturl" method="POST">
          <input
            type="text"
            name="url"
            placeholder="https://www.freecodecamp.org"
            required
          />
          <button type="submit">Shorten URL</button>
        </form>
      </body>
    </html>
  `);
});

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;
  let parsedUrl;

  try {
    parsedUrl = new URL(originalUrl);
  } catch (error) {
    return res.json({ error: 'invalid url' });
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const existingUrl = urls.find((item) => item.original_url === originalUrl);

    if (existingUrl) {
      return res.json(existingUrl);
    }

    const newEntry = {
      original_url: originalUrl,
      short_url: idCounter++
    };

    urls.push(newEntry);
    return res.json(newEntry);
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = Number(req.params.short_url);
  const foundUrl = urls.find((item) => item.short_url === shortUrl);

  if (!foundUrl) {
    return res.json({ error: 'invalid url' });
  }

  return res.redirect(foundUrl.original_url);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});