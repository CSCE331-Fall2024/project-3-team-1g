'use client'

import { useState } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCcw, UserPlus, FileText, Edit, Trash} from "lucide-react"
import Image from 'next/image'
import { Input } from "@/components/ui/input"

// Define types for our data structures
type InventoryItem = {
  id: string;
  stock: string;
  units: number;
  costPerUnit: number;
}

type Employee = {
  id: string;
  name: string;
  role: string;
  status: string;
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

// Sample data - replace with actual data from your database
const inventoryData: InventoryItem[] = [
  { id: '001', stock: 'Orange Chicken Sauce', units: 50, costPerUnit: 2.99 },
  { id: '002', stock: 'White Rice', units: 100, costPerUnit: 1.50 },
  { id: '003', stock: 'Fortune Cookies', units: 1000, costPerUnit: 0.10 },
]

const employeeData: Employee[] = [
  { id: '001', name: 'John Doe', role: 'Cashier', status: 'Active' },
  { id: '002', name: 'Jane Smith', role: 'Cook', status: 'Active' },
  { id: '003', name: 'Bob Wilson', role: 'Manager', status: 'Active' },
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
  const [selectedSection, setSelectedSection] = useState<string>('Inventory')
  const [selectedCategory, setSelectedCategory] = useState<string>('Sides')
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [selectedReport, setSelectedReport] = useState<string>('X')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(inventoryData)
  const [employees, setEmployees] = useState<Employee[]>(employeeData)
  const [menuItemsState, setMenuItemsState] = useState<MenuItems>(menuItems)

  const handleAddInventoryItem = (newItem: Omit<InventoryItem, 'id'>) => {
    setInventoryItems([...inventoryItems, { id: `00${inventoryItems.length + 1}`, ...newItem }])
    setShowAddDialog(false)
  }

  const handleEditInventoryItem = (editedItem: InventoryItem) => {
    setInventoryItems(inventoryItems.map(item => item.id === editedItem.id ? editedItem : item))
    setShowEditDialog(false)
  }

  const handleDeleteInventoryItem = (id: string) => {
    setInventoryItems(inventoryItems.filter(item => item.id !== id))
  }

  const handleAddEmployee = (newEmployee: Omit<Employee, 'id' | 'status'>) => {
    setEmployees([...employees, { id: `00${employees.length + 1}`, ...newEmployee, status: 'Active' }])
    setShowAddDialog(false)
  }

  const handleEditEmployee = (editedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === editedEmployee.id ? editedEmployee : emp))
    setShowEditDialog(false)
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

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
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Cost/Unit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventoryItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.stock}</TableCell>
              <TableCell>{item.units}</TableCell>
              <TableCell>${item.costPerUnit.toFixed(2)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteInventoryItem(item.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button className="flex-1 bg-panda-red hover:bg-[#b52528]">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Table
        </Button>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-panda-red hover:bg-[#b52528]">
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
              <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddInventoryItem({ stock: 'New Item', units: 0, costPerUnit: 0 })}>Add Item</Button>
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
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.id}</TableCell>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.role}</TableCell>
              <TableCell>{employee.status}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteEmployee(employee.id)}>
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
            <Button className="flex-1 bg-panda-red hover:bg-[#b52528]">
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
              <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddEmployee({ name: 'New Employee', role: 'Cashier' })}>Add Employee</Button>
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
            className={`text-white ${selectedReport === reportType ? 'bg-[#FF9636] hover:bg-[#FFA54F]' : 'hover:bg-[#E03A3C]'}`}
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
        <Button className="flex-1 bg-panda-red hover:bg-[#b52528]">
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
        <Button className="flex-1 bg-panda-red hover:bg-[#b52528]">Export Report</Button>
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
            className={`text-white ${selectedCategory === category ? 'bg-[#FF9636] hover:bg-[#FFA54F]' : 'hover:bg-[#E03A3C]'}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {menuItemsState[selectedCategory].map((item) => (
          <Card key={item.id} className="bg-panda-red border-2 border-black">
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
            <Button className="flex-1 bg-panda-red hover:bg-[#b52528]">
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
    <div className="flex h-screen bg-[#2C2C2C] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-panda-red p-4 flex justify-between items-center z-10">
        <div className="flex items-center">
          <Image src="/imgs/panda.png?height=40&width=40" alt="Panda Express Logo" width={40} height={40} className="mr-2" />
          <h1 className="text-2xl font-bold">Panda Express</h1>
        </div>
        <Link href="/employee-login">
          <Button>Log out</Button>
        </Link>
      </div>

      {/* Left Sidebar */}
      <div className="w-64 bg-panda-red p-4 pt-20">
        <h2 className="text-xl font-bold mb-4">Hello, Manager</h2>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          {['Menu', 'Inventory', 'Employees', 'Reports'].map((section) => (
            <Button
              key={section}
              variant={selectedSection === section ? "secondary" : "ghost"}
              className={`w-full justify-start mb-2 text-white ${selectedSection === section ? 'bg-[#FF9636] hover:bg-[#FFA54F]' : 'hover:bg-[#E03A3C]'}`}
              onClick={() => setSelectedSection(section)}
            >
              {section === 'Menu'}
              {section === 'Inventory'}
              {section === 'Employees'}
              {section === 'Reports'}
              {section}
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