function createFavicon(): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = Math.random() <= 0.5 ? 'blue' : 'red';

  ctx.fillRect(0, 0, 1, 1);

  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => {
      if (blob == null) reject();
      const url = URL.createObjectURL(blob);
      resolve(url);
    })
  );
}

function setFavicon(url: string) {
  const favicon = document.createElement('link');
  favicon.id = 'favicon';
  favicon.type = 'image/x-icon';
  favicon.rel = 'icon';
  favicon.href = url;

  const oldFavicon = document.querySelector('#favicon') as HTMLLinkElement;
  if (oldFavicon) {
    oldFavicon.remove();
    URL.revokeObjectURL(oldFavicon.href);
  }

  document.head.appendChild(favicon);
}

async function changeFavicon() {
  const url = await createFavicon();
  setFavicon(url);
}

function startFaviconSwitching(time: number) {
  changeFavicon();
  setInterval(changeFavicon, time);
}

export { startFaviconSwitching };
