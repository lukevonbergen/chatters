import React from 'react';
import { QRCodeSVG } from 'qrcode.react'; // Use named export

const QRCodeGenerator = ({ url }) => {
  return (
    <div style={styles.container}>
      <h3>Scan this QR code to leave feedback:</h3>
      <QRCodeSVG value={url} size={200} /> {/* Use QRCodeSVG */}
      <p style={styles.url}>{url}</p>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    margin: '20px 0',
  },
  url: {
    marginTop: '10px',
    fontSize: '0.9rem',
    color: '#666',
  },
};

export default QRCodeGenerator;