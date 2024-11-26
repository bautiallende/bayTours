document.getElementById('searchToggle').addEventListener('click', function (e) {
    e.preventDefault();
    var searchForm = document.getElementById('searchForm');
    if (searchForm.style.display === 'none' || searchForm.style.display === '') {
      searchForm.style.display = 'flex';
    } else {
      searchForm.style.display = 'none';
    }
  });
  