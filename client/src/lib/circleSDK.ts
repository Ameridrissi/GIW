const CIRCLE_APP_ID = '502da187-5a8a-53c5-9856-3d9a9ac6dd56';

let sdkInstance: any = null;

/**
 * Get the Circle Web SDK from the global window object (loaded via CDN)
 */
function getCircleSDK(): any {
  if (typeof window === 'undefined' || !(window as any).W3SSdk) {
    console.error('Circle SDK (W3SSdk) not available on window object');
    console.log('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('circle') || k.toLowerCase().includes('w3s')));
    throw new Error('Circle SDK not loaded. Ensure the CDN script is included in index.html');
  }
  console.log('Circle SDK (W3SSdk) found on window object');
  return (window as any).W3SSdk;
}

/**
 * Initialize the Circle Web SDK
 */
export function initializeCircleSDK() {
  if (sdkInstance) {
    console.log('Returning existing Circle SDK instance');
    return sdkInstance;
  }

  try {
    console.log('Initializing new Circle SDK instance...');
    const W3SSdk = getCircleSDK();
    sdkInstance = new W3SSdk();
    console.log('Circle SDK initialized successfully');
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
  console.log('executeCircleChallenge called with:', {
    challengeId: challengeId ? `${challengeId.substring(0, 20)}...` : 'undefined',
    userTokenLength: userToken?.length || 0,
    encryptionKeyLength: encryptionKey?.length || 0,
  });

  return new Promise((resolve, reject) => {
    try {
      const sdk = initializeCircleSDK();
      
      console.log('Setting app settings with appId:', CIRCLE_APP_ID);
      sdk.setAppSettings({
        appId: CIRCLE_APP_ID,
      });

      console.log('Setting authentication...');
      sdk.setAuthentication({
        userToken: userToken,
        encryptionKey: encryptionKey,
      });

      console.log('Executing challenge:', challengeId);
      sdk.execute(challengeId, (error: any, result: any) => {
        if (error) {
          console.error('Circle SDK execute callback error:', error);
          reject(error);
          return;
        }
        
        console.log('Circle challenge completed successfully:', result);
        resolve(result);
      });
    } catch (error) {
      console.error('Error in executeCircleChallenge:', error);
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
