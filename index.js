let selectedItemPrice = 0;
let selectedItemName = 'None';
let timerInterval;
let time = 180; 

document.addEventListener('DOMContentLoaded', () => {
  const allItems = document.querySelectorAll('.all-item');

  allItems.forEach(item => {
    item.addEventListener('click', () => {
      document.querySelector('.change')?.classList.remove('change');
      item.classList.add('change');
      selectedItemPrice = parseFloat(item.querySelector('h2').innerText.replace('$', ''));
      selectedItemName = item.querySelector('span').innerText;
      updateTotal();
    });
  });

  function updateTotal() {
    const checkPriceElement = document.getElementById('redPrice');
    const totalElement = document.getElementById('red');
    const itemElement = document.getElementById('itemall');
    const itemNameElement = document.getElementById('green2');

    checkPriceElement.innerText = `${selectedItemPrice.toFixed(2)}`;
    totalElement.innerText = `${selectedItemPrice.toFixed(2)}`;
    itemNameElement.innerText = `${selectedItemName}`;
    itemElement.innerText = `${selectedItemName}`;
    checkPriceElement.style.color = "red";
    totalElement.style.color = "red";
    itemNameElement.style.color = "green";
    itemElement.style.color = "green";
  }
});


function checkid() {
  const userId = document.getElementById('userid').value;
  const zoneId = document.getElementById('zoneid').value;

  if (userId.trim() === '' || zoneId.trim() === '') {
    showAlert('Please input both user ID and zone ID', 'error');
    return;
  }

  const url = `https://api.isan.eu.org/nickname/ml?id=${userId}&zone=${zoneId}`;

  document.getElementById('submit').innerText = 'Checking...';

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);

      if (data.success) {
        document.getElementById('responseName').innerText = data.name;
        document.getElementById('responseName').style.color = '';
        showAlert('User: ' + data.name, 'success');
      } else {
        document.getElementById('responseName').innerText = 'User not found';
        document.getElementById('responseName').style.color = 'red';
        showAlert('User not found!', 'error');
        document.querySelector('.alert').style.zIndex = 200;
      }

      document.getElementById('submit').innerText = 'Check';
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('submit').innerText = 'Check';
    });
}

function showAlert(message, type) {
  // You should implement this function to handle alert displays.
}

function startTimer() {
  const timerElement = document.getElementById("timer");
  if (!timerElement) return; 
  
  let minutes, seconds;
  timerInterval = setInterval(() => {
    minutes = Math.floor(time / 60);
    seconds = time % 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerElement.textContent = `${minutes}:${seconds}`;

    if (time > 0) {
      time--;
    } else {
      clearInterval(timerInterval);
      closeQR();
    }
  }, 1000);
}

function resetTimer() {
  time = 180;
  if (timerInterval) {
    clearInterval(timerInterval); 
  }
  startTimer(); 
}

function setShowQR(price, qr) {
  const showQR = document.getElementById('showQR');
  showQR.innerHTML = `
    <div class="KHQR">
        <div class="KHQRcontainer">
          <div class="card">
            <div class="KHQRheader">
              <img class="logoKHQR" src="img/KHQR Logo.png" alt="">
            </div>
            <div class="right"></div>
            <div class="name">
            <div class="flex">
              <div class="oneBox">
                <span class="shop-name">EMPTY SHOP</span>
                <div class="amount">${price} <span class="currency">USD</span></div>
              </div>
              <div class="loader-container">
                  <svg class="spin" width="22" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="12" r="9" stroke="#E8EEF1" stroke-width="4"/>
    <circle cx="11" cy="12" r="9" stroke="url(#paint0_linear)" stroke-width="4"/>
    <path d="M11.2001 2.70005C16.4801 2.70005 20.0001 6.63995 20.0001 11.5001C20.0001 16.3602 16.4801 21.1801 11.2001 21.1801" stroke="url(#paint1_linear)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear" x1="25.08" y1="14.2" x2="11" y2="12" gradientUnits="userSpaceOnUse">
        <stop stop-color="#28B4C3"/>
        <stop offset="1" stop-color="#E8EEF1"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="15.8401" y1="20.3601" x2="12.8663" y2="4.9307" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0BBCD4"/>
        <stop offset="1" stop-color="#0BBCD4" stop-opacity="0"/>
      </linearGradient>
    </defs>
  </svg>
                  <div class="timer" id="timer">03:00</div>
                </div>
              
            </div>
            <svg width="400px" height="2" viewBox="0 0 400 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0.845703H400" stroke="black" stroke-opacity="0.5" stroke-dasharray="8 8"/>
            </svg>
            <div class="QRImg">
              <img class="qr" src="https://jseang.onrender.com/api/qrcode/${qr}" alt="">
              <img class="usd" src="img/usd-khqr-logo.svg" alt="">
            </div>
          </div>
        </div>
      </div>
  `;

  resetTimer();
}

function closeQR() {
  const showQR = document.getElementById('showQR');
  showQR.innerHTML = "";
}

const apiLink = "http://127.0.0.1/api";

const buyNow = () => {
  fetch(apiLink + "/generatekhqr", {
    method: "POST",
    body: JSON.stringify({
      price: selectedItemPrice,
      planName: selectedItemName
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then((response) => response.json())
    .then((json) => {
      const { price, qr, md5 } = json.data;
      setShowQR(price, qr);
      checkUserPayment(md5);
    });
}

const checkUserPayment = (md5) => {
  sleep(2000).then(() => {
    fetch(apiLink + "/checkkhqr", {
      method: "POST",
      body: JSON.stringify({
        md5
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.success) {
          closeQR();
          showInvoice(selectedItemPrice, selectedItemName);
        } else {
          checkUserPayment(md5);
        }
      });
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getCurrentDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = today.getFullYear();

  return `${day}/${month}/${year}`;
}

function showInvoice(price, itemName) {
  const invoiceContainer = document.createElement('div');
  invoiceContainer.className = 'invoice';
  const currentDate = getCurrentDate();
  const userName = document.getElementById('responseName').innerText;

  invoiceContainer.innerHTML = `
  <div class="invoice">
    <h2>Payment Success</h2>
    <p class="item-value1">Date: <p class="statusthree">${currentDate}</p></p>
    <p class="item-value2">Item: <p class="statusthree">${itemName}</p></p>
    <p class="item-value3">Total Price: <p class="statusthree">${price.toFixed(2)}$</p></p>
    <p class="item-value4">User: <span id="responseName">${userName}</span></p>
    <p class="item-value5">Status: <p class="status">Success</p></p>
    <button id="closeInvoice">Close</button>
  </div>
  `;

  document.body.appendChild(invoiceContainer);

  document.getElementById('closeInvoice').addEventListener('click', () => {
    document.body.removeChild(invoiceContainer);
  });
}
