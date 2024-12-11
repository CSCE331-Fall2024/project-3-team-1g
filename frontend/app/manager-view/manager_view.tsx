'use client'

import { useState, useEffect } from 'react'
import React from 'react'
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
import { strict } from 'assert'
import { report } from 'process'
// import dayjs from 'dayjs'
// import utc from 'dayjs/plugin/utc'
// import timezone from 'dayjs/plugin/timezone'
import { format, toZonedTime } from 'date-fns-tz'

// Define types for our data structures
type InventoryItem = {
  Ingredient_Inventory_ID: string;
  Stock: number;
  Units: string;
  Cost_Per_Unit: number;
}

type Employee = {
  Employee_ID: number;
  Name: string;
  Type: string;
  Hourly_Salary: number;
}

type MenuItem = {
  Menu_Item_ID: string;
  Category: string;
  Active_Inventory: number; 
  Serving_Size: number;
  Units: string;
  Image: string;
}

const inventoryData: InventoryItem[] = [
  //default value that shows if there is an issue displaying or fetching data from database
  { Ingredient_Inventory_ID: 'N/A', Stock: 0, Units: 'N/A', Cost_Per_Unit: 0 },
]

const employeeData: Employee[] = [
  { Employee_ID: 0, Name: 'N/A', Type: 'N/A', Hourly_Salary: 0.00 },
]

type XReportItem = {
  hour_of_day: number;
  order_count: number;
  total_sales_revenue: number;
};

type YReportItem = {
  week_number: number;
  order_count: number;
};

type ZReportItem = {
  hour_of_day: number;
  order_count: number;
  total_sales_revenue: number;
};

type ReportData = {
  X: XReportItem[];
  Y: YReportItem[];
  Z: ZReportItem[];
};

const reportData: ReportData = {
  X: [
    { hour_of_day: 0, order_count: 0, total_sales_revenue: 0 },
  ],
  Y: [
    { week_number: 0, order_count: 0},
  ],
  Z: [
    { hour_of_day: 0, order_count: 0, total_sales_revenue: 0 }
  ],
};

const menuItemData: MenuItem[] = [
  { Menu_Item_ID: 'sidex', Category: 'Sides', Active_Inventory: 0, Serving_Size: 0, Units: 'x', Image:''},
  { Menu_Item_ID: 'entreex', Category: 'Entrees', Active_Inventory: 0, Serving_Size: 0, Units: 'x', Image:''},
  { Menu_Item_ID: 'appx', Category: 'Appetizers', Active_Inventory: 0, Serving_Size: 0, Units: 'x', Image:''},
  { Menu_Item_ID: 'extrax', Category: 'Extras', Active_Inventory: 0, Serving_Size: 0, Units: 'x', Image:''},
  { Menu_Item_ID: 'drinkx', Category: 'Drinks', Active_Inventory: 0, Serving_Size: 0, Units: 'x', Image:''},
]

const images: Record<string, string> = {
  "Chow Mein": '/imgs/chowmein.png',
  "Fried Rice": "/imgs/friedrice.png",
  "White Rice": "/imgs/whiterice.png",
  "Super Greens": "/imgs/supergreens.png",
  "Grilled Chicken": "/imgs/grilledchicken.png",
  "Spring Rolls": "/imgs/springrolls.jpg",
  "Egg Rolls": "/imgs/eggrolls.png",
  "Chicken Potstickers": "/imgs/chickenpotstickers.png",
  "Bowl": "/imgs/1black.png",
  "Plate": "/imgs/2black.png",
  "Bigger Plate": "/imgs/3black.png",
  "Appetizer Container": "/imgs/eggrolls.png",
  "Drink": "/imgs/drinks.png",
  "Cream Cheese Rangoon": "/imgs/crabrangoon.png",
  "Orange Chicken": "/imgs/orangechicken.png",
  "Beijing Beef": "/imgs/beijingbeef.png",
  "Broccoli Beef": "/imgs/broccolibeef.png",
  "String Bean Chicken Breast": "/imgs/stringbeanchicken.png",
  "Bottled Water": "/imgs/waterbottle.png",
  "Fountain Drink": "/imgs/drinks.png",
  "Fortune Cookies": "/imgs/fortunecookies.jpg",
  "Soy Sauce": "/imgs/soysauce.png",
};

const reportColumns = {
  X: ['Hour Of Day', 'Order Count', 'Total Sales Revenue'],
  Y: ['Week Number', 'Order Count'], 
  Z: ['Hour Of Day', 'Order Count', 'Total Sales Revenue'],
};

export default function Component() {
  //for testing locally
  const backendUrl = 'https://backend-project-3-team-1g-production.up.railway.app'
  //for deployment
  //const backendUrl = ''
  const [selectedSection, setSelectedSection] = useState<string>('Inventory')
  const [selectedCategory, setSelectedCategory] = useState<string>('Sides')
 
  const [selectedReport, setSelectedReport] = useState<'X' | 'Y' | 'Z'>('X');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(inventoryData)
  const [employees, setEmployees] = useState<Employee[]>(employeeData)
  // const [menuItemsState, setMenuItemsState] = useState<MenuItems>(menuItems)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(menuItemData)
  const [employeeName, setEmployeeName] = useState('')

  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<InventoryItem | null>(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);
  const [selectedEmployeeForDelete, setSelectedEmployeeForDelete] = useState<Employee | null>(null);
  const [selectedMenuForEdit, setSelectedMenuForEdit] = useState<MenuItem | null>(null);

  const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  //react states for Inventory Item
  const [id, setId] = React.useState('');
  const [stock, setStock] = React.useState(0);
  const [units, setUnits] = React.useState('');
  const [cpu, setCpu] = React.useState(0);

  //react states for Employee
  const [empID, setEmpID] = React.useState(0);
  const [empName, setEmpName] = React.useState('');
  const [empType, setEmpType] = React.useState('');
  const [empSal, setEmpSal] = React.useState(0);

  //react states for Menu Item
  const [menID, setMenID] = React.useState('');
  const [menCategory, setMenCategory] = React.useState('');
  const [menInventory, setMenInventory] = React.useState(0);
  const [menServSize, setMenServSize] = React.useState(0);
  const [menUnits, setMenUnits] = React.useState('');

  //react states for Reports
  const [reportData, setReportData] = useState({
    X: [],
    Y: [],
    Z: [],
  });

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
        // console.log(data);

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
        // console.log(data);

        setEmployees(data.employees);
      }
      catch (error) {
        if (error instanceof Error)
          console.error('Error fetching employees:', error.message);
        else
          console.error('Unexpected error:', error);
      }
    };
  }

  const fetchMenu = async () => {
    if (selectedSection === 'Menu'){
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
        // console.log(data);

        setMenuItems(data.menu);

        const menuWithImages = assignImagesToMenuItems(data.menu);
        setMenuItems(menuWithImages);
      }
      catch (error) {
        if (error instanceof Error)
          console.error('Error fetching menu:', error.message);
        else
          console.error('Unexpected error:', error);
      }
    };
  }

  const assignImagesToMenuItems = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems.map((item) => ({
      ...item,
      Image: `/imgs/${item.Menu_Item_ID.toLowerCase().replaceAll(' ', '')}.png?height=100&width=100` || '/imgs/pandaseasonal.png',
    }));
  };

  const fetchXReportData = async () => {
    if (selectedReport === 'X'){
      try {
        const today = new Date();
        const timeZone = 'America/Chicago';
        const zonedDate = toZonedTime(today, timeZone);

        const currDate = format(zonedDate, 'yyyy-MM-dd', { timeZone });
        const currTime = today.getHours();
        // console.log(currDate);
        // console.log(currTime);

        const response = await fetch(new URL('/manager-view', backendUrl), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType: 'X',
            date: currDate,
            time: currTime,
          }),
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

          
        setReportData(prevState => ({
          ...prevState,
          X: data.xReport,
        }));
        console.log(reportData.X);

        alert('XReport fetched successfully!');
      }

      catch (error) {
        if (error instanceof Error)
          console.error('Error fetching XReport:', error.message);
        else
          console.error('Unexpected error:', error);
      }
    }
  };

  const fetchYReportData = async () => {
    try {
        const response = await fetch(new URL('/manager-view', backendUrl), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reportType: 'Y',
          }),
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
        // console.log(data);
          
        setReportData(prevState => ({
          ...prevState,
          Y: data.yReport,
        }));
        console.log(data.yReport);

        alert('YReport fetched successfully!');
      }

      catch (error) {
        if (error instanceof Error)
          console.error('Error fetching YReport:', error.message);
        else
          console.error('Unexpected error:', error);
      }
    
  };

  const fetchZReportData = async () => {
    try {
      const today = new Date();
      const timeZone = 'America/Chicago';
      const zonedDate = toZonedTime(today, timeZone);

      const currDate = format(zonedDate, 'yyyy-MM-dd', { timeZone });
      const currTime = today.getHours();
      // console.log(currDate);
      // console.log(currTime);

      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: 'Z',
          date: currDate,
          time: currTime,
        }),
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

        
      setReportData(prevState => ({
        ...prevState,
        Z: data.zReport,
      }));
      console.log(reportData.Z);

      alert('ZReport fetched successfully!');
    }

    catch (error) {
      if (error instanceof Error)
        console.error('Error fetching ZReport:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  };

  const clearTotals = async () => {
    setReportData((prevData) => ({
      ...prevData, 
      X: [],
  }))};

  useEffect(() => {
    const name = localStorage.getItem('employeeName');
    if (name) {
      setEmployeeName(name);
    }

    if (selectedSection === 'Inventory')
      fetchInventory();
    else if (selectedSection === 'Employees')
      fetchEmployees();
    else if (selectedSection === 'Menu')
      fetchMenu();
  }, [selectedSection]);

  const handleAddInventoryItem = async (id: string, stock: number, units: string, cpu: number) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          id,
          stock,
          units,
          cpu,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add inventory item');
      }

      const data = await response.json();
      console.log(data.message);
      alert('Inventory item added successfully!');
      setShowAddDialog(false);
    }

    catch (error) {
      if (error instanceof Error)
        console.error('Error adding item:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  };

  const handleEditInventoryItem = async (id: string, stock: number, units: string, cpu: number) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'edit',
          id,
          stock,
          units,
          cpu,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit inventory item');
      }

      const data = await response.json();
      console.log(data.message);
      alert('Inventory item edited successfully!');
      setShowAddDialog(false);
    }
    
    catch (error) {
      if (error instanceof Error)
        console.error('Error editing item:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete', 
          id,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete inventory item');
      }
    
      const data = await response.json();
      console.log(data.message);
      alert('Inventory item deleted successfully!');
    }

    catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting item:', error.message);
      }
      else {
        console.error('Unexpected error:', error);
      }
    }
  }

  const handleAddEmployee = async (id: number, stock: string, units: string, cpu: number) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addEmp',
          id, //didn't change these values because it's easier and i'm lazy; just have to remember
          stock,
          units,
          cpu,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add employee');
      }

      const data = await response.json();
      console.log(data.message);
      alert('Employee added successfully!');
      setShowAddDialog(false);
    }

    catch (error) {
      if (error instanceof Error)
        console.error('Error adding employee:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  }

  const handleEditEmployee = async (id: number, stock: string, units: string, cpu: number) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'editEmp',
          id,
          stock,
          units,
          cpu,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit employee');
      }

      const data = await response.json();
      console.log(data.message);
      alert('Employee edited successfully!');
      setShowAddDialog(false);
    }
    
    catch (error) {
      if (error instanceof Error)
        console.error('Error editing item:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteEmp', 
          id,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete employee');
      }
    
      const data = await response.json();
      console.log(data.message);
      alert('Employee deleted successfully!');
    }

    catch (error) {
      if (error instanceof Error) {
        console.error('Error deleting employee:', error.message);
      }
      else {
        console.error('Unexpected error:', error);
      }
    }
  }

  const handleAddMenuItem = async (item_id: string, category: string, inventory: number, servsize: number, item_units: string) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addMen',
          item_id,
          category,
          inventory,
          servsize,
          item_units,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }

      const data = await response.json();
      console.log(data.message);
      alert('Menu item added successfully!');
      setShowAddDialog(false);
    }

    catch (error) {
      if (error instanceof Error)
        console.error('Error adding menu item:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  }

  const handleEditMenuItem = async (item_id: string, category: string, inventory: number, servsize: number, item_units: string) => {
    try {
      const response = await fetch(new URL('/manager-view', backendUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'editMen',
          item_id,
          category,
          inventory,
          servsize,
          item_units,
        }),
      });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit menu item');
      }

      const data = await response.json();
      console.log(data.message);
      alert('Menu item edited successfully!');
      setShowAddDialog(false);
    }

    catch (error) {
      if (error instanceof Error)
        console.error('Error editing menu item:', error.message);
      else
        console.error('Unexpected error:', error);
    }
  }

  // const handleDeleteMenuItem = (category: string, id: string) => {
  //   setMenuItemsState({
  //     ...menuItemsState,
  //     [category]: menuItemsState[category].filter(item => item.id !== id)
  //   })
  // }

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
                {/* Edit Button with Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedItemForEdit(item);
                      setShowEditDialog(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  {selectedItemForEdit && (
                  <DialogContent className="bg-[#2C2C2C] text-white">
                    <DialogHeader>
                      <DialogTitle>Edit {selectedItemForEdit.Ingredient_Inventory_ID}</DialogTitle>
                    </DialogHeader>
                    <div className = "space-y-4">
                      <Input type="number" placeholder="Stock" className="bg-[#1C1C1C] border-none" onChange={(e) => setStock(Number(e.target.value))}/>
                      <Input type="string" placeholder="Units"className="bg-[#1C1C1C] border-none" onChange={(e) => setUnits(e.target.value)}/>
                      <Input type="number" placeholder="Cost_Per_Unit" className="bg-[#1C1C1C] border-none" onChange={(e) => setCpu(Number(e.target.value))}/>
                      <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleEditInventoryItem(selectedItemForEdit.Ingredient_Inventory_ID, stock, units, cpu)}>Edit Item</Button>
                    </div>
                  </DialogContent>
                  )}
                </Dialog>
                {/* Delete Button with Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedItemForDelete(item); // Set the item to be deleted
                        setShowDeleteDialog(true);
                      }}
                        >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  {selectedItemForDelete && (
                    <DialogContent className="bg-[#2C2C2C] text-white">
                      <DialogHeader>
                        <DialogTitle>
                          Are you sure you want to delete{" "}
                          {selectedItemForDelete.Ingredient_Inventory_ID}?
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Button
                          className="w-full bg-gray-600 hover:bg-gray-500"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="w-full bg-panda-red hover:bg-[#b52528]"
                          onClick={() => {
                            handleDeleteInventoryItem(
                              selectedItemForDelete.Ingredient_Inventory_ID
                            );
                            setShowDeleteDialog(false);
                          }}
                        >
                          Confirm Delete
                        </Button>
                    </div>
                  </DialogContent>
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg" onClick={() => fetchInventory()}>
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
              <Input type="string" placeholder="Inventory_Ingredient_ID" className="bg-[#1C1C1C] border-none" onChange={(e) => setId(e.target.value)}/>
              <Input type="number" placeholder="Stock" className="bg-[#1C1C1C] border-none" onChange={(e) => setStock(Number(e.target.value))}/>
              <Input type="string" placeholder="Units"className="bg-[#1C1C1C] border-none" onChange={(e) => setUnits(e.target.value)}/>
              <Input type="number" placeholder="Cost_Per_Unit" className="bg-[#1C1C1C] border-none" onChange={(e) => setCpu(Number(e.target.value))}/>
              <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddInventoryItem(id, stock, units, cpu)}>Add Item</Button>
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
            <TableHead className="text-black">Type</TableHead>
            <TableHead className="text-black">Status</TableHead>
            <TableHead className="text-black">Hourly Salary</TableHead>
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
                {/* Edit Button with Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedEmployeeForEdit(employee);
                      setShowEditDialog(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  {selectedEmployeeForEdit && (
                  <DialogContent className="bg-[#2C2C2C] text-white">
                    <DialogHeader>
                      <DialogTitle>Edit {selectedEmployeeForEdit.Employee_ID}</DialogTitle>
                    </DialogHeader>
                    <div className = "space-y-4">
                      <Input type="string" placeholder="Name" className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpName(e.target.value)}/>
                      <Input type="string" placeholder="Type"className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpType(e.target.value)}/>
                      <Input type="number" placeholder="Hourly_Salary" className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpSal(Number(e.target.value))}/>
                      <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleEditEmployee(selectedEmployeeForEdit.Employee_ID, empName, empType, empSal)}>Edit Employee</Button>
                    </div>
                  </DialogContent>
                  )}
                  {/* Delete Button with Confirmation Dialog */}
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedEmployeeForDelete(employee); // Set the item to be deleted
                          setShowDeleteDialog(true);
                        }}
                          >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {selectedEmployeeForDelete && (
                      <DialogContent className="bg-[#2C2C2C] text-white">
                        <DialogHeader>
                          <DialogTitle>
                            Are you sure you want to delete{" "}
                            {selectedEmployeeForDelete.Employee_ID}?
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Button
                            className="w-full bg-gray-600 hover:bg-gray-500"
                            onClick={() => setShowDeleteDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="w-full bg-panda-red hover:bg-[#b52528]"
                            onClick={() => {
                              handleDeleteEmployee(selectedEmployeeForDelete.Employee_ID);
                              setShowDeleteDialog(false);
                            }}
                          >
                            Confirm Delete
                          </Button>
                      </div>
                    </DialogContent>
                    )}
                  </Dialog>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex gap-2">
        <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg" onClick={() => fetchEmployees()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh Table
        </Button>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#2C2C2C] text-white">
            <DialogHeader>
              <DialogTitle>Add Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input type="number" placeholder="Employee_ID" className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpID(Number(e.target.value))}/>
              <Input type="string" placeholder="Name" className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpName(e.target.value)}/>
              <Input type="string" placeholder="Type"className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpType(e.target.value)}/>
              <Input type="number" placeholder="Hourly_Salary" className="bg-[#1C1C1C] border-none" onChange={(e) => setEmpSal(Number(e.target.value))}/>
              <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddEmployee(empID, empName, empType, empSal)}>Add Employee</Button>
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
            onClick={() =>  { 
              setSelectedReport(reportType as 'X' | 'Y' | 'Z');
              // console.log(reportType);
              // console.log(selectedReport);
            }}
          > 
          
            {reportType} Report
          </Button>
        ))}
      </div>

      {reportData[selectedReport] && reportData[selectedReport].length > 0 ? (
      <Table>
        <TableHeader>
          <TableRow className="text-lg bg-white hover:bg-current">
            {reportColumns[selectedReport].map((header, index) => (
              <TableHead className="text-black" key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
        {reportData[selectedReport].map((item, index) => {
          if (selectedReport === 'X') {
            const xItem = item as XReportItem
            //console.log(xItem.hour_of_day);
            return (
              <TableRow key={index}>
                <TableCell>{xItem.hour_of_day}</TableCell>
                <TableCell>{xItem.order_count}</TableCell>
                <TableCell>{xItem.total_sales_revenue}</TableCell>
              </TableRow>
            );
          }
          else if (selectedReport === 'Z'){
            const zItem = item as ZReportItem
            return (
              <TableRow key={index}>
                <TableCell>{zItem.hour_of_day}</TableCell>
                <TableCell>{zItem.order_count}</TableCell>
                <TableCell>{zItem.total_sales_revenue}</TableCell>
              </TableRow>
            );
          } 
          else {
            const yItem = item as YReportItem
            return (
              <TableRow key={index}>
                <TableCell>{yItem.week_number}</TableCell>
                <TableCell>{yItem.order_count}</TableCell>
              </TableRow>
            );
          }
        })}
      </TableBody>
      </Table>
      ) : (
        // default message if there is no data to show (ex. no orders made today)
        <p>No data available</p>
      )}
      <div className="flex gap-2">
        <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg" onClick={() => {
          console.log(`Generate Report clicked for: ${selectedReport}`);
          if (selectedReport === 'X') {     //hard coding each bc retesting a function to take a value will take too long
            fetchXReportData();
          }
          else if (selectedReport === 'Y'){
            fetchYReportData();
          }
          else if (selectedReport === 'Z'){
            fetchZReportData();
            clearTotals();
          }
        }}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>
    </div>
  );

  const renderMenuContent = () => {
    const categories = Array.from(new Set(menuItemData.map((item) => item.Category)));
  
    return (
      <div className="space-y-6">
        {/* Category tabs based on Category values in Menu_Item database */}
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "secondary" : "ghost"}
              className={`text-white text-lg ${
                selectedCategory === category
                  ? 'bg-[#FF9636] hover:bg-[#FFA54F]'
                  : 'hover:bg-[#E03A3C]'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
  
        {/* Render item cards for each category */}
        <div className="grid grid-cols-3 gap-4">
          {/* Filters by category */}
          {menuItems
            .filter((item) => item.Category === selectedCategory)
            .map((item) => (
              <Card key={item.Menu_Item_ID} className="cursor-pointer bg-container-card border-2 border-black">
                <CardContent className="p-4 flex flex-col items-center">
                  <Image
                    src={item.Image}
                    alt={item.Menu_Item_ID}
                    width={100}
                    height={100}
                    className="mb-2"
                  />
                  <h3 className="font-bold text-white">{item.Menu_Item_ID}</h3>
                  <div className="flex gap-2 mt-2">
                    {/* Edit Button with Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedMenuForEdit(item);
                      setShowEditDialog(true);
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  {selectedMenuForEdit && (
                  <DialogContent className="bg-[#2C2C2C] text-white">
                    <DialogHeader>
                      <DialogTitle>Edit {selectedMenuForEdit.Menu_Item_ID}</DialogTitle>
                    </DialogHeader>
                    <div className = "space-y-4">
                      <Input type="string" placeholder="Category" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenCategory(e.target.value)}/>
                      <Input type="number" placeholder="Active_Inventory"className="bg-[#1C1C1C] border-none" onChange={(e) => setMenInventory(Number(e.target.value))}/>
                      <Input type="number" placeholder="Serving_Size" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenServSize(Number(e.target.value))}/>
                      <Input type="string" placeholder="Units" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenUnits(e.target.value)}/>
                      <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleEditMenuItem(selectedMenuForEdit.Menu_Item_ID, menCategory, menInventory, menServSize, menUnits)}>Edit Item</Button>
                    </div>
                  </DialogContent>
                  )}
                </Dialog>
                    {/* <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
                      <Edit className="h-4 w-4" />
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
  
        {/* Refresh table and add item button */}
        <div className="flex gap-2">
          <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg" onClick={() => fetchMenu()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Table
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex-1 bg-panda-orange hover:bg-panda-red-light hover:text-black text-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#2C2C2C] text-white">
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input type="string" placeholder="Menu_Item_ID" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenID(e.target.value)}/>
                <Input type="string" placeholder="Category" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenCategory(e.target.value)}/>
                <Input type="number" placeholder="Active_Inventory"className="bg-[#1C1C1C] border-none" onChange={(e) => setMenInventory(Number(e.target.value))}/>
                <Input type="number" placeholder="Serving_Size" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenServSize(Number(e.target.value))}/>
                <Input type="string" placeholder="Units" className="bg-[#1C1C1C] border-none" onChange={(e) => setMenUnits(e.target.value)}/>
                <Button className="w-full bg-panda-red hover:bg-[#b52528]" onClick={() => handleAddMenuItem(menID, menCategory, menInventory, menServSize, menUnits)}>Add Menu Item</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

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
