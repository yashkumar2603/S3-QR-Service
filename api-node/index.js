const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

const app = express();
app.use(express.json());

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
  
app.use(cors(corsOptions));

// Configure Winston Logger with Console Transport
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Configure AWS S3 client for Cloudflare R2
const r2 = new AWS.S3({
    endpoint: process.env.R2_ENDPOINT_URL,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'auto'
});

const bucketName = process.env.R2_BUCKET_NAME;
const r2PublicUrl = process.env.R2_PUBLIC_URL;

// Test connection to Cloudflare R2
r2.listBuckets((err, data) => {
    if (err) {
        logger.error(`Failed to connect to Cloudflare R2: ${err.message}`);
    } else {
        logger.info('Successfully connected to Cloudflare R2');
    }
});

app.post('/generate-qr', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        logger.error('No URL provided in request body');
        return res.status(400).json({ detail: 'URL is required in request body' });
    }
    
    logger.info(`Generating QR code for URL: ${url}`);

    try {
        // Generate QR code
        const qrCodeDataUrl = await qrcode.toDataURL(url, {
            errorCorrectionLevel: 'L',
            type: 'image/png',
            width: 200,
            margin: 1
        });

        // Convert Data URL to Buffer
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const imgBuffer = Buffer.from(base64Data, 'base64');

        // Prepare file name and upload to R2
        const fileName = `qr_codes/${url.split('//').pop()}.png`;
        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: imgBuffer,
            ContentType: 'image/png'
        };

        logger.info(`Uploading QR code to R2 with file name: ${fileName}`);
        await r2.putObject(params).promise();
        logger.info('QR code successfully uploaded to R2');

        const r2Url = `${r2PublicUrl}/${fileName}`;
        logger.info(`Generated R2 URL: ${r2Url}`);
        
        res.json({ qr_code_url: r2Url });
    } catch (error) {
        logger.error(`Error uploading QR code to R2: ${error.message}`);
        res.status(500).json({ detail: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});
