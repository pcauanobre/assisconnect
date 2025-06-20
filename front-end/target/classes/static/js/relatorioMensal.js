(function () {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  let dataSalva = sessionStorage.getItem("dataSimulada");
  let dataSimulada = dataSalva ? new Date(dataSalva) : new Date();
  const cardsGerados = new Map();

  function gerarCardDoMes(mesIndex, ano) {
    const chave = `${mesIndex}-${ano}`;
    if (!cardsGerados.has(chave)) {
      axios.get(`http://localhost:8080/idosos/quantidade-por-mes?ano=${ano}&mes=${mesIndex + 1}`)
        .then(res => {
          const qtd = res.data?.quantidade ?? null;
          cardsGerados.set(chave, qtd);
          atualizarCardsNaTela(ano);
        })
        .catch(() => {
          cardsGerados.set(chave, null);
          atualizarCardsNaTela(ano);
        });
    } else {
      atualizarCardsNaTela(ano);
    }
  }

  function atualizarCardsNaTela(anoAtual) {
    const container = document.getElementById("areaCardsMensais");
    container.innerHTML = "";

    const limiteMes = dataSimulada.getMonth();

    const chavesOrdenadas = [...cardsGerados.keys()]
      .filter(k => {
        const [mesStr, anoStr] = k.split("-");
        const mes = parseInt(mesStr);
        const ano = parseInt(anoStr);
        return ano === anoAtual && mes <= limiteMes;
      })
      .sort((a, b) => parseInt(a.split("-")[0]) - parseInt(b.split("-")[0]));

    chavesOrdenadas.forEach(chave => {
      const [mesIndexStr] = chave.split("-");
      const mesIndex = parseInt(mesIndexStr);

      const card = document.createElement("div");
      card.className = "bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center text-[#3D1F0C] h-48 animate-fade-in";
      card.innerHTML = `
        <h2 class="text-2xl font-bold">${meses[mesIndex]}</h2>
        <button onclick="exibirRelatorioMensal(${mesIndex}, ${anoAtual})"
          class="mt-4 bg-[#3D1F0C] text-white px-5 py-2 rounded-md hover:bg-[#2c1609] transition text-sm font-semibold">
          Ver
        </button>
      `;
      container.appendChild(card);
    });
  }

  function mostrarPopupRelatorioInterno(mes, ano) {
    const popup = document.createElement("div");
    popup.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50";

    popup.innerHTML = `
      <div class="bg-white p-6 rounded-xl shadow-xl border-4 border-[#3D1F0C] text-[#3D1F0C] w-full max-w-md animate-fade-in space-y-4" id="popupInternoRelatorio">
        <h2 class="text-xl font-bold flex items-center gap-2">
          <i data-lucide="check-circle" class="w-5 h-5"></i>
          Relatório Enviado
        </h2>
        <p class="text-sm">O relatório de <strong>${mes}/${ano}</strong> foi salvo com sucesso!</p>
        <div class="flex justify-end">
          <button onclick="document.getElementById('popupInternoRelatorio').parentElement.remove()"
                  class="bg-[#3D1F0C] text-white px-5 py-2 rounded-md font-semibold hover:bg-[#2c1609]">
            Fechar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);
    lucide.createIcons();
  }

  window.enviarRelatorioParaServidor = function (chave, mesIndex, ano, total) {
    const obs = document.getElementById(`obs-${chave}`)?.value || "";

    const relatorio = {
      mes: mesIndex + 1,
      ano: ano,
      quantidadeIdosos: total ?? 0,
      observacoes: obs
    };

    axios.post("http://localhost:8080/api/relatorios", relatorio)
      .then(() => {
        const nomeMes = meses[mesIndex];
        mostrarPopupRelatorioInterno(nomeMes, ano);
      })
      .catch(() => {
        alert("❌ Falha ao salvar relatório no servidor.");
      });
  };

  window.exibirRelatorioMensal = function (mesIndex, ano) {
    const nomeMes = meses[mesIndex];
    const chave = `${mesIndex}-${ano}`;
    const total = cardsGerados.get(chave);
    const relatorio = document.getElementById("areaRelatorioDetalhado");
    const isEditavel = dataSimulada.getMonth() === mesIndex && dataSimulada.getFullYear() === ano;

    const urlEstatisticas = `http://localhost:8080/api/relatorios/estatisticas/${mesIndex + 1}/${ano}`;
    const urlRelatorio = `http://localhost:8080/api/relatorios/${mesIndex + 1}/${ano}`;

    Promise.all([
      axios.get(urlEstatisticas).then(res => res.data).catch(() => null),
      axios.get(urlRelatorio).then(res => res.data).catch(() => null)
    ]).then(([estatisticas, dadosSalvos]) => {
      const dados = dadosSalvos || { observacoes: "" };
      const media = estatisticas?.mediaIdade?.toFixed(1) ?? "-";
      const fem = estatisticas?.percentualFeminino?.toFixed(1) ?? "-";
      const masc = estatisticas?.percentualMasculino?.toFixed(1) ?? "-";
      const outro = estatisticas?.percentualOutro?.toFixed(1) ?? "-";

      relatorio.innerHTML = `
        <div id="blocoRelatorioMes" class="bg-white shadow-xl mt-6 rounded-xl p-6 text-[#3D1F0C] border border-[#3D1F0C] opacity-0 translate-y-4 transition-all duration-500 ease-out">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-bold">📊 Relatório Mensal de ${nomeMes}/${ano}</h2>
            <button onclick="document.getElementById('areaRelatorioDetalhado').innerHTML=''" class="text-sm hover:underline">Fechar</button>
          </div>

          <div class="bg-[#f9f4ef] mt-4 p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 text-center">
            <div><p class="text-xs font-semibold text-gray-600">Idosos Cadastrados</p><p class="text-2xl font-bold mt-1">${total ?? "-"}</p></div>
            <div><p class="text-xs font-semibold text-gray-600">Média de Idade</p><p class="text-2xl font-bold mt-1">${media}</p></div>
            <div><p class="text-xs font-semibold text-gray-600">% Feminino</p><p class="text-2xl font-bold mt-1">${fem}%</p></div>
            <div><p class="text-xs font-semibold text-gray-600">% Masculino</p><p class="text-2xl font-bold mt-1">${masc}%</p></div>
            <div><p class="text-xs font-semibold text-gray-600">% Outro</p><p class="text-2xl font-bold mt-1">${outro}%</p></div>
          </div>

          <div class="mt-6">
            <label class="font-semibold text-sm">📝 Observações Gerais</label>
            <textarea id="obs-${chave}" ${!isEditavel ? "disabled" : ""} class="w-full mt-1 p-2 rounded border text-sm">${dados.observacoes}</textarea>
          </div>

          <div class="flex justify-center mt-6 gap-4">
            <button onclick="enviarRelatorioParaServidor('${chave}', ${mesIndex}, ${ano}, ${total})"
                    class="bg-[#3D1F0C] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#2c1609] transition">
              Confirmar
            </button>
            <button onclick="window.print()"
                    class="bg-[#3D1F0C] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#2c1609] transition">
              Imprimir Relatório
            </button>
          </div>
        </div>
      `;

      requestAnimationFrame(() => {
        const bloco = document.getElementById("blocoRelatorioMes");
        bloco.classList.remove("opacity-0", "translate-y-4");
        bloco.classList.add("opacity-100", "translate-y-0");
        bloco.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  };

  function inicializarMesesAteAtual() {
    const mesAtual = dataSimulada.getMonth();
    const ano = dataSimulada.getFullYear();
    for (let i = 0; i <= mesAtual; i++) {
      gerarCardDoMes(i, ano);
    }
  }

  inicializarMesesAteAtual();

  window.recarregarRelatorioMensal = function () {
    const anoAtual = dataSimulada.getFullYear();
    atualizarCardsNaTela(anoAtual);
  };

})();

window.addEventListener("beforeunload", () => {
  sessionStorage.clear();
});
