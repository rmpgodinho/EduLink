var accounts = [
  {
    "nome": "Catarina Machado",
    "especializacao": "Português",
    "avaliacao": 3,
    "preco": 25
  },
  {
    "nome": "Leandro Martins",
    "especializacao": "História",
    "avaliacao": 5,
    "preco":50
  },
  {
    "nome": "Gabriela Costa",
    "especializacao": "Música",
    "avaliacao": 4,
    "preco": 25
  },
  {
    "nome": "Haruki Tanaka",
    "especializacao": "Japonês",
    "avaliacao": 5,
    "preco": 25
  },
  {
    "nome": "Beatriz Sousa",
    "especializacao": "História",
    "avaliacao": 5,
    "preco": 30
  },
  {
    "nome": "João Mateus",
    "especializacao": "História",
    "avaliacao": 4,
    "preco": 10
  },
  {
    "nome": "João Pineda",
    "especializacao": "Matemática",
    "avaliacao": 4,
    "preco": 25
  },
]

function compare_avaliacao( a, b ) {
  if ( a.avaliacao < b.avaliacao ){
    return -1;
  }
  if ( a.avaliacao > b.avaliacao ){
    return 1;
  }
  return 0;
}

function compare_preco( a, b ) {
  if ( a.preco < b.preco ){
    return -1;
  }
  if ( a.preco > b.preco ){
    return 1;
  }
  return 0;
}

function procurarTutor(change) {
    var procura = document.getElementById("procura").value
    var div = document.getElementById("accounts-div")
    
    var users = accounts
    if (change != null || change != undefined) {
        var sortingorder = document.getElementById(change)
        
        if (change == 'avaliacao') {
            users = users.sort(compare_avaliacao)
            document.getElementById("preco").value = ""
        } else {
            users = users.sort(compare_preco)
            document.getElementById("avaliacao").value = ""
        }

        if (sortingorder.value == "down")
            users = users.reverse()
    }

    div.innerHTML = ""
    if (procura != "" && procura.length > 3)
        users.forEach((user) => {
            if (user.especializacao.toLowerCase().includes(procura.toLowerCase())) {
                div.innerHTML += `
                    <div class="col-4">
                    <p>${user.nome}</p>
                    </div>  
                `
            }
        })
}  