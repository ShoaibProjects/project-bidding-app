import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("../../secret keys/bid-buy-system-firebase-adminsdk-fbsvc-712ccd008d.json")),
  });
}

export default admin;
