// 캔버스 세팅
let canvas;
let ctx;
canvas = document.createElement("canvas");
ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 700;
document.body.appendChild(canvas);

//이미지 불러오는 함수 
let backgroundImage, locatImage, bulletImage, enemyImage, gameoverImage;
let gameOver = false // true이면 게임 끝남. 
let score = 0;

//우주선 좌표
let locatX = canvas.width / 2 - 32;
let locatY = canvas.height - 64;

let bulletList = [];

function Bullet() {
    this.x = 0;
    this.y = 0;
    this.init = function () {
        this.x = locatX + 7.3;
        this.y = locatY;
        this.alive = true; //  true면 살아있는 총알 
        bulletList.push(this);
    };

    this.update = function () { //총알 발사 함수
        this.y -= 7;
    };

    this.checkHit = function () {
        //2. 총알의y가 <= 적군의y 보다 작아진다 
        //And 총알.x >= 적군.x 총알.x <= 적군.x + 적군의 넓이
        for (let i = 0; i < enemyList.length; i++) {
            if (
                this.y <= enemyList[i].y &&
                this.x >= enemyList[i].x &&
                this.x <= enemyList[i].x + 40
            ) {
                //총알이 죽게됨 적군 없어짐. 점수 획득 
                score++;
                this.alive = false; //죽은 총알
                enemyList.splice(i, 1); //우주선 없에기 
            }

        }
    }
}

function generateRandomValue(min, max) {
    let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum;
}

let enemyList = [];

function Enemy() {
    this.x = 0;
    this.y = 0;
    this.init = function () {
        this.y = 0
        this.x = generateRandomValue(0, canvas.width - 64);
        enemyList.push(this);
    };
    this.update = function () {
        this.y += 5; //적군 속도 조절
        if (this.y >= canvas.height - 64) {
            gameOver = true;
            //console.log("겜끝")
        }
    }
}

function loadImage() {
    backgroundImage = new Image();
    backgroundImage.src = "images/background.jpg";

    locatImage = new Image();
    locatImage.src = "images/locat.png";

    bulletImage = new Image();
    bulletImage.src = "images/bullet.png";

    enemyImage = new Image();
    enemyImage.src = "images/enemy.png";

    gameoverImage = new Image();
    gameoverImage.src = "images/gameover.jpg";
}

//방향키 누르면 
let keyDown = {};

function setupKeyboard() {
    document.addEventListener("keydown", function (event) {
        //console.log("무슨 키가 눌려써?", event.keyCode);
        keyDown[event.keyCode] = true;
        //console.log("키다운 객체 값?", keyDown);
    });
    document.addEventListener("keyup", function () {
        delete keyDown[event.keyCode];
        //console.log("버튼 클릭 후", keyDown);

        if (event.keyCode == 32) {
            createBullet(); //총알생성

        }
    });
}

function createBullet() {
    //console.log("총알 생성!!");
    //console.log("새로운 총알 리스트", bulletList);
    let b = new Bullet(); //총알 하나 생성
    b.init();
}

function createEnemy() {
    const interval = setInterval(function () {
        let e = new Enemy()
        e.init();
    }, 1000);

}

function update() {
    if (39 in keyDown) { //오른쪽 방향키
        locatX += 5;
    }
    if (37 in keyDown) {
        locatX -= 5;
    }
    //우주선 배경화면안에 가두기
    if (locatX <= 0) {
        locatX = 0
    }
    if (locatX >= canvas.width - 64) {
        locatX = canvas.width - 64;
    }

    //총알의 y좌표 업데이트 함수
    for (let i = 0; i < bulletList.length; i++) {
        if (bulletList[i].alive) {
            bulletList[i].update();
            bulletList[i].checkHit();
        }
    }

    //적군 업데이트 함수
    for (let i = 0; i < enemyList.length; i++) {
        enemyList[i].update();
    }
}

//보여주는 함수 
function render() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(locatImage, locatX, locatY);
    ctx.fillText(`score:${score}`, 20, 20);
    ctx.font = "20px Arial";

    for (let i = 0; i < bulletList.length; i++) {
        if (bulletList[i].alive) {
            ctx.drawImage(bulletImage, bulletList[i].x, bulletList[i].y);
        }
    }

    for (let i = 0; i < enemyList.length; i++) {
        ctx.drawImage(enemyImage, enemyList[i].x, enemyList[i].y);
    }
}

//배경 계속 호출 할 함수
function main() {
    if (!gameOver) {
        update(); // 1. 좌표값을 업데이트하고
        render(); // 2. 그려주고 를 무한 반복하는게 게임의 원리☆
        requestAnimationFrame(main);
    } else {
        ctx.drawImage(gameoverImage, 50, 100, 300, 300);
    }
}

loadImage();
setupKeyboard();
createEnemy();
main();

/*방향키를 누르면
우주선의 xy좌표가 바뀌고
다시 render 그려준다.*/

/*총알 만들기
1. 스페이스바를 누르면 총알이 나온다.
2. 총알이 위로 올라간다 = y축이 줄어든다.
3. 스페이스바를 여러번 누르면 여러개의 총알이 발사된다. 
   = 배열에 담아서 총알마다 xy좌표값을 매겨준다. 
4. 총알 배열을 render한다 (class bullet에 담는 원리) */

/*적군 만들기
1. 커엽다
2. 위치가 랜덤하다
3. 랜덤한 위치 기반으로 밑으로 내려온다 = y좌표가 증가한다.
4. 1초마다 나온다
5. 적군의 우주선이 바닥에 닿으면 game over 
6. 적군과 총알이 만나면 적군이 사라지고 1점 획득!! */

/*적군이 죽는다
1. 총알이 적군에 닿는다
2. 총알의y가 <= 적군의y 보다 작아진다 
And 총알.x >= 적군.x 총알.x <= 적군.x + 적군의 넓이
=> 닿았다 
3. */