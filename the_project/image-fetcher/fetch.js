const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGE_URL = 'https://picsum.photos/1200';
const IMAGE_PATH = '/usr/src/app/files/image.jpg';
const CACHE_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

function downloadImage() {
  console.log(`${new Date().toISOString()} - Downloading new image...`);
  
  https.get(IMAGE_URL, (response) => {
    // Follow redirects
    if (response.statusCode === 301 || response.statusCode === 302) {
      console.log(`Following redirect to: ${response.headers.location}`);
      https.get(response.headers.location, (redirectResponse) => {
        if (redirectResponse.statusCode === 200) {
          const fileStream = fs.createWriteStream(IMAGE_PATH);
          redirectResponse.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            console.log(`${new Date().toISOString()} - Image downloaded successfully`);
          });
        } else {
          console.error(`Failed to download image after redirect: ${redirectResponse.statusCode}`);
        }
      }).on('error', (err) => {
        console.error(`Error downloading image after redirect: ${err.message}`);
      });
    } else if (response.statusCode === 200) {
      const fileStream = fs.createWriteStream(IMAGE_PATH);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`${new Date().toISOString()} - Image downloaded successfully`);
      });
    } else {
      console.error(`Failed to download image: ${response.statusCode}`);
    }
  }).on('error', (err) => {
    console.error(`Error downloading image: ${err.message}`);
  });
}

// Download image immediately on startup
downloadImage();

// Then download every hour
setInterval(downloadImage, CACHE_TIME);

console.log('Image fetcher started. Will fetch new image every hour.');
