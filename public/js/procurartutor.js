var accounts = [
  {
    "nome": "Catarina Machado",
    "especializacao": "Português",
    "avaliacao": 3,
    "preco": 25,
    "image": "images/catarina.svg"
  },
  {
    "nome": "Leandro Martins",
    "especializacao": "História",
    "avaliacao": 5,
    "preco":50,
    "image": "images/Leandro.svg"
  },
  {
    "nome": "Gabriela Costa",
    "especializacao": "Música",
    "avaliacao": 4,
    "preco": 25,
    "image": "images/gabriela.svg"
  },
  {
    "nome": "Haruki Tanaka",
    "especializacao": "Japonês",
    "avaliacao": 5,
    "preco": 25,
    "image": "images/Haruki.jpeg"
  },
  {
    "nome": "Beatriz Sousa",
    "especializacao": "História",
    "avaliacao": 5,
    "preco": 30,
    "image": "images/beatriz.svg"
  },
  {
    "nome": "João Mateus",
    "especializacao": "História",
    "avaliacao": 4,
    "preco": 10,
    "image": "images/joao.svg"
  },
  {
    "nome": "João Pineda",
    "especializacao": "Matemática",
    "avaliacao": 5,
    "preco": 25,
    "image": "images/joaopineda.jpg"
  },
];

function compare_avaliacao(a, b) {
  if (a.avaliacao < b.avaliacao) return -1;
  if (a.avaliacao > b.avaliacao) return 1;
  return 0;
}

function compare_preco(a, b) {
  if (a.preco < b.preco) return -1;
  if (a.preco > b.preco) return 1;
  return 0;
}

function procurarTutor(change) {
  var procura = document.getElementById("procura").value;
  var div = document.getElementById("accounts-div");

  // Clonar o array para não modificar o original
  var users = accounts.slice();

  if (change !== null && change !== undefined) {
    var sortingorder = document.getElementById(change);

    if (change == 'avaliacao') {
      users.sort(compare_avaliacao);
      document.getElementById("preco").value = "";
    } else {
      users.sort(compare_preco);
      document.getElementById("avaliacao").value = "";
    }

    if (sortingorder.value == "down") {
      users.reverse();
    }
  }

  div.innerHTML = "";

  // Só filtrar e mostrar se houver pelo menos 4 caracteres
  if (procura !== "" && procura.length > 3) {
    users.forEach((user) => {
      if (user.especializacao.toLowerCase().includes(procura.toLowerCase())) {
        // Monta um link que passa o nome do tutor como parâmetro
        // Exemplo: perfiltutor.html?nome=Leandro+Martins
        var nomeParam = encodeURIComponent(user.nome);
        div.innerHTML += `
          <a href="perfil_tutor_vista_aluno.html?nome=${nomeParam}" class="tutor-link">
            <div class="tutor-card">
              <img src="${user.image}" alt="${user.nome}" class="tutor-image">
              <div class="tutor-info">
                <h3>${user.nome}</h3>
                <p class="tutor-subject">${user.especializacao}</p>
                <div class="tutor-rating">
                  <span class="rating-number">${user.avaliacao}</span>
                  <span class="star">★</span>
                </div>
              </div>
            </div>
          </a>
        `;
      }
    });
  }
}
