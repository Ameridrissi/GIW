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
   * Create a new Circle user
   * @param userId - Unique user identifier (from your auth system)
   * @returns User token for subsequent operations
   */
  async createUser(userId: string): Promise<string> {
    try {
      const response: any = await circleClient.createUser({
        userId: userId,
      });
      
      return response.data?.userToken || '';
    } catch (error) {
      console.error('Error creating Circle user:', error);
      throw new Error('Failed to create Circle user');
    }
  }

  /**
   * Initialize user and create their first wallet with PIN
   * @param userToken - Token from createUser
   * @param blockchains - Array of blockchain networks (e.g., ['MATIC-AMOY', 'ETH-SEPOLIA'])
   * @returns Challenge ID for frontend PIN setup
   */
  async createUserPinWithWallets(
    userToken: string,
    blockchains: any[] = ['MATIC-AMOY']
  ): Promise<string> {
    try {
      const response: any = await circleClient.createUserPinWithWallets({
        userToken: userToken,
        accountType: 'SCA' as any, // Smart Contract Account
        blockchains: blockchains as any,
      });
      
      return response.data?.challengeId || '';
    } catch (error) {
      console.error('Error creating user PIN with wallets:', error);
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
