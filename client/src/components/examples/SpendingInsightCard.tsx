import { SpendingInsightCard } from '../SpendingInsightCard'

export default function SpendingInsightCardExample() {
  return (
    <SpendingInsightCard 
      title="This Month"
      amount="$1,234.56"
      change="-12%"
      trend="down"
      description="You're spending 12% less than last month"
    />
  )
}
