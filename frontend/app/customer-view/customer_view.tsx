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
  container_type: string | null;
  sides: string[] | null;
  entrees: string[] | null;
  appetizers: string[] | null;
  drinks: string[] | null;
  extras: string[] | null;
  details: string | null;
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
    { name: 'Egg Rolls', price: 1.95, image: '/imgs/eggrolls.png?height=100&width=100', quantity: 1,container_type: null,sides: null,entrees: null,appetizers: ['Egg Rolls'],drinks: null,extras: null,details: null},
    { name: 'Spring Rolls', price: 1.95, image: '/imgs/springrolls.jpg?height=100&width=100', quantity: 1,container_type: null,sides: null,entrees: null,appetizers: ['Spring Rolls'],drinks: null,extras: null,details: null
    },
  ],
  Drinks: [
    { name: 'Fountain Drink', price: 2.45, image: '/imgs/drinks.png?height=100&width=100', quantity: 1,container_type: null,sides: null,entrees: null,appetizers: null,drinks: ['Fountain Drink'],extras: null,details: null
    },
    { name: 'Bottled Water', price: 2.15, image: '/imgs/waterbottle.png?height=100&width=100', quantity: 1,container_type: null,sides: null,entrees: null,appetizers: null,drinks: ['Bottled Water'],extras: null,details: null
    },
  ],
  Extras: [
    { name: 'Fortune Cookies', price: 0.95, image: '/imgs/fortunecookies.jpg?height=100&width=100', quantity: 1,container_type: null,sides: null,entrees: null,appetizers: null,drinks: null,extras: ['Fortune Cookies'],details: null
    },
    { name: 'Soy Sauce', price: 0.25, image: '/imgs/soysauce.png?height=100&width=100', quantity: 1,container_type: null,sides: null,entrees: null,appetizers: null,drinks: null,extras: ['Soy Sauce'],details: null
    },
  ],
};

export default function Component() {
  const backendUrl = 'http://localhost:3001'
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

  useEffect(() => {
    // Retrieve the user's name from local storage
    const name = localStorage.getItem('customerName');
    if (name) {
      setCustomerName(name);
    }
  }, []);

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
        container_type: selectedContainer,
        sides: selectedSides,
        entrees: selectedEntrees,
        appetizers: null,
        drinks: null,
        extras: null,
        details: `Side: ${selectedSides[0]}, Entrees: ${selectedEntrees.join(', ')}`,
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

  const handleCheckout = async () => {
    const orderData = {
      items: cart.items.map(item => ({
        name: item.name,
        container_type: item.container_type,
        sides: item.sides,
        entrees: item.entrees,
        appetizers: item.appetizers,
        drinks: item.drinks,
        extras: item.extras,
        price: item.price,
        quantity: item.quantity
      })),
      total: cart.total,
      tax: cart.tax
    };

    try {
      const response = await fetch(new URL('/customer-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      alert('Order placed successfully');
      setCart({ items: [], total: 0, tax: 0 });
      setShowCheckoutDialog(false);
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Error placing order. Please try again.');
    }
  };

  useEffect(() => {
    if (selectedCategory !== 'Mains') {
      setQuantities({})
    }
  }, [selectedCategory])

  return (
    <div className="flex h-screen bg-dark-background text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-panda-red p-4 flex justify-between items-center z-10">
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
        <h2 className="text-xl font-bold mb-4">Hello, {customerName}</h2>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          {/* Creates buttons for each category that will store the current state (which tab is selected) and switch to the tab on button press */}
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 text-white ${selectedCategory === category ? 'bg-panda-orange hover:bg-panda-orange-light' : 'hover:bg-panda-red-light'}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span className = "text-lg font-semibold">
                {category}
              </span>
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Ordering Section  */}
      <div className="flex-1 p-4 pt-20 overflow-auto">
        <h2 className="text-3xl font-bold mb-4">{selectedCategory}</h2>
        {/* Mains Tab */}
        {selectedCategory === 'Mains' ? (
          <div className="space-y-8">
            {/* Container Selection Section */}
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
            {/* Side Selection Section */}
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              {/* Opacity low and sides not selectable unless container picked */}
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
                      <h3 className="text-lg font-semibold text-white">{side.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {/* Entree Selection Section */}
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
                      <h3 className="text-lg font-semibold text-white">{entree.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            {/* Add To Order Button */}
            <div className="flex justify-end">
              <Button 
                onClick={addMainsToCart} 
                disabled={!selectedContainer || selectedSides.length !== 1 || selectedEntrees.length !== containers.find(c => c.name === selectedContainer)?.entrees}
                className="bg-panda-orange hover:bg-panda-orange-light text-white text-lg"
              >
                Add To Order
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Appetizers/Drinks/Extras Tabs */}
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
              <Button onClick={addItemsToCart} className="bg-panda-orange hover:bg-panda-orange-light text-white">Add To Order</Button>
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
              onClick={handleCheckout}
            >
              Confirm
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
