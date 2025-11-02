import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';

let sdk: W3SSdk | null = null;

export function initializeCircleSDK(appId: string): W3SSdk {
  if (!sdk) {
    sdk = new W3SSdk();
    sdk.setAppSettings({ appId });
    console.log('[Circle SDK] Initialized with App ID:', appId);
  }
  return sdk;
}

export function getCircleSDK(): W3SSdk {
  if (!sdk) {
    throw new Error('Circle SDK not initialized. Call initializeCircleSDK first.');
  }
  return sdk;
}

export interface ChallengeResult {
  type: string;
  status: 'COMPLETE' | 'FAILED' | 'EXPIRED' | 'PENDING';
  data?: any;
}

export function executeChallenge(
  userToken: string,
  encryptionKey: string,
  challengeId: string
): Promise<ChallengeResult> {
  return new Promise((resolve, reject) => {
    const sdk = getCircleSDK();
    
    console.log('[Circle SDK] Setting authentication...');
    sdk.setAuthentication({
      userToken,
      encryptionKey,
    });

    console.log('[Circle SDK] Executing challenge:', challengeId);
    sdk.execute(challengeId, (error, result) => {
      if (error) {
        console.error('[Circle SDK] Challenge error:', error);
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error('No result from Circle SDK'));
        return;
      }

      console.log('[Circle SDK] Challenge completed:', result);
      resolve(result as ChallengeResult);
    });
  });
}
