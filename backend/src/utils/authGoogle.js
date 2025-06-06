import crypto from "crypto";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// generate a secure random state parameter for CSRF protection
export const generateState = () => {
  return crypto.randomBytes(32).toString("hex");
};

// generate a nonce value to prevent replay attacks
export const generateNonce = () => {
  return crypto.randomBytes(32).toString("hex");
};
// create a JWKS client for Google's certificate endpoint
const getJwksClient = () => {
  return jwksClient({
    jwksUri: process.env.GOOGLE_JWKS_URL,
    cache: true,
    rateLimit: true,
  });
};

// function to get the signing key for a given key ID
const getSigningKey = async (kid) => {
  const client = getJwksClient();
  // get the signing key from the JWKS client using the key ID (kid)
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        console.error("Error getting signing key:", err);
        return reject(err);
      }
      const signingKey = key.getPublicKey();
      resolve(signingKey);
    });
  });
};

// function to verify the ID token using the signing key
export const verifyGoogleToken = async (token) => {
  try {
    // decode without verifying to get the header (to extract the kid)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throw new Error("Invalid token");
    }

    const kid = decoded.header.kid;
    const signingKey = await getSigningKey(kid);

    // verify the token using the signing key
    const verifiedToken = jwt.verify(token, signingKey, {
      algorithms: ["RS256"],
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return verifiedToken;
  } catch (error) {
    console.log("Error verifying token:", error);
    throw new Error("Token verification failed");
  }
};
