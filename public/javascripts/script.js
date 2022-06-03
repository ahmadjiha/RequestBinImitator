function makeId(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

document.addEventListener('DOMContentLoaded', () => {
  const createBin = document.getElementById('create-bin');
  createBin.addEventListener('click', (event) => {
    event.preventDefault();
    const id = makeId(15);
    window.location.href = `${window.location.href}bin/view/${id}`;
  });
});
