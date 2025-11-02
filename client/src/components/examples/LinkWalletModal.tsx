import { LinkWalletModal } from '../LinkWalletModal'
import { useState } from 'react'
import { Button } from '../ui/button'

export default function LinkWalletModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <LinkWalletModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
