/*
 * Author: Erick Ruh Cardozo (W1SD00M) - <erickruhcardozo1998@hotmail.com>
 * Date: May 1, 2022 - 3:03 PM 
 */

const autoClickSwitch = document.querySelector('#autoClickSwitch');
const accessKeyField = document.querySelector('#accessKeyField');

autoClickSwitch.addEventListener('change', onAutoClickSwitchChange);
accessKeyField.addEventListener('change', onAccessKeyFieldChange);

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
