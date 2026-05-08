import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

// ── Replace this object with your own config from Firebase console ──────────
// Project Settings → Your apps → SDK setup and configuration → Config
const firebaseConfig = {
  apiKey:            'AIzaSyAIsM3NTYWJGjBGf3KaEhrsliJFrl9a5xo',
  authDomain:        'family-hub-67b12.firebaseapp.com',
  databaseURL:       'https://family-hub-67b12-default-rtdb.firebaseio.com',
  projectId:         'family-hub-67b12',
  storageBucket:     'family-hub-67b12.firebasestorage.app',
  messagingSenderId: '684989037934',
  appId:             '1:684989037934:web:c3ba7fcb6d25387301957f',
};
// ───────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

export const stateRef = ref(db, 'familyHub/state');
export { get, set };
