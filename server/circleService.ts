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
      // First, try to create the user (this will fail with 409 if user exists)
      await circleClient.createUser({
        userId: userId,
      });
      console.log('[Circle] User created successfully');
    } catch (error: any) {
      const status = error.response?.status || error.status || error.code;
      
      // If user doesn't already exist (not 409), this is a real error
      if (status !== 409 && status !== '409') {
        console.error('[Circle] Error creating Circle user:', {
          message: error.message,
          status,
          data: error.response?.data
        });
        throw new Error('Failed to create Circle user');
      }
      
      console.log(`[Circle] User already exists for userId: ${userId} (409 - this is normal)`);
    }
    
    // Always create a new token (for both new and existing users)
    // According to Circle SDK types, createUser returns UserResponse (no token),
    // and we need to call createUserToken to get the actual userToken
    try {
      console.log('[Circle] Fetching user token...');
      const tokenResponse: any = await circleClient.createUserToken({
        userId: userId,
      });
      
      // The response should be: { data: { userToken: string } }
      const userToken = tokenResponse.data?.userToken || tokenResponse.userToken || '';
      
      console.log('[Circle] User token retrieved successfully, length:', userToken.length);
      
      if (!userToken) {
        console.error('[Circle] No userToken in response:', {
          hasData: !!tokenResponse.data,
          dataKeys: tokenResponse.data ? Object.keys(tokenResponse.data) : []
        });
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

  /**
   * Initiate PIN setup for a user (separate from wallet creation)
   * This is the correct approach - set up PIN first, then create wallets
   * @param userToken - Token from createUser
   * @returns Challenge data for PIN setup
   */
  async createUserPin(userToken: string): Promise<{ challengeId: string; encryptionKey: string }> {
    try {
      console.log('[Circle] Initiating PIN setup for user');
      console.log(`[Circle] UserToken length: ${userToken?.length || 0}`);
      
      const response: any = await circleClient.createUserPin({
        userToken: userToken,
      });
      
      console.log('[Circle] PIN challenge created successfully');
      return {
        challengeId: response.data?.challengeId || '',
        encryptionKey: response.data?.encryptionKey || '',
      };
    } catch (error: any) {
      console.error('[Circle] Error creating user PIN:', {
        message: error.message,
        status: error.response?.status || error.status,
        data: error.response?.data,
      });
      throw new Error('Failed to initiate PIN setup');
    }
  }

  /**
   * Create a wallet for a user (after PIN is already set up)
   * @param userToken - User's token
   * @param blockchains - Array of blockchain networks
   * @returns Wallet creation challenge data
   */
  async createWallet(
    userToken: string,
    blockchains: any[] = ['ARC-TESTNET']
  ): Promise<{ challengeId: string }> {
    try {
      console.log(`[Circle] Creating wallet for blockchains: ${blockchains.join(', ')}`);
      
      const response: any = await circleClient.createWallet({
        userToken: userToken,
        blockchains: blockchains as any,
        accountType: 'SCA' as any,
      });
      
      console.log('[Circle] Wallet creation initiated');
      return {
        challengeId: response.data?.challengeId || '',
      };
    } catch (error: any) {
      console.error('[Circle] Error creating wallet:', {
        message: error.message,
        status: error.response?.status || error.status,
        data: error.response?.data,
      });
      throw new Error('Failed to create wallet');
    }
  }

  /**
   * Get all wallets for a user
   * @param userId - Circle user ID
   * @returns Array of user's wallets
   */
  async getUserWallets(userId: string): Promise<CircleWallet[]> {
    try {
      console.log('[Circle] Fetching wallets for userId:', userId);
      const response: any = await (circleClient as any).listWallets({
        userId: userId,
      });
      
      const wallets = response.data?.wallets || [];
      console.log('[Circle] Found wallets:', wallets.length);
      return wallets;
    } catch (error) {
      console.error('[Circle] Error fetching user wallets:', error);
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
