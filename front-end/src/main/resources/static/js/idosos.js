// idosos.js
(function () {

    let dataSimulada = new Date(); // ou qualquer data simulada


    function calcularIdade(dataNascStr) {
      const hoje = new Date();
      const nasc = new Date(dataNascStr);
      let idade = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
      }
      return idade;
    }

  // --- dados mock; mais tarde troque por GET na sua API
  axios.get("http://localhost:8080/idosos")
    .then(res => {
      const idosos = res.data.map(p => ({
        id: p.id, // <-- Adicione esta linha
        nome: p.nome,
        idade: calcularIdade(p.dataNascimento),
        sexo: p.sexo === "Masculino" ? "Homem" : "Mulher",
        img: p.fotoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      }));
      renderizarGrade(idosos);
    })
    .catch(err => {
      console.error("Erro ao carregar idosos:", err);
      alert("Não foi possível carregar os idosos.");
    });

  // --- helpers
  function gerarCard(idoso) {
    let filtro = idoso.falecido
      ? "grayscale"
      : idoso.inativo
        ? "marrom-inativo"
        : "";


    return `
      <div class="relative bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center transition hover:shadow-xl"
           data-nome="${idoso.nome.toLowerCase()}" data-sexo="${idoso.sexo}" data-idade="${idoso.idade}" data-status="${idoso.falecido ? 'Falecido' : idoso.inativo ? 'Inativo' : 'Ativo'}">
        <button onclick="confirmarExclusao(${idoso.id}, '${idoso.nome}')" class="absolute top-2 right-2 text-red-500 hover:text-red-700">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
        <img src="${idoso.img}" class="w-20 h-20 rounded-full object-cover mb-3 shadow-md ${filtro}" />
        <h2 class="text-sm font-semibold text-gray-900">${idoso.nome}</h2>
        <p class="text-xs text-gray-600">${idoso.sexo} • ${idoso.idade} anos</p>
        <div class="flex gap-3 mt-3">
          <button onclick="abrirVisualizacaoIdoso(${idoso.id})" title="Visualizar"
                  class="p-2 text-[#3D1F0C] rounded transition hover:bg-[#3D1F0C] hover:text-white">
            <i data-lucide="eye" class="w-5 h-5"></i>
          </button>
          <button onclick="abrirEdicaoIdoso(${idoso.id})" title="Editar"
                  class="p-2 text-[#3D1F0C] rounded transition hover:bg-[#3D1F0C] hover:text-white">
            <i data-lucide="edit-3" class="w-5 h-5"></i>
          </button>
        </div>
      </div>`;
  }

  function renderizarGrade(lista) {
    const grid = document.getElementById('idososGrid');
    if (!grid) return;
    grid.innerHTML = lista.map(gerarCard).join('');
    lucide.createIcons();
  }

    function abrirCadastroIdoso() {
      const container = document.getElementById('cardsIdosos');
      container.classList.remove('hidden');
      container.className = "col-span-full w-full";

      container.innerHTML = `
        <div class="flex flex-col lg:flex-row-reverse gap-4 w-full min-h-[95vh] text-sm animate-fade-in">
          <!-- FORMULÁRIO À DIREITA -->
          <div class="w-full lg:w-2/3 flex flex-col gap-4">
            <div class="bg-[#3D1F0C] text-white rounded-xl px-4 py-3 shadow flex items-center gap-3">
              <i data-lucide="user-plus" class="w-5 h-5"></i>
              <div>
                <h1 class="text-xl font-bold leading-tight">Cadastro de Novo Residente</h1>
                <p class="text-xs opacity-80">Preencha as informações principais com cuidado e atenção.</p>
              </div>
            </div>

            <form id="formCadastroIdoso" class="bg-white p-4 rounded-xl shadow-md w-full grow flex flex-col justify-between text-[#3D1F0C]">
              <div class="flex flex-col grow overflow-hidden space-y-5">
                <!-- INFO PESSOAIS -->
                <div>
                  <h2 class="text-base font-bold mb-2 border-b pb-1">Informações Pessoais</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><label class="text-xs">Nome Completo</label><input type="text" placeholder="Almir Benedito da Silva" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Sexo</label><select class="w-full border p-1 rounded bg-[#fdf9f6]"><option>Masculino</option><option>Feminino</option><option>Outro</option></select></div>
                    <div><label class="text-xs">Data de Nascimento</label><input type="date" placeholder="1939-01-01" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Estado Civil</label><select class="w-full border p-1 rounded bg-[#fdf9f6]"><option>Solteiro(a)</option><option>Casado(a)</option><option>Viúvo(a)</option><option>Divorciado(a)</option></select></div>
                    <div><label class="text-xs">RG</label><input type="text" placeholder="12.345.678-9" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">CPF</label><input type="text" placeholder="123.456.789-00" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                  </div>
                </div>

                <!-- ENDEREÇO -->
                <div>
                  <h2 class="text-base font-bold mb-2 border-b pb-1">Endereço e Contato</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><label class="text-xs">Endereço completo</label><input type="text" placeholder="Rua das Flores, 123" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Cidade</label><input type="text" placeholder="São Paulo" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Estado (UF)</label><input type="text" maxlength="2" placeholder="SP" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">CEP</label><input type="text" placeholder="01000-000" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Telefone do Idoso</label><input type="text" placeholder="(11) 99999-9999" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Nome do Responsável</label><input type="text" placeholder="Maria da Silva" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Telefone do Responsável</label><input type="text" placeholder="(11) 98888-8888" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                  </div>
                </div>

                <!-- SAÚDE -->
                <div class="flex flex-col grow">
                  <h2 class="text-base font-bold mb-2 border-b pb-1">Saúde e Observações</h2>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div><label class="text-xs">Doenças Crônicas</label><input type="text" placeholder="Hipertensão, Diabetes..." class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Alergias</label><input type="text" placeholder="Nenhuma" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Plano de Saúde</label><input type="text" placeholder="Plano Saúde Plus" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                    <div><label class="text-xs">Deficiências</label><input type="text" placeholder="Auditiva leve" class="w-full border p-1 rounded bg-[#fdf9f6]"/></div>
                  </div>
                  <div class="mt-2">
                    <label class="text-xs">Observações Gerais</label>
                    <textarea placeholder="Paciente lúcido, requer acompanhamento para medicação..." class="w-full border p-2 rounded bg-[#fdf9f6] resize-none h-[55px] overflow-y-auto"></textarea>
                  </div>
                </div>
              </div>

              <!-- BOTÕES -->
              <div class="flex justify-end gap-3 mt-4">
                <button type="submit" class="bg-[#3D1F0C] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#2c1609]">
                  Salvar Cadastro
                </button>
                <button type="button" onclick="funcao2()" class="bg-white border border-[#3D1F0C] text-[#3D1F0C] px-4 py-2 rounded-md font-semibold hover:bg-gray-100">
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- FOTO -->
          <div class="hidden lg:flex flex-col items-center justify-center bg-[#3D1F0C] text-white rounded-xl shadow w-1/3 p-6 gap-4 text-center">
            <div class="relative group w-52 h-52">
              <img id="fotoCadastroPreview" src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                   alt="Foto do Idoso"
                   class="w-full h-full object-cover rounded-md shadow-lg transition-opacity duration-300 group-hover:opacity-60 cursor-pointer" />
              <div onclick="document.getElementById('inputFotoCadastro').click()"
                   class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <i data-lucide="camera" class="w-8 h-8 text-white"></i>
              </div>
            </div>
            <input type="file" id="inputFotoCadastro" accept="image/*" class="hidden" onchange="previewNovaFotoCadastro(event)" />

            <i data-lucide="heart" class="w-8 h-8 mt-4"></i>
            <h2 class="text-lg font-bold leading-tight">Cuidar com Amor</h2>
            <p class="text-xs opacity-80">Cada novo cadastro inicia com carinho.</p>
            <i data-lucide="send" onclick="gerarIdosoFake()" title="Gerar Dados Aleatórios" class="w-6 h-6 text-white opacity-80 mt-4 cursor-pointer hover:opacity-100 transition"></i>
          </div>
        </div>
      `;

      setTimeout(() => lucide.createIcons(), 0);

      document.getElementById("formCadastroIdoso").onsubmit = function (e) {
        e.preventDefault();

        const get = (sel) => document.querySelector(sel)?.value || '';
        const getAll = (sel, i) => document.querySelectorAll(sel)[i]?.value || '';
        const file = document.getElementById("inputFotoCadastro").files[0];
        const defaultImg = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

        const salvarComImagem = (fotoBase64) => {
          const dados = {
            nome: get('input[placeholder="Almir Benedito da Silva"]'),
            sexo: get('select'),
            dataNascimento: get('input[type="date"]'),
            estadoCivil: getAll('select', 1),
            rg: get('input[placeholder="12.345.678-9"]'),
            cpf: get('input[placeholder="123.456.789-00"]'),
            endereco: get('input[placeholder="Rua das Flores, 123"]'),
            cidade: get('input[placeholder="São Paulo"]'),
            estado: get('input[maxlength="2"]'),
            cep: get('input[placeholder="01000-000"]'),
            telefoneIdoso: get('input[placeholder="(11) 99999-9999"]'),
            responsavel: get('input[placeholder="Maria da Silva"]'),
            telefoneResponsavel: get('input[placeholder="(11) 98888-8888"]'),
            doencas: get('input[placeholder="Hipertensão, Diabetes..."]'),
            alergias: get('input[placeholder="Nenhuma"]'),
            planoSaude: get('input[placeholder="Plano Saúde Plus"]'),
            deficiencias: get('input[placeholder="Auditiva leve"]'),
            observacoes: document.querySelector('textarea')?.value || '',
            fotoUrl: fotoBase64 || defaultImg
          };

          dados.dataCriacao = dataSimulada.toISOString().slice(0, 10);

          axios.post("http://localhost:8080/idosos", dados)
            .then(() => {
              verificarBadgeSino(); // <-- ADICIONE AQUI
              mostrarPopupGlobal({
                titulo: "Cadastrar",
                mensagem: "O novo residente foi cadastrado com sucesso.",
                icone: "check-circle",
                confirmarTexto: "Fechar",
                onConfirm: funcao2
              });
            })
            .catch(err => {
              console.error("Erro completo:", err.response?.data || err.message);
              alert("Erro ao cadastrar idoso: " + (err.response?.data?.message || err.message));
            });
        };

        if (file) {
          const reader = new FileReader();
          reader.onload = function (event) {
            salvarComImagem(event.target.result);
          };
          reader.readAsDataURL(file);
        } else {
          const previewSrc = document.getElementById("fotoCadastroPreview").src;
          salvarComImagem(previewSrc || defaultImg);
        }
      };
    }

    window.abrirCadastroIdoso = abrirCadastroIdoso;

    function abrirEdicaoIdoso(id) {
      axios.get(`http://localhost:8080/idosos/${id}`).then(res => {
        const dados = res.data;
        const container = document.getElementById('cardsIdosos');
        container.classList.remove('hidden');
        container.className = "col-span-full w-full";

        container.innerHTML = `
          <div class="flex flex-col lg:flex-row-reverse gap-4 w-full min-h-[95vh] text-sm animate-fade-in">
            <div class="w-full lg:w-2/3 flex flex-col gap-4">
              <div class="bg-[#3D1F0C] text-white rounded-xl px-4 py-3 shadow flex items-center gap-3">
                <i data-lucide="edit-3" class="w-5 h-5"></i>
                <div class="flex justify-between items-center w-full">
                  <div>
                    <h1 class="text-xl font-bold leading-tight">Editar Cadastro de Residente</h1>
                    <p class="text-xs opacity-80">Atualize os dados com atenção aos detalhes.</p>
                  </div>
                  <div class="flex gap-4 text-sm text-white">
                    <label class="flex items-center gap-1">
                      <input type="checkbox" id="checkboxInativo" ${dados.inativo ? "checked" : ""} />
                      Inativo
                    </label>
                    <label class="flex items-center gap-1">
                      <input type="checkbox" id="checkboxFalecido" ${dados.falecido ? "checked" : ""} />
                      Falecido
                    </label>
                  </div>
                </div>
              </div>

              <form id="formCadastroIdoso" class="bg-white p-4 rounded-xl shadow-md w-full grow flex flex-col justify-between text-[#3D1F0C]">
                <div class="flex flex-col grow overflow-hidden space-y-5">

                  <!-- INFO PESSOAIS -->
                  <div>
                    <h2 class="text-base font-bold mb-2 border-b pb-1">Informações Pessoais</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label class="text-xs">Nome Completo</label><input type="text" value="${dados.nome}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="nome"/></div>
                      <div><label class="text-xs">Sexo</label>
                        <select class="w-full border p-1 rounded bg-[#fdf9f6]" id="sexo">
                          <option ${dados.sexo === "Masculino" ? "selected" : ""}>Masculino</option>
                          <option ${dados.sexo === "Feminino" ? "selected" : ""}>Feminino</option>
                          <option ${dados.sexo === "Outro" ? "selected" : ""}>Outro</option>
                        </select>
                      </div>
                      <div><label class="text-xs">Data de Nascimento</label><input type="date" value="${dados.dataNascimento}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="dataNascimento"/></div>
                      <div><label class="text-xs">Estado Civil</label>
                        <select class="w-full border p-1 rounded bg-[#fdf9f6]" id="estadoCivil">
                          <option ${dados.estadoCivil === "Solteiro(a)" ? "selected" : ""}>Solteiro(a)</option>
                          <option ${dados.estadoCivil === "Casado(a)" ? "selected" : ""}>Casado(a)</option>
                          <option ${dados.estadoCivil === "Viúvo(a)" ? "selected" : ""}>Viúvo(a)</option>
                          <option ${dados.estadoCivil === "Divorciado(a)" ? "selected" : ""}>Divorciado(a)</option>
                        </select>
                      </div>
                      <div><label class="text-xs">RG</label><input type="text" value="${dados.rg}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="rg"/></div>
                      <div><label class="text-xs">CPF</label><input type="text" value="${dados.cpf}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="cpf"/></div>
                    </div>
                  </div>

                  <!-- ENDEREÇO E CONTATO -->
                  <div>
                    <h2 class="text-base font-bold mb-2 border-b pb-1">Endereço e Contato</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label class="text-xs">Endereço completo</label><input type="text" value="${dados.endereco}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="endereco"/></div>
                      <div><label class="text-xs">Cidade</label><input type="text" value="${dados.cidade}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="cidade"/></div>
                      <div><label class="text-xs">Estado (UF)</label><input type="text" value="${dados.estado}" maxlength="2" class="w-full border p-1 rounded bg-[#fdf9f6]" id="estado"/></div>
                      <div><label class="text-xs">CEP</label><input type="text" value="${dados.cep}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="cep"/></div>
                      <div><label class="text-xs">Telefone do Idoso</label><input type="text" value="${dados.telefoneIdoso}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="telefoneIdoso"/></div>
                      <div><label class="text-xs">Nome do Responsável</label><input type="text" value="${dados.responsavel}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="responsavel"/></div>
                      <div><label class="text-xs">Telefone do Responsável</label><input type="text" value="${dados.telefoneResponsavel}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="telefoneResponsavel"/></div>
                    </div>
                  </div>

                  <!-- SAÚDE -->
                  <div class="flex flex-col grow">
                    <h2 class="text-base font-bold mb-2 border-b pb-1">Saúde e Observações</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div><label class="text-xs">Doenças Crônicas</label><input type="text" value="${dados.doencas}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="doencas"/></div>
                      <div><label class="text-xs">Alergias</label><input type="text" value="${dados.alergias}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="alergias"/></div>
                      <div><label class="text-xs">Plano de Saúde</label><input type="text" value="${dados.planoSaude}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="planoSaude"/></div>
                      <div><label class="text-xs">Deficiências</label><input type="text" value="${dados.deficiencias}" class="w-full border p-1 rounded bg-[#fdf9f6]" id="deficiencias"/></div>
                    </div>
                    <div class="mt-2">
                      <label class="text-xs">Observações Gerais</label>
                      <textarea class="w-full border p-2 rounded bg-[#fdf9f6] resize-none h-[55px] overflow-y-auto" id="observacoes">${dados.observacoes}</textarea>
                    </div>
                  </div>
                </div>

                <!-- BOTÕES -->
                <div class="flex justify-end gap-3 mt-4">
                  <button type="submit" class="bg-[#3D1F0C] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#2c1609]">
                    Salvar Edições
                  </button>
                  <button type="button" onclick="funcao2()" class="bg-white border border-[#3D1F0C] text-[#3D1F0C] px-4 py-2 rounded-md font-semibold hover:bg-gray-100">
                    Cancelar
                  </button>
                </div>
              </form>
            </div>

            <!-- FOTO E FRASE À ESQUERDA -->
            <div class="hidden lg:flex flex-col items-center justify-center bg-[#3D1F0C] text-white rounded-xl shadow w-1/3 p-6 gap-4 text-center">
              <div class="relative group w-40 h-40">
                <img id="fotoPreview" src="${dados.fotoUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}"
                     alt="Foto do Idoso"
                     class="w-full h-full object-cover rounded-md shadow-lg transition-opacity duration-300 group-hover:opacity-60 cursor-pointer" />
                <div onclick="document.getElementById('inputFotoEdicao').click()"
                     class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <i data-lucide="camera" class="w-8 h-8 text-white"></i>
                </div>
              </div>
              <input type="file" id="inputFotoEdicao" accept="image/*" class="hidden" onchange="previewNovaFoto(event)" />

              <i data-lucide="heart" class="w-8 h-8 mt-2"></i>
              <h2 class="text-lg font-bold leading-tight">Cuidar com Amor</h2>
              <p class="text-xs opacity-80">A edição também é um gesto de cuidado. Revise com carinho.</p>
              <i data-lucide="send" class="w-6 h-6 text-white opacity-80 mt-2"></i>
            </div>
          </div>
        `;

        setTimeout(() => {
          lucide.createIcons();

          const falecidoCheckbox = document.getElementById("checkboxFalecido");
          const inativoCheckbox = document.getElementById("checkboxInativo");

          falecidoCheckbox.addEventListener("change", function () {
            inativoCheckbox.checked = this.checked;
          });
        }, 0);

        document.getElementById("formCadastroIdoso").onsubmit = function (e) {
          e.preventDefault();

          const atualizado = {
            nome: document.getElementById("nome").value,
            sexo: document.getElementById("sexo").value,
            dataNascimento: document.getElementById("dataNascimento").value,
            estadoCivil: document.getElementById("estadoCivil").value,
            rg: document.getElementById("rg").value,
            cpf: document.getElementById("cpf").value,
            endereco: document.getElementById("endereco").value,
            cidade: document.getElementById("cidade").value,
            estado: document.getElementById("estado").value,
            cep: document.getElementById("cep").value,
            telefoneIdoso: document.getElementById("telefoneIdoso").value,
            responsavel: document.getElementById("responsavel").value,
            telefoneResponsavel: document.getElementById("telefoneResponsavel").value,
            doencas: document.getElementById("doencas").value,
            alergias: document.getElementById("alergias").value,
            planoSaude: document.getElementById("planoSaude").value,
            deficiencias: document.getElementById("deficiencias").value,
            observacoes: document.getElementById("observacoes").value,
            inativo: document.getElementById("checkboxInativo").checked,
            falecido: document.getElementById("checkboxFalecido").checked,
            fotoUrl: window.fotoBase64Edicao || dados.fotoUrl
          };

          axios.put(`http://localhost:8080/idosos/${id}`, atualizado)
            .then(() => {
              verificarBadgeSino();
              mostrarPopupGlobal({
                titulo: "Atualização concluída",
                mensagem: "Dados do idoso atualizados com sucesso.",
                icone: "check-circle",
                confirmarTexto: "Fechar",
                onConfirm: () => {
                  window.fotoBase64Edicao = null;
                  funcao2();
                }
              });
            })
            .catch(err => {
              console.error("Erro ao atualizar:", err);
              alert("Erro ao salvar as edições.");
            });
        };
      });
    }




    function renderCampo(titulo, valor) {
      return `
        <div>
          <label class="text-xs font-medium block mb-1">${titulo}</label>
          <div class="bg-[#fdf9f6] border rounded p-2 text-[13px] leading-tight">${valor || "Não informado"}</div>
        </div>
      `;
    }

    window.aplicarFiltrosIdosos = function () {
      const idadeMin = parseInt(document.getElementById("filtroIdadeMin").value) || 0;
      const idadeMax = parseInt(document.getElementById("filtroIdadeMax").value) || 200;
      const sexo = document.getElementById("filtroSexo").value;
      const status = document.getElementById("filtroStatus").value;

      document.querySelectorAll('#idososGrid > div[data-nome]').forEach(card => {
        const idade = parseInt(card.dataset.idade);
        const cardSexo = card.dataset.sexo;
        const ativo = card.dataset.status === "Ativo";

        let mostrar = true;

        if (idade < idadeMin || idade > idadeMax) mostrar = false;
        if (sexo && cardSexo !== sexo) mostrar = false;

        if (status === "inativo" && ativo) mostrar = false;
        if (status === "falecido" && ativo) mostrar = false;
        if (status === "ativo" && !ativo) mostrar = false;

        card.style.display = mostrar ? 'flex' : 'none';
      });

      document.getElementById("popupFiltro").classList.add("hidden");
    };


    function abrirVisualizacaoIdoso(id) {
      axios.get(`http://localhost:8080/idosos/${id}`)
        .then(res => {
          const dados = res.data;

          const container = document.getElementById('cardsIdosos');
          container.classList.remove('hidden');
          container.className = "col-span-full w-full";

          container.innerHTML = `
            <div class="flex flex-col lg:flex-row-reverse gap-4 w-full min-h-[93vh] text-sm animate-fade-in">
              <!-- FORMULÁRIO À DIREITA -->
              <div class="w-full lg:w-2/3 flex flex-col gap-4">
                <div class="bg-[#3D1F0C] text-white rounded-xl px-4 py-2 shadow flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <i data-lucide="eye" class="w-5 h-5"></i>
                    <div>
                      <h1 class="text-lg font-bold leading-tight">Visualização de Cadastro</h1>
                      <p class="text-xs opacity-80">Verifique os dados completos do residente com atenção aos detalhes.</p>
                    </div>
                  </div>
                  <div class="flex gap-4 text-sm text-white">
                    <label class="flex items-center gap-1">
                      <input type="checkbox" ${dados.inativo ? 'checked' : ''} disabled />
                      Inativo
                    </label>
                    <label class="flex items-center gap-1">
                      <input type="checkbox" ${dados.falecido ? 'checked' : ''} disabled />
                      Falecido
                    </label>
                  </div>
                </div>

                <div class="bg-white p-4 rounded-xl shadow-md w-full grow flex flex-col justify-between space-y-4 text-[#3D1F0C]">
                  <!-- INFO PESSOAIS -->
                  <div>
                    <h2 class="text-base font-bold mb-1 border-b pb-1">Informações Pessoais</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      ${renderCampo("Nome Completo", dados.nome)}
                      ${renderCampo("Sexo", dados.sexo)}
                      ${renderCampo("Data de Nascimento", dados.dataNascimento)}
                      ${renderCampo("Estado Civil", dados.estadoCivil)}
                      ${renderCampo("RG", dados.rg)}
                      ${renderCampo("CPF", dados.cpf)}
                    </div>
                  </div>

                  <!-- ENDEREÇO -->
                  <div>
                    <h2 class="text-base font-bold mb-1 border-b pb-1">Endereço e Contato</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      ${renderCampo("Endereço completo", dados.endereco)}
                      ${renderCampo("Cidade", dados.cidade)}
                      ${renderCampo("Estado (UF)", dados.estado)}
                      ${renderCampo("CEP", dados.cep)}
                      ${renderCampo("Telefone do Idoso", dados.telefoneIdoso)}
                      ${renderCampo("Nome do Responsável", dados.responsavel)}
                      ${renderCampo("Telefone do Responsável", dados.telefoneResponsavel)}
                    </div>
                  </div>

                  <!-- SAÚDE -->
                  <div>
                    <h2 class="text-base font-bold mb-1 border-b pb-1">Saúde e Observações</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                      ${renderCampo("Doenças Crônicas", dados.doencas)}
                      ${renderCampo("Alergias", dados.alergias)}
                      ${renderCampo("Plano de Saúde", dados.planoSaude)}
                      ${renderCampo("Deficiências", dados.deficiencias)}
                    </div>
                    <div class="mt-2">
                      <label class="text-xs font-medium block mb-1">Observações Gerais</label>
                      <div class="bg-[#fdf9f6] border rounded p-2 text-[13px] leading-tight max-h-[60px] overflow-y-auto">
                        ${dados.observacoes || "Nenhuma"}
                      </div>
                    </div>
                  </div>

                  <!-- BOTÃO -->
                  <div class="flex justify-end mt-3">
                    <button type="button" onclick="funcao2()" class="bg-[#3D1F0C] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#2c1609] text-[13px]">
                      Finalizar Visualização
                    </button>
                  </div>
                </div>
              </div>

              <!-- FOTO E FRASE À ESQUERDA -->
              <div class="hidden lg:flex flex-col items-center justify-center bg-[#3D1F0C] text-white rounded-xl shadow w-1/3 p-6 gap-4 text-center">
                <img src="${dados.fotoUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" alt="Foto do Idoso" class="w-40 h-40 object-cover rounded-md shadow-lg" />
                <i data-lucide="heart" class="w-8 h-8 mt-2"></i>
                <h2 class="text-lg font-bold leading-tight">Cuidar com Amor</h2>
                <p class="text-xs opacity-80 px-4">Ver é também uma forma de cuidar. Conheça cada detalhe com carinho.</p>
                <i data-lucide="send" class="w-6 h-6 text-white opacity-80 mt-2"></i>
              </div>
            </div>
          `;

          setTimeout(() => lucide.createIcons(), 0);
        })
        .catch(err => {
          console.error("Erro ao buscar dados do idoso:", err);
          alert("Erro ao carregar visualização.");
        });
    }



function mostrarPopupGlobal({
  titulo,
  mensagem,
  icone = "info",
  confirmarTexto,
  cancelarTexto,
  onConfirm,
  onCancel
}) {
  const popup = document.getElementById('popupGlobal');
  const tituloEl = document.getElementById('popupTitulo');
  const mensagemEl = document.getElementById('popupMensagem');
  const confirmarBtn = document.getElementById('popupConfirmarBtn');
  const cancelarBtn = document.getElementById('popupCancelarBtn');

  tituloEl.innerHTML = `<i data-lucide="${icone}" class="w-5 h-5"></i> ${titulo}`;
  mensagemEl.innerHTML = mensagem;

  // CONFIGURA BOTÃO CONFIRMAR
  if (confirmarTexto) {
    confirmarBtn.textContent = confirmarTexto;
    confirmarBtn.classList.remove("hidden");
    confirmarBtn.onclick = () => {
      popup.classList.add('hidden');
      if (onConfirm) onConfirm();
    };
  } else {
    confirmarBtn.classList.add("hidden");
    confirmarBtn.onclick = null;
  }

  // CONFIGURA BOTÃO CANCELAR
  if (cancelarTexto) {
    cancelarBtn.textContent = cancelarTexto;
    cancelarBtn.classList.remove("hidden");
    cancelarBtn.onclick = () => {
      popup.classList.add('hidden');
      if (onCancel) onCancel();
    };
  } else {
    cancelarBtn.classList.add("hidden");
    cancelarBtn.onclick = null;
  }

  popup.classList.remove("hidden");
  lucide.createIcons();
}




function fecharPopupGlobal() {
  document.getElementById("popupGlobal").classList.add("hidden");
}


window.editarFotoIdoso = function () {
  alert("A funcionalidade de edição da foto foi acionada!");
};

window.abrirCadastroIdoso = abrirCadastroIdoso;
window.abrirEdicaoIdoso = abrirEdicaoIdoso;
window.abrirVisualizacaoIdoso = abrirVisualizacaoIdoso;


  // -- filtros / busca
  window.filtrarIdosos = function (texto) {
    texto = (texto || '').toLowerCase();
    document.querySelectorAll('#idososGrid > div[data-nome]').forEach(card => {
      card.style.display = card.dataset.nome.includes(texto) ? 'flex' : 'none';
    });
  };

  // filtros avançados permanecem
  window.abrirFiltro  = () => document.getElementById('popupFiltro').classList.remove('hidden');

  window.aplicarFiltrosIdosos = function () {
    const idadeMin = parseInt(document.getElementById("filtroIdadeMin").value) || 0;
    const idadeMax = parseInt(document.getElementById("filtroIdadeMax").value) || 200;
    const sexo = document.getElementById("filtroSexo").value;
    const status = document.getElementById("filtroStatus").value;

    document.querySelectorAll('#idososGrid > div[data-nome]').forEach(card => {
      const idade = parseInt(card.dataset.idade);
      const cardSexo = card.dataset.sexo;
      const statusTexto = card.dataset.status;

      let mostrar = true;

      if (idade < idadeMin || idade > idadeMax) mostrar = false;
      if (sexo && cardSexo !== sexo) mostrar = false;
      if (status && statusTexto !== status) mostrar = false;

      card.style.display = mostrar ? 'flex' : 'none';
    });

    document.getElementById("popupFiltro").classList.add("hidden");
  };


  // -------- init público ---------
  window.initIdosos = function () {
    axios.get("http://localhost:8080/idosos")
      .then(res => {
        const idosos = res.data.map(p => ({
          id: p.id, // <-- ESSENCIAL
          nome: p.nome,
          idade: calcularIdade(p.dataNascimento),
          sexo: p.sexo === "Masculino" ? "Homem" : "Mulher",
          img: p.fotoUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
          inativo: p.inativo,
          falecido: p.falecido
        }));
        renderizarGrade(idosos);
      })
      .catch(err => {
        console.error("Erro ao carregar idosos:", err);
        alert("Não foi possível carregar os idosos.");
      });

    const busca = document.getElementById('campoBusca');
    if (busca) busca.value = '';
  };


  window.confirmarExclusao = function (id, nome) {
    mostrarPopupGlobal({
      titulo: "Excluir Residente",
      mensagem: `Tem certeza que deseja excluir ${nome}? Esta ação não poderá ser desfeita.`,
      icone: "trash-2",
      confirmarTexto: "Sim, excluir",
      cancelarTexto: "Cancelar",
      onConfirm: () => {
        axios.delete(`http://localhost:8080/idosos/${id}`)
          .then(() => funcao2())
          .catch(() => alert("Erro ao excluir o idoso."));
      }
    });
  };

  window.resetarFiltrosIdosos = () => {
    document.getElementById("filtroIdadeMin").value = "";
    document.getElementById("filtroIdadeMax").value = "";
    document.getElementById("filtroSexo").value = "";
    document.getElementById("filtroStatus").value = "";
    document.getElementById("resetarFiltrosLabel").classList.add("hidden");
    window.initIdosos(); // recarrega sem filtros
  };

  window.previewNovaFoto = function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('fotoPreview').src = event.target.result;
      window.fotoBase64Edicao = event.target.result; // <- Salva global
    };
    reader.readAsDataURL(file);
  };


  window.previewNovaFotoCadastro = function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('fotoCadastroPreview').src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  window.gerarIdosoFake = function (quantidade = 1) {
    const nomesFemininos = ["Maria Aparecida", "Ana Clara", "Rosa Maria", "Helena Costa", "Paula Regina", "Cláudia Souza", "Juliana Alves", "Bianca Ferreira", "Camila Duarte", "Gabriela Barros", "Luciana Ribeiro", "Renata Figueiredo", "Larissa Mendes", "Débora Santos", "Aline Moura", "Tatiane Gomes", "Simone Araújo", "Eliane Lopes", "Patrícia Ramos", "Vanessa Almeida", "Daniela Lima", "Sueli Castro", "Adriana Neves", "Valéria Costa", "Jaqueline Lemos", "Priscila Xavier", "Verônica Sales", "Silvia Regina", "Tatiana Rocha", "Natália Luz", "Letícia Pires", "Cristiane Duarte", "Marta Carvalho", "Jéssica Andrade", "Lívia Araújo", "Kelly Silva", "Monique Rocha", "Elaine Dias", "Isabela Fontes", "Lorena Dantas", "Milena Viana", "Daniela Braga", "Sabrina Cardoso", "Érica Fernandes"];
    const nomesMasculinos = ["Almir Benedito", "João Nunes", "Carlos Silva", "Vicente Luz", "Marcos Vinícius", "Pedro Henrique", "Antônio Carlos", "Fernando Rocha", "Eduardo Lima", "Luís Fernando", "Thiago Martins", "Marcelo Torres", "Bruno Oliveira", "Ricardo Nogueira", "André Felipe", "Fábio Andrade", "Diego Moreira", "Gustavo Freitas", "Igor Silva", "Rafael Brito", "Célio Bezerra", "Rodrigo Paiva", "Henrique Matos", "Renan Teixeira", "Alex Barbosa", "Douglas Tavares", "Vagner Almeida", "Jonas Meireles", "Alessandro Melo", "Samuel Farias", "Pablo Reis", "Vitor Nascimento", "Wallace Ramos", "Otávio Leal", "Danilo Santiago", "Washington Cruz", "Felipe Martins", "Jorge Ribeiro", "Leandro Moura", "Caio Mesquita"];
    const todosNomes = [...nomesFemininos, ...nomesMasculinos];

    const sobrenomes = ["da Silva", "Souza", "Pereira", "Oliveira", "Lima", "Fernandes", "Rocha", "Moreira", "Teixeira", "Alencar"];
    const cidades = ["São Paulo", "Campinas", "Belo Horizonte", "Recife", "Curitiba", "Porto Alegre", "Salvador", "Natal", "Maceió"];
    const ufs = ["SP", "RJ", "MG", "PR", "RS", "PE", "BA", "CE"];
    const estadosCivis = ["Solteiro(a)", "Casado(a)", "Viúvo(a)", "Divorciado(a)", "Separado(a)"];
    const doencas = ["Hipertensão", "Diabetes", "Artrose", "Nenhuma", "Doença Pulmonar", "Problemas Cardíacos", "Alzheimer", "Parkinson"];
    const alergias = ["Nenhuma", "Poeira", "Lactose", "Glúten", "Medicamentos", "Pólen"];
    const planos = ["Saúde Plus", "Viver Bem", "Plano Família", "Essencial Vida"];
    const deficiencias = ["Visual", "Auditiva", "Motora", "Nenhuma", "Mental"];
    const nomesResponsaveis = ["Maria Silva", "José Lima", "Carlos Souza", "Ana Paula", "Roberta Gomes", "Joana D’Arc"];

    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randCPF = () => `${Math.floor(Math.random() * 999).toString().padStart(3, '0')}.${Math.floor(Math.random() * 999).toString().padStart(3, '0')}.${Math.floor(Math.random() * 999).toString().padStart(3, '0')}-${Math.floor(Math.random() * 99).toString().padStart(2, '0')}`;
    const randRG = () => `${Math.floor(Math.random() * 99)}.${Math.floor(Math.random() * 999)}.${Math.floor(Math.random() * 999)}-${Math.floor(Math.random() * 9)}`;
    const randCEP = () => `${Math.floor(Math.random() * 89999 + 10000)}-${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
    const randPhone = () => `(11) 9${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const randDataNasc = () => {
      const ano = Math.floor(Math.random() * 35 + 1930);
      const mes = String(Math.floor(Math.random() * 12 + 1)).padStart(2, '0');
      const dia = String(Math.floor(Math.random() * 28 + 1)).padStart(2, '0');
      return `${ano}-${mes}-${dia}`;
    };

    for (let i = 0; i < quantidade; i++) {
      const nome = rand(todosNomes);
      const sexo =
        Math.random() <= 0.02 ? "Outro" :
        nomesFemininos.includes(nome) ? "Feminino" : "Masculino";

      const nomeCompleto = `${nome} ${rand(sobrenomes)} ${rand(sobrenomes)}`;

      // Distribuição precisa
      const chance = Math.random();
      const isFalecido = chance < 0.05;
      const isInativo = !isFalecido && chance < 0.25;

      const novoIdoso = {
        nome: nomeCompleto,
        sexo,
        dataNascimento: randDataNasc(),
        estadoCivil: rand(estadosCivis),
        rg: randRG(),
        cpf: randCPF(),
        endereco: `Rua ${rand(sobrenomes)}, ${Math.floor(Math.random() * 1000)}`,
        cidade: rand(cidades),
        estado: rand(ufs),
        cep: randCEP(),
        telefoneIdoso: randPhone(),
        responsavel: rand(nomesResponsaveis),
        telefoneResponsavel: randPhone(),
        doencas: rand(doencas),
        alergias: rand(alergias),
        planoSaude: rand(planos),
        deficiencias: rand(deficiencias),
        observacoes: "Paciente gerado automaticamente para testes.",
        fotoUrl: `https://randomuser.me/api/portraits/${sexo === "Feminino" ? "women" : "men"}/${Math.floor(Math.random() * 90)}.jpg`,
        dataCriacao: new Date().toISOString().split("T")[0],
        inativo: isInativo,
        falecido: isFalecido
      };

      axios.post("http://localhost:8080/idosos", novoIdoso)
        .then(() => {
          if (i === quantidade - 1) window.initIdosos?.();
        })
        .catch((err) => {
          console.error("Erro ao gerar idoso fake:", err);
        });
    }
  };


  (function () {
    let buffer = "";

    window.addEventListener("keydown", function (e) {
      buffer += e.key.toLowerCase();

      // Mantém só os últimos 10 caracteres no buffer
      if (buffer.length > 10) buffer = buffer.slice(-10);

      if (buffer.includes("ccc")) {
        buffer = "";
        codigos(); // chama a função de comandos
      }
    });
  })();








})();



