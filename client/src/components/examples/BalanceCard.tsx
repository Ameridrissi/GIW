import { BalanceCard } from '../BalanceCard'

export default function BalanceCardExample() {
  return (
    <BalanceCard 
      balance="2,450.00 USDC"
      usdValue="2,450.00"
      percentChange="+2.4%"
      isPositive={true}
    />
  )
}
