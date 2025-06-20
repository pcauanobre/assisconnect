/* static/js/login.js ──────────────────────────────────────────────────── */
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = false;

/* =======================  LOGIN  ====================================== */
async function tentarLogin() {
  const usuario = document.getElementById("loginUsuario").value.trim();
  const senha   = document.getElementById("loginSenha").value.trim();
  const manter  = document.getElementById("manterConectado").checked;

  if (!usuario || !senha)
    return mostrarErroLogin("Preencha usuário e senha.");

  try {
    const { data } = await axios.post("/auth/login", { usuario, senha });

    localStorage.setItem("usuarioLogado", data.usuario);
    localStorage.setItem("sessaoAssisConnect", "ok");

    const perfil = await axios.get(`/perfil/${data.usuario}`);
    localStorage.setItem("usuarioAtual", JSON.stringify(perfil.data));

    // ✅ Armazena flag com base no usuário (único por usuário, não por navegador)
    const chaveLogin = `primeiroLogin:${data.usuario}`;
    if (!localStorage.getItem(chaveLogin)) {
      localStorage.setItem(chaveLogin, "feito");
      localStorage.setItem("usuarioPrimeiroLogin", "sim");
    } else {
      localStorage.removeItem("usuarioPrimeiroLogin");
    }

    if (manter) {
      localStorage.setItem("usuarioSalvo", usuario);
      localStorage.setItem("senhaSalva", senha);
      localStorage.setItem("manterLogado", "sim");
    } else {
      localStorage.removeItem("usuarioSalvo");
      localStorage.removeItem("senhaSalva");
      localStorage.removeItem("manterLogado");
    }

    window.location = "../index.html";

  } catch (err) {
    if (err.response?.status === 401) {
      mostrarErroLogin("Usuário ou senha inválido!");
    } else {
      console.error(err);
      mostrarErroLogin("Erro de conexão com o servidor.");
    }
  }
}


function mostrarPopupBoasVindas() {
  const popup = document.createElement("div");
  popup.id = "popupBoasVindas";
  popup.className = "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center";
  popup.innerHTML = `
    <div class="bg-white p-6 rounded-xl max-w-md w-full shadow-xl border-4 border-[#3D1F0C] text-[#3D1F0C] animate-fade-in">
      <h2 class="text-2xl font-bold mb-4">🎉 Boas-vindas ao AssisConnect!</h2>
      <p class="text-sm mb-5">Antes de começar, por favor atualize seus dados no perfil. Isso ajuda a mantermos tudo organizado e seguro.</p>
      <div class="text-right">
        <button onclick="document.getElementById('popupBoasVindas').remove(); window.location = '../index.html';"
                class="px-4 py-2 bg-[#3D1F0C] text-white font-semibold rounded hover:bg-[#2c1609] transition">
          Começar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}

function mostrarErroLogin(msg) {
  const el = document.getElementById("erroLogin");
  el.textContent = msg;
  el.classList.remove("hidden");
}

/* =======================  REGISTRO  ==================================== */
async function registrar() {
  const usuario   = document.getElementById("usuarioRegistro").value.trim();
  const senha     = document.getElementById("senhaRegistro").value.trim();
  const confirmar = document.getElementById("confirmarRegistro").value.trim();
  const email     = document.getElementById("emailRegistro").value.trim();
  const token     = document.getElementById("admToken").value.trim();

  if (!usuario || !senha || !confirmar || !email)
    return mostrarErroRegistro("Preencha todos os campos.");
  if (senha !== confirmar)
    return mostrarErroRegistro("As senhas não coincidem.");

  try {
    await axios.post("/auth/register", {
      nome: "Usuário Padrão",
      usuario, senha, email,
      administrador: token === "12345"
    });
    voltarLogin();
  } catch {
    mostrarErroRegistro("Erro ao registrar usuário.");
  }
}

function mostrarErroRegistro(msg){
  const el = document.getElementById("erroRegistro");
  el.textContent = msg;
  el.classList.remove("hidden");
}

/* =================  RECUPERAÇÃO DE SENHA  ============================= */
function abrirRecuperacaoSenha() {
  fecharPopupSenha();
  document.getElementById("popupEsqueciSenha").classList.remove("hidden");
}

function enviarCodigoRecuperacao() {
  const email = document.getElementById("emailRecuperacao").value.trim();
  if (!email) return mostrarErroRecuperacao("Preencha o email.");

  animarTrocaEtapa("etapaEmail","etapaCodigo");
  mostrarErroRecuperacao("Código enviado para " + email);
}

function validarCodigoRecuperacao() {
  const codigo = document.getElementById("codigoRecuperacao").value.trim();
  if (codigo === "12345") {
    animarTrocaEtapa("etapaCodigo","etapaNovaSenha");
    mostrarErroRecuperacao("");
  } else {
    mostrarErroRecuperacao("Código inválido.");
  }
}

function confirmarNovaSenha() {
  const nova      = document.getElementById("novaSenha").value.trim();
  const confirmar = document.getElementById("confirmarNovaSenha").value.trim();
  const email     = document.getElementById("emailRecuperacao").value.trim();

  if (!nova || !confirmar) return mostrarErroRecuperacao("Preencha os dois campos.");
  if (nova !== confirmar) return mostrarErroRecuperacao("As senhas não coincidem.");

  axios.post("/auth/resetar-senha", { email, novaSenha: nova })
       .then(() => {
         document.getElementById("popupEsqueciSenha").classList.add("hidden");
         mostrarPopupSenhaAlterada();
       })
       .catch(() => mostrarErroRecuperacao("Erro ao alterar senha."));
}

function mostrarErroRecuperacao(msg){
  const el = document.getElementById("mensagemRecuperacao");
  el.textContent = msg;
  el.classList.toggle("hidden", !msg);
}

/* ==================== POPUPS & TROCAS ================================ */
function abrirRegistro() {
  document.getElementById("telaLogin").classList.add("hidden");
  document.getElementById("telaRegistro").classList.remove("hidden");
}
function voltarLogin() {
  document.getElementById("telaRegistro").classList.add("hidden");
  document.getElementById("telaLogin").classList.remove("hidden");
}
function sair() {
  localStorage.removeItem("sessaoAssisConnect");
  if (localStorage.getItem("manterLogado") !== "sim") {
    localStorage.removeItem("usuarioSalvo");
    localStorage.removeItem("senhaSalva");
  }
  window.location.href = "/login.html";
}

/* limpa popup de senha */
function fecharPopupSenha() {
  document.getElementById("popupEsqueciSenha").classList.add("hidden");
  ["emailRecuperacao","codigoRecuperacao","novaSenha","confirmarNovaSenha"]
    .forEach(id => document.getElementById(id).value="");
  ["etapaEmail","etapaCodigo","etapaNovaSenha"]
    .forEach(id => document.getElementById(id).classList.add("hidden"));
  mostrarErroRecuperacao("");
  setTimeout(()=>animarTrocaEtapa(null,"etapaEmail"),50);
}
function mostrarPopupSenhaAlterada(){
  document.getElementById("popupSenhaAlterada").classList.remove("hidden");
  lucide.createIcons();
}
function fecharPopupSenhaAlterada(){
  document.getElementById("popupSenhaAlterada").classList.add("hidden");
}
function animarTrocaEtapa(idAnterior,idProximo){
  if(idAnterior) document.getElementById(idAnterior).classList.add("hidden");
  const prox=document.getElementById(idProximo);
  prox.classList.remove("hidden");
  prox.classList.add("fade-in");
  setTimeout(()=>prox.classList.remove("fade-in"),300);
}

/* ========== AUTO-PREENCHER se "manter logado" ========================= */
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("manterLogado") !== "sim") return;

  const userInput  = document.getElementById("loginUsuario");
  const passInput  = document.getElementById("loginSenha");
  if (!userInput || !passInput) return;

  const u = localStorage.getItem("usuarioSalvo");
  const s = localStorage.getItem("senhaSalva");
  if (u && s) {
    userInput.value = u;
    passInput.value = s;
    document.getElementById("manterConectado").checked = true;
  }

  window.atualizarDadosUsuario = async function () {
    const usuario = localStorage.getItem("usuarioLogado");
    if (!usuario) return;

    try {
      const { data } = await axios.get(`http://localhost:8080/perfil/${usuario}`);
      localStorage.setItem("usuarioAtual", JSON.stringify(data));
      if (typeof carregarPerfil === "function") carregarPerfil();
    } catch (err) {
      console.error("Erro ao atualizar dados do usuário logado:", err);
    }
  };
});
