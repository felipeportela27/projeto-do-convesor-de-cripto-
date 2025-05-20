document.addEventListener('DOMContentLoaded', () => {
  // controle de navegação 
  const navButtons = document.querySelectorAll('nav .nav-btn');
  const sections = document.querySelectorAll('main section');

  function updateAriaSelected(activeBtn) {
    navButtons.forEach(btn => {
      btn.setAttribute('aria-selected', btn === activeBtn ? 'true' : 'false');
    });
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateAriaSelected(btn);
      const targetId = btn.getAttribute('data-target');
      sections.forEach(s => {
        s.classList.toggle('active', s.id === targetId);
      });
      // Foco na seção ativada para acessibilidade
      const activeSection = document.getElementById(targetId);
      if(activeSection){
        activeSection.focus();
      }
    });
  });

  // key de API e base para a API CryptoCompare
  const apiKey = "685419b6bedfb725bb6af07ed3dd6fef8f20a83f05c066d1eb20a10c563c7801";

  const amountInput = document.getElementById('amount');
  const fromCurrencySelect = document.getElementById('from-currency');
  const toCurrencySelect = document.getElementById('to-currency');
  const resultDiv = document.getElementById('converter-result');

  async function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }
    const apiUrl = `https://min-api.cryptocompare.com/data/price?fsym=${fromCurrency.toUpperCase()}&tsyms=${toCurrency.toUpperCase()}&api_key=${apiKey}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log("Resposta da API:", data);

      // Verifica se a API retornou erro
      if (data.Response === "Error" || !data[toCurrency.toUpperCase()]) {
        throw new Error(data.Message || "Preço inválido");
      }

      const rate = data[toCurrency.toUpperCase()];
      return amount * rate;
    } catch (error) {
      console.error("Erro na conversão:", error.message);
      return null;
    }
  }

  async function updateConversion() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (!amount || amount <= 0) {
      resultDiv.textContent = 'Digite uma quantidade válida.';
      return;
    }
    resultDiv.textContent = 'Calculando...';

    const convertedAmount = await convertCurrency(amount, fromCurrency, toCurrency);
    if (convertedAmount === null) {
      resultDiv.textContent = 'Erro ao obter preço da moeda.';
      return;
    }

    const formattedAmount = convertedAmount.toFixed(8);

    resultDiv.textContent = `${amount.toLocaleString('pt-BR')} ${fromCurrency.toUpperCase()} equivalem a ${formattedAmount} ${toCurrency.toUpperCase()}`;
  }

  amountInput.addEventListener('input', updateConversion);
  fromCurrencySelect.addEventListener('change', updateConversion);
  toCurrencySelect.addEventListener('change', updateConversion);

  updateConversion();

  // A lógica dos preços em tempo real permanece inalterada
  const cryptoTableBody = document.querySelector('#crypto-table tbody');
  const cryptosToShow = ['bitcoin', 'ethereum', 'tether', 'ripple', 'litecoin'];

  async function updateCryptoPrices() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids='+cryptosToShow.join(',')+'&order=market_cap_desc&per_page=10&page=1&sparkline=false');
      const data = await response.json();

      cryptoTableBody.innerHTML = '';

      for(const coin of data){
        const tr = document.createElement('tr');

        const tdName = document.createElement('td');
        tdName.textContent = `${coin.name} (${coin.symbol.toUpperCase()})`;
        tdName.setAttribute('data-label', 'Cripto');
        tr.appendChild(tdName);

        const tdPrice = document.createElement('td');
        tdPrice.textContent = coin.current_price.toLocaleString('pt-BR', {style:'currency', currency:'USD'});
        tdPrice.setAttribute('data-label', 'Preço (USD)');
        tr.appendChild(tdPrice);

        const tdChange = document.createElement('td');
        tdChange.textContent = coin.price_change_percentage_24h ? coin.price_change_percentage_24h.toFixed(2) + '%' : 'N/A';
        tdChange.className = coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative';
        tdChange.setAttribute('data-label', 'Variação 24h');
        tr.appendChild(tdChange);

        const tdUpdated = document.createElement('td');
        tdUpdated.textContent = new Date(coin.last_updated).toLocaleTimeString('pt-BR');
        tdUpdated.setAttribute('data-label', 'Última Atualização');
        tr.appendChild(tdUpdated);

        cryptoTableBody.appendChild(tr);
      }
    } catch {
      cryptoTableBody.innerHTML = '<tr><td colspan="4" style="color:#ffb347; font-weight:bold; padding:1rem;">Erro ao carregar dados em tempo real.</td></tr>';
    }
  }

  updateCryptoPrices();
  setInterval(updateCryptoPrices, 60000);
});