var mysql = require("mysql");
var inquirer = require("inquirer");
const cTable = require('console.table')
var colors = require("colors");


// connect to the mysql server and sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "yourRootPassword",
    database: "bamazon_DB"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    readProducts();
});

function readProducts() {
    console.log("Welcome to Bamazon! Here are all our available items:\n".yellow)
    connection.query("SELECT item_id,product_name,price FROM products", function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    })
}

function start() {
    inquirer
        .prompt([{
            name: "name",
            type: "input",
            message: "\nPlease enter your name: "
        }, {
            type: "confirm",
            name: "ready",
            message: "Ready to shop till you drop?",
            default: true
        }]).then(function (answer) {
            if (answer.ready) {
                console.log("\nWelcome to Bamazon ".cyan + answer.name.magenta + "! We have some great deals for you.\n".cyan);
                shop();
            } else {
                console.log("\nCome back soon!".cyan)
                connection.end();
            }
        })
}

// Function to handle shop requests
function shop() {
    // query the database for all products being sold
    connection.query("SELECT * FROM products WHERE stock_quantity > 0", function (err, results) {
        if (err) throw err;
        // prompt user for which product they want to buy
        inquirer
            .prompt([{
                name: "choice",
                type: "list",
                choices: function () {
                    var choicesArr = [];
                    for (var i = 0; i < results.length; i++) {
                        choicesArr.push(results[i].product_name);
                    }
                    return choicesArr;
                },
                message: "What item would you like to purchase?",
            }, {
                name: "unit",
                type: "input",
                message: "Enter how many you would like to purchase",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return "Please enter only numbers".red;
                }
            }]).then(function (answer) {
                // grab chosen item information
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    if (results[i].product_name === answer.choice) {
                        chosenItem = results[i];
                    }
                }
                // determine if there are enough products
                if (chosenItem.stock_quantity >= parseInt(answer.unit)) {
                    var newQuantity = parseInt(chosenItem.stock_quantity) - parseInt(answer.unit);
                    var totalPrice = parseFloat(chosenItem.price) * answer.unit;
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [{
                            stock_quantity: newQuantity,
                        }, {
                            item_id: chosenItem.id
                        }],
                        function (error) {
                            if (error) throw err;
                            console.log("\nThanks for shopping with us! Your total is:".yellow + " $" + totalPrice + ".\n")
                            keepShopping();
                        }
                    );
                } else {
                    console.log("We can't match your order. We only have " + chosenItem.stock_quantity + " left");
                    keepShopping();
                }
            })
    })
};

function keepShopping() {
    inquirer
        .prompt([{
            name: "continue",
            type: "confirm",
            message: "Would you like to keep shopping?"
        }]).then(function (answer) {
            if (answer.continue) {
                readProducts();
            } else {
                console.log("\nCome back soon!".cyan);
                connection.end();
            }
        })
}