const $ = (el) => document.querySelector(el);
const $$ = (el) => document.querySelectorAll(el);

console.log('scripts')

$('#toggler').addEventListener('click', (e) => {
  $$('input[name*=password]').forEach(item => {
    if (item.type === 'password') {
      console.log(item.type, item)
      item.type = 'text';
    } else {
      console.log(item.type, item)
      item.type = 'password';
    }
  });
});