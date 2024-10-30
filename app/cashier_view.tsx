'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export default function Component() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [cart, setCart] = useState({ items: [], total: 0, tax: 0 })
  const [selectedContainer, setSelectedContainer] = useState(null)
  const [selectedSides, setSelectedSides] = useState([])
  const [selectedEntrees, setSelectedEntrees] = useState([])

  const categories = ['Mains', 'Appetizers', 'Drinks', 'Extras']
  const containers = [
    { name: 'Bowl', sides: 1, entrees: 1 },
    { name: 'Plate', sides: 1, entrees: 2 },
    { name: 'Bigger Plate', sides: 1, entrees: 3 },
  ]
  const sides = ['Side 1', 'Side 2', 'Side 3', 'Side 4']
  const entrees = ['Entree 1', 'Entree 2', 'Entree 3', 'Entree 4', 'Entree 5']
  const items = {
    Appetizers: [
      { name: 'Appetizer 1', price: 5.99 },
      { name: 'Appetizer 2', price: 6.99 },
      { name: 'Appetizer 3', price: 7.99 },
    ],
    Drinks: [
      { name: 'Drink 1', price: 2.99 },
      { name: 'Drink 2', price: 3.99 },
      { name: 'Drink 3', price: 4.99 },
    ],
    Extras: [
      { name: 'Extra 1', price: 1.99 },
      { name: 'Extra 2', price: 2.99 },
      { name: 'Extra 3', price: 3.99 },
    ],
  }

  const addToCart = (item) => {
    setCart(prevCart => {
      const newTotal = prevCart.total + item.price
      return {
        items: [...prevCart.items, item],
        total: newTotal,
        tax: newTotal * 0.1
      }
    })
  }

  const addMainsToCart = () => {
    if (selectedContainer && selectedSides.length === 1 && selectedEntrees.length === containers.find(c => c.name === selectedContainer).entrees) {
      const mainItem = {
        name: `${selectedContainer} Meal`,
        details: `Side: ${selectedSides[0]}, Entrees: ${selectedEntrees.join(', ')}`,
        price: 10.99 // You can adjust the pricing logic as needed
      }
      addToCart(mainItem)
      setSelectedContainer(null)
      setSelectedSides([])
      setSelectedEntrees([])
    }
  }

  const handleSideSelect = (side) => {
    setSelectedSides(prev => prev.includes(side) ? [] : [side])
  }

  const handleEntreeSelect = (entree) => {
    setSelectedEntrees(prev => {
      const maxEntrees = containers.find(c => c.name === selectedContainer)?.entrees || 0
      if (prev.includes(entree)) {
        return prev.filter(e => e !== entree)
      } else if (prev.length < maxEntrees) {
        return [...prev, entree]
      }
      return prev
    })
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">{selectedCategory || 'Select a category'}</h2>
        {selectedCategory === 'Mains' ? (
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Select Container</h3>
              <RadioGroup value={selectedContainer} onValueChange={setSelectedContainer}>
                {containers.map(container => (
                  <div key={container.name} className="flex items-center space-x-2">
                    <RadioGroupItem value={container.name} id={container.name} />
                    <Label htmlFor={container.name}>{container.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              <h3 className="text-xl font-semibold mb-4">Select Side (1)</h3>
              {sides.map(side => (
                <div key={side} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={side}
                    checked={selectedSides.includes(side)}
                    onCheckedChange={() => handleSideSelect(side)}
                    disabled={!selectedContainer}
                  />
                  <label htmlFor={side}>{side}</label>
                </div>
              ))}
            </div>
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              <h3 className="text-xl font-semibold mb-4">Select Entrees ({containers.find(c => c.name === selectedContainer)?.entrees || 0})</h3>
              {entrees.map(entree => (
                <div key={entree} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={entree}
                    checked={selectedEntrees.includes(entree)}
                    onCheckedChange={() => handleEntreeSelect(entree)}
                    disabled={!selectedContainer}
                  />
                  <label htmlFor={entree}>{entree}</label>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={addMainsToCart} disabled={!selectedContainer || selectedSides.length !== 1 || selectedEntrees.length !== containers.find(c => c.name === selectedContainer)?.entrees}>
                Add to Cart
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {selectedCategory && items[selectedCategory]?.map((item, index) => (
              <div key={index} className="border rounded p-4">
                <h3 className="font-bold">{item.name}</h3>
                <p>${item.price.toFixed(2)}</p>
                <Button onClick={() => addToCart(item)} className="mt-2">Add to cart</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-64 bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        <ScrollArea className="h-[calc(100vh-16rem)]">
          {cart.items.map((item, index) => (
            <div key={index} className="mb-2">
              <span>{item.name}</span>
              {item.details && <p className="text-sm text-gray-600">{item.details}</p>}
              <span className="float-right">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </ScrollArea>
        <div className="mt-4">
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
          <Button className="w-full">Checkout</Button>
          <Button variant="secondary" className="w-full">Issue refund</Button>
        </div>
      </div>
    </div>
  )
}