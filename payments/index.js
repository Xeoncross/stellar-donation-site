"use strict";

// Function to find percentage
function percentage(a, b) {
  return a / b * 100 > 100 ? 100 : a / b * 100;
}

function updateProgress(collected, goal) {
  // IDs
  var donationProgress = document.querySelector(".progress");
  var goalEl = document.querySelector(".goal");
  //var donationNumber = document.querySelector(".number");

  // How much percent to reach Goal
  var percent = percentage(collected, goal);

  // What we have so far to reach Goal
  donationProgress.setAttribute("aria-valuenow", collected);
  donationProgress.setAttribute("aria-valuemax", goal);

  goalEl.innerHTML = (goal > collected ? goal : collected) + " XLM";

  // Default Data
  donationProgress.setAttribute("style", "width:" + percent + "%");
  // donationNumber.setAttribute("style", "left:" + percent + "%");
  // donationNumber.innerHTML = collected + " XLM";

  // Round to 2 decimal places
  donationProgress.innerHTML =
    "&nbsp; " + Number(collected.toFixed(2)) + " XLM";
}

var donationAmount = 0.0;

function generateDonation() {
  var newAmount = randomNumber(goal / 20);
  addDonation(newAmount, "G" + makeid(55), '');
}

function addDonation(newAmount, publicKey, url) {
  $("article").prepend(`<div class="donation">
      <div class="amount">${newAmount} XLM</div>
      <p><a href="${url}" target="_blank">${publicKey}</a></p>
    </div>`);

  donationAmount += newAmount;
  updateProgress(donationAmount, goal);
}

// Development
// 1. Testnet
// var url = 'payments/GANBDVLBXKIG6BJGBNTNP6CIE6QYLBFPGR77UCS4M7EELLKJGFLQKIDB/500?testnet=true';
// 2. Livenet
// var url =
//   "payments/GARDIVICOIG53DC4BGVUQW2GAFJHFAT7EQK7265YC7LPP6GVAN62MZKQ/50?generate_donations=true";
// window.history.pushState({}, null, url);

// Values provided from the URL path
// const pathParams = document.location.pathname.split('/').filter(x => x.length);

// This alows any URL to be used as we only capture `.../key/goal/...`
const pathParams = document.location.pathname.match(/\/(G\w{55})\/?(\d+)?/);

if(!pathParams || !pathParams.length) {
  document.location.pathname='/';
}

const accountId = pathParams[1];
const goal = Number(pathParams[2]);

// We can toggle testnet using `?testnet=true`
const useTestnet = /testnet=/g.test(document.location.search);
const generateDonations = /generate_donations=/g.test(document.location.search);

const qr = new QRious({
  element: document.getElementById("qr"),
  value: accountId,
  size: 300
});

//On Window Load
window.onload = function() {
  if (generateDonations) {
    (function loop() {
      var rand = Math.round(Math.random() * (10000 - 500)) + 500;
      setTimeout(function() {
        generateDonation();
        loop();
      }, rand);
    })();
  }

  document.querySelector(".public_key").innerHTML = accountId;
  streamPayments(accountId);
};

function streamPayments(accountId) {
  var server = new StellarSdk.Server(
    `https://horizon${useTestnet ? "-testnet" : ""}.stellar.org`
  );

  console.log("Loading payments for", accountId);

  var payments = server.payments().forAccount(accountId);

  payments.stream({
    onmessage: function(payment) {
      console.log('payment', JSON.stringify(payment));
      // console.log(JSON.stringify(payment), payment._links.self.href);

      // The payments stream includes both sent and received payments. We only
      // want to process received payments here.
      if (payment.to !== accountId) {
        return;
      }

      // In Stellar’s API, Lumens are referred to as the “native” type.
      if (payment.asset_type !== "native") {
        return;
      }

      // console.log(typeof payment.amount, payment.amount + ' from ' + payment.from);
      addDonation(parseFloat(payment.amount), payment.from, payment._links.self.href);
    },
    onerror: function(err) {
      console.error(err);
    }
  });
}

function makeid(size) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  for (var i = 0; i < size; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function randomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}
