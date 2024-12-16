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
      <h1 style={styles.title}>
        <span style={styles.titleGradient}>QR Code</span> Generator
      </h1>
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
      <a href="https://github.com/yashkumar2603/S3-QR-Service" target="_blank" rel="noopener noreferrer" style={styles.githubButton}>
        <svg height="32" aria-hidden="true" viewBox="0 0 16 16" version="1.1" width="32" data-view-component="true">
          <path fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        <span style={styles.githubText}>View on GitHub</span>
      </a>
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
    background: 'linear-gradient(135deg, #4a4a4a 0%, #215d5e 100%)',
    color: 'white',
  },
  title: {
    margin: '0 0 30px',
    lineHeight: '1.15',
    fontSize: '4rem',
    textAlign: 'center',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
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
    color: '#121212',
    fontSize: '16px',
  },
  button: {
    padding: '10px 20px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#4ecdc4',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#45b7aa',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  qrCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
  qrCode: {
    marginTop: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    borderRadius: '10px',
  },
  downloadButton: {
    padding: '10px 20px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#ff5252',
    },
  },
  githubButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '30px',
    padding: '10px 20px',
    backgroundColor: '#24292e',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: '#2f363d',
    },
  },
  githubText: {
    marginLeft: '10px',
    fontSize: '16px',
  },
};
