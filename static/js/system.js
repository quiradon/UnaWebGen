document.querySelectorAll('.auto-open').forEach(function(element) {
  element.addEventListener('mouseleave', function() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      element.querySelector('.dropdown-menu').classList.remove('show');
    }
  });

  element.addEventListener('mouseenter', function() {
    if (window.matchMedia("(min-width: 768px)").matches) {
      element.querySelector('.dropdown-menu').classList.add('show');
    }
  });

  element.addEventListener('click', function() {
    const dropdownMenu = element.querySelector('.dropdown-menu');
    if (dropdownMenu.classList.contains('grow-menu')) {
      dropdownMenu.classList.remove('grow-menu');
    } else {
      dropdownMenu.classList.add('grow-menu');
    }
  });
});

document.querySelector('.navbar-toggler').addEventListener('click', function() {
  document.querySelector('.navbar-collapse').classList.toggle('show');
});

//Auto Scroll esse elemento deve estar presente somente na landing page
  document.querySelectorAll('#auto-scroll').forEach(function(element) {
    let isMouseOver = false;
    let isDragging = false;
    let startX;
    let scrollLeft;
  
    element.addEventListener('mouseenter', function() {
      isMouseOver = true;
    });
  
    element.addEventListener('mouseleave', function() {
      isMouseOver = false;
    });
  
    element.addEventListener('mousedown', function(e) {
      isDragging = true;
      startX = e.pageX - element.offsetLeft;
      scrollLeft = element.scrollLeft;
      element.classList.add('active');
    });
  
    element.addEventListener('mouseleave', function() {
      isDragging = false;
      element.classList.remove('active');
    });
  
    element.addEventListener('mouseup', function() {
      isDragging = false;
      element.classList.remove('active');
    });
  
    element.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - element.offsetLeft;
      const walk = (x - startX) * 2; // Multiplique por 2 para aumentar a velocidade de arrasto
      element.scrollLeft = scrollLeft - walk;
    });
  
    function scrollRight() {
      if (!isMouseOver) {
        const cardWidth = element.querySelector('.card').offsetWidth;
        if (element.scrollLeft < element.scrollWidth - element.clientWidth) {
          element.scrollBy({ left: cardWidth, behavior: 'smooth' });
        } else {
          element.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }
  
    setInterval(scrollRight, 2000); // Ajuste o intervalo conforme necessário
  });