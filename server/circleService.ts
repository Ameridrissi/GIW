import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

// Initialize Circle SDK
const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || '',
});

export interface CircleUser {
  userId: string;
  userToken: string;
}

export interface CircleWallet {
  id: string;
  address: string;
  blockchain: string;
  state: string;
  custodyType: string;
  accountType: string;
}

export class CircleService {
  /**
   * Create a new Circle user or get token for existing user
   * @param userId - Unique user identifier (from your auth system)
   * @returns User token for subsequent operations
   */
  async createUser(userId: string): Promise<string> {
    try {
      const response: any = await circleClient.createUser({
        userId: userId,
      });
      
      console.log('[Circle] createUser response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        userToken: response.data?.userToken,
        user: response.data?.user,
        fullData: JSON.stringify(response.data).substring(0, 200)
      });
      
      // Try different possible response structures
      const userToken = response.data?.userToken 
        || response.data?.user?.token 
        || response.userToken 
        || response.data?.data?.userToken
        || '';
      
      console.log('[Circle] Extracted userToken length:', userToken.length);
      
      if (!userToken) {
        console.error('[Circle] No userToken found in response!');
        throw new Error('Circle API returned no userToken');
      }
      
      return userToken;
    } catch (error: any) {
      const status = error.response?.status || error.status || error.code;
      console.log(`[Circle] createUser error - status: ${status}, userId: ${userId}`);
      
      // If user already exists (409), get a new token for them
      if (status === 409 || status === '409') {
        console.log(`[Circle] User already exists for userId: ${userId}, fetching new token...`);
        try {
          const tokenResponse: any = await circleClient.createUserToken({
            userId: userId,
          });
          
          console.log('[Circle] createUserToken response structure:', {
            hasData: !!tokenResponse.data,
            dataKeys: tokenResponse.data ? Object.keys(tokenResponse.data) : [],
            userToken: tokenResponse.data?.userToken,
            fullData: JSON.stringify(tokenResponse.data).substring(0, 200)
          });
          
          // Try different possible response structures
          const userToken = tokenResponse.data?.userToken 
            || tokenResponse.data?.user?.token 
            || tokenResponse.userToken 
            || tokenResponse.data?.data?.userToken
            || '';
          
          console.log('[Circle] Extracted userToken length:', userToken.length);
          
          if (!userToken) {
            console.error('[Circle] No userToken found in createUserToken response!');
            throw new Error('Circle API returned no userToken');
          }
          
          return userToken;
        } catch (tokenError: any) {
          console.error('[Circle] Error creating user token:', {
            message: tokenError.message,
            status: tokenError.response?.status || tokenError.status,
            data: tokenError.response?.data
          });
          throw new Error('Failed to get user token');
        }
      }
      
      console.error('[Circle] Error creating Circle user:', {
        message: error.message,
        status,
        data: error.response?.data
      });
      throw new Error('Failed to create Circle user');
    }
  }

  /**
   * Initialize user and create their first wallet with PIN
   * @param userToken - Token from createUser
   * @param blockchains - Array of blockchain networks (e.g., ['MATIC-AMOY', 'ETH-SEPOLIA'])
   * @returns Full challenge data including challengeId, userToken, and encryptionKey
   */
  async createUserPinWithWallets(
    userToken: string,
    blockchains: any[] = ['MATIC-AMOY']
  ): Promise<{ challengeId: string; userToken: string; encryptionKey: string }> {
    try {
      console.log(`[Circle] Creating PIN with wallets for blockchains: ${blockchains.join(', ')}`);
      console.log(`[Circle] UserToken length: ${userToken?.length || 0}`);
      
      const response: any = await circleClient.createUserPinWithWallets({
        userToken: userToken,
        accountType: 'SCA' as any, // Smart Contract Account
        blockchains: blockchains as any,
      });
      
      console.log('[Circle] PIN challenge created successfully');
      return {
        challengeId: response.data?.challengeId || '',
        userToken: userToken,
        encryptionKey: response.data?.encryptionKey || '',
      };
    } catch (error: any) {
      console.error('[Circle] Error creating user PIN with wallets:', {
        message: error.message,
        status: error.response?.status || error.status,
        data: error.response?.data,
        userTokenProvided: !!userToken,
        userTokenLength: userToken?.length || 0
      });
      throw new Error('Failed to create user PIN and wallet');
    }
  }

  /**
   * Get all wallets for a user
   * @param userToken - User's token
   * @returns Array of user's wallets
   */
  async getUserWallets(userToken: string): Promise<CircleWallet[]> {
    try {
      const response: any = await (circleClient as any).listWallets({
        userToken: userToken,
      });
      
      return response.data?.wallets || [];
    } catch (error) {
      console.error('Error fetching user wallets:', error);
      throw new Error('Failed to fetch user wallets');
    }
  }

  /**
   * Get wallet balance for a specific token
   * @param userToken - User's token
   * @param walletId - Wallet ID
   * @returns Token balances
   */
  async getWalletBalance(userToken: string, walletId: string) {
    try {
      const response: any = await circleClient.getWalletTokenBalance({
        userToken: userToken,
        walletId: walletId,
      });
      
      return response.data?.tokenBalances || [];
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw new Error('Failed to fetch wallet balance');
    }
  }

  /**
   * Initiate a token transfer
   * @param userToken - User's token
   * @param walletId - Source wallet ID
   * @param destinationAddress - Recipient address
   * @param tokenId - Token ID (e.g., USDC token ID)
   * @param amount - Amount to transfer
   * @returns Challenge ID for user confirmation
   */
  async createTransfer(
    userToken: string,
    walletId: string,
    destinationAddress: string,
    tokenId: string,
    amount: string
  ): Promise<string> {
    try {
      const response = await circleClient.createTransaction({
        userToken: userToken,
        amounts: [amount],
        destinationAddress: destinationAddress,
        tokenId: tokenId,
        walletId: walletId,
        fee: {
          type: 'level',
          config: { feeLevel: 'MEDIUM' },
        },
      });
      
      return response.data?.challengeId || '';
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw new Error('Failed to create transfer');
    }
  }

  /**
   * Get transaction status
   * @param userToken - User's token
   * @param transactionId - Transaction ID
   * @returns Transaction details
   */
  async getTransaction(userToken: string, transactionId: string) {
    try {
      const response = await circleClient.getTransaction({
        userToken: userToken,
        id: transactionId,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error('Failed to fetch transaction');
    }
  }
}

export const circleService = new CircleService();
