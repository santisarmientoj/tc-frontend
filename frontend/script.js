window.onload = () => {
  const canvas = document.getElementById("miCanvas");
  const ctx = canvas.getContext("2d");

  // Dibujar un rectángulo
  ctx.fillStyle = "blue";
  ctx.fillRect(50, 50, 100, 100);

  // Dibujar un círculo
  ctx.beginPath();
  ctx.arc(250, 150, 50, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

  // Texto
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText("Hola Netlify!", 120, 250);
};