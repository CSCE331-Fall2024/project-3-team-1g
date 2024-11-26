'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCcw, UserPlus, FileText, Edit, Trash} from "lucide-react"
import Image from 'next/image'
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

// Define types for our data structures
type InventoryItem = {
  Ingredient_Inventory_ID: string;
  Stock: string;
  Units: number;
  Cost_Per_Unit: number;
}

type Employee = {
  Employee_ID: number;
  Name: string;
  Type: string;
  Hourly_Salary: number;
}

type ReportItem = {
  category: string;
  amount: number;
}

type MenuItem = {
  id: string;
  name: string;
  price: number;
  image: string;
}

type MenuItems = {
  [key: string]: MenuItem[];
}

const inventoryData: InventoryItem[] = [
  //default value that shows if there is an issue displaying or fetching data from database
  { Ingredient_Inventory_ID: '000', Stock: 'N/A', Units: 0, Cost_Per_Unit: 0 },
]

const employeeData: Employee[] = [
  { Employee_ID: 0, Name: 'N/A', Type: 'N/A', Hourly_Salary: 0.00 },
]

const reportData: { [key: string]: ReportItem[] } = {
  X: [
    { category: 'Food Sales', amount: 5000 },
    { category: 'Beverage Sales', amount: 1000 },
    { category: 'Total Sales', amount: 6000 },
    { category: 'Cash Payments', amount: 3500 },
    { category: 'Card Payments', amount: 2500 },
  ],
  Y: [
    { category: 'Opening Cash', amount: 500 },
    { category: 'Cash Sales', amount: 3500 },
    { category: 'Cash Payouts', amount: 200 },
    { category: 'Closing Cash', amount: 3800 },
  ],
  Z: [
    { category: 'Total Sales', amount: 18000 },
    { category: 'Total Tax', amount: 1440 },
    { category: 'Total Discounts', amount: 500 },
    { category: 'Net Sales', amount: 16060 },
  ],
}

const menuItems: MenuItems = {
  Sides: [
    { id: 's1', name: 'White Rice', price: 2.50, image: '/placeholder.svg?height=100&width=100' },
    { id: 's2', name: 'Fried Rice', price: 2.99, image: '/placeholder.svg?height=100&width=100' },
    { id: 's3', name: 'Chow Mein', price: 2.99, image: '/placeholder.svg?height=100&width=100' },
  ],
  Entrees: [
    { id: 'e1', name: 'Orange Chicken', price: 3.99, image: '/placeholder.svg?height=100&width=100' },
    { id: 'e2', name: 'Beijing Beef', price: 3.99, image: '/placeholder.svg?height=100&width=100' },
    { id: 'e3', name: 'Broccoli Beef', price: 3.99, image: '/placeholder.svg?height=100&width=100' },
  ],
  Appetizers: [
    { id: 'a1', name: 'Egg Roll', price: 1.95, image: '/placeholder.svg?height=100&width=100' },
    { id: 'a2', name: 'Spring Roll', price: 1.95, image: '/placeholder.svg?height=100&width=100' },
  ],
}

export default function Component() {
  //for testing locally
  const backendUrl = 'http://localhost:3001'
  //for deployment
  //const backendUrl = ''
  const [selectedSection, setSelectedSection] = useState<string>('Inventory')
  const [selectedCategory, setSelectedCategory] = useState<string>('Sides')
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [selectedReport, setSelectedReport] = useState<string>('X')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(inventoryData)
  const [employees, setEmployees] = useState<Employee[]>(employeeData)
  const [menuItemsState, setMenuItemsState] = useState<MenuItems>(menuItems)
  const [employeeName, setEmployeeName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('employeeName');
    if (name) {
      setEmployeeName(name);
    }

    //gets Ingredient_Inventory table data from database to populate table in Inventory tab
    const fetchInventory = async () => {
      if (selectedSection === 'Inventory'){
        try {
          const response = await fetch(new URL('/manager-view', backendUrl), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          //checks if HTTP request was successful, throws status code if not
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          //gets the Content-Type header from the server's response, uses that to determine format of the returned data
          const contentType = response.headers.get('content-type');

          //if the Content-Type header is missing or doesn't contain application/json, throws an error (we expect the response to be JSON format)
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid content type, expected JSON');
          }

          const data = await response.json();
          console.log(data);

          setInventoryItems(data.inventory);
        }
        catch (error) {
          if (error instanceof Error)
            console.error('Error fetching inventory:', error.message);
          else
            console.error('Unexpected error:', error);
        }
      };
    }

    //gets Employee table data from database to populate table in Employees tab
    const fetchEmployees = async () => {
      if (selectedSection === 'Employees'){
        try {
          const response = await fetch(new URL('/manager-view', backendUrl), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          //checks if HTTP request was successful, throws status code if not
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          //gets the Content-Type header from the server's response, uses that to determine format of the returned data
          const contentType = response.headers.get('content-type');

          //if the Content-Type header is missing or doesn't contain application/json, throws an error (we expect the response to be JSON format)
          if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Invalid content type, expected JSON');
          }

          const data = await response.json();
          console.log(data);

          setEmployees(data.employees);
        }
        catch (error) {
          if (error instanceof Error)
            console.error('Error fetching inventory:', error.message);
          else
            console.error('Unexpected error:', error);
        }
      };
    }

    if (selectedSection === 'Inventory')
      fetchInventory();
    else if (selectedSection === 'Employees')
      fetchEmployees();
  }, [selectedSection]);

  const handleAddInventoryItem = (newItem: Omit<InventoryItem, 'Ingredient_Inventory_ID'>) => {
    setInventoryItems([...inventoryItems, { Ingredient_Inventory_ID: `00${inventoryItems.length + 1}`, ...newItem }])
    setShowAddDialog(false)
  }

  const handleEditInventoryItem = (editedItem: InventoryItem) => {
    setInventoryItems(inventoryItems.map(item => item.Ingredient_Inventory_ID === editedItem.Ingredient_Inventory_ID ? editedItem : item))
    setShowEditDialog(false)
  }

  const handleDeleteInventoryItem = (id: string) => {
    setInventoryItems(inventoryItems.filter(item => item.Ingredient_Inventory_ID !== id))
  }

  // const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'status'>) => {
  //   setEmployees([...employees, { id: `00${employees.length + 1}`, ...newEmployee, status: 'Active' }])
  //   setShowAddDialog(false)
  // }

  // const handleEditEmployee = (editedEmployee: Employee) => {
  //   setEmployees(employees.map(emp => emp.id === editedEmployee.id ? editedEmployee : emp))
  //   setShowEditDialog(false)
  // }

  // const handleDeleteEmployee = (id: string) => {
  //   setEmployees(employees.filter(emp => emp.id !== id))
  // }

  const handleAddMenuItem = (category: string, newItem: Omit<MenuItem, 'id'>) => {
    setMenuItemsState({
      ...menuItemsState,
      [category]: [...menuItemsState[category], { id: `${category[0].toLowerCase()}${menuItemsState[category].length + 1}`, ...newItem }]
    })
    setShowAddDialog(false)
  }

  const handleEditMenuItem = (category: string, editedItem: MenuItem) => {
    setMenuItemsState({
      ...menuItemsState,
      [category]: menuItemsState[category].map(item => item.id === editedItem.id ? editedItem : item)
    })
    setShowEditDialog(false)
  }

  const handleDeleteMenuItem = (category: string, id: string) => {
    setMenuItemsState({
      ...menuItemsState,
      [category]: menuItemsState[category].filter(item => item.id !== id)
    })
  }

  const renderInventoryContent = () => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="text-lg bg-white hover:bg-current">
            <TableHead className="text-black">ID</TableHead>
            <TableHead className="text-black">Stock</TableHead>
            <TableHead className="text-black">Units</TableHead>
            <TableHead className="text-black">Cost/Unit</TableHead>
            <TableHead className="text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryItems.map((item) => (
            <TableRow key={item.Ingredient_Inventory_ID}>
              <TableCell>{item.Ingredient_Inventory_ID}</TableCell>
              <TableCell>{item.Stock}</TableCell>
              <TableCell>{item.Units}</TableCell>
              <TableCell>${item.Cost_Per_Unit ? item.Cost_Per_Unit.toFixed(2) : '0.00'}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteInventoryItem(item.Ingredient_Inventory_ID)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Table
        </Button>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#2C2C2C] text-white">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Stock Name" className="bg-[#1C1C1C] border-none" />
              <Input type="number" placeholder="Units" className="bg-[#1C1C1C] border-none" />
              <Input type="number" placeholder="Cost per Unit" className="bg-[#1C1C1C] border-none" />
              <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddInventoryItem({ Stock: 'New Item', Units: 0, Cost_Per_Unit: 0 })}>Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  const renderEmployeeContent = () => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="text-lg bg-white hover:bg-current">
            <TableHead className="text-black">ID</TableHead>
            <TableHead className="text-black">Name</TableHead>
            <TableHead className="text-black">Role</TableHead>
            <TableHead className="text-black">Status</TableHead>
            <TableHead className="text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.Employee_ID}>
              <TableCell>{employee.Employee_ID}</TableCell>
              <TableCell>{employee.Name}</TableCell>
              <TableCell>{employee.Type}</TableCell>
              <TableCell>{employee.Hourly_Salary}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" /*onClick={() => handleDeleteEmployee(employee.id)}*/>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#2C2C2C] text-white">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Name" className="bg-[#1C1C1C] border-none" />
              <Input placeholder="Role" className="bg-[#1C1C1C] border-none" />
              <Button className="w-full flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg" /*onClick={() => handleAddEmployee({ name: 'New Employee', role: 'Cashier' })}*/>Add Employee</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  const renderReportsContent = () => (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {['X', 'Y', 'Z'].map((reportType) => (
          <Button
            key={reportType}
            variant={selectedReport === reportType ? "secondary" : "ghost"}
            className={`text-white text-lg ${selectedReport === reportType ? 'bg-[#FF9636] hover:bg-[#FFA54F]' : 'hover:bg-[#E03A3C]'}`}
            onClick={() => setSelectedReport(reportType)}
          >
            {reportType} Report
          </Button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reportData[selectedReport].map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.category}</TableCell>
              <TableCell>${item.amount.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
        <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">Export Report</Button>
      </div>
    </div>
  )

  const renderMenuContent = () => (
    <div className="space-y-6">
      <div className="flex gap-2">
        {Object.keys(menuItemsState).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "secondary" : "ghost"}
            className={`text-white text-lg ${selectedCategory === category ? 'bg-[#FF9636] hover:bg-[#FFA54F]' : 'hover:bg-[#E03A3C]'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {menuItemsState[selectedCategory].map((item) => (
          <Card key={item.id} className="cursor-pointer bg-container-card border-2 border-black">
            <CardContent className="p-4 flex flex-col items-center">
              <Image src={item.image} alt={item.name} width={100} height={100} className="mb-2" />
              <h3 className="font-bold text-white">{item.name}</h3>
              <p className="text-white">${item.price.toFixed(2)}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteMenuItem(selectedCategory, item.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#2C2C2C] text-white">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Item Name" className="bg-[#1C1C1C] border-none" />
              <Input type="number" placeholder="Price" className="bg-[#1C1C1C] border-none" />
              <Input placeholder="Image URL" className="bg-[#1C1C1C] border-none" />
              <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddMenuItem(selectedCategory, { name: 'New Item', price: 0, image: '/placeholder.svg?height=100&width=100' })}>Add Item</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  return (
    // code for main panel that contains current section's contents
    <div className="flex h-screen bg-dark-background text-white">

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-panda-red p-4 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Image src="/imgs/panda.png?height=40&width=40" alt="Panda Express Logo" width={100} height={100} className="mr-2" />
          <h1 className="text-2xl font-bold">Panda Express</h1>
        </div>
        <Link href="/employee-login">
          <Button className="text-lg font-semibold">Log out</Button>
        </Link>
      </div>

      {/* Left Sidebar */}
      <div className="w-64 bg-dark-sidebar p-4 pt-20">
        <h2 className="text-xl font-bold mb-4">Hello, {employeeName}</h2>

        {/* Creates buttons for each category that will store the current state (which tab is selected) and switch to the tab on button press */}
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {['Menu', 'Inventory', 'Employees', 'Reports'].map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 text-white ${selectedSection === section ? 'bg-panda-orange hover:bg-panda-orange-light' : 'hover:bg-panda-red-light'}`}
              onClick={() => setSelectedSection(section)}
            >
              {section === 'Menu'}
              {section === 'Inventory'}
              {section === 'Employees'}
              {section === 'Reports'}
              <span className = "text-lg font-semibold">
                {section}
              </span>
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pt-20 overflow-auto">
        <h2 className="text-3xl font-bold mb-6">{selectedSection}</h2>
        {selectedSection === 'Inventory' && renderInventoryContent()}
        {selectedSection === 'Employees' && renderEmployeeContent()}
        {selectedSection === 'Reports' && renderReportsContent()}
        {selectedSection === 'Menu' && renderMenuContent()}
      </div>
    </div>
  )
}