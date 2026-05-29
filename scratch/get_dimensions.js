import fs from 'fs';

const buffer = fs.readFileSync('c:\\Users\\Doell\\Documents\\DOELL\\POLIMEDIA\\VSCode\\photobooth-app UPDATED\\photobooth-app ver. fayyad\\photobooth-app\\public\\logo - Copy.png');
const width = buffer.readInt32BE(16);
const height = buffer.readInt32BE(20);

console.log(`Dimensions: ${width}x${height}`);
console.log(`Aspect Ratio (W/H): ${width / height}`);
