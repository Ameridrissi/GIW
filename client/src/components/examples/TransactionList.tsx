import { TransactionList } from '../TransactionList'

export default function TransactionListExample() {
  const mockTransactions = [
    {
      id: "1",
      type: "sent" as const,
      merchant: "Amazon Store",
      category: "shopping",
      amount: "124.50 USDC",
      date: "Today, 2:30 PM",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "received" as const,
      merchant: "Salary Payment",
      category: "bills",
      amount: "3,000.00 USDC",
      date: "Yesterday, 9:00 AM",
      status: "completed" as const,
    },
    {
      id: "3",
      type: "sent" as const,
      merchant: "Starbucks",
      category: "food",
      amount: "8.50 USDC",
      date: "Nov 1, 4:15 PM",
      status: "pending" as const,
    },
  ]

  return <TransactionList transactions={mockTransactions} />
}
