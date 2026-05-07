import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

// ── Replace this object with your own config from Firebase console ──────────
// Project Settings → Your apps → SDK setup and configuration → Config
const firebaseConfig = {
  apiKey:            'REPLACE_ME',
  authDomain:        'REPLACE_ME',
  databaseURL:       'REPLACE_ME',
  projectId:         'REPLACE_ME',
  storageBucket:     'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId:             'REPLACE_ME',
};
// ───────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export const stateRef = ref(db, 'familyHub/state');
export { get, set };
