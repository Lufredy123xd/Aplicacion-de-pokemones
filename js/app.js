const grillaPokemon = document.getElementById("pokemon-grid");
const barraBusqueda = document.getElementById("searchBar");
const modalmargen = document.getElementById("modal-overlay");
const modalContenedor = document.getElementById("pokemon-modal");
const botonBusqueda = document.querySelector(".search");
const limpiarCache=document.getElementById("limpiarCache");


 // lista completa de Pokémons almacenados
let listaPokemones= [];

// Función para obtener la lista de Pokémones desde la API
async function obtenerListaPokemones() {
  const respuesta = await fetch('https://pokeapi.co/api/v2/pokemon?limit=18');
  const datos = await respuesta.json();

  // Realizamos una petición por cada Pokémon para obtener su ID
  listaPokemones= await Promise.all(datos.results.map(async (pokemon) => {
    const pokemonDetallerespuesta = await fetch(pokemon.url);
    const pokemonDetalle = await pokemonDetallerespuesta.json();
    return {
      name: pokemon.name,
      id: pokemonDetalle.id, // Guardamos el ID del Pokémon
      types: pokemonDetalle.types.map(type => type.type.name),
    };
  }));

  mostrarPokemon(listaPokemones);
}

// Función para mostrar los Pokémones en el grid
function mostrarPokemon(arregloPokemones) {
  // Limpiar el grid antes de agregar nuevos Pokémon
  grillaPokemon.innerHTML = '';

  // Obtener la lista de favoritos desde el Local Storage
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

  // Recorremos el array de Pokémon y los mostramos en el grid
  arregloPokemones.forEach((pokemon) => {
    const tarjetaPokemon = document.createElement("div");
    tarjetaPokemon.classList.add("pokemon-card");

    // Comprobar si el Pokémon está en la lista de favoritos para cambiar el ícono
    const esFavorito = favoritos.includes(pokemon.id);

    // Generar el contenido de la tarjeta
    tarjetaPokemon.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.name}">
      <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
      <button type="button" class="favorito">
        <i class="${esFavorito ? 'fa-solid fa-star' : 'fa-regular fa-star'}"></i>
      </button>
    `;

    // Agregar evento al botón de favorito
    const botonFavorito = tarjetaPokemon.querySelector(".favorito");
    botonFavorito.addEventListener("click", function() {
      // Si el Pokémon no es favorito, guardarlo como favorito
      if (!esFavorito) {
       
        guardarPokemonFavorito(pokemon.id);
        botonFavorito.innerHTML = `<i class="fa-solid fa-star"></i>`;
        location.reload();
      }
    });

    // Agregar evento al card para mostrar detalles (ahora la función es correcta)
    tarjetaPokemon.addEventListener("click", () => obtenerDetallesPokemon(pokemon.name));

    // Añadir la tarjeta de Pokémon al grid
    grillaPokemon.appendChild(tarjetaPokemon);
  });
}

// Función para guardar un Pokémon favorito en el Local Storage
function guardarPokemonFavorito(pokemonId) {
  // Obtener la lista de favoritos existente
  const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  // Agregar el nuevo favorito si no está ya en la lista
  if (!favoritos.includes(pokemonId)) {
    favoritos.push(pokemonId);
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
    alert(`Pokémon ID ${pokemonId} guardado como favorito`);
   
  } else {
    alert(`Pokémon ID ${pokemonId} ya es un favorito`);
  }
}

// Renombramos la función que obtiene detalles del Pokémon
async function obtenerDetallesPokemon(pokemonName) {
  const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
  const pokemondatos = await respuesta.json();

  // Contenido de la tarjeta en el modal
  modalContenedor.innerHTML = `
    <div class="card-header">
      <img src="${pokemondatos.sprites.front_default}" alt="${pokemondatos.name}" class="pokemon-image">
      <h2>${pokemondatos.name}</h2>
    </div>
    <div class="card-body"> 
      <p><strong>Base Experience/Experiencia:</strong> ${pokemondatos.base_experience} XP</p>
      <p><strong>Height/Altura:</strong> ${pokemondatos.height / 10} m</p>
      <p><strong>Weight/Peso:</strong> ${pokemondatos.weight / 10} kg</p>
      <p><strong>Pokemon Types/Tipo:</strong></p>
      <div class="types">
        ${pokemondatos.types.map(type => `<span class="type ${type.type.name}">${type.type.name}</span>`).join('')}
      </div>
      <p><strong>Abilities/Habilidades:</strong></p>
      <div class="abilities">
        ${pokemondatos.abilities.map(ability => `<span class="ability">${ability.ability.name}</span>`).join('')}
      </div>
    </div>
  `;

  // Mostrar el modal y el overlay
  modalmargen.style.display = "block";
  modalContenedor.style.display = "block";

  // Añadir el evento para cerrar el modal al hacer clic en el overlay
  modalmargen.addEventListener("click", cerrarModal);
}

// Función para cerrar el modal
function cerrarModal() {
  modalmargen.style.display = "none";
  modalContenedor.style.display = "none";
  modalmargen.removeEventListener("click", cerrarModal);
}

botonBusqueda.addEventListener('click', function buscarPokemon() {
  const consultaBusqueda = barraBusqueda.value.toLowerCase();

  // Filtra los Pokémon según el nombre o el tipo
  const filtradoPokemon = listaPokemones.filter(pokemon =>
    pokemon.name.includes(consultaBusqueda) || 
    pokemon.types.some(tipo => tipo.includes(consultaBusqueda))
  );

  mostrarPokemon(filtradoPokemon);
});


// Helper: capitaliza el primer carácter del nombre
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Función para mostrar los Pokémon favoritos en el grid
function mostrarFavoritos() {

const favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];
  
  // Limpiar el grid antes de agregar nuevos Pokémon
  const favoritosGrid = document.getElementById("favoritos-grid");
  favoritosGrid.innerHTML = '';



  // Recorremos el array de IDs de Pokémon favoritos y los mostramos
  favoritos.forEach(async (pokemonId) => {
    const respuesta = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const pokemonDetalle = await respuesta.json();

    const tarjetaPokemon = document.createElement("div");
    tarjetaPokemon.classList.add("pokemon-card");

    // Generar el contenido de la tarjeta
    tarjetaPokemon.innerHTML = `
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonDetalle.id}.png" alt="${pokemonDetalle.name}">
      <h3>${capitalizeFirstLetter(pokemonDetalle.name)}</h3>
      <button type="button" class="favorito">
        <i class="fa-solid fa-star"></i>
      </button>
      
    `;

    if( tarjetaPokemon.innerHTML!=null)
      {
         h2=document.getElementById("h2-favoritos");
         h2.style.display="block";
      }

    // Añadir la tarjeta de Pokémon al grid de favoritos
    favoritosGrid.appendChild(tarjetaPokemon);
  });
}
limpiarCache.addEventListener('click', function() {

  localStorage.clear();
  alert('Cache limpiado exitosamente');
  location.reload();
  
});


// Llamada inicial para obtener la lista de Pokémones
obtenerListaPokemones().then(() => {
  
  mostrarFavoritos(); // Mostrar favoritos después de cargar Pokémon
});