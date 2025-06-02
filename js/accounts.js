var accounts = [
  {
    "nome": "Mariana",
    "sobrenome": "Gonçalves",
    "email": "marianagoncalves@ua.pt",
    "password": "goncalves0206!",
    "tipo": "Aluno"
  },
  {
    "nome": "Beatriz",
    "sobrenome": "Sousa",
    "email": "beatrizsousa@ua.pt",
    "password": "8567Bs447.",
    "tipo": "Tutor"
  },
]

function login() {
  var email = document.getElementById("email").value
  var password = document.getElementById("password").value

  if (email == "") {
    alert("Need Email")
    return;
  }

  if (password == "") {
    alert("Need Password")
    return;
  }
  
  var valid = false
  accounts.forEach((user) => {
    if (user.email == email && user.password == password) {
      if (user.tipo == "Aluno") {
        window.location.href = "perfilaluno.html";
      } else {
        window.location.href = "perfiltutor.html";
      }
      valid = true
      return;
    }
  })

  if (!valid)
    alert("Wrong Credentials")

}

function criarconta() {
  var email = document.getElementById("email").value
  var password = document.getElementById("password").value
  var nome = document.getElementById("nome").value
  var sobrenome = document.getElementById("sobrenome").value

  if (nome == "") {
    alert("Need Nome")
    return;
  }

  if (sobrenome == "") {
    alert("Need Sobrenome")
    return;
  }

  if (email == "") {
    alert("Need Email")
    return;
  }

  if (password == "") {
    alert("Need Password")
    return;
  }

  var user = {
    "nome": nome,
    "sobrenome": sobrenome,
    "email": email,
    "password": password,
    "tipo": "Aluno"
  }

  accounts.push(user)
  console.log(accounts)

  window.location.href = "perfilaluno.html";
}