import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';

const CIRCLE_APP_ID = "502da187-5a8a-53c5-9856-3d9a9ac6dd56";

// Initialize SDK at module level (matching working example)
let sdk: W3SSdk | undefined;
if (typeof window !== "undefined") {
  sdk = new W3SSdk({
    appSettings: { appId: CIRCLE_APP_ID },
  });
  console.log('[Circle SDK] Initialized at module level');
}

export function getCircleSDK(): W3SSdk {
  if (!sdk) {
    throw new Error('Circle SDK not initialized');
  }
  return sdk;
}

export interface ChallengeResult {
  type: string;
  status: 'COMPLETE' | 'FAILED' | 'EXPIRED' | 'PENDING';
  data?: any;
}

export function setAuthentication(userToken: string, encryptionKey: string) {
  const circleSdk = getCircleSDK();
  circleSdk.setAuthentication({
    userToken,
    encryptionKey,
  });
  console.log('[Circle SDK] Authentication set');
}

export function executeChallenge(
  challengeId: string,
  callback: (error: any, result: any) => void
): void {
  const circleSdk = getCircleSDK();
  console.log('[Circle SDK] Executing challenge:', challengeId);
  circleSdk.execute(challengeId, callback);
}
