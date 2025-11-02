import { CategorySpendingChart } from '../CategorySpendingChart'

export default function CategorySpendingChartExample() {
  const mockData = [
    { category: "Shopping", amount: 450, color: "hsl(221, 83%, 53%)" },
    { category: "Food", amount: 280, color: "hsl(262, 83%, 58%)" },
    { category: "Travel", amount: 620, color: "hsl(291, 64%, 42%)" },
    { category: "Bills", amount: 340, color: "hsl(334, 86%, 46%)" },
  ]

  return <CategorySpendingChart data={mockData} />
}
