import { WalletCreationModal } from '../WalletCreationModal'
import { useState } from 'react'
import { Button } from '../ui/button'

export default function WalletCreationModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <WalletCreationModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
