'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import React from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, X, AlertCircle, Check } from 'lucide-react'
import { AnimatePresence, motion } from "framer-motion"
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type MenuItem = {
  Menu_Item_ID: string;
  Category: string;
  Active_Inventory: number;
  Serving_Size: number;
  Units: string;
  contains_allergens: string[];
  doesnt_contain: string[];
};

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
  contains_allergens: string[];
  doesnt_contain: string[];
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
  price: number;
  contains_allergens: string[];
  doesnt_contain: string[];
};

type CategoryItems = {
  [key: string]: MenuItem[];
};

type AllergyIconsProps = {
  containsAllergens: string[];
  doesntContain: string[];
};

const allergenIcons = {
  wheat: '/allergen-icons/wheat.png',
  lactose: '/allergen-icons/lactose.png',
  peanuts: '/allergen-icons/peanuts.png',
  'tree nuts': '/allergen-icons/tree_nuts.png',
  shellfish: '/allergen-icons/shellfish.png',
  soy: '/allergen-icons/soy.png',
  eggs: '/allergen-icons/eggs.png',
  fish: '/allergen-icons/fish.png',
  sesame: '/allergen-icons/sesame.png',
  vegetarian: '/allergen-icons/vegetarian.png',
  vegan: '/allergen-icons/vegan.png',
}

const containers: Container[] = [
  { name: 'Bowl', sides: 1, entrees: 1, image: '/imgs/bowlsvg.png?height=100&width=100', price: 8, contains_allergens: [], doesnt_contain: [] },
  { name: 'Plate', sides: 1, entrees: 2, image: '/imgs/platesvg.png?height=100&width=100', price: 10, contains_allergens: [], doesnt_contain: [] },
  { name: 'Bigger Plate', sides: 1, entrees: 3, image: '/imgs/biggerplatesvg.png?height=100&width=100', price: 12, contains_allergens: [], doesnt_contain: [] },
];

function AllergyIcons({ containsAllergens, doesntContain }: AllergyIconsProps) {
  return (
    <div className="flex space-x-1">
      {containsAllergens.map((allergen) => (
        <TooltipProvider key={allergen}>
          <Tooltip>
            <TooltipTrigger>
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image 
                  src={allergenIcons[allergen as keyof typeof allergenIcons] || '/allergen-icons/placeholder.png'} 
                  alt={allergen} 
                  width={24} 
                  height={24}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This item contains {allergen}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
      {doesntContain.map((item) => (
        <TooltipProvider key={item}>
          <Tooltip>
            <TooltipTrigger>
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <Image 
                  src={allergenIcons[item as keyof typeof allergenIcons] || '/allergen-icons/placeholder.png'} 
                  alt={item} 
                  width={24} 
                  height={24}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>This item is {item}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

interface TranslateProps {
  children: ReactNode
  isSpanish: boolean
  translateText: (text: string, targetLanguage: string) => Promise<string>
  translatedCache: Record<string, string>
}

function Translate({ children, isSpanish, translateText, translatedCache }: TranslateProps) {
  const [translated, setTranslated] = useState<ReactNode>(children)

  useEffect(() => {
    const translate = async () => {
      if (isSpanish && typeof children === 'string') {
        const translatedText = await translateText(children, 'es')
        setTranslated(translatedText)
      } else if (isSpanish && React.isValidElement(children)) {
        const translatedChildren = await Promise.all(
          React.Children.map(children.props.children, async (child) => {
            if (typeof child === 'string') {
              return await translateText(child, 'es')
            }
            return child
          })
        )
        setTranslated(React.cloneElement(children, {}, ...translatedChildren))
      } else {
        setTranslated(children)
      }
    } 

    translate()
  }, [children, isSpanish, translateText])

  return <>{translated}</>
}

export default function Component() {
  const backendUrl = 'https://backend-project-3-team-1g-production.up.railway.app';
  const categories = ['Mains', 'Appetizers', 'Drinks', 'Extras']
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
  const [menuItems, setMenuItems] = useState<CategoryItems>({})

  const [isSpanish, setIsSpanish] = useState(false);
  const TRANSLATE_API_KEY = 'AIzaSyAzT9821UMgFfHS6UYGqEj0OZxOAzJN6RA';
  const [translatedCache, setTranslatedCache] = useState<Record<string, string>>({});
  

  const translateText = async (text: string, targetLanguage: string) => {
    const cachedTranslation = translatedCache[text];
    if (cachedTranslation) {
      return cachedTranslation; // Use cached translation if available
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`;
    try {
      const response = await fetch(url, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLanguage }),
      });
      const data = await response.json();
      const translated = data.data.translations[0].translatedText;

      //cache translation for reuse
      setTranslatedCache((prev) => ({ ...prev, [text]: translated }));
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const toggleLanguage = () => {
    setIsSpanish(!isSpanish);
  };


  useEffect(() => {
    const name = localStorage.getItem('customerName');
    if (name) {
      setCustomerName(name);
    }

    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${backendUrl}/get-menu-items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          console.log("Failed Fetch");
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        //ensures all items have the required allergen arrays
        const processedData = Object.fromEntries(
          Object.entries(data).map(([category, items]) => [
            category,
            (items as MenuItem[]).map(ensureAllergenArrays)
          ])
        );
        setMenuItems(processedData);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };

    fetchMenuItems();
  }, []);

  const ensureAllergenArrays = (item: MenuItem): MenuItem => {
    return {
      ...item,
      contains_allergens: item.contains_allergens || [],
      doesnt_contain: item.doesnt_contain || ["vegetarian", "vegan"],
    };
  };

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
    if (!isSpanish)
      setNotification("Item added to cart!")
    else
      setNotification("¡Artículo agregado al carrito!")
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
      const selectedSideItem = menuItems['Sides']?.find(side => side.Menu_Item_ID === selectedSides[0]);
      const selectedEntreeItems = selectedEntrees.map(entree => menuItems['Entrees']?.find(item => item.Menu_Item_ID === entree));
      
      const containsAllergens = [...new Set([
        ...(selectedContainerObj.contains_allergens || []),
        ...(selectedSideItem?.contains_allergens || []),
        ...selectedEntreeItems.flatMap(item => item?.contains_allergens || [])
      ])];
      
      const doesntContain = [...new Set([
        ...(selectedContainerObj.doesnt_contain || []),
        ...(selectedSideItem?.doesnt_contain || []),
        ...selectedEntreeItems.flatMap(item => item?.doesnt_contain || [])
      ])];

      const mainItem: Item = {
        name: `${selectedContainer} Meal`,
        container_type: selectedContainer,
        sides: selectedSides,
        entrees: selectedEntrees,
        appetizers: null,
        drinks: null,
        extras: null,
        details: `Side: ${selectedSides[0]}, Entrees: ${selectedEntrees.join(', ')}`,
        price: selectedContainerObj.price,
        quantity: 1,
        image: selectedContainerObj.image,
        contains_allergens: containsAllergens,
        doesnt_contain: doesntContain
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
        const menuItem = menuItems[selectedCategory]?.find(i => i.Menu_Item_ID === itemName)
        if (menuItem) {
          let price = 0;
          if (selectedCategory === 'Appetizers') price = 3;
          else if (selectedCategory === 'Drinks') price = 2;
          else if (selectedCategory === 'Extras') price = 0;

          return {
            name: itemName,
            container_type: null,
            sides: null,
            entrees: null,
            appetizers: selectedCategory === 'Appetizers' ? [itemName] : null,
            drinks: selectedCategory === 'Drinks' ? [itemName] : null,
            extras: selectedCategory === 'Extras' ? [itemName] : null,
            details: null,
            price,
            quantity,
            image: `/imgs/${itemName.toLowerCase().replace(' ', '')}.png?height=100&width=100`,
            contains_allergens: menuItem.contains_allergens || [],
            doesnt_contain: menuItem.doesnt_contain || []
          }
        }
        return null
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

  return (
    <div className="flex h-screen bg-dark-background text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-panda-red p-4 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Image src="/imgs/panda.png?height=40&width=40" alt="Panda Express Logo" width={40} height={40} className="mr-2" />
          <h1 className="text-2xl font-bold">Panda Express</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={toggleLanguage}>
            <span className="text-lg font-bold">
              {isSpanish ? "English" : "Español"}
            </span>
          </Button>
          <Link href="employee-login">
            <Button>
              <span className="text-lg text-white font-bold">
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  Log out
                </Translate>
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Left Sidebar */}
      <div className="w-64 bg-dark-sidebar p-4 pt-20">
        <h2 className="text-xl font-bold mb-4">
          {isSpanish ? `Hola, ${customerName}` : `Hello, ${customerName}`}
        </h2>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 text-white ${selectedCategory === category ? 'bg-panda-orange text-black hover:bg-panda-orange-light' : 'hover:bg-panda-red-light'}`}
              onClick={() => setSelectedCategory(category)}
            >
              <span className="text-lg font-bold">
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  {category}
                </Translate>
              </span>
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Ordering Section  */}
      <div className="flex-1 p-4 pt-20 overflow-auto">
        <h2 className="text-3xl font-bold mb-4">
          <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
            {selectedCategory}
          </Translate>
        </h2>
        {selectedCategory === 'Mains' ? (
          <div className="space-y-8">
            {/* Container Selection Section */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  Select Container
                </Translate>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {containers.map(container => (
                  <Card 
                    key={container.name} 
                    className={`cursor-pointer bg-container-card border-2 border-black ${selectedContainer === container.name ? 'ring-2 ring-panda-gold' : ''}`}
                    onClick={() => setSelectedContainer(container.name)}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Image src={container.image} alt={container.name} width={100} height={100} className="mb-2" />
                      <h3 className="text-lg font-bold text-white">
                        <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                          {container.name}
                        </Translate>
                      </h3>
                      <p className="text-white">${container.price.toFixed(2)}</p>
                      <div className="mt-2">
                        <AllergyIcons containsAllergens={container.contains_allergens} doesntContain={container.doesnt_contain} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Side Selection Section */}
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              <h3 className="text-xl font-semibold mb-4">
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  Select Side (1)
                </Translate>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {menuItems['Sides']?.map(side => (
                  <Card 
                    key={side.Menu_Item_ID} 
                    className={`cursor-pointer bg-container-card border-2 border-black ${selectedSides.includes(side.Menu_Item_ID) ? 'ring-2 ring-panda-gold' : ''}`}
                    onClick={() => setSelectedSides([side.Menu_Item_ID])}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Image src={`/imgs/${side.Menu_Item_ID.toLowerCase().replaceAll(' ', '')}.png?height=100&width=100`} alt={side.Menu_Item_ID} width={100} height={100} className="mb-2" />
                      <h3 className="text-lg font-bold text-white">
                        <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                          {side.Menu_Item_ID}
                        </Translate>
                      </h3>
                      <div className="mt-2">
                        <AllergyIcons containsAllergens={side.contains_allergens || []} doesntContain={side.doesnt_contain || []} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Entree Selection Section */}
            <div className={selectedContainer ? '' : 'opacity-50 pointer-events-none'}>
              <h3 className="text-xl font-semibold mb-4">
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                          Select Entrees </Translate>({containers.find(c => c.name === selectedContainer)?.entrees || 0})</h3>
              <div className="grid grid-cols-3 gap-4">
                {menuItems['Entrees']?.map(entree => (
                  <Card 
                    key={entree.Menu_Item_ID} 
                    className={`cursor-pointer bg-container-card border-2 border-black ${selectedEntrees.includes(entree.Menu_Item_ID) ? 'ring-2 ring-panda-gold' : ''}`}
                    onClick={() => {
                      const maxEntrees = containers.find(c => c.name === selectedContainer)?.entrees || 0
                      setSelectedEntrees(prev => 
                        prev.includes(entree.Menu_Item_ID) 
                          ? prev.filter(e => e !== entree.Menu_Item_ID)
                          : prev.length < maxEntrees ? [...prev, entree.Menu_Item_ID] : prev
                      )
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center">
                      <Image src={`/imgs/${entree.Menu_Item_ID.toLowerCase().replaceAll(' ', '')}.png?height=100&width=100`} alt={entree.Menu_Item_ID} width={100} height={100} className="mb-2" />
                      <h3 className="text-lg font-bold text-white"><Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                          {entree.Menu_Item_ID}
                        </Translate></h3>
                      <div className="mt-2">
                        <AllergyIcons containsAllergens={entree.contains_allergens || []} doesntContain={entree.doesnt_contain || []} />
                      </div>
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
                className="bg-panda-orange text-black hover:bg-panda-orange-light text-lg font-bold"
              >
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Add to Order </Translate>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Appetizers/Drinks/Extras Tabs */}
            <div className="grid grid-cols-3 gap-4">
              {menuItems[selectedCategory]?.map((item: MenuItem) => (
                <Card key={item.Menu_Item_ID} className="flex flex-col justify-between bg-container-card border-2 border-black">
                  <CardContent className="p-4 flex flex-col items-center">
                    <Image src={`/imgs/${item.Menu_Item_ID.toLowerCase().replaceAll(' ', '')}.png?height=100&width=100`} alt={item.Menu_Item_ID} width={100} height={100} className="mb-2" />
                    <h3 className="font-bold text-white">
                      <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                        {item.Menu_Item_ID}
                      </Translate>  
                    </h3>
                    <p className="text-white">
                      ${selectedCategory === 'Appetizers' ? '3.00' : selectedCategory === 'Drinks' ? '2.00' : '0.00'}
                    </p>
                    <div className="mt-2">
                      <AllergyIcons containsAllergens={item.contains_allergens || []} doesntContain={item.doesnt_contain || []} />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.Menu_Item_ID, -1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="mx-2 text-white">{quantities[item.Menu_Item_ID] || 0}</span>
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.Menu_Item_ID, 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={addItemsToCart} className="bg-panda-orange hover:bg-panda-orange-light text-black font-bold text-lg">
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  Add To Order
                </Translate>
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-64 bg-dark-sidebar p-4 pt-20 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
              Cart
            </Translate>
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  Edit
                </Translate>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dialog-dark text-white">
              <DialogHeader>
                <DialogTitle>
                  <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                    Edit Cart
                  </Translate>
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[50vh]">
                {cart.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center mb-2">
                    <span>
                      <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                        {item.name}
                      </Translate> 
                      (x{item.quantity})
                    </span>
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
              <span>
                <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                  {item.name}
                </Translate> (x{item.quantity})
              </span>
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                {item.details && <p className="text-sm text-gray-300">{item.details}</p>}
              </Translate> 
              <span className="float-right">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </ScrollArea>
        <div>
          <div className="flex justify-between mb-2">
            <span>
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Subtotal:
              </Translate>
            </span>
            <span>${cart.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Tax:
              </Translate>
            </span>
            <span>${cart.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold mb-4">
            <span>
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Total:
              </Translate>
            </span>
            <span>${(cart.total + cart.tax).toFixed(2)}</span>
          </div>
          <Button 
            className="w-full mb-2 bg-panda-orange hover:bg-panda-orange-light text-black font-bold text-lg" 
            onClick={() => setShowCheckoutDialog(true)}
          >
            <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
              Checkout
            </Translate>
          </Button>
        </div>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="bg-container-card text-white border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Checkout
              </Translate>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <h3 className="text-xl underline">
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Summary
              </Translate>
            </h3>
            {cart.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <div>
                  <div className="font-bold">
                    <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                      {item.name}
                    </Translate>
                  </div>
                  <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                    {item.details && <div className="text-sm">{item.details}</div>}
                  </Translate>
                </div>
                <div>${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span>
                  <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                    Sub Total
                  </Translate>
                </span>
                <span>${cart.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                    Tax
                  </Translate>
                </span>
                <span>${cart.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span> 
                  <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                    Total
                  </Translate>
                </span>
                <span>${(cart.total + cart.tax).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              className="flex-1 bg-confirm-button hover:bg-button-hover"
              onClick={handleCheckout}
            >
              <Translate isSpanish={isSpanish} translateText={translateText} translatedCache={translatedCache}>
                Confirm
              </Translate>
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

