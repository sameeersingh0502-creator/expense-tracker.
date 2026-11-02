// ---------- Get elements from the page ----------
const form = document.getElementById("transaction-form");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const list = document.getElementById("list");
const emptyMsg = document.getElementById("empty-msg");
const filterSelect = document.getElementById("filter");
const clearBtn = document.getElementById("clear-btn");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

// ---------- Load saved data from localStorage ----------
// localStorage keeps data even after the browser is closed
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Set today's date as default in the date box
dateInput.valueAsDate = new Date();

// ---------- Helper: format number as rupees ----------
function formatMoney(num) {
  // en-IN gives Indian comma style, e.g. 1,50,000.00
  return "₹" + num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// ---------- Helper: "2026-10-03" -> "3 Oct" ----------
function formatDate(dateString) {
  const parts = dateString.split("-");
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ---------- Helper: stop user text from being treated as HTML ----------
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Save to localStorage ----------
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// ---------- Update the Balance / Income / Expense cards ----------
function updateSummary() {
  let income = 0;
  let expense = 0;

  transactions.forEach(function (t) {
    if (t.type === "income") {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  });

  incomeEl.textContent = formatMoney(income);
  expenseEl.textContent = formatMoney(expense);
  balanceEl.textContent = formatMoney(income - expense);
}

// ---------- Show the transactions on the page ----------
function showTransactions() {
  list.innerHTML = "";

  const filter = filterSelect.value;

  // Keep only the transactions that match the filter
  const filtered = transactions.filter(function (t) {
    return filter === "all" || t.type === filter;
  });

  emptyMsg.style.display = filtered.length === 0 ? "block" : "none";

  filtered.forEach(function (t) {
    const li = document.createElement("li");
    li.className = t.type;

    const sign = t.type === "income" ? "+" : "−";

    li.innerHTML = `
      <div class="info">
        <strong>${escapeHTML(t.description)}</strong>
        <small>${t.category}, ${formatDate(t.date)}</small>
      </div>
      <div class="right">
        <span class="amount">${sign}${formatMoney(t.amount)}</span>
        <button class="delete-btn" aria-label="Delete transaction" onclick="deleteTransaction(${t.id})">&times;</button>
      </div>
    `;

    list.appendChild(li);
  });
}

// ---------- Add a new transaction ----------
form.addEventListener("submit", function (e) {
  e.preventDefault(); // stop the page from reloading

  const transaction = {
    id: Date.now(), // unique id based on current time
    description: descriptionInput.value.trim(),
    amount: parseFloat(amountInput.value),
    type: typeInput.value,
    category: categoryInput.value,
    date: dateInput.value
  };

  transactions.unshift(transaction); // add to the top of the list
  saveData();
  updateAll();

  // Clear the form
  descriptionInput.value = "";
  amountInput.value = "";
  dateInput.valueAsDate = new Date();
});

// ---------- Delete one transaction ----------
function deleteTransaction(id) {
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });
  saveData();
  updateAll();
}

// ---------- Clear everything ----------
clearBtn.addEventListener("click", function () {
  if (transactions.length === 0) return;

  if (confirm("Delete all transactions?")) {
    transactions = [];
    saveData();
    updateAll();
  }
});

// ---------- Filter dropdown ----------
filterSelect.addEventListener("change", showTransactions);

// ---------- Refresh everything on the screen ----------
function updateAll() {
  updateSummary();
  showTransactions();
}

// Run once when the page opens
updateAll();
