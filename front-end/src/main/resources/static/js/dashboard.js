window.carregarDashboard = function () {
  const container = document.getElementById("cardsIdosos");
  container.classList.remove("hidden");

  fetch("html/dashboard.html")
    .then((res) => res.text())
    .then((html) => {
      container.innerHTML = html;
      renderizarPainelAdmin();
    })
    .catch((err) => {
      console.error("Erro ao carregar dashboard", err);
      alert("Erro ao carregar painel.");
    });
};

function renderizarPainelAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuarioAtual") || "{}");
  const nomeUsuario = usuario.nome || "Usuário";
  const ehAdmin = usuario.administrador === true;

  const container = document.getElementById("dashboardContainer");
  container.innerHTML = `
    <!-- TOPO (sem animação) -->
    <div class="bg-[#3D1F0C] text-white rounded-xl px-6 py-5 shadow flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <i data-lucide="home" class="w-6 h-6"></i>
        <div>
          <h1 class="text-2xl font-bold">Painel de Administração</h1>
          <p class="text-sm opacity-80">Acesso restrito para gestores</p>
        </div>
      </div>
      <div class="text-center">
        <span class="block text-sm font-semibold">${nomeUsuario}</span>
        <span class="block text-xs opacity-80">${ehAdmin ? "Administrador" : "Colaborador"}</span>
      </div>
    </div>

    <!-- TUDO ABAIXO COM ANIMAÇÃO -->
    <div class="space-y-6 animate-fade-in">
      <!-- MÉTRICAS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white shadow rounded-xl p-5 text-center">
          <h2 class="text-2xl font-bold text-[#3D1F0C]" id="qtdIdosos">--</h2>
          <p class="text-sm">Idosos cadastrados</p>
        </div>
        <div class="bg-white shadow rounded-xl p-5 text-center">
          <h2 class="text-2xl font-bold text-[#3D1F0C]" id="qtdAniversariantes">--</h2>
          <p class="text-sm">Aniversariantes do mês</p>
        </div>
        <div class="bg-white shadow rounded-xl p-5 text-center">
          <h2 class="text-2xl font-bold text-[#3D1F0C]" id="qtdAtividades">--</h2>
          <p class="text-sm">Atividades Cadastradas</p>
        </div>
        <div class="bg-white shadow rounded-xl p-5 text-center">
          <h2 class="text-2xl font-bold text-[#3D1F0C]" id="qtdColaboradores">--</h2>
          <p class="text-sm">Colaboradores</p>
        </div>
      </div>

      <!-- CARDÁPIO -->
      <div class="bg-white shadow rounded-xl p-6">
        <h2 class="text-lg font-bold text-[#3D1F0C] mb-2 flex items-center gap-2">
          <i data-lucide="utensils" class="w-5 h-5"></i> Cardápio de hoje
        </h2>
        <div class="text-sm text-[#3D1F0C] space-y-1" id="cardapioHoje"></div>
      </div>

      <!-- ANIVERSARIANTES -->
      <div class="bg-white shadow rounded-xl p-6">
        <h2 class="text-lg font-bold text-[#3D1F0C] mb-2 flex items-center gap-2">
          <i data-lucide="cake" class="w-5 h-5"></i> Aniversariantes do mês
        </h2>
        <div class="text-sm text-[#3D1F0C] space-y-1" id="aniversariantesHoje"></div>
      </div>

      <!-- ATIVIDADES -->
      <div class="bg-white shadow rounded-xl p-6">
        <h2 class="text-lg font-bold text-[#3D1F0C] mb-3 flex items-center gap-2">
          <i data-lucide="alert-circle" class="w-5 h-5"></i> Atividades Cadastradas
        </h2>
        <ul class="text-sm text-[#3D1F0C] space-y-2 list-disc pl-5" id="atividadesHoje"></ul>
      </div>

      <!-- BOTÕES -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <button onclick="abrirCadastroIdoso()" class="bg-[#3D1F0C] hover:bg-[#2c1609] text-white font-semibold py-3 rounded-md shadow flex items-center justify-center gap-2">
          <i data-lucide="user-plus" class="w-4 h-4"></i> Novo Cadastro
        </button>
        <button onclick="funcao2()" class="bg-white border border-[#3D1F0C] text-[#3D1F0C] hover:bg-[#e5d2bd] font-semibold py-3 rounded-md shadow flex items-center justify-center gap-2">
          <i data-lucide="users" class="w-4 h-4"></i> Ver todos os idosos
        </button>
        <button onclick="funcao3()" class="bg-white border border-[#3D1F0C] text-[#3D1F0C] hover:bg-[#e5d2bd] font-semibold py-3 rounded-md shadow flex items-center justify-center gap-2">
          <i data-lucide="utensils" class="w-4 h-4"></i> Cardápio semanal
        </button>
      </div>

      <!-- FRASE FINAL -->
      <div class="text-center text-white mt-10 italic text-sm opacity-80">
        “Cuidar do próximo é um ato de amor que transforma vidas.” 🤍
      </div>
    </div>

    <!-- TOOLTIPS (fora da animação) -->
    <div id="tooltipFoto" class="hidden fixed z-50 bg-white border border-[#3D1F0C] rounded-full shadow-lg w-32 h-32 overflow-hidden pointer-events-none transition-all duration-150 ease-out">
      <img id="tooltipFotoImg" src="" alt="Foto" class="w-full h-full object-cover" />
    </div>

    <div id="tooltipPresencas" class="hidden fixed z-50 bg-white border border-[#3D1F0C] text-[#3D1F0C] rounded-lg shadow-xl p-4 text-sm w-64 pointer-events-none transition-all duration-150 ease-out">
      <h2 class="font-bold text-[#3D1F0C] mb-2">Últimas presenças</h2>
      <ul id="tooltipConteudo" class="space-y-1"></ul>
    </div>
  `;

  lucide.createIcons();
  carregarDadosDoPainel();
}



function carregarDadosDoPainel() {
  axios.get("/idosos/quantidade")
    .then(r => document.getElementById("qtdIdosos").innerText = r.data);

  axios.get("/idosos/aniversariantes-do-mes").then(r => {
    const div = document.getElementById("aniversariantesHoje");
    document.getElementById("qtdAniversariantes").innerText = r.data.length;

    if (r.data.length === 0) {
      div.innerHTML = "<p>Nenhum aniversariante este mês.</p>";
      return;
    }

    div.innerHTML = r.data.map(pessoa => {
      let dia = "??";
      try {
        const [ano, mes, diaStr] = pessoa.dataNascimento.split("-");
        dia = `${diaStr}/${mes}`;
      } catch (e) {}

      const foto = pessoa.fotoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

      return `
        <p class="text-sm text-[#3D1F0C]">
          🎂 <strong
            class="cursor-pointer hover:underline"
            onmouseenter="mostrarTooltipFoto(event, '${foto}')"
            onmouseleave="ocultarTooltipFoto()"
          >
            ${pessoa.nome}
          </strong> – ${dia}
        </p>
      `;
    }).join("");
  });


  axios.get("/usuarios/quantidade")
    .then(r => document.getElementById("qtdColaboradores").innerText = r.data);

  axios.get("/cardapio/hoje").then(r => {
    const div = document.getElementById("cardapioHoje");
    const cafe = r.data?.cafe?.prato || "Não informado";
    const almoco = r.data?.almoco?.prato || "Não informado";
    const jantar = r.data?.jantar?.prato || "Não informado";

    div.innerHTML = `
      <p><strong>Café da manhã:</strong> ${cafe}</p>
      <p><strong>Almoço:</strong> ${almoco}</p>
      <p><strong>Jantar:</strong> ${jantar}</p>
    `;
  });

  axios.get("/atividades/hoje").then(r => {
    const atividades = r.data;
    const ul = document.getElementById("atividadesHoje");
    const qtd = atividades.length;

    document.getElementById("qtdAtividades").innerText = qtd;

    if (qtd === 0) {
      ul.innerHTML = "<li>Nenhuma atividade registrada.</li>";
      return;
    }

    ul.innerHTML = atividades.map(a => {
      const nome = a.nome || "Sem nome";
      return `
        <li>
           <span
            class="hover:underline cursor-pointer text-[#3D1F0C]"
            onmouseenter="mostrarTooltipPresencas(event, ${a.id})"
            onmouseleave="ocultarTooltipPresencas()"
          >${nome}</span>
        </li>
      `;
    }).join("");
  });
}

function mostrarTooltipPresencas(event, atividadeId) {
  const tooltip = document.getElementById("tooltipPresencas");
  const conteudo = document.getElementById("tooltipConteudo");

  axios.get(`/atividades/${atividadeId}`).then(res => {
    const lista = res.data.presentes || [];

    conteudo.innerHTML = lista.length
      ? lista.map(p => `<li>• ${p.nome}</li>`).join("")
      : "<li>Nenhuma presença registrada.</li>";

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const offsetX = 1;
    const offsetY = -20;

    tooltip.style.left = `${mouseX + offsetX}px`;
    tooltip.style.top = `${mouseY + offsetY}px`;
    tooltip.classList.remove("hidden");
  });
}

function ocultarTooltipPresencas() {
  document.getElementById("tooltipPresencas").classList.add("hidden");
}



Object.assign(window, { carregarDashboard });
