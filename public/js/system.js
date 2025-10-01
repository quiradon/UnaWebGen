
  
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
      if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      } else {
        dropdownMenu.classList.add('show');
      }
    });
  });

  document.querySelector('.navbar-toggler').addEventListener('click', function() {
    document.querySelector('.navbar-collapse').classList.toggle('show');
  });

  // Auto Scroll esse elemento deve estar presente somente na landing page
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



if (window.innerWidth < 768) {
  [].slice.call(document.querySelectorAll('[data-bss-disabled-mobile]')).forEach(function (elem) {
    elem.classList.remove('animated');
    elem.removeAttribute('data-bss-hover-animate');
    elem.removeAttribute('data-aos');
    elem.removeAttribute('data-bss-parallax-bg');
    elem.removeAttribute('data-bss-scroll-zoom');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var hoverAnimationTriggerList = [].slice.call(document.querySelectorAll('[data-bss-hover-animate]'));
  var hoverAnimationList = hoverAnimationTriggerList.forEach(function (hoverAnimationEl) {
    hoverAnimationEl.addEventListener('mouseenter', function(e){ e.target.classList.add('animated', e.target.dataset.bssHoverAnimate) });
    hoverAnimationEl.addEventListener('mouseleave', function(e){ e.target.classList.remove('animated', e.target.dataset.bssHoverAnimate) });
  });

  var toastTriggers = document.querySelectorAll('[data-bs-toggle="toast"]');

  for (let toastTrigger of toastTriggers) {
    toastTrigger.addEventListener('click', function () {
      var toastSelector = toastTrigger.getAttribute('data-bs-target');

      if (!toastSelector) return;

      try {
        var toastEl = document.querySelector(toastSelector);

        if (!toastEl) return;

        var toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
      catch(e) {
        console.error(e);
      }
    })
  }


});