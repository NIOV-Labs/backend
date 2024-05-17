const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const pathToTokens = path.resolve(__dirname, 'Tokens.json');

class TokenUtils {
  reset() {
    if (fs.existsSync(pathToTokens)) fs.rmSync(pathToTokens);
    const access = crypto.randomBytes(64).toString('hex');
    const refresh = crypto.randomBytes(64).toString('hex');
    fs.writeFileSync(
      pathToTokens,
      JSON.stringify({ access, refresh }, null, 2)
    );
  }

  update() {
    if (!fs.existsSync(pathToTokens)) this.reset();
    const tokens = JSON.parse(fs.readFileSync(pathToTokens, 'utf-8'));
    this.access = tokens.access;
    this.refresh = tokens.refresh;
  }

  constructor() {
    this.update();
  }

  generate(data) {
    const atkn = jwt.sign(data, this.access, { expiresIn: '90m' });
    const rtkn = jwt.sign(data, this.refresh, { expiresIn: '2400m' });
    return { atkn, rtkn };
  }

  decode(token) {
    return jwt.decode(token);
  }

  verify(type, token) {
    const secret = type === 'atkn' ? this.access : this.refresh;
    try {
      return jwt.verify(token, secret);
    } catch {
      return;
    }
  }
}

module.exports = TokenUtils;
