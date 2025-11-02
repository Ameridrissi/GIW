import { AIInsightAlert } from '../AIInsightAlert'

export default function AIInsightAlertExample() {
  return (
    <AIInsightAlert 
      message="Based on your spending pattern, you could save $120 this month by using USDC for international payments instead of traditional cards."
      type="tip"
    />
  )
}
