const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const app = express();
app.use(bodyParser.json());
app.use(cors()); //cord for connecting front and back


//db
const client = new Client({
  user: 'team_1g',
  host: 'csce-315-db.engr.tamu.edu',
  database: 'team_1g_db',
  password: 'woobat',
  port: 5432,
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL server'))
  .catch(err => console.error('Connection error', err.stack));

app.post('/customer-login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1;', [login]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const user = result.rows[0];
    if (user.type !== 'customer') {
      return res.status(400).json({ error: 'Invalid..log in on the right page' });
    }

    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const message = 'Customer login successful';
    res.json({ message, name: user.name }); 
  } catch (err) {
    console.error('login error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/cashier-login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1;', [login]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const user = result.rows[0];
    if (user.type !== 'cashier') {
      return res.status(400).json({ error: 'Invalid..log in on the right page' });
    }

    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const message = 'Cashier login successful';
    res.json({ message, name: user.name }); 
  } catch (err) {
    console.error('login error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/manager-login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await client.query('SELECT * FROM users WHERE login = $1;', [login]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const user = result.rows[0];
    if (user.type !== 'manager') {
      return res.status(400).json({ error: 'Invalid..log in on the right page' });
    }

    const isMatch = password === user.password;

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid login or password' });
    }

    const message = 'Manager login successful';
    res.json({ message, name: user.name }); 
  } catch (err) {
    console.error('login error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/manager-view', async (req, res) => {
  try {
    //QUERY FOR FETCHING INGREDIENT_INVENTORY TABLE
    const inventoryRows = await client.query('SELECT * FROM "Ingredient_Inventory"');
    
    const { action, id, stock, units, cpu } = req.body;
    // console.log('Received data:', req.body); //debugging

    //METHOD FOR ADDING NEW ITEMS TO INVENTORY
    if (action === 'add') {
      await client.query(
        'INSERT INTO "Ingredient_Inventory" ("Ingredient_Inventory_ID", "Stock", "Units", "Cost_Per_Unit") VALUES ($1, $2, $3, $4)',
        [id, stock, units, cpu]
      );

      // console.log('Adding inventory item with:', { id, stock, units, cpu });
      return res.json({ message: 'Inventory item added successfully' });
    }

    //METHOD FOR EDITING NEW ITEMS IN INVENTORY
    else if (action ==='edit'){
      await client.query(
        'UPDATE "Ingredient_Inventory" SET "Stock" = $2, "Units" = $3, "Cost_Per_Unit" = $4 WHERE "Ingredient_Inventory_ID" = $1',
        [id, stock, units, cpu]
      );

      // console.log('Editing inventory item with:', { id, stock, units, cpu });
      return res.json({ message: 'Inventory item edited successfully' });
    }

    //METHOD FOR DELETING ITEMS IN INVENTORY
    else if (action ==='delete'){
      await client.query(
        'DELETE FROM "Ingredient_Inventory" WHERE "Ingredient_Inventory_ID" = $1', [id],
      );

      // console.log('Deleting inventory item with:', { id, stock, units, cpu });
      return res.json({ message: 'Inventory item deleted successfully' });
    }

    //QUERY FOR FETCHING EMPLOYEE TABLE
    const employeeRows = await client.query('SELECT * FROM "Employee"');
    // console.log(inventoryRows.rows); //debugging

    //METHOD FOR ADDING NEW EMPLOYEE
    if (action==='addEmp'){
      await client.query(
        'INSERT INTO "Employee" ("Employee_ID", "Name", "Type", "Hourly_Salary") VALUES ($1, $2, $3, $4)',
        [id, stock, units, cpu]
      );

      // console.log('Adding inventory item with:', { id, stock, units, cpu });
      return res.json({ message: 'Employee added successfully' });
    }

    //METHOD FOR EDITING EMPLOYEE
    else if (action==='editEmp'){
      await client.query(
        'UPDATE "Employee" SET "Name" = $2, "Type" = $3, "Hourly_Salary" = $4 WHERE "Employee_ID" = $1',
        [id, stock, units, cpu]
      );

      // console.log('Editing employee item with:', { id, stock, units, cpu });
      return res.json({ message: 'Employee edited successfully' });
    }

    //METHOD FOR DELETING EMPLOYEE
    else if (action ==='deleteEmp'){
      await client.query(
        'DELETE FROM "Employee" WHERE "Employee_ID" = $1', [id],
      );

      // console.log('Deleting employee with:', { id, stock, units, cpu });
      return res.json({ message: 'Employee deleted successfully' });
    }

    //QUERY FOR FETCHING MENU_ITEM TABLE
    const menuRows = await client.query('SELECT * FROM "Menu_Item"');
    // console.log(menuItems.rows); //debugging

    const { item_id, category, inventory, servsize, item_units } = req.body;
    if (action==='addMen'){
      await client.query(
        'INSERT INTO "Menu_Item" ("Menu_Item_ID", "Category", "Active_Inventory", "Serving_Size", "Units") VALUES ($1, $2, $3, $4, $5)',
        [item_id, category, inventory, servsize, item_units]
      );

      // console.log('Adding menu item with:', { item_id, category, inventory, servsize, item_units });
      return res.json({ message: 'Menu item added successfully' });
    }

    res.json({
      inventory: inventoryRows.rows,
      employees: employeeRows.rows,
      menu: menuRows.rows,
    });
  }
  catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/customer-view', async (req, res) => {
  const { items, total, tax } = req.body;
  console.log("Recievet items: ", items);

  try {
    await client.query('BEGIN');
    console.log("begin query worked");

    // Get the latest Order_ID
    const latestOrderResult = await client.query('SELECT MAX("Order_ID") FROM "Order"');
    const newOrderId = (latestOrderResult.rows[0].max || 0) + 1;
    console.log("Got Latest Order ID: ", newOrderId);

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Date as YYYY-MM-DD
    const currentTime = currentDate.getHours() * 100 + currentDate.getMinutes(); // Time as HHMM
    await client.query(
      'INSERT INTO "Order" ("Order_ID", "Employee_ID", "Date", "Time") VALUES ($1, $2, $3, $4)',
      [newOrderId, 1, formattedDate, currentTime]
    );
    process.stdout.write("Inserted new order");

    for (const item of items) {
      // Get the latest Order_Container_ID
      const latestContainerResult = await client.query('SELECT MAX("Order_Container_ID") FROM "Order_Container"');
      const newContainerId = (latestContainerResult.rows[0]?.max || 0) + 1;
      process.stdout.write(`\nGot Latest Container ID: ${newContainerId}\n`);

      // Insert new container
      await client.query(
        'INSERT INTO "Order_Container" ("Order_Container_ID", "Order_ID", "Type") VALUES ($1, $2, $3)',
        [newContainerId, newOrderId, item.container_type]
      );
      process.stdout.write("Inserted new container");

      // Function to insert food items
      const insertFoodItems = async (category, items) => {
        if (items && items.length > 0) {
          for (const foodItem of items) {
            const latestFoodItemResult = await client.query('SELECT MAX("Order_Food_Item_ID") FROM "Order_Food_Item"');
            const newFoodItemId = (latestFoodItemResult.rows[0].max || 0) + 1;
            process.stdout.write(`Got Latest Food Item ID: ${newFoodItemId}`);
            await client.query(
              'INSERT INTO "Order_Food_Item" ("Order_Food_Item_ID", "Order_Container_ID", "Menu_Item_ID", "Category") VALUES ($1, $2, $3, $4)',
              [newFoodItemId, newContainerId, foodItem, category]
            );
            process.stdout.write("Inserted new food item");
          }
        }
      };

      // Insert food items for each category
      await insertFoodItems('Side', item.sides);
      await insertFoodItems('Entree', item.entrees);
      await insertFoodItems('Appetizer', item.appetizers);
      await insertFoodItems('Drink', item.drinks);
      await insertFoodItems('Extra', item.extras);

    }

    await client.query('COMMIT');
    console.log("Commit worked");

    res.json({ message: 'Order recorded successfully', orderId: newOrderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('view error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/cashier-view', async (req, res) => {
  const { items, total, tax } = req.body;
  console.log("Recieved items: ", items);

  try {
    await client.query('BEGIN');
    console.log("begin query worked");

    // Get the latest Order_ID
    const latestOrderResult = await client.query('SELECT MAX("Order_ID") FROM "Order"');
    const newOrderId = (latestOrderResult.rows[0].max || 0) + 1;
    console.log("Got Latest Order ID: ", newOrderId);

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Date as YYYY-MM-DD
    const currentTime = currentDate.getHours() * 100 + currentDate.getMinutes(); // Time as HHMM
    await client.query(
      'INSERT INTO "Order" ("Order_ID", "Employee_ID", "Date", "Time") VALUES ($1, $2, $3, $4)',
      [newOrderId, 1, formattedDate, currentTime]
    );
    process.stdout.write("Inserted new order");

    for (const item of items) {
      // Get the latest Order_Container_ID
      const latestContainerResult = await client.query('SELECT MAX("Order_Container_ID") FROM "Order_Container"');
      const newContainerId = (latestContainerResult.rows[0]?.max || 0) + 1;
      process.stdout.write(`\nGot Latest Container ID: ${newContainerId}\n`);

      // Insert new container
      await client.query(
        'INSERT INTO "Order_Container" ("Order_Container_ID", "Order_ID", "Type") VALUES ($1, $2, $3)',
        [newContainerId, newOrderId, item.container_type]
      );
      process.stdout.write("Inserted new container");

      // Function to insert food items
      const insertFoodItems = async (category, items) => {
        if (items && items.length > 0) {
          for (const foodItem of items) {
            const latestFoodItemResult = await client.query('SELECT MAX("Order_Food_Item_ID") FROM "Order_Food_Item"');
            const newFoodItemId = (latestFoodItemResult.rows[0].max || 0) + 1;
            process.stdout.write(`Got Latest Food Item ID: ${newFoodItemId}`);
            await client.query(
              'INSERT INTO "Order_Food_Item" ("Order_Food_Item_ID", "Order_Container_ID", "Menu_Item_ID", "Category") VALUES ($1, $2, $3, $4)',
              [newFoodItemId, newContainerId, foodItem, category]
            );
            process.stdout.write("Inserted new food item");
          }
        }
      };

      // Insert food items for each category
      await insertFoodItems('Side', item.sides);
      await insertFoodItems('Entree', item.entrees);
      await insertFoodItems('Appetizer', item.appetizers);
      await insertFoodItems('Drink', item.drinks);
      await insertFoodItems('Extra', item.extras);

    }

    await client.query('COMMIT');
    console.log("Commit worked");

    res.json({ message: 'Order recorded successfully', orderId: newOrderId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('view error', err.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


process.on('exit', () => {
  client.end();
});
