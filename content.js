(function checkAndRun() {

  // Check if the current site matches the desired URL

  if (window.location.hostname !== 'solutions.inet-logistics.com') {

    console.log('[AutoFill Extension] This script only works on the specified site.');

    return; // Exit if not on the correct site

  }

  const waitForFields = () => {

    const pickupDate = document.getElementById('elmtKopf.TransportInfo.AbholungVonDatum');

    const pickupTime = document.getElementById('elmtKopf.TransportInfo.AbholungVonZeit');

    const deliveryDate = document.getElementById('elmtKopf.TransportInfo.ZustellungVonDatum');

    const kolliWeight = document.getElementById('elmtKolliK_0_Gewicht');

    if (!pickupDate || !pickupTime || !deliveryDate || !kolliWeight) {

      console.log('[AutoFill Extension] Waiting for all required fields...');

      return setTimeout(waitForFields, 500);

    }

    console.log('[AutoFill Extension] Fields detected. Proceeding...');

    function pad(n) { return n < 10 ? '0' + n : n; }

    function getNextWeekday(date) {

      while (date.getDay() === 0 || date.getDay() === 6) {

        date.setDate(date.getDate() + 1);

      }

      return date;

    }

    const now = new Date();

    const plus30 = new Date(now.getTime() + 30 * 60000);

    // Get next weekday for pickup

    const pickup = getNextWeekday(new Date(now));

    const delivery = getNextWeekday(new Date(now.getTime() + 5 * 24 * 60 * 60000));

    const dateToday = pad(pickup.getDate()) + '.' + pad(pickup.getMonth() + 1) + '.' + pickup.getFullYear();

    const timePlus30 = pad(plus30.getHours()) + ':' + pad(plus30.getMinutes());

    const datePlus5 = pad(delivery.getDate()) + '.' + pad(delivery.getMonth() + 1) + '.' + delivery.getFullYear();

    pickupDate.value = dateToday;

    pickupTime.value = timePlus30;

    deliveryDate.value = datePlus5;

    let refVal = parseFloat(kolliWeight.value.replace(',', '.')) || 0;

    let items = [];

    let totalNet = 0;

    for (let i = 0; i < 20; i++) {

      let weightField = document.getElementById('elmtArtikelA_' + i + '_Gewicht');

      let qtyField = document.getElementById('elmtArtikelA_' + i + '_Menge');

      if (weightField && qtyField) {

        let net = parseFloat(weightField.value.replace(',', '.')) || 0;

        let qty = parseFloat(qtyField.value.replace(',', '.')) || 1;

        let totalItemWeight = net * qty;

        items.push({ field: weightField, net: net, qty: qty });

        totalNet += totalItemWeight;

      }

    }

    if (totalNet >= refVal) {

      console.log('[AutoFill Extension] Adjusting net weights...');

      let target = refVal - 0.01;

      let factor = target / totalNet;

      items.forEach(item => {

        let adjustedNet = (item.net * factor).toFixed(3);

        item.field.value = adjustedNet.replace('.', ',');

        item.field.dispatchEvent(new Event('change'));

      });

    }

    console.log('[AutoFill Extension] Done.');

  };

  waitForFields();

})();

 