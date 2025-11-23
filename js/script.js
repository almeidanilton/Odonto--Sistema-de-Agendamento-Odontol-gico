const agendamentoForm = document.getElementById("agendamentoForm");
  const selectData = document.getElementById("data");
  const selectHora = document.getElementById("hora");
  const listaAgendamentos = document.getElementById("listaAgendamentos");
  const formContainer = document.getElementById("formContainer");
  const telefoneInput = document.getElementById('telefone');

  telefoneInput.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = valor.slice(0, 11); // Limita a 11 dígitos

    if (valor.length > 6) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor.slice(0, 2)}`;
    }
    e.target.value = valor;
  });

  let agendamentos = JSON.parse(localStorage.getItem('agendamentos_odonto')) || [];

  function salvarAgendamentos() {
    localStorage.setItem('agendamentos_odonto', JSON.stringify(agendamentos));
  }

  function gerarDiasUteis() {
    let hoje = new Date();
    let contador = 0;
    while (contador < 5) {
      hoje.setDate(hoje.getDate() + 1);
      let diaSemana = hoje.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        let ano = hoje.getFullYear();
        let mes = String(hoje.getMonth() + 1).padStart(2, '0');
        let dia = String(hoje.getDate()).padStart(2, '0');
        let nomeDia = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"][diaSemana];
        let option = document.createElement("option");
        option.value = `${ano}-${mes}-${dia}`;
        option.textContent = `${nomeDia} - ${dia}/${mes}/${ano}`;
        selectData.appendChild(option);
        contador++;
      }
    }
  }

  function gerarHorarios() {
    const inicio = 9 * 60;
    const fim = 18 * 60;
    for(let minutos = inicio; minutos <= fim; minutos += 30) {
      const h = String(Math.floor(minutos / 60)).padStart(2, '0');
      const m = String(minutos % 60).padStart(2, '0');
      const option = document.createElement("option");
      option.value = `${h}:${m}`;
      option.textContent = `${h}:${m}`;
      selectHora.appendChild(option);
    }
  }

  function atualizarHorariosDisponiveis() {
    const dataSelecionada = selectData.value;
    for (const option of selectHora.options) {
      // Pula a primeira opção que é "Selecione um horário"
      if (option.value === "") continue; 
      
      if (horarioOcupado(dataSelecionada, option.value)) {
        option.disabled = true;
        option.textContent = `${option.value} - Ocupado`;
      } else {
        option.disabled = false;
        option.textContent = option.value;
      }
    }
  }

  function atualizarLista() {
    listaAgendamentos.innerHTML = "";
    if(agendamentos.length === 0) {
      const li = document.createElement("li");
      li.classList.add("no-agendamentos");
      li.textContent = "Nenhum agendamento ainda.";
      listaAgendamentos.appendChild(li);
      return;
    }
    agendamentos.forEach(ag => {
      const li = document.createElement("li");
      li.textContent = `${ag.data} às ${ag.hora} - ${ag.nome} (${ag.servico})`;
      listaAgendamentos.appendChild(li);
    });
  }

  function horarioOcupado(data, hora) {
    return agendamentos.some(ag => ag.data === data && ag.hora === hora);
  }

  function mostrarMensagemSucesso() {
    const existente = document.querySelector(".success-message");
    if (existente) existente.remove();

    const div = document.createElement("div");
    div.classList.add("success-message");
    div.innerHTML = `
      <h2>✅ Consulta agendada!</h2>
      <p>Obrigado por entrar em contato. Nossa equipe retornará o mais rápido possível.</p>
    `;

    formContainer.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  function mostrarMensagemErro(texto) {
    const existente = document.querySelector(".error-message");
    if (existente) existente.remove();

    const div = document.createElement("div");
    div.classList.add("error-message");
    div.textContent = texto;

    formContainer.appendChild(div);

    setTimeout(() => {
      div.remove();
    }, 3000);
  }

  // --- Inicialização ---
  gerarDiasUteis();
  gerarHorarios();
  atualizarLista();
  atualizarHorariosDisponiveis();

  // --- Event Listeners ---
  selectData.addEventListener('change', atualizarHorariosDisponiveis);

  agendamentoForm.addEventListener("submit", e => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const data = selectData.value;
    const hora = selectHora.value;
    const servico = document.getElementById("servico").value.trim();
    const observacao = document.getElementById("observacao").value.trim();

    if (!data || !hora || servico === "") {
        mostrarMensagemErro("⚠️ Por favor, preencha todos os campos obrigatórios.");
        return;
    }

    if(horarioOcupado(data, hora)) {
      mostrarMensagemErro("⚠️ Horário Ocupado! Por favor, escolha outro horário. Obrigado");
      return;
    }

    agendamentos.push({ nome, telefone, data, hora, servico, observacao });
    atualizarLista();
    salvarAgendamentos();
    atualizarHorariosDisponiveis();

    mostrarMensagemSucesso();

    agendamentoForm.reset();
    document.getElementById('servico').selectedIndex = 0;
  });


  // Fundo animado com partículas de dentes

  const canvas = document.getElementById('fundoCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function ajustarTamanho() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  ajustarTamanho();
  window.addEventListener('resize', ajustarTamanho);

  const dentePath = new Path2D("M12 2c-2 0-3 2-3 4v4a3 3 0 006 0V6c0-2-1-4-3-4z M6 10v5a6 6 0 0012 0v-5");

  class Particula {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = 15 + Math.random() * 20;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = 0.3 + Math.random() * 0.5;
      this.opacityDirection = 1;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.004;
      this.brilho = 0;
      this.brilhoDirection = 1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;

      if(this.x < -30) this.x = width + 30;
      else if(this.x > width + 30) this.x = -30;

      if(this.y < -30) this.y = height + 30;
      else if(this.y > height + 30) this.y = -30;

      this.opacity += 0.008 * this.opacityDirection;
      if(this.opacity >= 0.8) this.opacityDirection = -1;
      else if(this.opacity <= 0.3) this.opacityDirection = 1;

      this.brilho += 0.02 * this.brilhoDirection;
      if(this.brilho >= 0.7) this.brilhoDirection = -1;
      else if(this.brilho <= 0) this.brilhoDirection = 1;
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.size / 24, this.size / 24);
      ctx.globalAlpha = this.opacity;

      let brilhoCor = `rgba(255, 255, 255, ${this.brilho})`;
      ctx.fillStyle = '#6ea0f8';
      ctx.shadowColor = brilhoCor;
      ctx.shadowBlur = 12 * this.brilho;
      ctx.fill(dentePath);
      ctx.restore();
    }
  }

  const particulas = [];
  const NUM_PARTICULAS = 60;

  for(let i = 0; i < NUM_PARTICULAS; i++) {
    particulas.push(new Particula());
  }

  function animar() {
    ctx.clearRect(0, 0, width, height);
    particulas.forEach(p => {
      p.update();
      p.draw(ctx);
    });
    requestAnimationFrame(animar);
  }

  animar();