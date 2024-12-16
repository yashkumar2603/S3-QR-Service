'use client'
import { useState } from 'react';
import axios from 'axios';
export default function Home() {
  const [url, setUrl] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/generate-qr', {
        url: url
      }, {
        responseType: 'arraybuffer'
      });
      
      const blob = new Blob([response.data], { type: 'image/png' });
      const objectUrl = URL.createObjectURL(blob);
      setQrCode({ url: objectUrl, blob: blob });
    } catch (error) {
      console.error('Error generating QR Code:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(qrCode.blob);
      link.download = `qrcode-${url.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>QR Code Generator</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL like https://example.com"
          style={styles.input}
        />
        <button 
          type="submit" 
          style={styles.button}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>
      {qrCode && (
        <div style={styles.qrCodeContainer}>
          <img src={qrCode.url} alt="QR Code" style={styles.qrCode} />
          <button onClick={handleDownload} style={styles.downloadButton}>
            Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    color: 'white',
  },
  title: {
    margin: '0',
    lineHeight: '1.15',
    fontSize: '4rem',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    marginTop: '20px',
    width: '300px',
    color: '#121212'
  },
  button: {
    padding: '10px 20px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#0070f3',
    color: 'white',
    cursor: 'pointer',
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  qrCode: {
    marginTop: '20px',
  },
  qrCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
  downloadButton: {
    padding: '10px 20px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#28a745',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
  },
};
