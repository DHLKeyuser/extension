(function () {

  if (window.location.hostname !== 'solutions.inet-logistics.com') return;

  function pad(n) { return n < 10 ? '0' + n : n; }

  function getNextWeekday(date) {

    while (date.getDay() === 0 || date.getDay() === 6) {

      date.setDate(date.getDate() + 1);

    }

    return date;

  }

  function runAutoFillLogic() {

    const pickupDate = document.getElementById('elmtKopf.TransportInfo.AbholungVonDatum');

    const pickupTime = document.getElementById('elmtKopf.TransportInfo.AbholungVonZeit');

    const deliveryDate = document.getElementById('elmtKopf.TransportInfo.ZustellungVonDatum');

    if (!pickupDate || !pickupTime || !deliveryDate) return;

    const now = new Date();

    let pickupBase = new Date(now);

    if (now.getHours() >= 23 && now.getMinutes() >= 30) {

      pickupBase.setDate(pickupBase.getDate() + 1);

    }

    const plus30 = new Date(now.getTime() + 30 * 60000);

    const pickup = getNextWeekday(pickupBase);

    const delivery = getNextWeekday(new Date(pickupBase.getTime() + 5 * 24 * 60 * 60000));

    const dateToday = pad(pickup.getDate()) + '.' + pad(pickup.getMonth() + 1) + '.' + pickup.getFullYear();

    const timePlus30 = pad(plus30.getHours()) + ':' + pad(plus30.getMinutes());

    const datePlus5 = pad(delivery.getDate()) + '.' + pad(delivery.getMonth() + 1) + '.' + delivery.getFullYear();

    pickupDate.value = dateToday;

    pickupTime.value = timePlus30;

    deliveryDate.value = datePlus5;

    const kollis = [];

    for (let i = 0; i < 20; i++) {

      const k = document.getElementById(`elmtKolliK_${i}_Gewicht`);

      if (k) {

        const val = parseFloat(k.value.replace(',', '.')) || 0;

        kollis.push({ field: k, value: val });

      }

    }

    const articles = [];

    for (let i = 0; i < 100; i++) {

      const w = document.getElementById(`elmtArtikelA_${i}_Gewicht`);

      const q = document.getElementById(`elmtArtikelA_${i}_Menge`);

      if (w && q) {

        const net = parseFloat(w.value.replace(',', '.')) || 0;

        const qty = parseFloat(q.value.replace(',', '.')) || 1;

        articles.push({ field: w, net, qty });

      }

    }

    const groupCount = kollis.length;

    const perGroup = Math.floor(articles.length / groupCount);

    const remainder = articles.length % groupCount;

    let idx = 0;

    for (let i = 0; i < groupCount; i++) {

      const size = perGroup + (i === groupCount - 1 ? remainder : 0);

      const group = articles.slice(idx, idx + size);

      idx += size;

      const totalNet = group.reduce((sum, a) => sum + a.net * a.qty, 0);

      const gross = kollis[i].value;

      if (totalNet >= gross && totalNet > 0) {

        const factor = (gross - 0.01) / totalNet;

        group.forEach(a => {

          const newVal = (a.net * factor).toFixed(3);

          a.field.value = newVal.replace('.', ',');

          a.field.dispatchEvent(new Event('change'));

        });

      }

    }

    console.log('[AutoFill Extension] Done.');

    return true;

  }

  function checkAndMaybeRun() {

    const pickup = document.getElementById('elmtKopf.TransportInfo.AbholungVonDatum');

    const kolli = document.getElementById('elmtKolliK_0_Gewicht');

    if (pickup && kolli) {

      runAutoFillLogic();

      return true;

    }

    return false;

  }

  // Try immediately

  if (checkAndMaybeRun()) return;

  // If not ready yet, observe

  const observer = new MutationObserver(() => {

    if (checkAndMaybeRun()) observer.disconnect();

  });

  observer.observe(document.body, { childList: true, subtree: true });

})();
 