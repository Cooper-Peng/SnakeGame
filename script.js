// 获取画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏参数
const gridSize = 20; // 网格大小
const tileCount = canvas.width / gridSize; // 网格数量

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// 蛇的初始位置和速度
let snake = [
    { x: 10, y: 10 } // 蛇头位置
];
let velocityX = 0;
let velocityY = 0;
let lastVelocityX = 0;
let lastVelocityY = 0;

// 食物位置
let food = {
    x: 5,
    y: 5
};

// 游戏循环
let gameInterval;
let gameSpeed = 100; // 游戏速度（毫秒）
let speedLevel = 3; // 默认速度级别（1-5）

// 速度级别对应的毫秒数
const speedLevels = {
    1: 200, // 非常慢
    2: 150, // 慢
    3: 100, // 中等
    4: 70,  // 快
    5: 40   // 非常快
};

// 速度级别对应的文本描述
const speedTexts = {
    1: "非常慢",
    2: "慢",
    3: "中等",
    4: "快",
    5: "非常快"
};

// 获取DOM元素
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// 更新高分显示
highScoreElement.textContent = highScore;

// 初始化游戏
function initGame() {
    // 重置蛇
    snake = [
        { x: 10, y: 10 }
    ];
    
    // 重置速度
    velocityX = 0;
    velocityY = 0;
    lastVelocityX = 0;
    lastVelocityY = 0;
    
    // 重置分数
    score = 0;
    scoreElement.textContent = score;
    
    // 生成新食物
    generateFood();
    
    // 重置游戏状态
    gameOver = false;
    
    // 更新按钮状态
    updateButtonStates();
}

// 开始游戏
function startGame() {
    if (gameOver) {
        initGame();
    }
    
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    
    updateButtonStates();
}

// 暂停游戏
function pauseGame() {
    if (gameRunning && !gamePaused) {
        gamePaused = true;
        clearInterval(gameInterval);
    } else if (gameRunning && gamePaused) {
        gamePaused = false;
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    
    updateButtonStates();
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    initGame();
    gameRunning = false;
    gamePaused = false;
    updateButtonStates();
}

// 更新按钮状态
function updateButtonStates() {
    startBtn.disabled = gameRunning && !gamePaused && !gameOver;
    pauseBtn.disabled = !gameRunning || gameOver;
    pauseBtn.textContent = gamePaused ? '继续' : '暂停';
}

// 游戏主循环
function gameLoop() {
    if (gamePaused || gameOver) return;
    
    // 更新蛇的位置
    updateSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver = true;
        gameRunning = false;
        clearInterval(gameInterval);
        updateButtonStates();
        drawGame(); // 最后一次绘制，显示游戏结束状态
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 绘制游戏
    drawGame();
    
    // 保存当前方向
    lastVelocityX = velocityX;
    lastVelocityY = velocityY;
}

// 更新蛇的位置
function updateSnake() {
    // 创建新的蛇头
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };
    
    // 将新蛇头添加到蛇身体的前面
    snake.unshift(head);
    
    // 如果没有吃到食物，移除蛇尾
    if (!(head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    
    // 检查是否撞到自己的身体
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score++;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 生成新食物
        generateFood();
    }
}

// 生成食物
function generateFood() {
    // 随机生成食物位置
    let newFoodPosition;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 检查食物是否生成在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (newFoodPosition.x === snake[i].x && newFoodPosition.y === snake[i].y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFoodPosition;
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#1C1C1E';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制食物
    const foodRadius = gridSize / 2 - 2;
    ctx.fillStyle = '#FF3B30';
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        foodRadius,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#34C759'; // iOS绿色
        } else {
            ctx.fillStyle = '#30D158'; // 浅一点的绿色
        }
        
        // 圆角矩形
        const cornerRadius = 4;
        const x = segment.x * gridSize + 1;
        const y = segment.y * gridSize + 1;
        const width = gridSize - 2;
        const height = gridSize - 2;
        
        ctx.beginPath();
        ctx.moveTo(x + cornerRadius, y);
        ctx.lineTo(x + width - cornerRadius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + cornerRadius);
        ctx.lineTo(x + width, y + height - cornerRadius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - cornerRadius, y + height);
        ctx.lineTo(x + cornerRadius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - cornerRadius);
        ctx.lineTo(x, y + cornerRadius);
        ctx.quadraticCurveTo(x, y, x + cornerRadius, y);
        ctx.closePath();
        ctx.fill();
    });
    
    // 如果游戏结束，显示游戏结束文字
    if (gameOver) {
        // 半透明背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '30px -apple-system, BlinkMacSystemFont';
        ctx.fontWeight = 'bold';
        ctx.textAlign = 'center';
        ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px -apple-system, BlinkMacSystemFont';
        ctx.fillText('按开始按钮重新开始', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 键盘控制
document.addEventListener('keydown', function(event) {
    // 如果游戏未开始，按任意方向键开始游戏
    if (!gameRunning && !gameOver && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
        event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
        event.key === 'w' || event.key === 's' || 
        event.key === 'a' || event.key === 'd')) {
        startGame();
    }
    
    // 防止蛇反向移动（不能直接掉头）
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
            if (lastVelocityY !== 1) { // 不能向下时向上掉头
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
        case 's':
            if (lastVelocityY !== -1) { // 不能向上时向下掉头
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
        case 'a':
            if (lastVelocityX !== 1) { // 不能向右时向左掉头
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
        case 'd':
            if (lastVelocityX !== -1) { // 不能向左时向右掉头
                velocityX = 1;
                velocityY = 0;
            }
            break;
        case ' ': // 空格键暂停/继续
            pauseGame();
            break;
    }
});

// 触摸控制（移动端）
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', function(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    event.preventDefault();
});

canvas.addEventListener('touchmove', function(event) {
    if (!gameRunning && !gameOver) {
        startGame();
    }
    
    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;
    
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    
    // 判断滑动方向
    if (Math.abs(dx) > Math.abs(dy)) {
        // 水平滑动
        if (dx > 0 && lastVelocityX !== -1) { // 向右滑动
            velocityX = 1;
            velocityY = 0;
        } else if (dx < 0 && lastVelocityX !== 1) { // 向左滑动
            velocityX = -1;
            velocityY = 0;
        }
    } else {
        // 垂直滑动
        if (dy > 0 && lastVelocityY !== -1) { // 向下滑动
            velocityX = 0;
            velocityY = 1;
        } else if (dy < 0 && lastVelocityY !== 1) { // 向上滑动
            velocityX = 0;
            velocityY = -1;
        }
    }
    
    // 更新触摸起始位置
    touchStartX = touchEndX;
    touchStartY = touchEndY;
    
    event.preventDefault();
});

// 更新游戏速度
function updateGameSpeed(level) {
    speedLevel = level;
    gameSpeed = speedLevels[level];
    speedValue.textContent = speedTexts[level];
    
    // 如果游戏正在运行，重新设置游戏循环以应用新速度
    if (gameRunning && !gamePaused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// 按钮事件监听
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

// 速度滑块事件监听
speedSlider.addEventListener('input', function() {
    updateGameSpeed(parseInt(this.value));
});

// 初始化速度显示
updateGameSpeed(speedLevel);

// 初始化游戏
initGame();

// 初始绘制游戏
drawGame();