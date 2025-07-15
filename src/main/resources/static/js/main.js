document.addEventListener('DOMContentLoaded', function() {
    const card = document.querySelector('.card');
    if (card) {
        card.style.opacity = 0;
        setTimeout(() => {
            card.style.transition = 'opacity 0.7s';
            card.style.opacity = 1;
        }, 100);
    }
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                form.submit();
            }
        });
    }
}); 