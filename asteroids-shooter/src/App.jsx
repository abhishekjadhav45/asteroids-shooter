import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const WIDTH = 667;
const HEIGHT = 695;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function createAsteroid() {
  return {
    id: crypto.randomUUID(),
    x: randomRange(0, WIDTH),
    y: randomRange(0, HEIGHT),
    radius: randomRange(15, 30),
    angle: randomRange(0, 2 * Math.PI),
    speed: randomRange(1, 3),
  };
}

export default function App() {
  const canvasRef = useRef(null);

  const [ship, setShip] = useState({
    x: WIDTH / 2,
    y: HEIGHT / 2,
    angle: 0,
  });

  const [bullets, setBullets] = useState([]);
  const [asteroids, setAsteroids] = useState(
    Array.from({ length: 5 }).map(() => createAsteroid())
  );

  const keys = useRef({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
    };
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    function update() {
      setShip((s) => {
        let angle = s.angle;
        let x = s.x;
        let y = s.y;

        if (keys.current["ArrowLeft"]) {
          angle -= 0.05;
        }
        if (keys.current["ArrowRight"]) {
          angle += 0.05;
        }
        if (keys.current["ArrowUp"]) {
          x += Math.cos(angle) * 5;
          y += Math.sin(angle) * 5;
          if (x < 0) x = WIDTH;
          if (x > WIDTH) x = 0;
          if (y < 0) y = HEIGHT;
          if (y > HEIGHT) y = 0;
        }
        return { x, y, angle };
      });

      setBullets((oldBullets) =>
        oldBullets
          .map((b) => ({
            ...b,
            x: b.x + Math.cos(b.angle) * 10,
            y: b.y + Math.sin(b.angle) * 10,
            life: b.life - 1,
          }))
          .filter(
            (b) =>
              b.life > 0 && b.x >= 0 && b.x <= WIDTH && b.y >= 0 && b.y <= HEIGHT
          )
      );

      setAsteroids((oldAsteroids) =>
        oldAsteroids.map((a) => {
          let x = a.x + Math.cos(a.angle) * a.speed;
          let y = a.y + Math.sin(a.angle) * a.speed;
          if (x < 0) x = WIDTH;
          if (x > WIDTH) x = 0;
          if (y < 0) y = HEIGHT;
          if (y > HEIGHT) y = 0;
          return { ...a, x, y };
        })
      );

      setBullets((currentBullets) => {
        let survivingBullets = [];
        let survivingAsteroids = [...asteroids];
        currentBullets.forEach((b) => {
          let hit = false;
          for (let i = 0; i < survivingAsteroids.length; i++) {
            let a = survivingAsteroids[i];
            if (distance(b.x, b.y, a.x, a.y) < a.radius) {
              survivingAsteroids.splice(i, 1);
              hit = true;
              break;
            }
          }
          if (!hit) survivingBullets.push(b);
        });
        if (survivingAsteroids.length !== asteroids.length) {
          setAsteroids(survivingAsteroids);
        }
        return survivingBullets;
      });

      draw();

      requestAnimationFrame(update);
    }

    function draw() {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle);
      ctx.beginPath();
      ctx.moveTo(20, 0);
      ctx.lineTo(-15, 15);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-15, -15);
      ctx.closePath();
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.restore();

      bullets.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();
      });

      asteroids.forEach((a) => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "white";
        ctx.stroke();
      });
    }

    update();

    const handleSpace = (e) => {
      if (e.code === "Space") {
        setBullets((oldBullets) => [
          ...oldBullets,
          {
            id: crypto.randomUUID(),
            x: ship.x + Math.cos(ship.angle) * 20,
            y: ship.y + Math.sin(ship.angle) * 20,
            angle: ship.angle,
            life: 60,
          },
        ]);
      }
    };
    window.addEventListener("keydown", handleSpace);
    return () => window.removeEventListener("keydown", handleSpace);
  }, [ship, bullets, asteroids]);

  return (
    <div id="app-container">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} />
      <p
        style={{
          color: "white",
          textAlign: "center",
          marginTop: 10,
          fontFamily: "'Press Start 2P', cursive, monospace",
        }}
      >
        Use arrow keys to move (Up to thrust, Left/Right to rotate), Space to shoot
      </p>
    </div>
  );
}
