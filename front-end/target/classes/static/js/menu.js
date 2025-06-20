(function () {

  function obterUsuarioLocal() {
    const direto = localStorage.getItem("usuarioLogado");
    if (direto) return direto;

    try {
      const obj = JSON.parse(localStorage.getItem("usuarioAtual") || "{}");
      return obj.usuario || null;
    } catch {
      return null;
    }
  }

function initPerfilPopup() {
  const perfilFoto  = document.getElementById("perfilFoto");
  const popupPerfil = document.getElementById("popupPerfil");
  if (!perfilFoto || !popupPerfil) return;
  if (perfilFoto.dataset.popupInit === "ok") return;

  perfilFoto.dataset.popupInit = "ok";
  lucide.createIcons();

  const fotoWrapper = document.getElementById("fotoWrapper");
  const inputFoto   = document.getElementById("inputFoto");
  const popupFoto   = document.getElementById("popupFoto");
  const btnCancelar = document.getElementById("btnCancelar");
  const formPerfil  = document.getElementById("formPerfil");

  let fotoOriginal = null;
  let fotoTemp = null;

  perfilFoto.addEventListener("click", async () => {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) return;

    try {
      const { data } = await axios.get(`http://localhost:8080/perfil/${usuario}`);

      if (data.fotoUrl) {
        popupFoto.src  = data.fotoUrl;
        fotoOriginal   = data.fotoUrl;
      }

      document.getElementById("inputNome").value     = data.nome     || "";
      document.getElementById("inputEmail").value    = data.email    || "";
      document.getElementById("inputTelefone").value = data.telefone || "";

      abrirAnimado(popupPerfil);
    } catch (err) {
      console.error("Erro ao buscar dados do perfil:", err);
    }
  });

  btnCancelar.addEventListener("click", () => {
    popupFoto.src  = fotoOriginal;
    inputFoto.value = "";
    fotoTemp = null;
    fecharAnimado(popupPerfil);
  });

  fotoWrapper.addEventListener("click", () => inputFoto.click());

  inputFoto.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    const rd = new FileReader();
    rd.onload = ev => {
      popupFoto.src = ev.target.result;
      fotoTemp = ev.target.result;
    };
    rd.readAsDataURL(file);
  });

  formPerfil.addEventListener("submit", salvarPerfil);
}


  async function salvarPerfil(e) {
    e.preventDefault();
    const usuario = JSON.parse(localStorage.getItem("usuarioAtual")).usuario;
    const nome = document.getElementById("inputNome")?.value.trim() || "";
    const email = document.getElementById("inputEmail")?.value.trim() || "";
    const telefone = document.getElementById("inputTelefone")?.value.trim() || "";
    const fotoInput = document.getElementById("inputFoto");

    let fotoBase64 = null;
    if (fotoInput?.files?.length > 0) {
      const file = fotoInput.files[0];
      fotoBase64 = await toBase64(file);
    }

    const payload = { nome, email, telefone, fotoBase64 };

    try {
      const { data } = await axios.post(`http://localhost:8080/perfil/${usuario}`, payload);
      localStorage.setItem("usuarioAtual", JSON.stringify(data));
      fecharAnimado(document.getElementById("popupPerfil"));

      // 🔄 agora sim atualiza as fotos reais
      const url = data.fotoUrl?.trim();
      const fallback = "https://i.pravatar.cc/40?img=5";
      const imgTopo = document.getElementById("perfilFoto");
      const imgMenu = document.getElementById("avatarMenu");

      if (imgTopo) imgTopo.src = url && url !== "" ? url : fallback;
      if (imgMenu) imgMenu.src = url && url !== "" ? url : fallback;

      const nomeTopo = document.querySelector("#dashboardContainer span.font-semibold");
      if (nomeTopo) nomeTopo.textContent = data.nome || "Usuário";

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar perfil.");
    }

    mostrarPopupSucessoPerfil();

  }


  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  function carregarPerfil() {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) return;

    axios.get(`http://localhost:8080/perfil/${usuario}`)
      .then(res => {
        const data = res.data;
        localStorage.setItem("usuarioAtual", JSON.stringify(data));

        const url = data.fotoUrl?.trim();
        const fallback = "https://i.pravatar.cc/40?img=5";

        const imgTopo = document.getElementById("perfilFoto");
        const imgMenu = document.getElementById("avatarMenu");

        if (imgTopo) imgTopo.src = url && url !== "" ? url : fallback;
        if (imgMenu) imgMenu.src = url && url !== "" ? url : fallback;

      })
      .catch(err => {
        console.error("Erro ao carregar perfil:", err);
      });
  }

  async function verificarAniversariantes() {
    try {
      const { data } = await axios.get("http://localhost:8080/idosos/aniversariantes");
      if (!data || data.length === 0) return;

      const nomes = data.map(i => i.nome).join(", ");
      const mensagem = data.length === 1
        ? `🎂 Hoje é aniversário de ${nomes}!`
        : `🎉 Hoje é aniversário de: ${nomes}.`;

      mostrarNotificacao("Aniversariante(s) do Dia", mensagem);
    } catch (err) {
      console.error("Erro ao buscar aniversariantes:", err);
    }
  }

  async function verificarAniversariantesParaPainel() {
    try {
      const { data } = await axios.get("http://localhost:8080/idosos/aniversariantes");
      const container = document.getElementById("notificacoes");
      if (!container) return;

      container.innerHTML = "";
      if (!data || data.length === 0) return;

      data.forEach(idoso => {
        const idade = calcularIdade(idoso.dataNascimento);
        const card = document.createElement("div");
        card.className = "flex items-start gap-2";
        card.innerHTML = `
          <div class="w-1.5 h-5 mt-1 rounded-full bg-yellow-500"></div>
          <div class="text-sm">
            <p class="font-medium">Aniversariante do dia 🎉</p>
            <p>Hoje é aniversário de ${idoso.nome} (${idade} anos).</p>
          </div>
        `;
        container.appendChild(card);
      });

    } catch (err) {
      console.error("Erro ao buscar aniversariantes para painel:", err);
    }
  }

  async function verificarBadgeSino() {
    try {
      const { data } = await axios.get("http://localhost:8080/idosos/aniversariantes");
      const badge = document.getElementById("badgeSino");
      if (!badge) return;
      badge.classList.toggle("hidden", !(data && data.length > 0));
    } catch (e) {
      console.error("Erro ao verificar badge do sino:", e);
    }
  }

  function calcularIdade(dataNasc) {
    const hoje = new Date();
    const [ano, mes, dia] = dataNasc.split("-").map(Number);
    let idade = hoje.getFullYear() - ano;
    if (
      hoje.getMonth() + 1 < mes ||
      (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)
    ) {
      idade--;
    }
    return idade;
  }

  function mostrarNotificacao(titulo, corpo) {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(titulo, { body: corpo });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(titulo, { body: corpo });
        }
      });
    }
  }

  function mostrarNotificacoesReais() {
    axios.get("http://localhost:8080/idosos/aniversariantes")
      .then(({ data }) => {
        const html = (data && data.length > 0) ? `
          <div class="bg-white p-5 rounded-xl max-w-md w-full border-4 border-[#3D1F0C] shadow-xl animate-fade-in">
            <h2 class="text-lg font-bold text-[#3D1F0C] mb-4 flex items-center gap-2">
              <i data-lucide="bell" class="w-5 h-5"></i> Notificações Recentes
            </h2>
            <ul class="space-y-3 text-sm text-[#3D1F0C] max-h-72 overflow-y-auto pr-2">
              ${data.map(i => `
                <li class="border-l-4 border-[#3D1F0C] pl-3">
                  <p class="font-semibold">Aniversariante do dia 🎉</p>
                  <p>Hoje é aniversário de ${i.nome} (${calcularIdade(i.dataNascimento)} anos).</p>
                </li>
              `).join("")}
            </ul>
            <div class="text-right mt-5">
              <button onclick="fecharNotificacoes()" class="px-4 py-1 border border-[#3D1F0C] text-[#3D1F0C] rounded hover:bg-gray-100 font-semibold text-sm">
                Fechar
              </button>
            </div>
          </div>
        ` : `
          <div class="bg-white p-5 rounded-xl max-w-md w-full border-4 border-[#3D1F0C] shadow-xl animate-fade-in">
            <h2 class="text-lg font-bold text-[#3D1F0C] mb-4 flex items-center gap-2">
              <i data-lucide="bell" class="w-5 h-5"></i> Notificações Recentes
            </h2>
            <div class="text-center text-sm text-[#3D1F0C] py-6">
              Você ainda não tem notificações :(
            </div>
            <div class="text-right">
              <button onclick="fecharNotificacoes()" class="px-4 py-1 border border-[#3D1F0C] text-[#3D1F0C] rounded hover:bg-gray-100 font-semibold text-sm">
                Fechar
              </button>
            </div>
          </div>
        `;

        const popup = document.createElement("div");
        popup.id = "popupNotificacoes";
        popup.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";
        popup.innerHTML = html;
        document.body.appendChild(popup);
        lucide.createIcons();
      })
      .catch(err => console.error("Erro ao exibir notificações reais:", err));
  }

  function fecharNotificacoes() {
    const popup = document.getElementById("popupNotificacoes");
    if (popup) fecharAnimado(popup, true);
  }

  function abrirAnimado(el) {
    el.classList.remove("hidden");
    el.classList.add("animate-fade-in");
  }

  function fecharAnimado(el, remover = false) {
    el.classList.remove("animate-fade-in");
    el.classList.add("opacity-0");
    setTimeout(() => {
      if (remover) el.remove();
      else el.classList.add("hidden");
      el.classList.remove("opacity-0");
    }, 200);
  }

  function mostrarPopupSucessoPerfil() {
    const popup = document.getElementById("popupGlobal");
    const box   = document.getElementById("popupBox");
    if (!popup || !box) return;

    /* ─── Conteúdo ─────────────────────────────────────────── */
    document.getElementById("popupTitulo").innerHTML =
      `<i data-lucide="check-circle" class="w-5 h-5"></i> Sucesso`;

    document.getElementById("popupMensagem").textContent =
      "Perfil salvo com sucesso!";

    const btnConfirmar = document.getElementById("popupConfirmarBtn");
    const btnCancelar  = document.getElementById("popupCancelarBtn");

    btnConfirmar.textContent = "Fechar";
    btnCancelar.classList.add("hidden");

    /* ─── Estilo: contorno marrom ──────────────────────────── */
    box.classList.add("border-4", "border-[#3D1F0C]");

    /* ─── Ação do botão ────────────────────────────────────── */
    btnConfirmar.onclick = () => {
      popup.classList.add("hidden");
      // Remove o contorno para que outros pop-ups voltem ao estilo padrão
      box.classList.remove("border-4", "border-[#3D1F0C]");
    };

    /* ─── Exibir ───────────────────────────────────────────── */
    popup.classList.remove("hidden");
    lucide.createIcons();
  }



  // Exportações
  window.initPerfilPopup = initPerfilPopup;
  window.carregarPerfil = carregarPerfil;
  window.verificarBadgeSino = verificarBadgeSino;
  window.mostrarNotificacoesReais = mostrarNotificacoesReais;
  window.fecharNotificacoes = fecharNotificacoes;

  document.addEventListener("DOMContentLoaded", () => {
    initPerfilPopup();
    verificarAniversariantes();
    verificarAniversariantesParaPainel();

    const verificarMenuEIniciar = setInterval(() => {
      const badge = document.getElementById("badgeSino");
      if (!badge) return;

      clearInterval(verificarMenuEIniciar);
      lucide.createIcons();
      verificarBadgeSino();

      setInterval(() => {
        verificarBadgeSino();
      }, 10000);
    }, 300);
  });

  window.ativarPagina = function (elemento) {
      document.querySelectorAll('.nav-icon').forEach(el => el.classList.remove('active'));
      elemento.classList.add('active');
    };

})(); // autoinvocada
