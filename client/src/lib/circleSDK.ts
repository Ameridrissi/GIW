import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk';

const CIRCLE_APP_ID = '502da187-5a8a-53c5-9856-3d9a9ac6dd56';
const CIRCLE_ENDPOINT = 'https://api.circle.com/v1/w3s/';

let sdkInstance: W3SSdk | null = null;

/**
 * Initialize the Circle Web SDK
 */
export function initializeCircleSDK() {
  if (sdkInstance) {
    return sdkInstance;
  }

  try {
    sdkInstance = new W3SSdk();
    return sdkInstance;
  } catch (error) {
    console.error('Error initializing Circle SDK:', error);
    throw error;
  }
}

/**
 * Execute a Circle challenge (e.g., PIN setup, transaction signing)
 * @param challengeId - Challenge ID from backend
 * @param userToken - User authentication token from backend
 * @param encryptionKey - Encryption key from backend
 * @returns Promise that resolves when challenge is complete
 */
export function executeCircleChallenge(
  challengeId: string,
  userToken: string,
  encryptionKey: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const sdk = initializeCircleSDK();
    
    try {
      sdk.setAppSettings({
        appId: CIRCLE_APP_ID,
      });

      sdk.setAuthentication({
        userToken: userToken,
        encryptionKey: encryptionKey,
      });

      sdk.execute(challengeId, (error, result) => {
        if (error) {
          console.error('Circle SDK error:', error);
          reject(error);
          return;
        }
        
        console.log('Circle challenge completed:', result);
        resolve(result);
      });
    } catch (error) {
      console.error('Error executing Circle challenge:', error);
      reject(error);
    }
  });
}

/**
 * Set the layout configuration for the Circle SDK
 * @param config - Layout configuration options
 */
export function setCircleLayout(config?: {
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
}) {
  const sdk = initializeCircleSDK();
  
  if (config) {
    sdk.setLayout({
      title: config.title || 'Circle Wallet',
      subtitle: config.subtitle || 'Secure your wallet with a PIN',
      showClose: config.showCloseButton ?? true,
    });
  }
}
