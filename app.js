// budget controller
var budgetController = (function () {

    // function constructor of income and expenses
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // all data
    var data = {

        // all incomes and expenses
        allItems: {
            inc: [], 
            exp: []
        },

        // total incomes and expenses
        total: {
            inc: 0,
            exp: 0
        },

        budget: 0,

        percentage: -1

    }

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        })

        data.total[type] = sum;
    }


    return {
        
        // add the item to the budget controller
        addItem: function (type, description, value) {

            // declaring the variables
            var newItem, ID;

            // initiallizing the value of ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // creating a new object according to the type
            if (type == 'inc') {

                newItem = new Income(ID, description, value);

            } else if (type == 'exp') {

                newItem = new Expense(ID, description, value);
            }

            // adding the object to data
            data.allItems[type].push(newItem);

            return newItem;

        }, 

        calculateBudget: function() {
            // calculate the total of inc and exp
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget 
            data.budget = data.total.inc - data.total.exp;

            // calculate the percentage of the total expenses spent
            if (data.total.inc > 0) {
                data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                income: data.total.inc,
                expense: data.total.exp,
                budget: data.budget,
                percentage: data.percentage
            }
        },
        

        // function to delete the item
        deleteItem: function(type, id) {
            var ids, index;

            // map function is used to apply a function to all the elements to an array
            // and return the resultant array
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            // splice method is used to remove 
            // the item from the starting index 
            // to the last index
            if (index != -1) {
                
                data.allItems[type].splice(index, 1);
            }
        },

        calculatePercentage: function() {
            data.allItems.exp.forEach(function(current) {
                current.calculatePercentage(data.total.inc);
            });
        },

        getPercentages: function() {
            var allPercentages;

            allPercentages = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });   
            
            return allPercentages;
        },

        testing: function () {
            return data;
        }
    }

})();



// ui controller
var UIController = (function () {

    // DOM strings
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description', 
        inputValue: '.add__value', 
        inputBtn: '.add__btn', 
        incomeList:'.income__list', 
        expenseList: '.expenses__list',
        budgetValue: '.budget__value',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        totalExpensePercent: '.budget__expenses--percentage',
        container: '.container',
        expensePercentage: '.item__percentage',
        monthLabel: '.budget__title--month'
    }

    var formatNum = function(strNum, len) {
        
        var newNum;
        
        if (strNum.length > len) {
            newNum = strNum.substr(0, strNum.length - len) + ',' + strNum.substr(strNum.length - len, strNum.length);
        } else {
            newNum = strNum;
        }
        
        if (len >= strNum.length) {
            return newNum;
        }else {
            return formatNum(newNum, len + 3);
        }
    }
    
    var numberFormatter = function(num, type) {

            // sign of the number parent
            num = Math.abs(num);

            // adjusting the 2 decimals 
            num = num.toFixed(2);

            // spliting the number by decimal and integer
            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];

            // adding the ',' for the thousand
            int = formatNum(int, 3);
            
            //adding + or -
            if (type == 'inc') {
                num = '+ ' + int + '.' + dec;
            } else {
                num = '- ' + int + '.' + dec;
            }
            
            return num;

        }
    
    var getMonthName = function(month) {
        
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                     'October', 'November', 'December'];
        
        return months[month];
    }


    // get the input fields 
    return {
        
        getInput: function() { 
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        }, 

        addItemToUI: function (obj, type) {

            var html, newHtml, element, percent;

            // create the html string
            if (type == 'inc') {
                element = DOMStrings.incomeList;
                html = '<div class="list__item clearfix" id="inc-%id%"><span class="list__item--description item__description">%description%</span><div class="list__item--box"><div class="list__item--subbox"><span class="list__item--value item__value">%val%</span></div><button class="list__item--delete item__delete--btn"><i class="icon-arrows-circle-remove"></i></button></div></div>';
            } else {
                element = DOMStrings.expenseList;
                html = '<div class="list__item clearfix" id="exp-%id%"><span class="list__item--description item__description">%description%</span><div class="list__item--box"><div class="list__item--subbox"><span class="list__item--valueitem__value">%val%</span><span class="list__item--percentage item__percentage">%percent%</span></div><button class="list__item--delete item__delete--btn"><i class="icon-arrows-circle-remove"></i></button></div></div>';
            }

            // update the html string with the object properties
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%val%', numberFormatter(obj.value, type));

            // insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteItemUI: function(htmlId) {

            document.getElementById(htmlId).remove();
        },

        clearFields: function() {
            var fields, newFields;

            // setting the input fields to empty strings... Method 1
            document.querySelector(DOMStrings.inputDescription).value = '';
            document.querySelector(DOMStrings.inputValue).value = '';

            // Method 2 to clear the input fields
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            newFields = Array.prototype.slice.call(fields);

            newFields.forEach(function(current, index, array) {
                current.value = '';
            });

            // tranfering the control of focus to the description input field
            document.querySelector(DOMStrings.inputDescription).focus();
        },

        updateBudgetToUI: function(obj) {
           
            var type;
            
            obj.income >= obj.expense ? type = 'inc' : 'exp';
            
            document.querySelector(DOMStrings.totalIncome).textContent = numberFormatter(obj.income, 'inc');
            document.querySelector(DOMStrings.totalExpense).textContent = numberFormatter(obj.expense, 'exp');
            document.querySelector(DOMStrings.budgetValue).textContent = numberFormatter(obj.budget, type);

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.totalExpensePercent).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.totalExpensePercent).textContent = '----';
            }

        },

        updateInputBorder: function() {

            var inputList, newInputList;

            inputList = document.querySelectorAll(
                DOMStrings.inputType + ', ' + 
                DOMStrings.inputDescription + ', ' + 
                DOMStrings.inputValue);

            newInputList = Array.prototype.slice.call(inputList);

            newInputList.forEach(function(current) {
                current.classList.toggle('red-focus');
            });
            
            document.querySelector('.add__type').classList.toggle('red-border');
            document.querySelector('.icon-arrows-circle-check').classList.toggle('red');
        },

        displayPercentage: function(percentages) {

            allNodes = document.querySelectorAll(DOMStrings.expensePercentage);

            allNodes.forEach(function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '----';
                }
            });
        },

        displayMonth: function() {
            
            var now, month, year;
            
            // get the current date
            now = new Date();
            
            // get the current month
            month = now.getMonth();
            month = getMonthName(month);
            
            // get the current year
            year = now.getFullYear();
            
            // display on the UI
            document.querySelector(DOMStrings.monthLabel).textContent = month + ' ' + year;
        },
        
        getDOMString: function() {
            return DOMStrings;
        }
    }

})();



// app controller
var controller = (function (UICtrl, budgetCtrl) {

    // function setup
    var setupEventListner = function() {

        // getting the DOM string input
        var DOM = UICtrl.getDOMString();

        // event listener to the add__btn
        document.querySelector(DOM.inputBtn).addEventListener('click', addInput);

        // event listener for Enter Key
        document.addEventListener('keypress', function (event) {
            if (event.keyCode == '13') {
                addInput();
            }
        });

        // event listner for container (income and expenses)
        document.querySelector(DOM.container).addEventListener('click', deleteItem);
        
        // event listener for changing the border color
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.updateInputBorder);
    
    }

    var updateBudget = function() {

        // calculate the budget parent
        budgetCtrl.calculateBudget();

        // return the budget value
        var budget = budgetCtrl.getBudget();

        // update the budget on UI
        UICtrl.updateBudgetToUI(budget);
    }
    

    var updatePercentages = function() {

        var percentages;

        // calculate the percentages
        budgetCtrl.calculatePercentage();

        // get the percentages
        percentages = budgetCtrl.getPercentages();

        // update the percentage on the UI
        UICtrl.displayPercentage(percentages);

    }

    var addInput = function () {
        
        var input, newItem;

        // get the input field
        input = UICtrl.getInput();

        if (input.description != '' && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // add the item to the UI
            UICtrl.addItemToUI(newItem, input.type);

            // clear the input fields
            UICtrl.clearFields();

            // calculate the budget 
            updateBudget();

            // update the percentages
            updatePercentages();
            
        }

    };

    var deleteItem = function(event) {

        var itemID, newItemID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.id;
        newItemID = itemID.split('-');
        type = newItemID[0];
        ID = parseInt(newItemID[1]);

        // delete item from the data structure
        budgetCtrl.deleteItem(type, ID);

        // delete item from the UI
        UICtrl.deleteItemUI(itemID);

        // update the budget
        updateBudget();

        //update the percentages
        updatePercentages();

    };

    return {
        init: setupEventListner(),
        displayMonth: UICtrl.displayMonth(),
        resetValue: UICtrl.updateBudgetToUI({
            income: 0, 
            expense: 0,
            budget: 0, 
            percentage: 0
        })
    }

})(UIController, budgetController);