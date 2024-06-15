/*
 * Author: Erick Ruh Cardozo (W1SD00M) - <erickruhcardozo1998@hotmail.com>
 * Date: May 1, 2022 - 3:03 PM 
 */

const autoClickSwitch = document.getElementById('autoClickSwitch');
const accessKeyField = document.getElementById('accessKeyField');
const donationDateField = document.getElementById('donationDateField');
const countDonationBtn = document.getElementById('countDonationsBtn');
const cuponCountSpinner = document.getElementById('cuponCountSpinner');
const donatedCuponParagraph = document.getElementById('donatedCuponParagraph');
const donatedCuponCount = document.getElementById('donatedCuponCount');

autoClickSwitch.addEventListener('change', onAutoClickSwitchChange);
accessKeyField.addEventListener('change', onAccessKeyFieldChange);
countDonationBtn.addEventListener('click', countDonatedCupons);

function onAutoClickSwitchChange() {
  if (autoClickSwitch.checked) {
    enableAutoClick();
  } else {
    disableAutoClick();
  }
}

function onAccessKeyFieldChange() {
  chrome.runtime.sendMessage({command: 'SET_ACCESSKEY', key: accessKeyField.value});
}

function enableAutoClick() {
  chrome.runtime.sendMessage({command: 'SET_AUTOCLICK_ENABLED'});
}

function disableAutoClick() {
  chrome.runtime.sendMessage({command: 'SET_AUTOCLICK_DISABLED'});
}

async function countDonatedCupons() {
	donatedCuponParagraph.classList.add('d-none');
	const selectedDate = donationDateField.valueAsDate;
	const queryPeriod = selectedDate.toLocaleString('en-US', { month: '2-digit', year: 'numeric' });
	selectedDate.setDate(selectedDate.getDate() + 1); // Fixing the 'day-off' problem. Gosh I Hate JS 😡
	const brFormattedDate = selectedDate.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
	console.log(brFormattedDate);
	const url = `https://notaparana.pr.gov.br/nfprweb/RelatorioDocFiscalDoado?periodo=${queryPeriod}`;
	cuponCountSpinner.classList.remove('d-none');
	let response = await fetch(url);
	response = await response.text();
	const lines = response.split('\n');
	const donatedCupons = lines.filter(l => l.includes(brFormattedDate)).length;
	donatedCuponCount.innerText = donatedCupons;
	cuponCountSpinner.classList.add('d-none');
	donatedCuponParagraph.classList.remove('d-none');
}

addEventListener('load', function() {
  chrome.runtime.sendMessage({command: 'QUERY_AUTOCLICK_ENABLED'}, function(response) {
    autoClickSwitch.checked = response.enabled;
  });
  chrome.runtime.sendMessage({command: 'QUERY_ACCESSKEY'}, function(response) {
    accessKeyField.value = response.key;
  });
});

addEventListener('submit', function() {
  onAccessKeyFieldChange();
  chrome.tabs.reload();
});

let dateStr = (new Date()).toISOString();
dateStr = dateStr.substring(0, dateStr.indexOf('T'));
donationDateField.value = dateStr;
