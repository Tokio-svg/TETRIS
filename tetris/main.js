// canvasにID=canvasの要素を取得
const canvas=document.getElementById("canvas");
// 各種変数を定義
// 画面高さ、幅
const Width = 400;
const Height = 500;
// タイマー
let timer = 0;
// キー入力用オブジェクト
const input = {};
// キーが押し込まれたらそのキーの名前のプロパティ値をtrueにし、
// キーが離されたらfalseにする
// たとえば上矢印キーが押されている間は input["ArrowUp"] === true となる
addEventListener("keydown", e => input[e.key] = true);
addEventListener("keyup", e => input[e.key] = false);
let click = false;
const start = document.getElementById('start_button');
// ボタンがクリックされたらclickにtrueを格納
start.addEventListener('mousedown',()=> {
    click = true;
});
addEventListener('mouseup',()=> {
    click = false;
});

// ----------------------
// コントローラークラスを定義
// ----------------------
class Controller {
    
    constructor() {
        this.view = new View();
        this.model = new Model();
    }
    
    // ゲームスタート処理
    start() {
        // this.main()を10ミリ秒ごとに呼び出すタイマーを設定
        this.intervalId = setInterval(()=>this.main(),17);
        // Modelのstart()メソッドを呼び出す
        this.model.start();
    }
    // ゲーム時メインルーチン
    main() {
        // メイン処理
        this.model.main();
        // 画面描画(modelを渡す)
        this.view.update(this.model);
    }
}

// ----------------------
// 画面描画クラスを定義
// ----------------------
class View {
    
    constructor() {
        // canvasのコンテキストを取得
        this.ctx = canvas.getContext('2d');
    }

    // 画面表示更新
    update(model) {
        // 画面をクリア
        this.ctx.clearRect(0, 0, Width, Height);
        // model.field配列から各マスを表示する
        for(let i=0;i<288;i++) {
            // getColor関数でmodel.field[i]の値から色情報を取得する
            this.ctx.fillStyle = getColor(model.field[i]);
            this.ctx.fillRect(i%12*17+50,Math.floor(i/12)*17+30,15,15);
        }
        // 待機状態の場合は終了
        if (model.mode === 0) {
            // 最上段から4段までを隠す
            this.ctx.fillStyle = 'rgb(18, 18, 18)';
            this.ctx.fillRect(50,30,204,68);
            return;
        }
        // 操作しているテトリミノを表示する
        if (model.player.flag != false) {
            for(let i=0;i<16;i++) {
                if (model.player.tetrimino.content[model.player.rotate][i] === 0) {continue}
                // getColor関数でmodel.player.tetrimino.content[model.player.rotate][i]の値から色情報を取得する
                this.ctx.fillStyle = getColor(model.player.tetrimino.content[model.player.rotate][i]);
                this.ctx.fillRect((i%4+model.player.x)*17+50,(Math.floor(i/4)+model.player.y)*17+30,15,15);
            }
        }
        // 最上段から4段までを隠す
        this.ctx.fillStyle = 'rgb(18, 18, 18)';
        this.ctx.fillRect(50,30,450,68);
        // 次のテトリミノを表示する
        for(let i=0;i<16;i++) {
            if (model.player.nextTetrimino.content[0][i] === 0) {continue}
            // getColor関数でmodel.player.nextTetrimino.content[0][i]の値から色情報を取得する
            this.ctx.fillStyle = getColor(model.player.nextTetrimino.content[0][i]);
            this.ctx.fillRect((i%4)*17+285,(Math.floor(i/4))*17+185,15,15);
        }
        // 得点とNEXTを表示する
        this.ctx.font = "30px serif";
        this.ctx.fillStyle = 'rgb(255, 255, 255)';
        this.ctx.fillText("SCORE :　" + model.score, 50, 60);
        this.ctx.fillText("NEXT", 280, 150);
        // 操作方法を表示する
        this.ctx.font = "20px serif";
        this.ctx.fillText("← →: move", 270, 320);
        this.ctx.fillText("↓: fall", 270, 350);
        this.ctx.fillText("Z X: rotate", 270, 380);
        // ゲームオーバー時の表示
        if (model.mode < 0) {
            this.ctx.font = "48px serif";
            this.ctx.fillStyle = 'rgb(0, 0, 180)';
            this.ctx.fillText("GAME OVER", 33, 253);
            this.ctx.fillStyle = 'rgb(255, 255, 255)';
            this.ctx.fillText("GAME OVER", 30, 250);
        }
    }
}

// ----------------------
// 数値に対応する色情報を返す関数を定義
// ----------------------
function getColor(num) {
    let color = 'rgb(100, 100, 100)';
    switch(num) {
        // -1:壁
        case -1:
            color = 'rgb(200, 200, 200)';
            break;
        // 0:空き
        case 0:
            color = 'rgb(0, 0, 0)';
            break;
        // 1:黄色(O)
        case 1:
            color = 'rgb(255, 255, 0)';
            break;
        // 2:水色(I)
        case 2:
            color = 'rgb(43, 241, 255)';
            break;
        // 3:紫(T)
        case 3:
            color = 'rgb(160, 43, 255)';
            break;
        // 4:赤(Z)
        case 4:
            color = 'rgb(255, 52, 52)';
            break;
        // 5:緑(S)
        case 5:
            color = 'rgb(93, 255, 52)';
            break;
        // 6:オレンジ(L)
        case 6:
            color = 'rgb(255, 143, 52)';
            break;
        // 7:青(J)
        case 7:
            color = 'rgb(66, 52, 255)';
            break;
    }
    return color;
}

// ----------------------
// モデルクラスを定義
// ----------------------
class Model {

    constructor() {
        // プレイヤーインスタンスを生成
        this.player = new Player();
        // 画面内情報格納用配列
        this.field = [
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
        ];
        // ゲームモード 1:プレイ -1:ゲームオーバー 0:待機状態
        this.mode = null;
        // 得点
        this.score = 0;
        // ゲームスピード
        this.speed = 30;
        // コンボフラグ
        this.combo = 0;
    }

    // スタート処理
    start() {
        // タイマーリセット
        timer = 0;
        // 得点リセット
        this.score = 0;
        // ゲームモードを変更
        this.mode = 0;
        // ゲームスピードリセット(初期値30)
        this.speed = 30;
        // コンボフラグリセット
        this.combo = 0;
        // 画面内情報格納用配列初期化
        this.field = [
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,0,0,0,0,0,0,0,0,0,0,-1,
            -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1
        ];
        // プレイヤ座標リセット
        this.player.x = 4;
        this.player.y = 1;
        // テトリミノ生成
        this.player.tetrimino.make(Math.floor(Math.random()*7)+1);
        this.player.nextTetrimino.make(Math.floor(Math.random()*7)+1);
    }

    // メイン処理
    main() {
        // 待機状態でクリックされたら開始
        if (this.mode === 0 && click === true) this.mode = 1;
        // ゲームオーバー時にボタンがクリックされたら再スタート
        if (this.mode < 0 && click === true) {
            this.start();
            this.mode = 1;
            return;
        }
        // 待機、ゲームオーバー時は何もしない
        if (this.mode <= 0) return;
        // タイマー加算
        timer++
        // this.player.tetrimino=nullなら新たなテトリミノを生成する
        this.player.next();
        // キー入力に応じて移動を行う
        this.player.move(this.field);
        // キー入力に応じて回転を行う
        this.player.rotation(this.field);
        // timerが一定に達するか高速落下フラグがtrueの場合は落下処理を行う
        if (timer%this.speed === 0 || input["ArrowDown"] === true) {
            this.player.fall(this.field);
            // ブロック消滅処理を行う
            this.delete(this.field);
            // ゲームオーバー判定処理
            this.checkOver(this.field);
            // 高速落下時は得点を加算
            if (input["ArrowDown"] === true) this.score += 10;
        }
    }

    // ブロック消滅処理
    delete(field) {
        // 最上段から順に判定処理を行い、
        // 消滅⇒該当の行より上の段を詰める処理を行う
        // 上からy段目の左からx番目のインデックスは
        // (y*12)+(x%12)で表される
        // 消滅した行の数をカウントするための変数line
        let line = 0;
        // 最上段から順に判定を行う
        for (let j = 0; j < 23; j++) {
            // 判定用変数dにtrueを格納
            let d = true;
            // 23段目の行のマスを左からチェックしていき、1つでも0があったらd=falseの後抜ける
            for (let i = 1; i < 11; i++) {
                if (field[(j * 12) + (i % 12)] === 0) {
                    d = false;
                    break;
                }
            }
            // 消滅処理を行う
            if (d === true) {
                blockDelete(field, j);
                line++;
            }
        }
        // 得点加算
        // 基本点
        let i = line**2  * 100;
        // コンボボーナス
        i = i + Math.floor(i*this.combo*0.1);
        this.score += i;
        // ゲームスピード変更チェック
        this.speed = 30 - Math.floor(this.score/1000);
        if (this.speed < 1) this.speed = 1;
        // コンボフラグ加算処理
        if (line === 0) {
            // 消滅が無かったらリセット
            this.combo = 0;
        }
        else {
            // 消滅が起こったらフラグ加算
            this.combo++;
        }
    }
    // ゲームオーバー判定処理
    checkOver(field) {
        for (let i = 37; i < 47; i++) {
            // 上から4段目に一つでも設置ブロックが存在したらゲームモードを-1にして抜ける
            if (field[i] > 0) {
                this.mode = -1;
                break;
            }
        }
    }
}
// ----------------------
// 指定の行のブロックを消去して
// 上段のブロックを詰める関数
// ----------------------
function blockDelete(field, row) {
    for (let j = 0; j < 23; j++) {
        // 最上段を超えたら抜ける
        if (row - j < 1) break;
        // row-j行目の内容をrow-j-1行目で上書きする
        for (let i = 1; i < 11; i++) {
            field[((row - j) * 12) + (i % 12)] = field[((row - j - 1) * 12) + (i % 12)];
        }
    }
}
// ----------------------
// プレイヤークラスを定義
// ----------------------
class Player {

    constructor() {
        // 動かしているテトリミノ(初期値null)
        this.tetrimino = new Tetrimino();
        // 所持テトリミノの回転情報
        this.rotate = 0;
        // 次のテトリミノ
        this.nextTetrimino = new Tetrimino();
        // 画面上の座標(初期値4,0)
        this.x = 4;
        this.y = 1;
        // テトリミノ所持フラグ
        this.flag = true;
    }

    // this.flag = falseなら新たなテトリミノを生成する
    next() {
        // nullでない場合は終了
        if (this.flag != false) {
            return;
        }
        // 次のテトリミノ受け渡し
        this.tetrimino.content = this.nextTetrimino.content;
        // 次のテトリミノ生成
        this.nextTetrimino.make(Math.floor(Math.random() * 7) + 1);
        // 所持フラグオン
        this.flag = true;
        // 回転情報をリセット
        this.rotate = 0;
        // 座標をリセット
        this.x = 4;
        this.y = 1;
    }

    // 落下処理
    fall(field) {
        // 移動先の座標で衝突判定を行い、衝突がある場合は設置処理の後returnで抜ける
        if (checkCollision(this.x, this.y + 1, this.tetrimino.content[this.rotate], field)) {
            // 設置した時点でのthis.xとthis.yから
            // this.tetrimino.contentの値をfieldに反映する
            setTetrimino(this.x,this.y,this.tetrimino.content[this.rotate],field);
            this.flag = false;
            return;
        }
        // y座標加算
        this.y++;
    }

    // 移動処理
    move(field) {
        // テトリミノ未所持の場合は終了
        if (this.flag === false) return;
        // 左が押されている場合は移動処理を行う
        if (input["ArrowLeft"]) {
            // 移動先の座標で衝突判定を行い、衝突がある場合は設置処理の後returnで抜ける
            if (!checkCollision(this.x - 1, this.y, this.tetrimino.content[this.rotate], field)) {
                this.x--;
                // 左入力を無効
                input["ArrowLeft"] = false;
            }
        }
        // 右が押されている場合は移動処理を行う
        if (input["ArrowRight"]) {
            // 移動先の座標で衝突判定を行い、衝突がある場合は設置処理の後returnで抜ける
            if (!checkCollision(this.x + 1, this.y, this.tetrimino.content[this.rotate], field)) {
                this.x++;
                // 右入力を無効
                input["ArrowRight"] = false;
            }
        }
    }

    // 回転処理
    rotation(field) {
        // テトリミノ未所持の場合は終了
        if (this.flag === false) return;
        // Zが押されている場合は左回転処理を行う
        if (input["z"]) {
            // 回転後の座標で衝突判定を行い、衝突が無い場合は回転処理の後returnで抜ける
            let i = this.rotate - 1;
            if (i<0) i = 3;
            if (!checkCollision(this.x, this.y, this.tetrimino.content[i], field)) {
                this.rotate = i;
                // z入力を無効
                input["z"] = false;
            }
        }
        // Xが押されている場合は右回転処理を行う
        if (input["x"]) {
            // 回転後の座標で衝突判定を行い、衝突が無い場合は回転処理の後returnで抜ける
            let i = this.rotate + 1;
            if (i>3) i = 0;
            if (!checkCollision(this.x, this.y, this.tetrimino.content[i], field)) {
                this.rotate = i;
                // x入力を無効
                input["x"] = false;
            }
        }
    }
}
// ------------------------------------------------------
// 座標とテトリミノ配列からfield配列情報を変更する関数を定義
// ------------------------------------------------------
function setTetrimino(x,y,tetrimino,field) {
    let tmp = null;
    for(let i=0;i<16;i++) {
        // tetriminoの内容が0ならやり直し
        if (tetrimino[i] === 0) {continue}
        // 該当のfieldインデックス番号を格納
        tmp = (y*12+x)+(Math.floor(i/4)*12+(i%4));
        // fieldのインデックス番号は(y*12+x)
        // 該当マスが-1でなければfieldを変更
        if (field[tmp] === -1) {continue}
        field[tmp] = tetrimino[i];
    }
}
// ------------------------------------------------------
// 座標とテトリミノ配列から衝突判定を返す関数を定義
// moveX, moveYには移動先の座標を指定する
// 衝突あり：true 衝突なし：false
// ------------------------------------------------------
function checkCollision(moveX, moveY, tetrimino, field) {
    let tmp = null;
    // returnで返すcheck変数初期化
    let check = false;
    // テトリミノの要素分チェックを行う
    for (let i = 0; i < 16; i++) {
        // tetriminoの内容が0ならやり直し
        if (tetrimino[i] === 0) { continue }
        // 該当のfieldインデックス番号を格納
        tmp = (moveY*12+moveX)+(Math.floor(i/4)*12+(i%4));
        // fieldのインデックス番号は(y*12+x)
        // 該当マスが0以外（壁、設置ブロック）であれば衝突ありとしてtrueを格納してループ終了
        if (field[tmp] !== 0) {
            check = true;
            break;
        }
    }
    return check;
}

// ----------------------
// テトリミノクラスを定義
// ----------------------
class Tetrimino {

    constructor() {
        // テトリミノ内容配列
        this.content = [
            // [0]初期状態
            [0,0,0,0,
            0,1,1,0,
            0,1,1,0,
            0,0,0,0],
            // [1]右90°
            [0,0,0,0,
            0,1,1,0,
            0,1,1,0,
            0,0,0,0],
            // [2]180°
            [0,0,0,0,
            0,1,1,0,
            0,1,1,0,
            0,0,0,0],
            // [3]左90°
            [0,0,0,0,
            0,1,1,0,
            0,1,1,0,
            0,0,0,0]
        ];
        // ランダムでthis.contentの値を変更
        this.make(Math.floor(Math.random()*7)+1);
    }

    // テトリミノの内容を格納
    make(b) {
        switch(b) {
            // 1:O
            case 1:
                this.content = [
                    // [0]初期状態
                    [0,0,0,0,
                    0,b,b,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    0,b,b,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [2]180°
                    [0,0,0,0,
                    0,b,b,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [3]左90°
                    [0,0,0,0,
                    0,b,b,0,
                    0,b,b,0,
                    0,0,0,0]
                ];
                break;
            // 2:I
            case 2:
                this.content = [
                    // [0]初期状態
                    [0,b,0,0,
                    0,b,0,0,
                    0,b,0,0,
                    0,b,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    b,b,b,b,
                    0,0,0,0,
                    0,0,0,0],
                    // [2]180°
                    [0,0,b,0,
                    0,0,b,0,
                    0,0,b,0,
                    0,0,b,0],
                    // [3]左90°
                    [0,0,0,0,
                    0,0,0,0,
                    b,b,b,b,
                    0,0,0,0]
                ];
                break;
            // 3:T
            case 3:
                this.content = [
                    // [0]初期状態
                    [0,0,0,0,
                    0,b,0,0,
                    b,b,b,0,
                    0,0,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    0,b,0,0,
                    0,b,b,0,
                    0,b,0,0],
                    // [2]180°
                    [0,0,0,0,
                    0,0,0,0,
                    b,b,b,0,
                    0,b,0,0],
                    // [3]左90°
                    [0,0,0,0,
                    0,b,0,0,
                    b,b,0,0,
                    0,b,0,0]
                ];
                break;
            // 4:Z
            case 4:
                this.content = [
                    // [0]初期状態
                    [0,0,0,0,
                    b,b,0,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    0,0,b,0,
                    0,b,b,0,
                    0,b,0,0],
                    // [2]180°
                    [0,0,0,0,
                    b,b,0,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [3]左90°
                    [0,0,0,0,
                    0,0,b,0,
                    0,b,b,0,
                    0,b,0,0]
                ];
                break;
            // 5:S
            case 5:
                this.content = [
                    // [0]初期状態
                    [0,0,0,0,
                    0,0,b,b,
                    0,b,b,0,
                    0,0,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    0,b,0,0,
                    0,b,b,0,
                    0,0,b,0],
                    // [2]180°
                    [0,0,0,0,
                    0,0,b,b,
                    0,b,b,0,
                    0,0,0,0],
                    // [3]左90°
                    [0,0,0,0,
                    0,b,0,0,
                    0,b,b,0,
                    0,0,b,0]
                ];
                break;
            // 6:L
            case 6:
                this.content = [
                    // [0]初期状態
                    [0,b,0,0,
                    0,b,0,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    0,b,b,b,
                    0,b,0,0,
                    0,0,0,0],
                    // [2]180°
                    [0,b,b,0,
                    0,0,b,0,
                    0,0,b,0,
                    0,0,0,0],
                    // [3]左90°
                    [0,0,0,0,
                    0,0,b,0,
                    b,b,b,0,
                    0,0,0,0]
                ];
                break;
            // 7:J
            case 7:
                this.content = [
                    // [0]初期状態
                    [0,0,b,0,
                    0,0,b,0,
                    0,b,b,0,
                    0,0,0,0],
                    // [1]右90°
                    [0,0,0,0,
                    0,b,0,0,
                    0,b,b,b,
                    0,0,0,0],
                    // [2]180°
                    [0,b,b,0,
                    0,b,0,0,
                    0,b,0,0,
                    0,0,0,0],
                    // [3]左90°
                    [0,0,0,0,
                    b,b,b,0,
                    0,0,b,0,
                    0,0,0,0]
                ];
                break;
        }
    }
}

// ----------------------
// ゲームスタート
// ----------------------
// Controllerクラスのインスタンスを生成
const Controll = new Controller();
// ゲーム起動
Controll.start();