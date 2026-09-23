import upload from '../config/multer.js';

export const uploadSingle = (field) => upload.single(field);
export const uploadMultiple = (field, max) => upload.array(field, max);