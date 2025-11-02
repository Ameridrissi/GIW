import { PaymentCard } from '../PaymentCard'

export default function PaymentCardExample() {
  return (
    <PaymentCard 
      type="visa"
      last4="4242"
      expiry="12/25"
      isDefault={true}
      cardholderName="John Doe"
    />
  )
}
