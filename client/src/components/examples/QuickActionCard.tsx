import { QuickActionCard } from '../QuickActionCard'
import { Wallet } from 'lucide-react'

export default function QuickActionCardExample() {
  return (
    <QuickActionCard 
      title="Add Wallet"
      description="Connect your USDC wallet to start managing payments"
      icon={Wallet}
    />
  )
}
