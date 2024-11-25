'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Edit, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type MenuItem = {
  Menu_Item_ID: number;
  Menu_Item_Name: string;
  Menu_Item_Price: number;
  Category: string;
  Active_Inventory: number;
};

type Item = {
  name: string;
  menu_item_id: number;
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

type OrderState = {
  items: Item[];
  total: number;
  tax: number;
}

type CategoryItems = {
  [key: string]: MenuItem[];
}

const PRICES = {
  Bowl: 8.99,
  Plate: 10.99,
  'Bigger Plate': 12.99,
};

export default function CashierView() {
  const backendUrl = 'http://localhost:3001'
  const [currentStep, setCurrentStep] = useState<'category' | 'container' | 'sides' | 'entrees' | 'appetizers' | 'drinks' | 'extras'>('category')
  const [order, setOrder] = useState<OrderState>({ items: [], total: 0, tax: 0 })
  const [currentItem, setCurrentItem] = useState<Partial<Item>>({})
  const [remainingEntrees, setRemainingEntrees] = useState(0)
  const [maxEntrees, setMaxEntrees] = useState(0)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [showRefundDialog, setShowRefundDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [menuItems, setMenuItems] = useState<CategoryItems>({})

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${backendUrl}/get-menu-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch menu items')
      }
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
    }
  }

  const categories = ['Mains', 'Appetizers', 'Drinks', 'Extras']
  const containers = [
    { name: 'Bowl', entrees: 1 },
    { name: 'Plate', entrees: 2 },
    { name: 'Bigger Plate', entrees: 3 },
  ]

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
    setCurrentItem({ 
      name: container.name, 
      price: 3,
      container_type: container.name,
      sides: [],
      entrees: [],
      appetizers: null,
      drinks: null,
      extras: null,
      details: null,
      quantity: 1
    })
    setRemainingEntrees(container.entrees)
    setMaxEntrees(container.entrees)
    setCurrentStep('sides')
  }

  const handleSideSelect = (side: MenuItem) => {
    setCurrentItem(prev => ({
      ...prev,
      sides: [side.Menu_Item_Name],
      details: `Side: ${side.Menu_Item_Name} (ID: ${side.Menu_Item_ID})`
    }))
    setCurrentStep('entrees')
  }

  const handleEntreeSelect = (entree: MenuItem) => {
    setCurrentItem(prev => ({
      ...prev,
      entrees: [...(prev.entrees || []), entree.Menu_Item_Name],
      details: prev.details 
        ? `${prev.details}, Entree: ${entree.Menu_Item_Name} (ID: ${entree.Menu_Item_ID})` 
        : `Entree: ${entree.Menu_Item_Name} (ID: ${entree.Menu_Item_ID})`
    }));
    setRemainingEntrees(prev => prev - 1);
    
    if (remainingEntrees <= 1) {
      addToOrder({...currentItem, entrees: [...(currentItem.entrees || []), entree.Menu_Item_Name]} as Item);
      setCurrentItem({});
      setCurrentStep('category');
    }
  }

  const handleOtherItemSelect = (item: MenuItem) => {
    const newItem: Item = {
      name: item.Menu_Item_Name,
      menu_item_id: item.Menu_Item_ID,
      price: item.Menu_Item_Price,
      image: '/placeholder.svg?height=100&width=100',
      quantity: 1,
      container_type: null,
      sides: null,
      entrees: null,
      appetizers: item.Category === 'Appetizers' ? [item.Menu_Item_Name] : null,
      drinks: item.Category === 'Drinks' ? [item.Menu_Item_Name] : null,
      extras: item.Category === 'Extras' ? [item.Menu_Item_Name] : null,
      details: `${item.Menu_Item_Name} (ID: ${item.Menu_Item_ID})`,
    }
    addToOrder(newItem)
    setCurrentStep('category')
  }

  const addToOrder = (item: Item) => {
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

  const handleCheckout = async() => {
    const orderData = {
      items: order.items.map(item => ({
        name: item.name,
        menu_item_id: item.menu_item_id,
        container_type: item.container_type,
        sides: item.sides,
        entrees: item.entrees,
        appetizers: item.appetizers,
        drinks: item.drinks,
        extras: item.extras,
        price: item.price,
        quantity: item.quantity
      })),
      total: order.total,
      tax: order.tax
    };

    try {
      const response = await fetch(new URL('/cashier-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      const data = await response.json();
      alert('Order placed successfully');
      setOrder({ items: [], total: 0, tax: 0 });
      setShowCheckoutDialog(false);
    } catch (err) {
      console.error('Error during checkout:', err);
      alert('Error placing order. Please try again.');
    }
  }

  const renderNumpad = () => {
    const buttons = {
      category: categories,
      container: containers.map(c => c.name),
      sides: menuItems['Sides'] || [],
      entrees: menuItems['Entrees'] || [],
      appetizers: menuItems['Appetizers'] || [],
      drinks: menuItems['Drinks'] || [],
      extras: menuItems['Extras'] || [],
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
              if (currentStep === 'category') handleCategorySelect(button as string)
              else if (currentStep === 'container') {
                const container = containers.find(c => c.name === button)
                if (container) handleContainerSelect(container)
              }
              else if (currentStep === 'sides') handleSideSelect(button as MenuItem)
              else if (currentStep === 'entrees') handleEntreeSelect(button as MenuItem)
              else if (['appetizers', 'drinks', 'extras'].includes(currentStep)) {
                handleOtherItemSelect(button as MenuItem)
              }
            }}
          >
            {typeof button === 'string' ? button : `${button.Menu_Item_Name} (ID: ${button.Menu_Item_ID})`}
          </Button>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex h-screen bg-dark-background text-white">
        <div className="flex-1 flex flex-col">
          <header className="flex justify-between items-center p-4 bg-panda-red">
            <div className="flex items-center gap-2">
              <Image src="/imgs/panda.png?height=40&width=40" alt="Panda Express Logo" width={40} height={40} />
              <h1 className="text-2xl font-bold">Panda Express</h1>
            </div>
            <Link href="/employee-login">
              <Button variant="outline"><h1 style={{color: "black"}}>Log out</h1></Button>
            </Link>
          </header>

          <div className="flex-1 p-4 grid grid-cols-[1fr_300px] gap-4">
            <Card className="bg-dark-sidebar border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-xl font-bold text-white">{currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (['appetizers', 'drinks', 'extras'].includes(currentStep)) {
                        setCurrentStep('category');
                      } else if (currentStep === 'entrees') {
                        if (remainingEntrees < maxEntrees) {
                          setRemainingEntrees(prev => prev + 1);
                          setCurrentItem(prev => ({
                            ...prev,
                            entrees: prev.entrees?.slice(0, -1) || [],
                            details: prev.details?.split(', Entree:').slice(0, -1).join(', Entree:')
                          }));
                        } else {
                          setCurrentStep('sides');
                        }
                      } else if (currentStep === 'sides') {
                        setCurrentStep('container');
                      } else if (currentStep === 'container') {
                        setCurrentStep('category');
                      }
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Go back</span>
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
                    <span className="sr-only">Clear selection</span>
                  </Button>
                </div>
              </CardHeader>

              <CardContent>{renderNumpad()}</CardContent>
              {currentStep === 'entrees' && (
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
                  <span className="sr-only">Edit order</span>
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
                      <div>${2}</div>
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
              <label htmlFor="order-number">Order Number</label>
              <Input id="order-number" className="bg-dark-background border-gray-600 text-white" />
            </div>
            <div className="space-y-2">
              <label htmlFor="customer-name">Customer Name</label>
              <Input id="customer-name" className="bg-dark-background border-gray-600 text-white" />
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
                  <span className="sr-only">Remove item</span>
                </Button>
              </div>
            ))}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  )
}

