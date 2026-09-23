export function validateMiddleware(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ message: 'Validation échouée', details });
    }
    req.body = value;
    next();
  };
}