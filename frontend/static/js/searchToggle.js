document.getElementById('searchToggle').addEventListener('click', function (e) {
  e.preventDefault();
  var searchForm = document.getElementById('searchForm');
  if (searchForm.style.display === 'none' || searchForm.style.display === '') {
      searchForm.style.display = 'flex';
  } else {
      searchForm.style.display = 'none';
  }
});
  

  document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    var id_grupo = document.querySelector('#searchForm input[name="id_grupo"]').value.trim();
    if (id_grupo) {
        window.location.href = '/grupo/' + encodeURIComponent(id_grupo);
    } else {
        alert('Por favor, ingrese un ID de grupo válido.');
    }
});