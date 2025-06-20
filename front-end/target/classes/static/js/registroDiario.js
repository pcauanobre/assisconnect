(function () {
  let atividades = [];
  let idosos = [];

  function formatarDataBr(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function salvarPresencas() {
    const dataInput = document.getElementById('dataPresenca').value;
    const hoje = new Date().toISOString().split("T")[0];

    const confirmarESalvar = () => {
      const checkboxes = document.querySelectorAll('[id^="cb-"]');
      const presentes = [];

      const horaRegistro = new Date().toLocaleTimeString();

      checkboxes.forEach((cb) => {
        if (cb.checked) {
          const nome = cb.dataset.nome;
          const hora = new Date().toLocaleTimeString();
          const fotoUrl = cb.dataset.foto || "";
          presentes.push({ nome, data: dataInput, hora, fotoUrl });
        }
      });

      const atividade = document.getElementById('selectAtividade').value;

      const payload = {
        nome: atividade,
        dataRegistro: dataInput,
        horaRegistro: horaRegistro,
        presentes: presentes
      };

      axios.post("http://localhost:8080/atividades", payload)
        .then(() => {
          const detalhes = presentes.map(p => `✓ ${p.nome} (${p.hora})`).join('<br>');
          mostrarPopupGlobal({
            titulo: "Presenças Registradas",
            mensagem: detalhes || "Nenhum presente registrado.",
            icone: "check-circle",
            confirmarTexto: "Fechar"
          });
        })
        .catch(err => {
          console.error("Erro ao salvar presença:", err);
          mostrarPopupGlobal({
            titulo: "Erro ao Salvar",
            mensagem: "Não foi possível salvar a presença.",
            icone: "x-circle"
          });
        });
    };

    if (dataInput < hoje) {
      mostrarPopupGlobal({
        titulo: "Data Anterior",
        mensagem: `Você escolheu uma data anterior ao dia de hoje (${formatarDataBr(dataInput)}). <br>Deseja continuar?`,
        icone: "alert-triangle",
        confirmarTexto: "Sim",
        cancelarTexto: "Cancelar",
        inverterBotoes: true,
        onConfirm: confirmarESalvar
      });
    } else if (dataInput > hoje) {
      mostrarPopupGlobal({
        titulo: "Data Posterior",
        mensagem: `Você escolheu uma data após o dia de hoje (${formatarDataBr(dataInput)}). <br>Deseja continuar?`,
        icone: "alert-triangle",
        confirmarTexto: "Sim",
        cancelarTexto: "Cancelar",
        inverterBotoes: true,
        onConfirm: confirmarESalvar
      });
    } else {
      confirmarESalvar();
    }
  }



  function consultarPresenca() {
    const data = document.getElementById('dataPresenca').value;
    const atividade = document.getElementById('selectAtividade').value;

    axios.get("http://localhost:8080/atividades", {
      params: { data: data, nome: atividade }
    })
      .then(res => {
        const lista = res.data;

        if (lista.length === 0) {
          mostrarPopupGlobal({
            titulo: "Consulta",
            mensagem: "Nenhum registro encontrado.",
            icone: "info",
            confirmarTexto: "Fechar",
            cancelarTexto: "",
            onConfirm: () => {
              document.getElementById("popupGlobal").classList.add("hidden");
            }
          });
          return;
        }

        const ult = lista[lista.length - 1];
        const nomes = ult.presentes || [];

        let conteudoHTML = "";

        if (nomes.length === 0) {
          conteudoHTML = `
            <div class="text-center text-[#3D1F0C] font-semibold py-10">
              Nenhuma presença registrada para este dia.
            </div>
          `;
        } else {
          conteudoHTML = nomes.map((p, i) => `
            <div class="flex justify-between items-center border-b py-1">
              <span class="text-[#3D1F0C] cursor-pointer hover:underline"
                    onmouseenter="mostrarTooltipFoto(event, '${p.fotoUrl || ''}')"
                    onmouseleave="ocultarTooltipFoto()">
                ✓ ${p.nome} (${p.hora})
              </span>
              <button onclick="removerPresenca('${ult.id}', '${p.nome}')" class="text-red-600 hover:text-red-800">
                <i data-lucide="x-circle" class="w-4 h-4"></i>
              </button>
            </div>
          `).join('');
        }

        document.getElementById('conteudoPresenca').innerHTML = conteudoHTML;
        document.querySelector('#popupPresenca h2').innerHTML = `Presenças - ${formatarDataBr(data)}`;
        document.getElementById('popupPresenca').classList.remove('hidden');
        lucide.createIcons();
      })
      .catch(err => {
        console.error("Erro ao consultar presença:", err);
        mostrarPopupGlobal({
          titulo: "Erro",
          mensagem: "Erro ao consultar os registros do banco.",
          icone: "alert-triangle",
          confirmarTexto: "Fechar",
          cancelarTexto: "",
          inverterBotoes: true,
          onConfirm: () => {
            document.getElementById("popupGlobal").classList.add("hidden");
          }
        });
      });
  }





  window.removerPresenca = function (atividadeId, nome) {
    mostrarPopupGlobal({
      titulo: "Remover Presença",
      mensagem: `Deseja realmente remover <strong>${nome}</strong> da lista de presença?`,
      icone: "x-octagon",
      confirmarTexto: "Sim, remover",
      cancelarTexto: "Cancelar",
      inverterBotoes: true,
      onConfirm: () => {
        axios.get(`http://localhost:8080/atividades/${atividadeId}`)
          .then(res => {
            const atividade = res.data;
            atividade.presentes = atividade.presentes.filter(p => p.nome !== nome);
            axios.post("http://localhost:8080/atividades", atividade)
              .then(() => {
                consultarPresenca();
              });
          });
      },
      onCancel: () => {
        // Nenhuma ação extra além de fechar o popup
        document.getElementById("popupGlobal").classList.add("hidden");
      }
    });
  };



  function inicializarRegistroDiario() {
    document.getElementById('dataPresenca').value = new Date().toISOString().split('T')[0];

    document.getElementById('btnNovaAtividade').onclick = () => {
      mostrarPopupGlobal({
        titulo: "Nova Atividade",
        mensagem: `
          <div class="space-y-3">
            <input id="popupInputAtividade"
                   type="text"
                   placeholder="Digite o nome da nova atividade"
                   class="w-full p-2 border rounded text-sm" />
          </div>
        `,
        icone: "plus-circle",
        confirmarTexto: "Criar",
        cancelarTexto: "Cancelar",
        inverterBotoes: true,
        onConfirm: () => {
          const nova = document.getElementById('popupInputAtividade').value.trim();
          if (nova && !atividades.includes(nova)) {
            const hoje = new Date();
            const data = hoje.toISOString().split('T')[0];
            const hora = hoje.toLocaleTimeString();

            axios.post("http://localhost:8080/atividades", {
              nome: nova,
              dataRegistro: data,
              horaRegistro: hora,
              presentes: []
            }).then(() => {
              atividades.push(nova);
              preencherAtividades();
              renderPresencas();
            });
          }
        }
      });
    };

    document.getElementById('btnExcluirAtividade').onclick = () => {
      const nome = document.getElementById('selectAtividade').value;
      mostrarPopupGlobal({
        titulo: "Excluir Atividade",
        mensagem: `Deseja realmente excluir a atividade <strong>${nome}</strong>?`,
        icone: "trash-2",
        confirmarTexto: "Confirmar",
        cancelarTexto: "Cancelar",
        inverterBotoes: true,
        onConfirm: () => {
          const idx = atividades.indexOf(nome);
          if (idx !== -1) {
            atividades.splice(idx, 1);
            preencherAtividades();
            renderPresencas();
          }
        }
      });
    };

    document.getElementById('btnSalvarPresencaAtividade').onclick = salvarPresencas;
    document.getElementById('btnConsultarPresenca').onclick = consultarPresenca;
    document.getElementById('selectAtividade').onchange = renderPresencas;
    document.getElementById('dataPresenca').onchange = renderPresencas;

    carregarIdosos();
    carregarAtividadesDoBanco();
    lucide.createIcons();
  }




  function preencherAtividades() {
    const select = document.getElementById('selectAtividade');
    select.innerHTML = atividades.map(nome => `<option value="${nome}">${nome}</option>`).join('');
  }

  function renderPresencas() {
    const area = document.getElementById('areaPresenca');
    if (!area || idosos.length === 0) return;

    const grid = idosos.map((idoso, i) => `
      <div class="m-2 flex flex-col items-center bg-white p-5 rounded-xl shadow-md border border-[#3D1F0C] w-[221px] cursor-pointer transition hover:bg-[#f5ece3]">

        <!-- FOTO + ÍCONE -->
        <div class="relative w-24 h-24 mb-3" onclick="event.stopPropagation(); abrirImagemPopup('${idoso.fotoUrl || 'https://via.placeholder.com/600'}')">
          <img src="${idoso.fotoUrl || 'https://via.placeholder.com/60'}"
               alt="${idoso.nome}"
               class="w-full h-full object-cover rounded-full border border-[#3D1F0C] transition duration-200 hover:brightness-75 cursor-pointer" />
          <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition duration-200">
            <i data-lucide="eye" class="text-white w-7 h-7 cursor-pointer"></i>
          </div>
        </div>

        <!-- NOME + CHECKBOX -->
        <label for="cb-${i}" class="flex flex-col items-center w-full cursor-pointer">
          <span class="text-[14px] text-[#3D1F0C] font-medium leading-snug text-center break-words">
            ${idoso.nome}
          </span>
          <input type="checkbox"
                 id="cb-${i}"
                 data-nome="${idoso.nome}"
                 data-foto="${idoso.fotoUrl || ''}"
                 class="mt-3 w-7 h-7 text-[#3D1F0C]" />
        </label>
      </div>
    `).join('');

    area.innerHTML = `
      <div class="w-full flex justify-center">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8 px-6">
          ${grid}
        </div>
      </div>
    `;
    lucide.createIcons();
  }


  window.abrirImagemPopup = function (url) {
    const popup = document.getElementById('popupImagem');
    const container = document.getElementById('popupImagemContainer');
    const img = document.getElementById('popupImagemFoto');

    img.src = url;
    popup.classList.remove('hidden');
    container.classList.remove('animate-fade-out');
    container.classList.add('animate-fade-in');
    lucide.createIcons();
  };

  window.fecharImagemPopup = function (event) {
    const popup = document.getElementById('popupImagem');
    const container = document.getElementById('popupImagemContainer');

    if (!event || event.target === popup || event.target.closest('button')) {
      container.classList.remove('animate-fade-in');
      container.classList.add('animate-fade-out');
      setTimeout(() => {
        popup.classList.add('hidden');
      }, 200); // mesmo tempo da animação
    }
  };

  function carregarIdosos() {
    axios.get("http://localhost:8080/idosos")
      .then(res => {
        idosos = res.data.map(i => ({
          nome: i.nome,
          fotoUrl: i.fotoUrl
        }));
        renderPresencas();
      })
      .catch(err => {
        console.error("Erro ao buscar idosos:", err);
        mostrarPopupGlobal({
          titulo: "Erro",
          mensagem: "Não foi possível carregar a lista de idosos.",
          icone: "alert-triangle"
        });
      });
  }

  function carregarAtividadesDoBanco() {
    axios.get("http://localhost:8080/atividades")
      .then(res => {
        const nomesUnicos = new Set(res.data.map(a => a.nome));
        atividades = Array.from(nomesUnicos);
        preencherAtividades();
        renderPresencas();
      });
  }

  // FUNÇÃO PARA FILTRAR A EXIBIÇÃO DOS IDOSOS NO REGISTRO DIÁRIO
  window.filtrarPresencas = function () {
    const termo = document.getElementById("inputBuscaPresenca").value.toLowerCase();
    const cards = document.querySelectorAll("#areaPresenca .grid > div");

    cards.forEach(card => {
      const nome = card.querySelector("label span").textContent.toLowerCase();
      if (nome.includes(termo)) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  };


  window.inicializarRegistroDiario = inicializarRegistroDiario;
})();
