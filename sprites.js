(function () {
  function drawBackground(ctx, width, height, time) {
    ctx.save();
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#6ed7f2');
    sky.addColorStop(0.58, '#b9f3e4');
    sky.addColorStop(1, '#ffe5a8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const drift = (time || 0) * 8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = -1; i < 5; i += 1) {
      const cloudX = ((i * 115 - drift) % (width + 150)) - 70;
      const cloudY = 82 + (i % 2) * 72;
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 18, 0, Math.PI * 2);
      ctx.arc(cloudX + 24, cloudY - 10, 26, 0, Math.PI * 2);
      ctx.arc(cloudX + 54, cloudY, 19, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#7e9ed0';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.62);
    for (let x = 0; x <= width; x += 36) {
      ctx.lineTo(x, height * 0.62 - ((x / 36) % 3) * 18 - 18);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#526b9a';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.72);
    for (let x = 0; x <= width; x += 28) {
      ctx.lineTo(x, height * 0.72 - ((x / 28) % 2) * 22 - 10);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f8c85f';
    for (let x = 18; x < width; x += 46) {
      const y = height * 0.58 + (x % 31);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.arc(x + 7, y - 3, 4, 0, Math.PI * 2);
      ctx.arc(x + 14, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(ctx, width, height, groundHeight, offset) {
    ctx.save();
    const top = height - groundHeight;
    ctx.fillStyle = '#274b59';
    ctx.fillRect(0, top, width, groundHeight);
    ctx.fillStyle = '#6bd18b';
    ctx.fillRect(0, top, width, 9);
    ctx.strokeStyle = '#17313d';
    ctx.lineWidth = 3;
    const scroll = ((offset || 0) % 32 + 32) % 32;
    for (let x = -32 - scroll; x < width + 32; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, top + 13);
      ctx.lineTo(x + 16, top + 29);
      ctx.lineTo(x, top + 45);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 16, top + 29);
      ctx.lineTo(x + 32, top + 13);
      ctx.stroke();
    }
    ctx.fillStyle = '#b8f29c';
    for (let x = 8 - scroll; x < width; x += 48) {
      ctx.beginPath();
      ctx.arc(x, top + 61, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawBird(ctx, x, y, size, velocity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.max(-0.35, Math.min(0.45, velocity * 0.0012)));
    const s = size / 34;
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#17283a';
    ctx.fillStyle = '#314f72';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f3ead2';
    ctx.beginPath();
    ctx.ellipse(-3, 4, 8, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1e3348';
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-19, -13);
    ctx.lineTo(-14, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e3b64c';
    ctx.beginPath();
    ctx.moveTo(11, -3);
    ctx.lineTo(23, 1);
    ctx.lineTo(11, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff8e5';
    ctx.beginPath();
    ctx.arc(6, -5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#17283a';
    ctx.beginPath();
    ctx.arc(7, -5, 1.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
    ctx.save();
    const cap = 7;
    const drawTower = (top, bottom) => {
      ctx.fillStyle = '#d58aef';
      ctx.strokeStyle = '#241c48';
      ctx.lineWidth = 3;
      ctx.fillRect(x, top, pipeWidth, bottom - top);
      ctx.strokeRect(x + 1.5, top + 1.5, pipeWidth - 3, bottom - top - 3);
      ctx.fillStyle = '#ffe28a';
      for (let row = top + 14; row < bottom - 8; row += 20) {
        for (let col = x + 8; col < x + pipeWidth - 5; col += 18) {
          ctx.fillRect(col, row, 7, 8);
        }
      }
    };
    drawTower(0, gapTop);
    drawTower(gapBottom, height);
    ctx.fillStyle = '#f3b7ff';
    ctx.strokeStyle = '#241c48';
    ctx.lineWidth = 3;
    ctx.fillRect(x - 3, gapTop - cap, pipeWidth + 6, cap);
    ctx.strokeRect(x - 3, gapTop - cap, pipeWidth + 6, cap);
    ctx.fillRect(x - 3, gapBottom, pipeWidth + 6, cap);
    ctx.strokeRect(x - 3, gapBottom, pipeWidth + 6, cap);
    ctx.restore();
  }

  window.SPRITES = { drawBackground, drawGround, drawBird, drawPipe };
})();
