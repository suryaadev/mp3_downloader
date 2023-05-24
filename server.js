const express = require('express');
const { exec } = require('youtube-dl-exec');
const fs = require('fs');
const sanitize = require('sanitize-filename');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/download', async (req, res) => {
  const url = req.body.url;

  if (!url) {
    res.status(400).send('Invalid request: No URL provided');
    return;
  }

  try {
    const downloadFolder = './downloads';

    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder, { recursive: true });
    }

    const options = {
      extractAudio: true,
      audioFormat: 'mp3',
      output: `${downloadFolder}/%(title)s.%(ext)s`,
    };

    const info = await exec(url, options);
    const fileName = sanitize(info.title) + '.mp3';
    const filePath = `${downloadFolder}/${fileName}`;

    fs.renameSync(`${downloadFolder}/${info._filename}`, filePath);

    console.log('Download complete');
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
      }
      fs.unlinkSync(filePath);
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).send(`Error downloading audio: ${err.message}`);
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
