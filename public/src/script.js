const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

const toggler = $('#toggler') || null;

if (toggler) {
  toggler.addEventListener('click', (e) => {
    $$('input[name*=password]').forEach(item => {
      if (item.type === 'password') {
        item.type = 'text';
      } else {
        item.type = 'password';
      }
    });
  });
}