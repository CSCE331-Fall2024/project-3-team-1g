'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import Image from 'next/image'
import { Input } from "@/components/ui/input"

type Item = {
  name: string;
  details?: string;
  sides?: string[];
  entrees?: string[];
  price: number;
  quantity: number;
  image: string;
};

type Cart = {
  items: Item[];
  total: number;
  tax: number;
};

type Container = {
  name: string;
  sides: number;
  entrees: number;
  image: string;
};

type CategoryItems = {
  [key: string]: Item[];
};

const containers: Container[] = [
  { name: 'Bowl', sides: 1, entrees: 1, image: '/imgs/1black.png?height=100&width=100' },
  { name: 'Plate', sides: 1, entrees: 2, image: '/imgs/2black.png?height=100&width=100' },
  { name: 'Bigger Plate', sides: 1, entrees: 3, image: '/imgs/3black.png?height=100&width=100' },
];

const sides = [
  { name: 'White Rice', image: '/imgs/whiterice.png?height=100&width=100' },
  { name: 'Fried Rice', image: '/imgs/friedrice.png?height=100&width=100' },
  { name: 'Chow Mein', image: '/imgs/chowmein.png?height=100&width=100' },
];

const entrees = [
  { name: 'Orange Chicken', image: '/imgs/orangechicken.png?height=100&width=100' },
  { name: 'Beijing Beef', image: '/imgs/beijingbeef.png?height=100&width=100' },
  { name: 'Broccoli Beef', image: '/imgs/broccolibeef.png?height=100&width=100' },
  { name: 'String Bean Chicken Breast', image: '/imgs/stringbeanchicken.png?height=100&width=100' },
  { name: 'Black Pepper Angus Steak', image: '/imgs/beef.png?height=100&width=100' },
];

const items: CategoryItems = {
  Appetizers: [
    { name: 'Chicken Egg Roll', price: 1.95, image: '/imgs/eggrolls.png?height=100&width=100', quantity: 1 },
    { name: 'Veggie Spring Roll', price: 1.95, image: '/imgs/springrolls.jpg?height=100&width=100', quantity: 1 },
  ],
  Drinks: [
    { name: 'Fountain Drink', price: 2.45, image: '/imgs/drinks.png?height=100&width=100', quantity: 1 },
    { name: 'Bottled Water', price: 2.15, image: '/imgs/waterbottle.png?height=100&width=100', quantity: 1 },
  ],
  Extras: [
    { name: 'Fortune Cookies', price: 0.95, image: '/imgs/fortunecookies.jpg?height=100&width=100', quantity: 1 },
    { name: 'Soy Sauce', price: 0.25, image: '/imgs/soysauce.png?height=100&width=100', quantity: 1 },
  ]
};

export default function Component() {
  const [selectedCategory, setSelectedCategory] = useState('Mains')
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, tax: 0 })
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null)
  const [selectedSides, setSelectedSides] = useState<string[]>([])
  const [selectedEntrees, setSelectedEntrees] = useState<string[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [notification, setNotification] = useState<string | null>(null)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [employeeName, setEmployeeName] = useState('');
  const categories = ['Mains', 'Appetizers', 'Drinks', 'Extras']

  const addToCart = (newItems: Item | Item[]) => {
    setCart(prevCart => {
      const itemsToAdd = Array.isArray(newItems) ? newItems : [newItems]
      const newTotal = prevCart.total + itemsToAdd.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return {
        items: [...prevCart.items, ...itemsToAdd],
        total: newTotal,
        tax: newTotal * 0.1
      }
    })
    setNotification("Item added to cart!")
    setTimeout(() => setNotification(null), 2000)
  }

  const removeFromCart = (index: number) => {
    setCart(prevCart => {
      const newItems = [...prevCart.items]
      const removedItem = newItems.splice(index, 1)[0]
      const newTotal = prevCart.total - (removedItem?.price ?? 0) * (removedItem?.quantity ?? 1)
      return {
        items: newItems,
        total: newTotal,
        tax: newTotal * 0.1
      }
    })
  }

  const addMainsToCart = () => {
    const selectedContainerObj = containers.find(c => c.name === selectedContainer);
    if (selectedContainer && selectedContainerObj && selectedSides.length === 1 && selectedEntrees.length === selectedContainerObj.entrees) {
      const mainItem: Item = {
        name: `${selectedContainer} Meal`,
        details: `Side: ${selectedSides[0]}, Entrees: ${selectedEntrees.join(', ')}`,
        sides: selectedSides,
        entrees: selectedEntrees,
        price: 10.99,
        quantity: 1,
        image: selectedContainerObj.image
      }
      addToCart(mainItem)
      setSelectedContainer(null)
      setSelectedSides([])
      setSelectedEntrees([])
    }
  }

  const handleQuantityChange = (itemName: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [itemName]: Math.max((prev[itemName] || 0) + change, 0)
    }))
  }

  const addItemsToCart = () => {
    const itemsToAdd = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([itemName, quantity]): Item | null => {
        const item = items[selectedCategory]?.find(i => i.name === itemName)
        return item ? { ...item, quantity } : null
      })
      .filter((item): item is Item => item !== null)
    
    if (itemsToAdd.length > 0) {
      addToCart(itemsToAdd)
      setQuantities({})
    }
  }

  const handleCheckout = (paymentType: string) => {
    // Clear cart
    setCart({ items: [], total: 0, tax: 0 })
    setShowCheckoutDialog(false)
    // TODO: Add SQL query here
  }

  useEffect(() => {
    if (selectedCategory !== 'Mains') {
      setQuantities({})
    }
  }, [selectedCategory])

  useEffect(() => {
    const name = localStorage.getItem('employeeName');
    if (name) {
      setEmployeeName(name);
    }
  }, []);

  return (
    <div className="flex h-screen bg-dark-background text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right=0 bg-panda-red p-4 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Image src="/imgs/panda.png?height=40&width=40" alt="Panda Express Logo" width={40} height={40} className="mr-2" />
          <h1 className="text-2xl font-bold">Panda Express</h1>
        </div>
        <Link href="employee-login">
          <Button>Log out</Button>
        </Link>
      </div>

      {/* Left Sidebar */}
      <div className="w-64 bg-dark-sidebar p-4 pt-20">
        <h2 className="text-xl font-bold mb-4">Hello, {employeeName}</h2>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 text-white ${selectedCategory === category ? 'bg-panda-orange hover:bg-panda-orange-light' : 'hover:bg-panda-red-light'}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pt-20 overflow-auto">
        <h2 className="text-3xl font-bold mb-4">{selectedCategory}</h2>
        {selectedCategory === 'Mains' ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Container</h3>
              <div className="grid grid-cols-3 gap-4">
                {containers.map(container => (
                  <Card 
                    key={container.name} 
                    className={`cursor-pointer bg-container-card border-2 border-black ${selectedContainer === container.name ? 'ring-2 ring-panda-gold' : ''}`}
                    onClick={() => setSelectedContainer(container.name)}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Image src={container.image} alt={container.name} width={100} height={100} className="mb-2" />
                      <h3 className="text-lg font-semibold text-white">{container.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              <h3 className="text-xl font-semibold mb-4">Select Side (1)</h3>
              <div className="grid grid-cols-3 gap-4">
                {sides.map(side => (
                  <Card 
                    key={side.name} 
                    className={`cursor-pointer bg-container-card border-2 border-black ${selectedSides.includes(side.name) ? 'ring-2 ring-panda-gold' : ''}`}
                    onClick={() => setSelectedSides([side.name])}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Image src={side.image} alt={side.name} width={100} height={100} className="mb-2" />
                      <h4 className="font-semibold text-white">{side.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              <h3 className="text-xl font-semibold mb-4">Select Entrees ({containers.find(c => c.name === selectedContainer)?.entrees || 0})</h3>
              <div className="grid grid-cols-3 gap-4">
                {entrees.map(entree => (
                  <Card 
                    key={entree.name} 
                    className={`cursor-pointer bg-container-card border-2 border-black ${selectedEntrees.includes(entree.name) ? 'ring-2 ring-panda-gold' : ''}`}
                    onClick={() => {
                      const maxEntrees = containers.find(c => c.name === selectedContainer)?.entrees || 0
                      setSelectedEntrees(prev => 
                        prev.includes(entree.name) 
                          ? prev.filter(e => e !== entree.name)
                          : prev.length < maxEntrees ? [...prev, entree.name] : prev
                      )
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Image src={entree.image} alt={entree.name} width={100} height={100} className="mb-2" />
                      <h4 className="font-semibold text-white">{entree.name}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={addMainsToCart} 
                disabled={!selectedContainer || selectedSides.length !== 1 || selectedEntrees.length !== containers.find(c => c.name === selectedContainer)?.entrees}
                className="bg-panda-orange hover:bg-panda-orange-light text-white"
              >
                Add to order
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              {selectedCategory && items[selectedCategory]?.map((item: Item) => (
                <Card key={item.name} className="flex flex-col justify-between bg-container-card border-2 border-black">
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image src={item.image} alt={item.name} width={100} height={100} className="mb-2" />
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <p className="text-white">${item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.name, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2 text-white">{quantities[item.name] || 0}</span>
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.name, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={addItemsToCart} className="bg-panda-orange hover:bg-panda-orange-light text-white">Add to order</Button>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-64 bg-dark-sidebar p-4 pt-20 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="bg-dialog-dark text-white">
              <DialogHeader>
                <DialogTitle>Edit Cart</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[50vh]">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>{item.name} (x{item.quantity})</span>
                    <Button variant="destructive" size="icon" onClick={() => removeFromCart(index)}>
                      <X className="h-4  w-4" />
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-grow mb-4">
          {cart.items.map((item, index) => (
            <div key={index} className="mb-2">
              <span>{item.name} (x{item.quantity})</span>
              {item.details && <p className="text-sm text-gray-300">{item.details}</p>}
              <span className="float-right">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </ScrollArea>
        <div>
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax:</span>
            <span>${cart.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mb-4">
            <span>Total:</span>
            <span>${(cart.total + cart.tax).toFixed(2)}</span>
          </div>
          <Button 
            className="w-full mb-2 bg-panda-orange hover:bg-panda-orange-light text-white" 
            onClick={() => setShowCheckoutDialog(true)}
          >
            Checkout
          </Button>
          <Button 
            variant="secondary" 
            className="w-full" 
            onClick={() => setShowRefundDialog(true)}
          >
            Issue refund
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-container-card text-white border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl">Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="text-xl underline">Summary</h3>
            {cart.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <div className="font-bold">{item.name}</div>
                  {item.details && <div className="text-sm">{item.details}</div>}
                </div>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span>Sub Total</span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(cart.total + cart.tax).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              className="flex-1 bg-confirm-button hover:bg-button-hover"
              onClick={() => handleCheckout('Confirm')}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent className="bg-container-card text-white border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl">Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Order #</label>
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="bg-dialog-dark border-none"
              />
            </div>
            <Button 
              className="w-full bg-dialog-dark hover:bg-button-hover"
              onClick={() => {}}
            >
              ENTER
            </Button>
            <div className="space-y-2">
              <label>Customer:</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-dialog-dark border-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              className="w-full bg-dialog-dark hover:bg-button-hover"
              onClick={() => {
                setShowRefundDialog(false)
                // TODO: Add SQL query here
              }}
            >
              Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-md shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}