exports.handler = async () => {
  const siteIdExists = !!process.env.NETLIFY_SITE_ID;
  const apiTokenExists = !!process.env.NETLIFY_API_TOKEN;
  const firebaseKeyExists = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  const report = {
    NETLIFY_SITE_ID_LOADED: siteIdExists,
    NETLIFY_API_TOKEN_LOADED: apiTokenExists,
    FIREBASE_SERVICE_ACCOUNT_KEY_LOADED: firebaseKeyExists,
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  };
};
