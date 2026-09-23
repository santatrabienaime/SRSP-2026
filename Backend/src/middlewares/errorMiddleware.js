export function errorMiddleware(err, req, res, next) {
  console.error('❌ Erreur :', err.message);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Conflit : donnée déjà existante.' });
  }
  if (err.message && err.message.includes('Extension')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message || 'Erreur interne du serveur.' });
}