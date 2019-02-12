require('dotenv').config()
var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table')
var colors = require("colors");

// connect to the mysql server and sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: process.env.PASSWORD,
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    prompt();
});

function prompt() {
    inquirer
        .prompt([{
            name: "start",
            type: "list",
            message: "Would you like to continue?",
            choices: ["Yes", "No"]
        }]).then(function (answer) {
            switch (answer.start) {
                case "Yes":
                    start();
                    break;
                case "No":
                    console.log("\nEnding connection\n".cyan);
                    connection.end();
                    break;
            }
        })
}

function start() {
    inquirer
        .prompt({
            name: "action",
            type: "list",
            message: "what would you like to do?",
            choices: [
                "View Product for Sale",
                "View Low Inventory",
                "Add to Inventory",
                "Add New Product"
            ]
        }).then(function (answer) {
            switch (answer.action) {
                case "View Product for Sale":
                    viewProduct();
                    break;

                case "View Low Inventory":
                    viewInventory();
                    break;

                case "Add to Inventory":
                    addInventory();
                    break;

                case "Add New Product":
                    addProduct();
                    break;
            }
        })
}

// List every available item: the item IDs, names, prices, and quantities.
function viewProduct() {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("\nWelcome, Manager. Here are all available items:\n".yellow)
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.table(res[i].item_id + "  |  " + res[i].product_name + "  |  " + "$" + res[i].price + "  |  " + res[i].stock_quantity + " items in stock")
        }
        prompt();
    })
}

// Lists all items with an inventory count lower than five.
function viewInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
        console.log("\nHere is a list of all items with an inventory count lower than five:\n".yellow)
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.table(res[i].item_id + "  |  " + res[i].product_name + "  |  " + "$" + res[i].price + "  |  " + res[i].stock_quantity + " items in stock")
        }
        prompt();
    })
}

// Display a prompt that will let the manager "add more" of any item currently in the store.
function addInventory() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "Please enter the item ID"
    }, {
        name: "quantity",
        type: "input",
        message: "Please enter the quantity"
    }]).then(function (answer) {
        connection.query("SELECT * FROM products WHERE ?", {
            item_id: answer.id
        }, function (err, res) {
            itemQuantity = res[0].stock_quantity + parseInt(answer.quantity);
            connection.query(
                "UPDATE products SET ? WHERE ? ",
                [{
                        stock_quantity: itemQuantity
                    },
                    {
                        item_id: answer.id
                    }
                ],
                function (err) {
                    if (err) throw err;
                    console.log("\nItem was added successfully!\n".cyan)
                    // viewProduct();
                    prompt();
                }
            )
        })
    })
}

// Allows the manager to add a completely new product to the store.
function addProduct() {
    inquirer
        .prompt([{
                name: "item",
                type: "input",
                message: "Enter the name of the product"

            },
            {
                name: "department",
                type: "input",
                message: "Enter the department of the product"
            },
            {
                name: "price",
                type: "input",
                message: "Enter the price of the product",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "Enter the product quantity",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?", {
                    product_name: answer.item,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.quantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("\nYour product was added successfully!\n".cyan);
                    // viewProduct();
                    prompt();
                }
            )
        })
}