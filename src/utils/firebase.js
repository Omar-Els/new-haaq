import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "elhaqpro-bd131.firebaseapp.com",
  databaseURL: "https://elhaqpro-bd131-default-rtdb.firebaseio.com",
  projectId: "elhaqpro-bd131",
  storageBucket: "elhaqpro-bd131.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

