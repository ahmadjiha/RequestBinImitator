document.addEventListener('DOMContentLoaded', () => {
  const createBin = document.getElementById('create-bin');

  createBin.addEventListener('click', (event) => {
    event.preventDefault();
    const link = `${window.location.href}bin/`;
    fetch(link, {
      method: 'POST',
    })
      .then((res) => res.json())
      .then((data) => {
        window.location.href = data;
      });
  });
});
