    lucide.createIcons();

    function abrirPopupSenha() {
    	document.getElementById("popupSenha").classList.remove("hidden");
    	document.getElementById("formSenha").reset();
    	document.getElementById("codigoContainer").classList.add("hidden");
    	document.getElementById("msgCodigo").classList.add("hidden");
    	lucide.createIcons();
    }

    function fecharPopupSenha() {
    	document.getElementById("popupSenha").classList.add("hidden");
    }

    function aplicarFiltros() {
    	const sexo = document.getElementById('filtroSexo').value;
    	const idade = document.getElementById('filtroIdade').value;
    	const status = document.getElementById('filtroStatus').value;

    	document.querySelectorAll('#cardsIdosos > div[data-nome]').forEach(card => {
    		const sexoIdoso = card.getAttribute('data-sexo');
    		const idadeIdoso = parseInt(card.getAttribute('data-idade'));
    		const statusIdoso = card.getAttribute('data-status') || "Ativo";

    		let exibir = true;

    		if (sexo && sexo !== sexoIdoso) exibir = false;

    		if (idade) {
    			if (idade === "60-70" && !(idadeIdoso >= 60 && idadeIdoso <= 70)) exibir = false;
    			if (idade === "71-80" && !(idadeIdoso >= 71 && idadeIdoso <= 80)) exibir = false;
    			if (idade === "81+" && idadeIdoso < 81) exibir = false;
    		}

    		if (status && status !== statusIdoso) exibir = false;

    		card.style.display = exibir ? "flex" : "none";
    	});

    	fecharFiltro();
    }

    function fecharFiltro() {
    	document.getElementById('popupFiltro').classList.add('hidden');
    }

    function exibirPopup(nome) {
    	document.getElementById("popupExclusao").classList.remove("hidden");
    	document.getElementById("nomeIdosoExcluir").innerText = nome;
    }

    function fecharPopup() {
    	document.getElementById("popupExclusao").classList.add("hidden");
    }

    function abrirFiltro() {
    	document.getElementById('popupFiltro').classList.remove('hidden');
    }

    function funcao1() {
      const container = document.getElementById("cardsIdosos");
      container.classList.remove("hidden");

      fetch("html/dashboard.html")
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;

          if (!window.__dashboardJsCarregado) {
            const s = document.createElement("script");
            s.src = "js/dashboard.js";
            s.onload = () => {
              window.__dashboardJsCarregado = true;
              window.carregarDashboard?.();
            };
            document.body.appendChild(s);
          } else {
            window.carregarDashboard?.();
          }
        })
        .catch(err => {
          console.error("Erro ao carregar dashboard.html", err);
          alert("Erro ao carregar painel.");
        });
    }


    function funcao2() {
      const container = document.getElementById('cardsIdosos');
      const grid = document.getElementById('idososGrid');

      if (!container) return;

      // evita piscar caso já esteja carregado
      container.classList.remove('hidden');

      // carrega fragmento HTML
      fetch('html/idosos.html')
        .then(r => r.text())
        .then(htmlFrag => {
          container.innerHTML = htmlFrag;

          // carrega lógica apenas 1ª vez
          if (!window.__idososJsCarregado) {
            const s = document.createElement('script');
            s.src = 'js/idosos.js';
            s.onload = () => {
              window.__idososJsCarregado = true;
              window.initIdosos?.();
              animarGrid();
            };
            document.body.appendChild(s);
          } else {
            window.initIdosos?.(); // já carregado: só reinicia grade
            animarGrid();
          }
        })
        .catch(err => {
          console.error('Erro ao carregar idosos.html', err);
          alert('Não foi possível carregar a lista de idosos.');
        });

      function animarGrid() {
        const grid = document.getElementById('idososGrid');
        if (grid) {
          grid.classList.remove('hidden');
          grid.classList.add('animate-fade-in');
          setTimeout(() => grid.classList.remove('animate-fade-in'), 300);
        }
      }
    }

    function funcao3() {
      const container = document.getElementById('cardsIdosos');
      container.classList.remove('hidden');

      fetch("html/cardapio.html")
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;

          if (!window.__cardapioJsCarregado) {
            const s = document.createElement("script");
            s.src = "js/cardapio.js";
            s.onload = () => {
              window.__cardapioJsCarregado = true;
              window.inicializarCardapioSemanal?.();
            };
            document.body.appendChild(s);
          } else {
            window.inicializarCardapioSemanal?.();
          }
        })
        .catch(err => {
          console.error("Erro ao carregar cardapio.html", err);
          alert("Erro ao carregar cardápio.");
        });
    }


    function funcao4() {
      const container = document.getElementById('cardsIdosos');
      container.classList.remove('hidden');

      fetch('html/registroDiario.html')
        .then(r => r.text())
        .then(html => {
          container.innerHTML = html;

          if (!window.__registroDiarioJsCarregado) {
            const s = document.createElement('script');
            s.src = 'js/registroDiario.js';
            s.onload = () => {
              window.__registroDiarioJsCarregado = true;
              window.inicializarRegistroDiario(); // garante que executa após o HTML estar pronto
            };
            document.body.appendChild(s);
          } else {
            window.inicializarRegistroDiario(); // se já carregou antes, só chama de novo
          }
        });
    }

    function funcao5() {
      const container = document.getElementById("cardsIdosos");
      container.classList.remove("hidden");

      fetch("relatorioMensal.html")
        .then(res => res.text())
        .then(html => {
          container.innerHTML = html;
          lucide.createIcons();

          const script = document.createElement("script");
          script.src = "js/relatorioMensal.js";
          document.body.appendChild(script);
        });
    }




    function mostrarPopupGlobal({
      titulo,
      mensagem,
      icone = "info",
      confirmarTexto = "Fechar",
      cancelarTexto = "",           // Novo
      inverterBotoes = false,       // Novo
      onConfirm,
      onCancel
    }) {
      const popup = document.getElementById("popupGlobal");
      const tituloEl = document.getElementById("popupTitulo");
      const mensagemEl = document.getElementById("popupMensagem");
      const confirmarBtn = document.getElementById("popupConfirmarBtn");
      const cancelarBtn = document.getElementById("popupCancelarBtn");
      const box = document.getElementById("popupBox");

      if (!popup || !tituloEl || !mensagemEl || !confirmarBtn || !cancelarBtn || !box) {
        console.warn("⚠️ Popup Global não está disponível.");
        return;
      }

      tituloEl.innerHTML = `<i data-lucide="${icone}" class="w-5 h-5"></i> ${titulo}`;
      mensagemEl.innerHTML = mensagem;
      confirmarBtn.textContent = confirmarTexto;
      cancelarBtn.textContent = cancelarTexto;

      // Exibe ou oculta botão de cancelar
      if (cancelarTexto) {
        cancelarBtn.classList.remove("hidden");
      } else {
        cancelarBtn.classList.add("hidden");
      }

      // Define a ordem dos botões
      const botoes = inverterBotoes && cancelarTexto
        ? [confirmarBtn, cancelarBtn]
        : cancelarTexto
          ? [cancelarBtn, confirmarBtn]
          : [confirmarBtn];

      const container = confirmarBtn.parentElement;
      container.innerHTML = "";
      botoes.forEach(btn => container.appendChild(btn));

      // Ações dos botões
      confirmarBtn.onclick = () => {
        popup.classList.add("hidden");
        if (onConfirm) onConfirm();
      };

      cancelarBtn.onclick = () => {
        popup.classList.add("hidden");
        if (onCancel) onCancel();
      };

      popup.classList.remove("hidden");
      box.classList.add("animate-fade-in");
      setTimeout(() => box.classList.remove("animate-fade-in"), 300);
      lucide.createIcons();
    }

    window.mostrarTooltipFoto = function (event, url) {
      if (!url) return;

      const tooltip = document.getElementById("tooltipFoto");
      const img = document.getElementById("tooltipFotoImg");

      img.src = url;

      const mouseX = event.clientX;
      const mouseY = event.clientY;
      tooltip.style.left = `${mouseX + 10}px`;
      tooltip.style.top = `${mouseY - 10}px`;

      tooltip.classList.remove("hidden");
    };

    window.ocultarTooltipFoto = function () {
      document.getElementById("tooltipFoto").classList.add("hidden");
    };






    function mostrarTooltipFoto(event, fotoUrl) {
      const tooltip = document.getElementById("tooltipFoto");
      const img = document.getElementById("tooltipFotoImg");

      img.src = fotoUrl;
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const offsetX = 10;
      const offsetY = -20;

      tooltip.style.left = `${mouseX + offsetX}px`;
      tooltip.style.top = `${mouseY + offsetY}px`;
      tooltip.classList.remove("hidden");
    }

    function ocultarTooltipFoto() {
      document.getElementById("tooltipFoto").classList.add("hidden");
    }







    function fecharPopupGlobal() {
      document.getElementById("popupGlobal").classList.add("hidden");
    }

    function abrirPopupRegistro() {
    	document.getElementById("popupRegistro").classList.remove("hidden");
    	lucide.createIcons();
    }

    function fecharPopupRegistro() {
    	document.getElementById("popupRegistro").classList.add("hidden");
    }

    function abrirCadastroIdoso() {
      let tentouAbrir = false;

      const tentarAbrir = () => {
        if (typeof window.abrirCadastroIdoso === "function" && !tentouAbrir) {
          tentouAbrir = true;
          window.abrirCadastroIdoso();
        }
      };

      // Força carregar a aba de idosos
      const container = document.getElementById('cardsIdosos');
      container.classList.remove('hidden');

      fetch('html/idosos.html')
        .then(r => r.text())
        .then(htmlFrag => {
          container.innerHTML = htmlFrag;

          if (!window.__idososJsCarregado) {
            const s = document.createElement('script');
            s.src = 'js/idosos.js';
            s.onload = () => {
              window.__idososJsCarregado = true;
              window.initIdosos?.();
              tentarAbrir(); // agora sim, garantido após o carregamento
            };
            document.body.appendChild(s);
          } else {
            window.initIdosos?.();
            tentarAbrir();
          }
        })
        .catch(err => {
          console.error('Erro ao carregar idosos.html', err);
          alert('Não foi possível carregar a lista de idosos.');
        });
    }

    window.codigos = function () {
      if (document.getElementById("popupCodigos")) return;

      const popup = document.createElement("div");
      popup.id = "popupCodigos";
      popup.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";

      popup.innerHTML = `
        <div class="bg-white p-6 rounded-xl w-full max-w-md border-4 border-[#3D1F0C] text-[#3D1F0C] animate-fade-in space-y-5">
          <h2 class="text-xl font-bold flex items-center gap-2"><i data-lucide="code"></i> Comandos de Teste</h2>

          <div class="space-y-4 text-sm">
            <div>
              <label class="font-semibold block mb-1">Gerar idosos aleatórios</label>
              <input type="number" id="inputQtdGerar" placeholder="Quantidade" min="1"
                     class="w-full border p-2 rounded bg-[#fdf9f6]" />
            </div>

            <div>
              <label class="font-semibold block mb-1">Excluir idosos (quantidade)</label>
              <input type="number" id="inputQtdDeletar" placeholder="Ex: 3" min="1"
                     class="w-full border p-2 rounded bg-[#fdf9f6]" />
            </div>

            <div>
              <button onclick="randomizarTodosIdosos()" class="bg-[#3D1F0C] text-white px-4 py-2 rounded font-semibold hover:bg-[#2c1609] w-full">
                Randomizar Todos os Idosos Existentes
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button onclick="aplicarComandosCodigo()" class="bg-[#3D1F0C] text-white px-5 py-2 rounded font-semibold hover:bg-[#2c1609]">
              Aplicar
            </button>
            <button onclick="document.getElementById('popupCodigos').remove()" class="bg-white border border-[#3D1F0C] text-[#3D1F0C] px-5 py-2 rounded font-semibold hover:bg-gray-100">
              Fechar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(popup);
      lucide.createIcons();
    };


    window.executarComandoCodigo = function () {
      const valor = document.getElementById("inputComandoCodigo").value.trim();
      if (!valor) return;

      if (valor.startsWith("/geraridoso")) {
        const qtd = parseInt(valor.split(" ")[1]) || 1;
        gerarVariosIdosos(qtd);
      }

      else if (valor.startsWith("/deletaridoso")) {
        const arg = valor.split(" ")[1];
        if (arg === "all") {
          deletarTodosIdosos();
        } else {
          const qtd = parseInt(arg) || 1;
          deletarAlgunsIdosos(qtd);
        }
      }
    };

    window.gerarVariosIdosos = function (quantidade = 1) {
      const loop = async () => {
        for (let i = 0; i < quantidade; i++) {
          await new Promise(resolve => setTimeout(resolve, 150));
          await gerarIdosoFake(true);
        }
        initIdosos();
      };
      loop();
    };

    window.deletarAlgunsIdosos = async function (quantidade) {
      try {
        const { data } = await axios.get("http://localhost:8080/idosos");
        const deletar = data.slice(0, quantidade);
        for (const idoso of deletar) {
          await axios.delete(`http://localhost:8080/idosos/${idoso.id}`);
        }
        initIdosos();
      } catch (e) {
        alert("Erro ao deletar.");
      }
    };

    window.deletarTodosIdosos = async function () {
      try {
        const { data } = await axios.get("http://localhost:8080/idosos");
        for (const idoso of data) {
          await axios.delete(`http://localhost:8080/idosos/${idoso.id}`);
        }
        initIdosos();
      } catch (e) {
        alert("Erro ao deletar todos.");
      }
    };

    window.randomizarTodosIdosos = async function () {
      try {
        const { data } = await axios.get("http://localhost:8080/idosos");
        for (const antigo of data) {
          const fake = gerarIdosoObjFake();
          fake.fotoUrl = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 90)}.jpg`;
          fake.inativo = antigo.inativo;
          fake.falecido = antigo.falecido;
          await axios.put(`http://localhost:8080/idosos/${antigo.id}`, fake);
        }
        initIdosos();
      } catch (e) {
        alert("Erro ao randomizar todos.");
      }
    };

    window.codigos = function () {
      if (document.getElementById("popupCodigos")) return;

      const popup = document.createElement("div");
      popup.id = "popupCodigos";
      popup.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";

      popup.innerHTML = `
        <div class="bg-white p-6 rounded-xl w-full max-w-md border-4 border-[#3D1F0C] text-[#3D1F0C] animate-fade-in space-y-5">
          <h2 class="text-xl font-bold flex items-center gap-2"><i data-lucide="code"></i> Comandos de Teste</h2>

          <div class="space-y-4 text-sm">
            <div>
              <label class="font-semibold block mb-1">Gerar idosos aleatórios</label>
              <input type="number" id="inputQtdGerar" placeholder="Ex: 5" min="1"
                     class="w-full border p-2 rounded bg-[#fdf9f6]" />
            </div>

            <div>
              <label class="font-semibold block mb-1">Deletar idosos (quantidade)</label>
              <input type="number" id="inputQtdDeletar" placeholder="Ex: 3" min="1"
                     class="w-full border p-2 rounded bg-[#fdf9f6]" />
            </div>

            <div>
              <button onclick="randomizarTodosIdosos()" class="bg-[#3D1F0C] text-white px-4 py-2 rounded font-semibold hover:bg-[#2c1609] w-full">
                Randomizar Todos os Idosos Existentes
              </button>
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button onclick="aplicarComandosCodigo()" class="bg-[#3D1F0C] text-white px-5 py-2 rounded font-semibold hover:bg-[#2c1609]">
              Aplicar
            </button>
            <button onclick="document.getElementById('popupCodigos').remove()" class="bg-white border border-[#3D1F0C] text-[#3D1F0C] px-5 py-2 rounded font-semibold hover:bg-gray-100">
              Fechar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(popup);
      lucide.createIcons();
    };


    window.aplicarComandosCodigo = async function () {
      const qtdGerarEl = document.getElementById("inputQtdGerar");
      const qtdDeletarEl = document.getElementById("inputQtdDeletar");

      const qtdGerar = qtdGerarEl ? parseInt(qtdGerarEl.value) : 0;
      const qtdDeletar = qtdDeletarEl ? parseInt(qtdDeletarEl.value) : 0;

      if (qtdGerar > 0) {
        for (let i = 0; i < qtdGerar; i++) {
          await gerarIdosoFake();
        }
      }

      if (qtdDeletar > 0) {
        const { data } = await axios.get("http://localhost:8080/idosos");
        const deletar = data.slice(0, qtdDeletar);
        for (const idoso of deletar) {
          await axios.delete(`http://localhost:8080/idosos/${idoso.id}`);
        }
      }

      initIdosos();
      document.getElementById("popupCodigos")?.remove();
    };






    Object.assign(window, { abrirCadastroIdoso });




Object.assign(window, {
  funcao1, funcao2, funcao3, funcao4, funcao5,
  abrirPopupSenha, fecharPopupSenha,
  abrirPopupRegistro, fecharPopupRegistro,
  // ... outras funções do painel
});
