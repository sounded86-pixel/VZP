import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Force HTTP long polling to successfully bypass restricted WebSocket proxy environments in container previews,
// and use memory caching to avoid IndexedDB lease acquisition errors in sandboxed iframes.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: memoryLocalCache()
}, (firebaseConfig as any).firestoreDatabaseId || "ai-studio-062eab10-bcca-4269-a32c-8f57082bf304");

export const auth = getAuth(app);

// Authenticate anonymously automatically to satisfy security rules (request.auth != null)
signInAnonymously(auth).then(() => {
  console.log("Firebase authenticated anonymously successfully");
}).catch((error) => {
  console.warn("Firebase anonymous authentication failed:", error);
});

// Error Handling conforming to the spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;

  const isPermissionDenied = 
    code === 'permission-denied' || 
    message.toLowerCase().includes('permission') || 
    message.toLowerCase().includes('insufficient');

  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };

  if (isPermissionDenied) {
    console.error('Firestore Permission Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Connection/Non-Permission Warning: ', message, 'Operation:', operationType, 'Path:', path);
  }
}

// Mandatory testConnection helper with a 3-second timeout limit to prevent long blocking
async function testConnection() {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Timeout waiting for Firestore server")), 3000)
  );

  try {
    await Promise.race([
      getDoc(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
    console.log("Firestore connection check successful.");
  } catch (error) {
    if (error instanceof Error) {
      console.warn("Firestore connection check info/warning: " + error.message);
    } else {
      console.warn("Firestore connection check is offline or unavailable.");
    }
  }
}
testConnection();
