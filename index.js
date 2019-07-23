window.onload = function() {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  const CELL_SIZE = 20;
  const MAX_BULLET_COUNT = 3;
  const updateInfo = {
    bullet: {
      max: 1,
      count: 0,
    },
    villain: {
      max: 30,
      count: 0,
      dir: {
        x: 1,
        y: 0,
      }
    },
    villainShoot: {
      max: 30,
      count: 0,
    },
    reload: {
      max: 60,
      count: 0,
    }
  };
  const bulletStore = {
    bullet: {
      current: {},
      pool: [],
      add: function(n) {
        for (let i = 0; i < n; i ++) {
          const bullet = {
            id: i,
            owner: null,
            row: 0,
            col: 0,
            x: 0,
            y: 0,
            color: 'orange',
          };
          this.pool.push(bullet);
        }
      }
    }
  };
  let score = 0;
  let bulletLeft = MAX_BULLET_COUNT;
  let villainIndex = 0;

  const random = (min, max) => Math.random() * (max - min) + min;

  const updateCountData = function(key) {
    updateInfo[key].count ++;
    if (updateInfo[key].count > updateInfo[key].max) {
      updateInfo[key].count = 0
      return true;
    }
    return false;
  };

  const buildGrid = function(rows, cols) {
    const matrix = [];

    for (let i = 0; i < rows; i ++) {
        matrix[i] = [];
        for (let j = 0; j < cols; j ++)  {
            matrix[i][j] = 0;
        }
    }
    return matrix;
  }

  const resizeScene = function() {
    canvas.width = CELL_SIZE * matrix[0].length;
    canvas.height = matrix.length * CELL_SIZE;
    canvas.style.marginTop = `${((window.innerHeight / 2) - (canvas.height / 2))}px`;
  };

  const renderGrid = function(matrix) {
    for (let i = 0; i < matrix.length; i ++) {
      for (let j = 0; j < matrix[i].length; j ++) {
        const color = i < parseInt(matrix.length / 2) ? '#777777' : '#555555';
        context.strokeStyle = color;
        context.strokeRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  };

  const renderScore = function() {
    context.fillStyle = '#DDDDDD';
    context.font = `${CELL_SIZE}px Courier`;
    context.fillText('SCORE: ' + score, 5, CELL_SIZE * 0.8);
  };

  const renderBulletCount = function(n) {
    let row = 0;
    let col = (matrix[0].length - n) * CELL_SIZE;

    for (let i = 0; i < n; i ++) {
      context.fillStyle = 'green';
      context.strokeStyle = '#222222';
      context.lineWidth = 2;
      context.fillRect(col + i * CELL_SIZE, row, CELL_SIZE, CELL_SIZE);
      context.strokeRect(col + i * CELL_SIZE, row, CELL_SIZE, CELL_SIZE);
      context.lineWidth = 1;
    }
  };

  const placeBullet = function(bullet, row, col) {
    bullet.x = col * CELL_SIZE;
    bullet.y = row * CELL_SIZE;
    bullet.row = row;
    bullet.col = col;
  };

  const updateVillain = function() {
    if (villain.isEmpty()) {
      score ++;
      villainIndex ++;
      if (villainIndex > villainShapes.length - 1) {
        villainIndex = 0;
      }
      
      villain.init(villainShapes[villainIndex], 6, 6);
    }

    if (villain.getLastRow() >= matrix.length - 1) {
      resetGame();
    }

    const villainShootCountData = updateCountData('villainShoot');
    if (villainShootCountData) {
      updateInfo.villainShoot.max = parseInt(random(10, 100));
      shoot('v');
    }

    const villainCountData = updateCountData('villain');
    if (villainCountData) {
      villain.move(updateInfo.villain.dir.y, updateInfo.villain.dir.x);

      if (villain.getLastCol() > matrix[0].length - 1) {
        updateInfo.villain.dir.x *= -1;
        villain.move(1, updateInfo.villain.dir.x);
      }
      if (villain.getFirstCol() < 0) {
        updateInfo.villain.dir.x *= -1;
        villain.move(1, updateInfo.villain.dir.x); 
      }
    }
  };

  const updateBullets = function() {
    const bulletCountData = updateCountData('bullet');

    if (bulletCountData) {
      for (let i in bulletStore.bullet.current) {
        const bullet = bulletStore.bullet.current[i];
        if (bullet !== -1) {
          bullet.y += CELL_SIZE * bullet.dir;
          bullet.row += parseInt(`${bullet.dir}*${CELL_SIZE}`)
          if (bullet.y < 0 || bullet.y > canvas.height) {
            removeBullet(bullet);
          }
        }
      }
    }
  };

  const checkIntersections = function() {
    const bulletShipIntersect = checkIntersectWithBullet(ship, 1);
    const bulletVillainIntersect = checkIntersectWithBullet(villain, -1);

    if (bulletShipIntersect) {
      ship.removePart(bulletShipIntersect.entityPartID);
      removeBullet(bulletShipIntersect.bullet);
    }

    if (bulletVillainIntersect) {
      villain.removePart(bulletVillainIntersect.entityPartID);
      removeBullet(bulletVillainIntersect.bullet);
    }
  };

  const updateReload = function() {
    if (bulletLeft === MAX_BULLET_COUNT) return;

    const reloadCountData = updateCountData('reload');
    if (reloadCountData) {
      bulletLeft ++;
    }
  };

  const resetGame = function() {
    score = 0;
    bulletLeft = MAX_BULLET_COUNT;
    villain.init(villainShapes[0], 6, 6);
    ship.init(shipShape, shipPos.row, shipPos.col);
  };

  const update = function() {
    if (ship.isEmpty()) {
      resetGame();
      return;
    }
    updateBullets();
    updateVillain();
    checkIntersections();
    if (bulletLeft < MAX_BULLET_COUNT)
      updateReload();
  };

  const drawGround = function() {
    context.fillStyle = '#111111'; 
    context.strokeStyle = 'orange';
    context.lineWidth = 4;
    context.fillRect(0, canvas.height - CELL_SIZE, CELL_SIZE * matrix[0].length, CELL_SIZE);
    context.strokeRect(0, canvas.height - CELL_SIZE, CELL_SIZE * matrix[0].length, CELL_SIZE);
    context.lineWidth = 1;
  };

  const drawBullets = function() {
    for (let i in bulletStore.bullet.current) {
      const b = bulletStore.bullet.current[i];
      if (b !== -1) {
        context.fillStyle = b.dir === -1 ? 'green' : '#DDDDDD';
        context.fillRect(b.x, b.y, CELL_SIZE, CELL_SIZE);
      }
    }
  };

  const shoot = function(owner) {
    const bullet = bulletStore.bullet.pool.pop();
    bullet.dir = owner === 'v' ? 1 : -1;
    bulletStore.bullet.current[bullet.id] = bullet;

    let isFirstLastCol = random(0, 2);
    let row = 0;
    let col = 0;

    if (owner === 'v') {
      row = villain.getLastRow();
      col = isFirstLastCol >= 1 ? villain.getFirstCol() : villain.getLastCol();
    } else {
      row = ship.getFirstRow();
      col = ship.col + 1;
    }

    placeBullet(bullet, row, col);
  };

  const checkIntersectWithBullet = function(entity, dir) {
    for (let i in entity.partsDictionary) {
      const p1 = entity.partsDictionary[i];
      for (let j in bulletStore.bullet.current) {
        const p2 = bulletStore.bullet.current[j];
        if (p2.dir === dir) {
          if (checkIntersection(p1, p2)) {
            return { 
              entityPartID: p1.id,
              bullet: p2
            };
          }
        }
      }
    }
  };

  const checkIntersection = (p1, p2) => p1.row === p2.row && p1.col === p2.col;

  const removeBullet = function(bullet) {
    bulletStore.bullet.pool.push(bullet);
    bulletStore.bullet.current[bullet.id] = -1;
  };

  const draw = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    renderGrid(matrix);
    villain.draw(context);
    ship.draw(context);
    drawBullets();
    drawGround();
    renderScore();
    renderBulletCount(bulletLeft);
  };

  const tick = function() {
    update(); draw(); requestAnimationFrame(tick);
  };

  document.onkeydown = function({ keyCode }) {
    switch(keyCode) {
      case 32:
        if (bulletLeft > 0) {
          shoot('s');
          bulletLeft --;
        }
        break;
      case 37: 
        if (ship.getFirstCol() > 0) {
          ship.move(0, -1)
        }
        break;
      case 39:
        if (ship.getLastCol() < matrix[0].length - 1) {
          ship.move(0, 1)
        }
        break;
    }
  };

  let matrix = buildGrid(30, 15);
  resizeScene();

  const shipPos = {
    row: (matrix.length - 1) - (shipShape.matrix.length),
    col: 6,
  };
  const ship  = new Entity(shipShape, 'orange', CELL_SIZE, shipPos.row, shipPos.col);
  
  let villain = new Entity(villainShapes[0], 'red', CELL_SIZE, 6, 6, 0);
  bulletStore.bullet.add(50);

  tick();
}