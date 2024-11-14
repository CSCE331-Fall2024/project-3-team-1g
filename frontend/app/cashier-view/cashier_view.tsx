'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Edit, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type OrderItem = {
  name: string
  details?: string
  price: number
}

type OrderState = {
  items: OrderItem[]
  total: number
  tax: number
}

type CategoryItems = {
  [key: string]: {
    name: string
    price: number
    image: string
    quantity: number
  }[]
}

const items: CategoryItems = {
  Appetizers: [
    { name: 'Egg Roll', price: 1.95, image: '/imgs/eggrolls.png?height=100&width=100', quantity: 1 },
    { name: 'Spring Roll', price: 1.95, image: '/imgs/springrolls.jpg?height=100&width=100', quantity: 1 },
  ],
  Drinks: [
    { name: 'Fountain Drink', price: 2.45, image: '/imgs/drinks.png?height=100&width=100', quantity: 1 },
    { name: 'Bottled Water', price: 2.15, image: '/imgs/waterbottle.png?height=100&width=100', quantity: 1 },
  ],
  Extras: [
    { name: 'Fortune Cookies', price: 0.95, image: '/imgs/fortunecookies.jpg?height=100&width=100', quantity: 1 },
    { name: 'Soy Sauce', price: 0.25, image: '/imgs/soysauce.png?height=100&width=100', quantity: 1 },
  ],
}

export default function Component() {
  const [currentStep, setCurrentStep] = useState<'category' | 'container' | 'side' | 'entree' | 'appetizers' | 'drinks' | 'extras'>('category')
  const [order, setOrder] = useState<OrderState>({ items: [], total: 0, tax: 0 })
  const [currentItem, setCurrentItem] = useState<Partial<OrderItem>>({})
  const [remainingEntrees, setRemainingEntrees] = useState(0)
  const [maxEntrees, setMaxEntrees] = useState(0)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const categories = ['Mains', 'Appetizers', 'Drinks', 'Extras']
  const containers = [
    { name: '1 Item', price: 8.99, entrees: 1 },
    { name: '2 Item', price: 10.99, entrees: 2 },
    { name: '3 Item', price: 12.99, entrees: 3 },
  ]
  const sides = ['White Rice', 'Fried Rice', 'Chow Mein']
  const entrees = ['Orange Chicken', 'Beijing Beef', 'Broccoli Beef', 'String Bean Chicken', 'Black Pepper Angus']

  const handleCategorySelect = (category: string) => {
    if (category === 'Mains') {
      setCurrentStep('container')
    } else if (category === 'Appetizers') {
      setCurrentStep('appetizers')
    } else if (category === 'Drinks') {
      setCurrentStep('drinks')
    } else if (category === 'Extras') {
      setCurrentStep('extras')
    }
  }

  const handleContainerSelect = (container: typeof containers[0]) => {
    setCurrentItem({ name: container.name, price: container.price })
    setRemainingEntrees(container.entrees)
    setMaxEntrees(container.entrees)
    setCurrentStep('side')
  }

  const handleSideSelect = (side: string) => {
    setCurrentItem(prev => ({
      ...prev,
      details: `Side: ${side}`
    }))
    setCurrentStep('entree')
  }

  const handleEntreeSelect = (entree: string) => {
    setCurrentItem(prev => ({
      ...prev,
      details: prev.details ? `${prev.details}, Entree: ${entree}` : `Entree: ${entree}`
    }));
    setRemainingEntrees(prev => prev - 1);
    
    if (remainingEntrees <= 1) {
      addToOrder(currentItem as OrderItem);
      setCurrentItem({});
      setCurrentStep('category');
    }
  }

  const handleOtherItemSelect = (item: CategoryItems[keyof CategoryItems][0]) => {
    addToOrder({
      name: item.name,
      price: item.price
    })
    setCurrentStep('category')
  }

  const addToOrder = (item: OrderItem) => {
    setOrder(prev => {
      const newTotal = prev.total + item.price
      return {
        items: [...prev.items, item],
        total: newTotal,
        tax: newTotal * 0.1
      }
    })
  }

  const removeFromOrder = (index: number) => {
    setOrder(prev => {
      const newItems = [...prev.items]
      const removedItem = newItems.splice(index, 1)[0]
      const newTotal = prev.total - removedItem.price
      return {
        items: newItems,
        total: newTotal,
        tax: newTotal * 0.1
      }
    })
  }

  const handleCheckout = () => {
    setOrder({ items: [], total: 0, tax: 0 })
    setShowCheckoutDialog(false)
  }

  const renderNumpad = () => {
    const buttons = {
      category: categories,
      container: containers.map(c => c.name),
      side: sides,
      entree: entrees,
      appetizers: items.Appetizers.map(item => item.name),
      drinks: items.Drinks.map(item => item.name),
      extras: items.Extras.map(item => item.name)
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {buttons[currentStep].map((button, index) => (
          <Button
            key={index}
            className="h-24 text-lg"
            style={{
              backgroundColor: 'panda-orange',
              color: 'white',
            }}
            onClick={() => {
              if (currentStep === 'category') handleCategorySelect(button)
              else if (currentStep === 'container') {
                const container = containers.find(c => c.name === button)
                if (container) handleContainerSelect(container)
              }
              else if (currentStep === 'side') handleSideSelect(button)
              else if (currentStep === 'entree') handleEntreeSelect(button)
              else if (['appetizers', 'drinks', 'extras'].includes(currentStep)) {
                const item = items[currentStep.charAt(0).toUpperCase() + currentStep.slice(1)].find(i => i.name === button)
                if (item) handleOtherItemSelect(item)
              }
            }}
          >
            {button}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-dark-background text-white">
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-panda-red">
          <div className="flex items-center gap-2">
            <Image src="/imgs/panda.png?height=40&width=40" alt="Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold">Panda Express</h1>
          </div>
          <Link href="/employee-login">
            <Button variant="outline">Log out</Button>
          </Link>
        </header>

        <div className="flex-1 p-4 grid grid-cols-[1fr_300px] gap-4">
          <Card className="bg-dark-sidebar border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold">{currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    if (['appetizers', 'drinks', 'extras'].includes(currentStep)) {
                      setCurrentStep('category');
                    } else if (currentStep === 'entree') {
                      if (remainingEntrees < maxEntrees) {
                        // If we've already selected some entrees, increment the remaining entrees
                        setRemainingEntrees(prev => prev + 1);
                        // Update the currentItem by removing the last entree from the details
                        setCurrentItem(prev => ({
                          ...prev,
                          details: prev.details?.split(', Entree:').slice(0, -1).join(', Entree:')
                        }));
                      } else {
                        // If we haven't selected any entrees yet, go back to side selection
                        setCurrentStep('side');
                      }
                    } else if (currentStep === 'side') {
                      setCurrentStep('container');
                    } else if (currentStep === 'container') {
                      setCurrentStep('category');
                    }
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setCurrentItem({})
                    setCurrentStep('category')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>{renderNumpad()}</CardContent>
            {currentStep === 'entree' && (
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Remaining entrees: {remainingEntrees}
                </p>
              </CardFooter>
            )}
          </Card>

          <Card className="bg-dark-sidebar border-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-xl font-bold text-white">Order Summary</h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditDialog(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-400px)]">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2 text-white">
                    <div>
                      <div>{item.name}</div>
                      {item.details && (
                        <div className="text-sm text-gray-400">{item.details}</div>
                      )}
                    </div>
                    <div>${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="w-full flex justify-between text-white">
                <span>Subtotal:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="w-full flex justify-between text-white">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="w-full flex justify-between font-bold text-white">
                <span>Total:</span>
                <span>${(order.total + order.tax).toFixed(2)}</span>
              </div>
              <Button
                className="w-full bg-confirm-button hover:bg-button-hover"
                onClick={() => setShowCheckoutDialog(true)}
                disabled={order.items.length === 0}
              >
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full hover:bg-button-hover"
                onClick={() => setShowRefundDialog(true)}
              >
                Issue Refund
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-dialog-dark text-white border-none">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <div>{item.name}</div>
                    {item.details && <div className="text-sm text-gray-400">{item.details}</div>}
                  </div>
                  <div>${item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-600 pt-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(order.total + order.tax).toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full bg-confirm-button hover:bg-button-hover" onClick={handleCheckout}>
              Confirm Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="bg-dialog-dark text-white border-none">
          <DialogHeader>
            <DialogTitle>Issue Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>Order Number</label>
              <Input className="bg-dark-background border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <label>Customer Name</label>
              <Input className="bg-dark-background border-gray-600 text-white" />
            </div>
            <Button className="w-full bg-panda-red hover:bg-panda-red-light" onClick={() => setShowRefundDialog(false)}>
              Process Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-dialog-dark text-white border-none">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[50vh]">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-2">
                <span>{item.name} - ${item.price.toFixed(2)}</span>
                <Button variant="destructive" size="icon" onClick={() => removeFromOrder(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}