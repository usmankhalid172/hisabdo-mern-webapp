import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();

const uid = "FAYUSaZrQVRquJYhHEsvAyQEai33";

await auth.setCustomUserClaims(uid, {
  admin: true
});

console.log("✅ Admin claim successfully set for:", uid);

process.exit(0);