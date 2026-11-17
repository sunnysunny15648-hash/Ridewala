const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ridewala_super_secret_jwt_key_change_this_in_production_2024';

/**
 * Generate a signed JWT token.
 * @param {Object} payload - The data to encode (id, role).
 * @returns {string} Signed JWT token.
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Helper to paginate a Mongoose query.
 * @param {Object} query - Mongoose query object.
 * @param {number|string} page - Current page (1-based).
 * @param {number|string} limit - Items per page.
 * @returns {{ data: any[], total: number, page: number, pages: number }}
 */
const paginate = async (query, page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    query.skip(skip).limit(limitNum),
    query.model.countDocuments(query.getFilter()),
  ]);

  return {
    data,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
  };
};

module.exports = { generateToken, paginate };
