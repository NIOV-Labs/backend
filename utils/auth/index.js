const ethers = require('ethers');
const TokenUtils = require('./TokenUtils');
const SessionTracker = require('./SessionTracker');
const { rejection } = require('../validation');

class Auth {
  update() {
    this.tkn = new TokenUtils();
    this.sesh = new SessionTracker();
  }

  constructor() {
    this.update();
  }

  sigValidation(req, res, next) {
    const rejectAs = (nature) => {
      console.error(`Signature validation failed: ${nature}`);
      rejection('signature', nature, res);
    };

    const user = req.body.user;
    if (!user) return rejectAs('missing');

    console.log(`Received user data: ${JSON.stringify(user)}`);

    let signer;
    try {
      signer = ethers.verifyMessage(user.message, user.signature);
      console.log(`Signer: ${signer}`);
    } catch (error) {
      console.error(`Error verifying message: ${error}`);
      return rejectAs('invalid');
    }

    if (user.address !== signer) {
      console.error(`Address mismatch: ${user.address} !== ${signer}`);
      return rejectAs('stolen');
    }

    req.userData = { address: user.address, ip: req.ip };
    next();
  }

  rtknValidation(req, res, next) {
    const rejectAs = (nature) => rejection('rtkn', nature, res);

    const rtkn = req.cookies.rtkn;

    if (!rtkn) return rejectAs('missing');
    if (!this.sesh.has(rtkn)) return rejectAs('invalid');
    const decoded = this.tkn.verify('rtkn', rtkn);
    if (!decoded) return rejectAs('invalid');
    const { address, ip, timestamp } = decoded;
    if (req.ip !== decoded.ip) return rejectAs('stolen');

    req.userData = { address, ip, timestamp };
    next();
  }

  handleLogin(req, res) {
    let timestamp;
    const { address, ip } = req.userData;

    if (!req.userData.timestamp) timestamp = new Date();
    else {
      this.sesh.rm(req.cookies.rtkn);
      timestamp = req.userData.timestamp;
    }

    const { atkn, rtkn } = this.tkn.generate({ address, ip, timestamp });
    this.sesh.add(rtkn);

    console.log(`${address} logged in from ${ip} at ${new Date()}`);
    const { iat, exp } = this.tkn.decode(atkn);
    const cookieOpts = {
      httpOnly: true,
      // secure: true,
      // domain: 'mywebsite.com'
    };
    res
      .cookie('atkn', atkn, cookieOpts)
      .cookie('rtkn', rtkn, cookieOpts)
      .status(200)
      .json({ iat, exp, atkn, rtkn });
  }

  handleLogout(req, res) {
    const { rtkn } = req.cookies;
    if (!this.sesh.all.includes(rtkn))
      return res
        .status(403)
        .json({ info: 'validation.refreshToken - invalid' });

    this.sesh.rm(rtkn);

    this.sesh.clean();

    console.log(`${req.userData.address} logged out at ${new Date()}`);
    res
      .clearCookie('rtkn')
      .clearCookie('atkn')
      .status(204)
      .json({ info: 'logged out' });
  }

  atknValidation(req, res, next) {
    const rejectAs = (nature) => {
      console.error(`Token validation failed: ${nature}`);
      rejection('atkn', nature, res);
    };

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("Authorization header missing");
      return rejectAs('missing');
    }

    const atkn = authHeader.split(' ')[1];
    if (!atkn) {
      console.log("Access token missing");
      return rejectAs('missing');
    }

    const decoded = this.tkn.verify('atkn', atkn);
    if (!decoded) {
      console.log("Invalid token");
      return rejectAs('invalid');
    }

    const { address, ip, timestamp } = decoded;
    if (req.ip !== ip) {
      console.log("IP address mismatch");
      return rejectAs('stolen');
    }

    console.log(`Decoded token: ${JSON.stringify(decoded)}`);

    req.userData = { address, ip, timestamp };
    next();
  }
}

module.exports = Auth;
