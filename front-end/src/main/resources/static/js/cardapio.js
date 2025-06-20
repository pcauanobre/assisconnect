(function () {
  window.inicializarCardapioSemanal = function () {
    const container = document.getElementById('cardapioSemanalContainer');
    if (!container) return;

    const dias = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sabado", "Domingo"];
    const horarios = {
      cafe: "Café da Manhã",
      almoco: "Almoço",
      jantar: "Jantar"
    };

    const baseMock = {
      Segunda: { cafe: { prato: "Pão com manteiga", calorias: 250 }, almoco: { prato: "Arroz, feijão e frango", calorias: 600 }, jantar: { prato: "Sopa de legumes", calorias: 350 } },
      Terca: { cafe: { prato: "Bolo de milho", calorias: 300 }, almoco: { prato: "Macarronada com carne", calorias: 700 }, jantar: { prato: "Canja de galinha", calorias: 400 } },
      Quarta: { cafe: { prato: "Pão integral com queijo", calorias: 280 }, almoco: { prato: "Arroz, feijão e peixe", calorias: 580 }, jantar: { prato: "Sopa cremosa", calorias: 360 } },
      Quinta: { cafe: { prato: "Frutas e iogurte", calorias: 230 }, almoco: { prato: "Escondidinho de carne", calorias: 640 }, jantar: { prato: "Salada e pão", calorias: 310 } },
      Sexta: { cafe: { prato: "Cuscuz com ovo", calorias: 320 }, almoco: { prato: "Feijoada leve", calorias: 650 }, jantar: { prato: "Sopa com torradas", calorias: 330 } },
      Sabado: { cafe: { prato: "Pão doce", calorias: 310 }, almoco: { prato: "Lasanha de frango", calorias: 720 }, jantar: { prato: "Caldo verde", calorias: 340 } },
      Domingo: { cafe: { prato: "Tapioca com queijo", calorias: 290 }, almoco: { prato: "Carne assada com arroz", calorias: 700 }, jantar: { prato: "Sopa leve", calorias: 320 } }
    };

    window.cardapioAtual = JSON.parse(JSON.stringify(baseMock));

    // Requisição para obter cardápio do servidor
    axios.get("http://localhost:8080/cardapio")
      .then(response => {
        const dados = response.data;
        if (dados && dados.length > 0) {
          dados.forEach(item => {
            if (!window.cardapioAtual[item.dia]) window.cardapioAtual[item.dia] = {};
            window.cardapioAtual[item.dia][item.tipo] = {
              prato: item.prato,
              calorias: item.calorias
            };
          });
        } else {
          console.warn("⚠️ Nenhum dado retornado do banco. Usando cardápio mock.");
        }
        renderizarTabela();
      })
      .catch(err => {
        alert("Erro ao carregar cardápio.");
        console.error(err);
        renderizarTabela();
      });

    // Função para renderizar o cardápio
    function renderizarTabela() {
      container.innerHTML = `
        <div class="bg-[#3D1F0C] text-white rounded-xl px-6 py-5 shadow flex justify-between items-center">
          <div class="flex items-center gap-3">
            <i data-lucide="utensils" class="w-6 h-6"></i>
            <div>
              <h1 class="text-2xl font-bold">Cardápio Semanal</h1>
              <p class="text-sm opacity-80">Visualize os pratos da semana.</p>
            </div>
          </div>
          <button onclick="imprimirCardapio()" class="bg-white text-[#3D1F0C] px-4 py-2 rounded-md font-bold shadow hover:bg-[#e5d2bd] flex items-center gap-2">
            <i data-lucide="printer" class="w-4 h-4"></i> Imprimir
          </button>
        </div>

        <div class="animate-fade-in">
          <div class="overflow-x-auto bg-white p-4 rounded-xl shadow border border-[#3D1F0C] mt-4">
            <table class="w-full text-sm text-left text-[#3D1F0C] border-collapse">
              <thead>
                <tr class="bg-[#e5d2bd] font-bold">
                  <th class="px-4 py-3 border">Dia</th>
                  ${Object.values(horarios).map(h => `<th class="px-4 py-3 border">${h}</th>`).join('')}
                  <th class="px-4 py-3 border text-center">Editar</th>
                </tr>
              </thead>
              <tbody>
                ${dias.map(dia => `
                  <tr class="border-t">
                    <td class="px-4 py-3 border font-semibold">${dia}</td>
                    ${Object.keys(horarios).map(ref => {
                      const prato = window.cardapioAtual[dia]?.[ref]?.prato || "-";
                      const calorias = window.cardapioAtual[dia]?.[ref]?.calorias || 0;
                      return `
                        <td class="px-4 py-3 border">
                          <div class="text-sm font-medium">${prato}</div>
                          <div class="text-xs opacity-70">${calorias} kcal</div>
                        </td>
                      `;
                    }).join("")}
                    <td class="px-4 py-3 border text-center">
                      <button onclick="abrirPopupEditar('${dia}')" title="Editar ${dia}" class="text-[#3D1F0C] hover:text-white hover:bg-[#3D1F0C] p-2 rounded transition">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      lucide.createIcons();
    }
  };

  // Função para abrir o popup de edição de cardápio
  window.abrirPopupEditar = function (dia) {
    const cardapio = window.cardapioAtual[dia] || {};
    const horarios = {
      cafe: "Café da Manhã",
      almoco: "Almoço",
      jantar: "Jantar"
    };

    let html = `
      <h2 class="text-xl font-bold text-[#3D1F0C] mb-4 flex items-center gap-2">
        <i data-lucide="edit-3" class="w-5 h-5"></i> Editar Cardápio - ${dia}
      </h2>
      <form id="formEdicaoDia" class="space-y-4 text-sm text-[#3D1F0C]">
    `;

    for (const ref in horarios) {
      html += `
        <div class="bg-[#f8f3ef] p-4 rounded-xl border border-[#3D1F0C] shadow">
          <label class="block text-sm font-bold mb-1">${horarios[ref]}</label>
          <input type="text" name="${ref}_prato" placeholder="Prato" value="${cardapio[ref]?.prato || ''}"
            class="w-full border p-2 rounded mb-2" />
          <input type="number" name="${ref}_calorias" placeholder="Calorias" value="${cardapio[ref]?.calorias || ''}"
            class="w-full border p-2 rounded" />
        </div>
      `;
    }

    html += `
      <div class="flex justify-end gap-3 pt-2">
        <button type="submit"
          class="bg-[#3D1F0C] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#2c1609]">Salvar</button>
        <button type="button" onclick="document.getElementById('popupEditarCardapio').classList.add('hidden')"
          class="bg-white border border-[#3D1F0C] text-[#3D1F0C] px-4 py-2 rounded-md font-semibold hover:bg-gray-100">Cancelar</button>
      </div>
    </form>
    `;

    const popup = document.getElementById('popupEditarCardapio');
    popup.querySelector('form').innerHTML = html;
    popup.classList.remove('hidden');

    // Função para salvar as alterações no cardápio
    document.getElementById("formEdicaoDia").onsubmit = (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const novo = {};

      for (const ref in horarios) {
        novo[ref] = {
          prato: data.get(`${ref}_prato`) || "-",
          calorias: parseInt(data.get(`${ref}_calorias`)) || 0,
        };
      }

      window.cardapioAtual[dia] = novo;

      const refeicoes = Object.keys(novo).map(tipo => ({
        dia: dia,
        tipo: tipo,
        prato: novo[tipo].prato,
        calorias: novo[tipo].calorias
      }));

      // Atualiza o cardápio no servidor e exibe o popup
      axios.put("http://localhost:8080/cardapio/atualizar", refeicoes)
        .then(() => {
          // Exibindo o popup de confirmação
          mostrarPopup({
            titulo: "Cardápio Atualizado",
            mensagem: `O cardápio de <strong>${dia}</strong> foi salvo com sucesso!`,
            icone: "check-circle",
            confirmarTexto: "Fechar",
            onConfirm: () => {
              funcao3(); // Atualiza os dados após fechar o popup
            }
          });

          // Oculta o popup de edição após exibir a confirmação
          popup.classList.add("hidden");
        })
        .catch(error => {
          alert("Erro ao salvar cardápio.");
          console.error(error);
        });
    };

    lucide.createIcons();
  };

  // Função para mostrar o popup inline no estilo do popupGlobal
  function mostrarPopup({ titulo, mensagem, icone = "info", confirmarTexto = "Fechar", onConfirm }) {
    const popup = document.createElement("div");
    popup.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";

    popup.innerHTML = `
      <div class="bg-white p-6 rounded-xl w-full max-w-md border-4 border-[#3D1F0C] text-[#3D1F0C] animate-fade-in space-y-5 shadow-xl">

        <div class="flex items-center gap-3">
          <i data-lucide="${icone}" class="w-5 h-5"></i>
          <h2 class="text-xl font-bold">${titulo}</h2>
        </div>

        <div class="space-y-4 text-sm">
          <p>${mensagem}</p>
        </div>

        <div class="flex justify-end gap-3">
          <button id="popupFecharBtn" class="bg-[#3D1F0C] text-white px-5 py-2 rounded font-semibold hover:bg-[#2c1609]">
            ${confirmarTexto}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    lucide.createIcons();

    document.getElementById('popupFecharBtn').onclick = () => {
      popup.remove();
      if (onConfirm) onConfirm();
    };
  }

  window.imprimirCardapio = function () {
    // cria (ou reaproveita) o cabeçalho de impressão
    let cabecalho = document.getElementById("cabecalhoImpressaoCardapio");
    if (!cabecalho) {
      cabecalho = document.createElement("div");
      cabecalho.id = "cabecalhoImpressaoCardapio";
      cabecalho.style.textAlign = "center";
      cabecalho.style.marginTop = "100px";
      cabecalho.style.marginBottom = "2rem";
      cabecalho.style.width = "100%";
      document.body.appendChild(cabecalho);
    }

    // conteúdo do cabeçalho
    cabecalho.innerHTML = `
      <h1 style="font-size:30px;font-weight:bold;color:#3D1F0C;">Cardápio Semanal</h1>
      <p style="font-size:18px;color:#3D1F0C;margin:0;">Lar Francisco de Assis</p>
      <p style="font-size:16px;color:#3D1F0C;margin:0;">${new Date().toLocaleString("pt-BR")}</p>
    `;

    // dispara a impressão
    window.print();

    // remove o cabeçalho após um pequeno delay (garante que o print finalize)
    setTimeout(() => {
      cabecalho.remove();
    }, 1000);
  };



})();
