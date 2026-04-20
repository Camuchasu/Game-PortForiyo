// 星のパーティクル管理クラス
class StarParticle {
    constructor(canvasWidth, canvasHeight) {
        // [規約] グローバル変数やクラスメンバは m_ で開始、一文字目は大文字
        this.m_X = Math.random() * canvasWidth;
        this.m_Y = Math.random() * canvasHeight;
        this.m_Radius = Math.random() * 2 + 0.5; // 星の大きさを設定する

        // 白やオフホワイト系に加えて、黄色（ゴールド系）を復活（点滅はしません）
        // [規約] ローカル変数は m_ をつけない
        const colors = [
            'rgba(255, 255, 255, ',  // ピュアホワイトに設定
            'rgba(253, 251, 247, ',  // オフホワイトに設定
            'rgba(255, 215, 0, '     // 黄色（ゴールド系）に設定
        ];

        // 星の色をランダムに選ぶ
        const randomColorPrefix = colors[Math.floor(Math.random() * colors.length)];

        // 変数へ保持する定数の透明度（チカチカしないよう透明度を固定にする）
        const initialAlpha = Math.random() * 0.4 + 0.1; // 0.1〜0.5程度の落ち着いた透明度に設定

        // カラーストリングを保存する
        this.m_ColorPrefix = randomColorPrefix;
        // 透明度を保存する
        this.m_Alpha = initialAlpha;

        // 点滅（ちかちか）をなくすため、透明度の変更速度と方向を0にする
        this.m_BlinkSpeed = 0;
        this.m_BlinkDirection = 0;

        // 上昇する・ふわふわ動く速度をランダムに設定する
        this.m_SpeedY = Math.random() * 0.4 + 0.1;
        this.m_SpeedX = (Math.random() - 0.5) * 0.2;
    }

    update(canvasWidth, canvasHeight, scrollVelocity = 0) {
        // 位置のX座標を更新する
        this.m_X += this.m_SpeedX;
        // 位置のY座標を更新する（ゆっくり上に登る基本分）
        this.m_Y -= this.m_SpeedY;

        // --- パララックス（視差効果）によるY座標の更新 ---
        // 変化がよりハッキリと分かるよう、視差係数（動きの幅幅）を大きく引き上げました (0.4 -> 1.2)
        const parallaxFactor = this.m_Radius * 1.2;
        // スクロール速度に視差係数を掛けた分だけ移動させる
        this.m_Y -= scrollVelocity * parallaxFactor;

        // 透明度の更新を行う（ちかちかを止めたため変化しません）
        this.m_Alpha += this.m_BlinkSpeed * this.m_BlinkDirection;

        // 画面上部を越えたら下部へループさせる
        if (this.m_Y + this.m_Radius < 0) {
            // Y座標を画面下部にリセットする
            this.m_Y = canvasHeight + this.m_Radius;
            // X座標をランダムに配置し直す
            this.m_X = Math.random() * canvasWidth;
            // 反対に画面下部を越えたら上部へループさせる（上への急速なスクロール対応）
        } else if (this.m_Y - this.m_Radius > canvasHeight) {
            // Y座標を画面上部にリセットする
            this.m_Y = -this.m_Radius;
            // X座標をランダムに配置し直す
            this.m_X = Math.random() * canvasWidth;
        }

        // 画面の右端を越えた時の左右ループ処理を行う
        if (this.m_X > canvasWidth) {
            this.m_X = 0;
            // 画面の左端を越えた時の左右ループ処理を行う
        } else if (this.m_X < 0) {
            this.m_X = canvasWidth;
        }
    }

    draw(ctx) {
        // [規約] ローカル変数は m_ をつけない
        const currentColor = this.m_ColorPrefix + this.m_Alpha + ')';

        // パスを描き始める
        ctx.beginPath();
        // 円を描くパスを設定する
        ctx.arc(this.m_X, this.m_Y, this.m_Radius, 0, Math.PI * 2);
        // 塗りつぶしの色を設定する
        ctx.fillStyle = currentColor;

        // わずかに光をまとわせる（チカチカしない程度）
        ctx.shadowBlur = 5;
        // 影（光）の色を設定する
        ctx.shadowColor = currentColor;

        // 図形を塗りつぶす
        ctx.fill();
        // パスを閉じる
        ctx.closePath();
    }
}

// 流れ星を管理するクラス
class ShootingStar {
    constructor() {
        // リセット処理を行い、初期状態にする
        this.reset();
    }

    reset() {
        // アクティブな状態かどうかを判定するフラグ
        this.m_IsActive = false;
        // 発生するまでの待機時間（少し遅め＝間隔を長く設定：300〜700フレーム待ち）
        this.m_WaitTime = Math.random() * 400 + 300;
        // X座標の初期化
        this.m_X = 0;
        // Y座標の初期化
        this.m_Y = 0;
        // Xの移動速度の初期化
        this.m_SpeedX = 0;
        // Yの移動速度の初期化
        this.m_SpeedY = 0;
        // 流れ星の長さの初期化
        this.m_Length = 0;
        // 透明度の初期化
        this.m_Opacity = 0;
    }

    spawn(canvasWidth, canvasHeight) {
        // 流れ星を発生させてアクティブにする
        this.m_IsActive = true;
        // ランダムなX座標から出現させる
        this.m_X = Math.random() * canvasWidth;
        // 画面の上半分から出現させる
        this.m_Y = Math.random() * (canvasHeight / 2);

        // 右下に向かって速く移動させるための速度X
        this.m_SpeedX = Math.random() * 5 + 5;
        // 右下に向かって速く移動させるための速度Y
        this.m_SpeedY = Math.random() * 5 + 5;

        // 流れ星の尾の長さを少し大きく長く設定する
        this.m_Length = Math.random() * 120 + 80;
        // 初期状態は完全に表示する（不透明にする）
        this.m_Opacity = 1.0;
    }

    update(canvasWidth, canvasHeight) {
        // もし流れ星が発生していなければ待機時間を減らす
        if (!this.m_IsActive) {
            // タイマーを1減らす
            this.m_WaitTime -= 1;
            // タイマーが0以下になったら出現させる
            if (this.m_WaitTime <= 0) {
                // 出現処理を実行する
                this.spawn(canvasWidth, canvasHeight);
            }
            // その他の処理はせず終了する
            return;
        }

        // 流れ星のX座標を更新する
        this.m_X += this.m_SpeedX;
        // 流れ星のY座標を更新する
        this.m_Y += this.m_SpeedY;

        // 時間とともに透明度を下げてフェードアウトさせる
        this.m_Opacity -= 0.015;

        // 完全に消えるか、画面外に出たら再びリセットする
        if (this.m_Opacity <= 0 || this.m_X > canvasWidth + this.m_Length || this.m_Y > canvasHeight + this.m_Length) {
            // 初期状態に戻す
            this.reset();
        }
    }

    draw(ctx) {
        // アクティブでない場合は何も描かない
        if (!this.m_IsActive) return;

        // 線の描画を開始する
        ctx.beginPath();
        // 流れ星の尾の端点を計算して移動する
        ctx.moveTo(this.m_X - this.m_Length, this.m_Y - this.m_Length);
        // 流れ星の先頭に向けて線を引く
        ctx.lineTo(this.m_X, this.m_Y);
        // 白色のグラデーション（透明度付き）を設定する
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.m_Opacity})`;
        // 線の太さを少し太く（大きく）設定する
        ctx.lineWidth = 3.5;
        // わすかに光らせる（Shadow）
        ctx.shadowBlur = 15;
        // 光の色を設定する
        ctx.shadowColor = `rgba(255, 255, 255, ${this.m_Opacity})`;
        // 色を適用して描画する
        ctx.stroke();
        // 描画パスを終了する
        ctx.closePath();
    }
}

// キャンバス要素の変数
let m_Canvas;
// コンテキスト要素の変数
let m_Ctx;
// 星の配列を格納する変数
let m_ParticlesArray = [];
// 流れ星の配列を格納する変数
let m_ShootingStarsArray = [];

// --- スクロール（パララックス）用のグローバル変数 ---
// 現在のスクロール位置（目標値）
let m_CurrentScrollY = 0;
// 慣性（イージング）追従中の現在のスクロール位置
let m_EasedScrollY = 0;
// 前回のフレームでの慣性スクロール位置（差分計算用）
let m_LastEasedScrollY = 0;

// --- 編集モード用のグローバル変数 ---
// 編集モード中かどうかのフラグ
let m_IsEditMode = false;
// 現在選択中のメディア（画像・動画）枠
let m_CurrentMediaTarget = null;
// 作品一覧のコンテナ要素
let m_WorksGridContainer;
// AboutMeのコンテナ要素
let m_AboutContainer;
// コンタクトのコンテナ要素
let m_ContactContainer;
// メディアモーダル要素
let m_MediaModal;
// モーダルの枠要素
let m_ModalBody;
// モーダルの閉じるボタン要素
let m_ModalCloseBtn;

// --- 星座スキルツリー用のグローバル変数 ---
// 星座の親コンテナ
let m_ConstellationContainer;
// 星を結ぶ線を描画するSVG
let m_ConstellationSvg;
// 全ての星（ノード）リスト
let m_StarNodes = [];

// --- データベース(IndexedDB)用のグローバル変数 ---
// ブラウザを更新しても動画や画像を永続的に保存するために利用する仕組み
// データベース名の設定
const m_DbName = 'PortfolioMediaDB';
// ストア名の設定
const m_StoreName = 'media_store';
// データベースインスタンスの保持
let m_DB = null;

// データベースの初期化を行う

// --- 作品カルーセル用のグローバル変数 ---
let m_CarouselIndex = 0;
let m_CarouselCards = [];
let m_CarouselRadius = 360;

function initCarousel() {
    const grid = document.getElementById('works-grid');
    if (!grid) return;

    // 最新のカード一覧を取得
    m_CarouselCards = Array.from(grid.querySelectorAll('.glass-card'));
    if (m_CarouselCards.length === 0) return;

    if (m_IsEditMode) {
        // 編集モードなら3D配置を解除して通常グリッドに戻す
        grid.style.transform = '';
        m_CarouselCards.forEach(card => {
            card.style.transform = '';
            card.classList.remove('carousel-active');
        });
        return;
    }

    // 代表作（マスターピース）が最初に表示されるようにインデックスを合わせる
    let masterpieceIdx = m_CarouselCards.findIndex(card => card.classList.contains('masterpiece-card'));
    if (masterpieceIdx === -1) masterpieceIdx = 0;

    m_CarouselIndex = masterpieceIdx;
    updateCarouselDisplay();
}

function updateCarouselDisplay() {
    const grid = document.getElementById('works-grid');
    if (!grid || m_IsEditMode || m_CarouselCards.length === 0) return;

    const numCards = m_CarouselCards.length;

    m_CarouselCards.forEach((card, index) => {
        let diff = (index - m_CarouselIndex) % numCards;
        if (diff < 0) diff += numCards;

        // クラスの付け外し（フロントのみアクティブ化）
        if (diff === 0) {
            card.classList.add('carousel-active');
        } else {
            card.classList.remove('carousel-active');
        }
        
        // --- ユーザーの指定画像（手前・両隣・一番後ろ）に基づく立体ビルボード配置 ---
        // 常に正面（rotateY(0deg)）を向けつつ、Z軸とスケールで遠近感を出す
        if (diff === 0) {
            // 0: 一番手前（明るく、大きい）
            card.style.transform = `translateX(0px) translateZ(0px) scale(1)`;
            card.style.opacity = '1';
            card.style.zIndex = '10';
            card.style.filter = 'brightness(1)';
        } else if (diff === 1) {
            // 1: 右隣（少し遠く、暗め）
            // カードが600px幅になることを考慮し、X軸を大きくずらす
            card.style.transform = `translateX(380px) translateZ(-150px) scale(0.8)`;
            card.style.opacity = '0.6';
            card.style.zIndex = '5';
            card.style.filter = 'brightness(0.5)';
        } else if (diff === numCards - 1) {
            // 3(最後の要素): 左隣（少し遠く、暗め）
            card.style.transform = `translateX(-380px) translateZ(-150px) scale(0.8)`;
            card.style.opacity = '0.6';
            card.style.zIndex = '5';
            card.style.filter = 'brightness(0.5)';
        } else {
            // 2(それ以外): 一番後ろ（さらに暗く、遠目）
            card.style.transform = `translateX(0px) translateZ(-300px) scale(0.5)`;
            card.style.opacity = '0.3';
            card.style.zIndex = '1';
            card.style.filter = 'brightness(0.3)';
        }
    });

    // コンテナ自体の回転は行わない（カードが常に前を向くように）
    grid.style.transform = `translateZ(0px) rotateY(0deg)`;
}

function rotateCarousel(direction) {
    if (m_CarouselCards.length === 0 || m_IsEditMode) return;
    m_CarouselIndex += direction;
    if (m_CarouselIndex < 0) {
        m_CarouselIndex = m_CarouselCards.length - 1;
    } else if (m_CarouselIndex >= m_CarouselCards.length) {
        m_CarouselIndex = 0;
    }
    updateCarouselDisplay();
}

function initDB(callback) {
    // IndexedDBを開くリクエストを送信する
    const request = indexedDB.open(m_DbName, 1);

    // 初回起動時やバージョンアップ時にテーブルを作成する
    request.onupgradeneeded = (e) => {
        // データベースインスタンスを取得する
        m_DB = e.target.result;
        // メディアを保存するためのストアを作成する
        if (!m_DB.objectStoreNames.contains(m_StoreName)) {
            // オブジェクトストアを生成する
            m_DB.createObjectStore(m_StoreName);
        }
    };

    // DBが正常に開けた時の処理
    request.onsuccess = (e) => {
        // データベースインスタンスを格納する
        m_DB = e.target.result;
        // コールバックが指定されていれば実行する
        if (callback) callback();
    };

    // DBの読み込みに失敗した時の処理
    request.onerror = (e) => {
        // エラーログを表示する
        console.error("IndexedDBエラー", e);
    };
}

// データベースにメディアファイル（動画・画像）を保存する
function saveMediaToDB(id, file, callback) {
    // データベースが無ければ処理を終わる
    if (!m_DB) return;

    // トランザクションを開始し、データを書き込む権限を設定する
    const tx = m_DB.transaction(m_StoreName, 'readwrite');
    // ストアを取り出す
    const store = tx.objectStore(m_StoreName);
    // データを挿入（あるいは上書き）する
    store.put(file, id);

    // 保存完了時のコールバックを実行する
    tx.oncomplete = () => {
        // コールバック関数を呼ぶ
        if (callback) callback();
    };
}

// データベースからメディアファイル（動画・画像）を取り出す
function loadMediaFromDB(id, callback) {
    // データベースが無ければnullを返す
    if (!m_DB) {
        // コールバックにnullを渡す
        callback(null);
        return;
    }

    // 読み込み専用のトランザクションを開始する
    const tx = m_DB.transaction(m_StoreName, 'readonly');
    // ストアを取り出す
    const store = tx.objectStore(m_StoreName);
    // データを取り出すリクエストを送る
    const request = store.get(id);

    request.onsuccess = (e) => {
        // 読み込んだファイルをそのままコールバックに渡す
        callback(e.target.result);
    };
}

function init() {
    // Canvasタグの取得を行う
    m_Canvas = document.getElementById('starfield');
    // canvasが見つからない場合は処理中断する
    if (!m_Canvas) return;

    // 2Dコンテキストを取得する
    m_Ctx = m_Canvas.getContext('2d');

    // リサイズイベントの登録を行う
    window.addEventListener('resize', handleResize);

    // スクロールイベントの登録を行う（パララックス用）
    window.addEventListener('scroll', () => {
        // 現在のスクロール位置を更新する（全ブラウザ環境に確実に対応するため判定を強化）
        m_CurrentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    });
    // 初期スクロール位置を取得してセットする
    m_CurrentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    m_EasedScrollY = m_CurrentScrollY;
    m_LastEasedScrollY = m_CurrentScrollY;

    // 初期サイズ設定とパーティクル生成処理を呼ぶ
    handleResize();

    // アニメーションループ開始する
    animate();

    // データベースを初期化したあとに、復元や編集モードの準備をする
    initDB(() => {
        // 編集モードの初期化処理を呼ぶ
        initEditMode();
    });
}

function handleResize() {
    // 画面の幅をキャンバスに設定する
    m_Canvas.width = window.innerWidth;
    // 画面の高さをキャンバスに設定する
    m_Canvas.height = window.innerHeight;

    // 画面サイズに合わせてパーティクル数を調整する
    const particleCount = Math.floor((m_Canvas.width * m_Canvas.height) / 8000);

    // 星配列を空にする
    m_ParticlesArray = [];
    // ループを回して星を作成する
    for (let i = 0; i < particleCount; i++) {
        // 新しい星を配列に追加する
        m_ParticlesArray.push(new StarParticle(m_Canvas.width, m_Canvas.height));
    }

    // 流れ星配列を空にする
    m_ShootingStarsArray = [];
    // ランダムなタイミングで発生する流れ星を2つ登録する
    for (let i = 0; i < 2; i++) {
        // 新しい流れ星を配列に追加する
        m_ShootingStarsArray.push(new ShootingStar());
    }
}

function animate() {
    // 古い描画を完全に消去して、透明なキャンバスを保ちます（CSSの綺麗なグラデーションを見せるため）
    m_Ctx.clearRect(0, 0, m_Canvas.width, m_Canvas.height);

    // --- パララックス用：スクロール速度（慣性つき）の計算 ---
    // 絶対位置としての「目標スクロール量」へ、現在の「慣性スクロール量」を0.1ずつ近づける（イージング処理）
    m_EasedScrollY += (m_CurrentScrollY - m_EasedScrollY) * 0.1;
    // 今のフレームで実際に星が動くべき量（差分＝速度）を算出する
    const currentVelocity = m_EasedScrollY - m_LastEasedScrollY;
    // 今回の位置を「前回の位置」として上書き保存する
    m_LastEasedScrollY = m_EasedScrollY;

    // 星を1つずつ更新と描画する
    for (let i = 0; i < m_ParticlesArray.length; i++) {
        // 星の更新処理（イージング済みのスクロール速度を渡す）
        m_ParticlesArray[i].update(m_Canvas.width, m_Canvas.height, currentVelocity);
        // 星の描画処理
        m_ParticlesArray[i].draw(m_Ctx);
    }

    // 流れ星を1つずつ更新と描画する
    for (let i = 0; i < m_ShootingStarsArray.length; i++) {
        // 流れ星の更新処理
        m_ShootingStarsArray[i].update(m_Canvas.width, m_Canvas.height);
        // 流れ星の描画処理
        m_ShootingStarsArray[i].draw(m_Ctx);
    }

    // アニメーション処理のループを行う
    requestAnimationFrame(animate);
}

function initEditMode() {
    // 編集ボタンの取得を行う
    const editBtn = document.getElementById('edit-mode-btn');
    // ファイルアップローダーの取得を行う
    const uploader = document.getElementById('media-uploader');
    // 作品のコンテナ要素を取得する
    m_WorksGridContainer = document.getElementById('works-grid');
    // AboutMeのコンテナ要素を取得する
    m_AboutContainer = document.getElementById('about-container');
    // コンタクトのコンテナ要素を取得する
    m_ContactContainer = document.getElementById('contact');
    // メディア拡大用のモーダル要素を取得する
    m_MediaModal = document.getElementById('media-modal');
    // モーダルの枠を取得する
    m_ModalBody = document.getElementById('modal-body');
    // モーダルの閉じるボタンを取得する
    m_ModalCloseBtn = document.getElementById('modal-close-btn');

    // === 星座システム用の要素取得 ===
    m_ConstellationContainer = document.getElementById('constellation-container');
    m_ConstellationSvg = document.getElementById('constellation-svg');

    // 必須要素が無ければ実行しない
    if (!editBtn || !uploader || !m_WorksGridContainer || !m_AboutContainer) return;

    // --- GAMES & WORKSの復元処理 ---
    // ページロード時に保存されたHTMLがあれば復元する処理
    const savedWorksHTML = localStorage.getItem('portfolioWorksHTML');
    if (savedWorksHTML) {
        // ストレージのHTMLを反映する
        m_WorksGridContainer.innerHTML = savedWorksHTML;

        // 【追加修正】: 古いセーブデータ（代表作カードがない時代のもの）を読み込んだ場合、自動でカードを追加する
        if (!m_WorksGridContainer.querySelector('.masterpiece-card')) {
            // 特大の星カードのHTMLを構築する
            const masterpieceHTML = `
                <div class="card glass-card masterpiece-card">
                    <div class="card-media-container card-image-placeholder"></div>
                    <div class="masterpiece-content-wrap">
                        <h4 class="editable-text masterpiece-label">★ MASTERPIECE GAME ★</h4>
                        <p class="editable-text">一番頑張った代表作のタイトルと、アピールポイントや注力した技術をここに記載します。</p>
                    </div>
                </div>
            `;
            // コンテナの一番最後に代表作カードを追加する
            m_WorksGridContainer.insertAdjacentHTML('beforeend', masterpieceHTML);
        }
    }

    // --- ABOUT MEの復元処理 ---
    const savedAboutHTML = localStorage.getItem('portfolioAboutHTML');
    if (savedAboutHTML) {
        // ストレージのHTMLを反映する
        m_AboutContainer.innerHTML = savedAboutHTML;
    }

    // --- CONTACTの復元処理 ---
    if (m_ContactContainer) {
        const savedContactHTML = localStorage.getItem('portfolioContactHTML');
        if (savedContactHTML) {
            // ストレージのHTMLを反映する
            m_ContactContainer.innerHTML = savedContactHTML;
        }
    }

    // --- SKILLS（星座）の復元処理 ---
    if (m_ConstellationContainer) {
        const savedSkillsHTML = localStorage.getItem('portfolioSkillsHTML');
        if (savedSkillsHTML) {
            m_ConstellationContainer.innerHTML = savedSkillsHTML;
            // innertHTMLの書き換えでSVGの参照が変わるため再取得
            m_ConstellationSvg = document.getElementById('constellation-svg');
        }
        // 初期化や線引きを行う関数の呼び出し
        initConstellation();
    }

    // 【復元処理の共通化】HTMLに記録されているデータIDを頼りに、DBから映像/画像を読み込み直す
    const restoreMedia = (container) => {
        const savedMediaElements = container.querySelectorAll('[data-media-id]');
        // 取得した要素に対して処理を行う
        savedMediaElements.forEach(el => {
            // 要素のカスタムデータ属性からIDを取得する
            const mediaId = el.getAttribute('data-media-id');
            // データベースから紐づくファイルを読み込む
            loadMediaFromDB(mediaId, (file) => {
                // ファイルが存在すれば処理を行う
                if (file) {
                    // Blob（ファイル）からブラウザ専用の読み込みURLを再生成する
                    const objectUrl = URL.createObjectURL(file);
                    // 動画および画像のsrcに設定し、表示を復活させる
                    el.src = objectUrl;

                    // --- 追加: 復元時の動画強制ミュート設定 ---
                    // 動画要素であれば、自動再生（ホバー再生）がブロックされないようにするため
                    if (el.tagName.toLowerCase() === 'video') {
                        // オブジェクトへのプロパティによる付与
                        el.muted = true;
                        el.loop = true;
                        // ストレージに保存・復元した際にも欠落しないようHTML属性としての付与
                        el.setAttribute('muted', '');
                        el.setAttribute('loop', '');
                        el.setAttribute('playsinline', '');
                    }
                }
            });
        });
    };

    // GAMESとABOUTのメディアをDBから復元する
    restoreMedia(m_WorksGridContainer);
    restoreMedia(m_AboutContainer);

    // 公開用保存ボタンの取得を行う
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
        // 初期状態として表示する（編集モードでないため）
        publishBtn.style.display = 'block';

        // 🚀 本番公開ボタンのクリックイベントを設定する
        publishBtn.addEventListener('click', async () => {
            // エクスポート処理を呼び出す
            await exportForPublishing();
        });
    }

    // ボタンのクリックイベントを登録する
    editBtn.addEventListener('click', () => {
        // フラグを反転させる
        m_IsEditMode = !m_IsEditMode;

        if (m_IsEditMode) {
            // カルーセル表示をリセット
            initCarousel();
            // ボタンのテキストを変更する
            editBtn.innerHTML = '💾 編集を保存・終了';
            // 本番公開ボタンを隠す
            if (publishBtn) publishBtn.style.display = 'none';
            // 編集中クラスを付与する
            editBtn.classList.add('editing-active');
            // コンテナに編集中クラスを付与する
            m_WorksGridContainer.classList.add('editing');
            document.body.classList.add('editing');
            m_AboutContainer.classList.add('editing');
            if (m_ConstellationContainer) m_ConstellationContainer.classList.add('editing');
            if (m_ContactContainer) m_ContactContainer.classList.add('editing');

            // 全てのテキスト要素を編集可能にする
            document.querySelectorAll('.editable-text').forEach(el => {
                // 文字入力可能な属性を付与する
                el.setAttribute('contenteditable', 'true');
            });

            // 全ての作品カードに公開/非公開ボタンを追加・設定する
            document.querySelectorAll('.glass-card').forEach(card => {
                // 絶対配置されるボタンの基準点とするため相対配置を設定
                card.style.position = 'relative';

                // ボタンがまだ無ければ作成する
                if (!card.querySelector('.visibility-toggle-btn')) {
                    const btn = document.createElement('button');
                    btn.className = 'visibility-toggle-btn';

                    // 現在のクラスをチェックしてテキストをセットする
                    const isPrivate = card.classList.contains('private-card');
                    btn.innerHTML = isPrivate ? '🙈 非公開' : '👁️ 公開';

                    // カードに追加する
                    card.appendChild(btn);
                }
            });

        } else {
            // ボタンのテキストを戻す
            editBtn.innerHTML = '✏️ 編集モードON';
            // 本番公開ボタンを表示する
            if (publishBtn) publishBtn.style.display = 'block';
            // 編集中クラスを外す
            editBtn.classList.remove('editing-active');
            // コンテナの編集中クラスを外す
            m_WorksGridContainer.classList.remove('editing');
            document.body.classList.remove('editing');
            m_AboutContainer.classList.remove('editing');
            if (m_ConstellationContainer) m_ConstellationContainer.classList.remove('editing');
            if (m_ContactContainer) m_ContactContainer.classList.remove('editing');

            // 全てのテキスト要素の編集を無効にする
            document.querySelectorAll('.editable-text').forEach(el => {
                // 文字入力可能な属性を外す
                el.removeAttribute('contenteditable');
            });

            // 約定：テキストをaタグのhrefに同期させる
            if (m_ContactContainer) {
                m_ContactContainer.querySelectorAll('a.contact-card').forEach(link => {
                    const urlEl = link.querySelector('.contact-url');
                    if (urlEl) {
                        // URL要素の中身（テキスト）をhrefとして設定し直す
                        const newUrl = urlEl.innerText.trim();
                        if (newUrl) {
                            link.setAttribute('href', newUrl);
                        }
                    }
                });
            }

            // 編集内容をローカルストレージに保存する（再読み込み時に復元するため）
            localStorage.setItem('portfolioWorksHTML', m_WorksGridContainer.innerHTML);
            // ABOUT MEの内容も保存する
            localStorage.setItem('portfolioAboutHTML', m_AboutContainer.innerHTML);
            // CONTACTの内容も保存する
            if (m_ContactContainer) {
                localStorage.setItem('portfolioContactHTML', m_ContactContainer.innerHTML);
            }
            // SKILLS（星座）の内容も保存する
            if (m_ConstellationContainer) {
                localStorage.setItem('portfolioSkillsHTML', m_ConstellationContainer.innerHTML);
            }
            // 保存完了のアラートを出す
            alert('変更をブラウザ内に一時保存しました！\n（世界に公開するには🚀本番公開用ファイル保存を押してください）');

            // 編集モードから抜けた際、または入った際にカルーセルを再計算
            initCarousel();
        }
    });

    // メディア（画像や動画）をクリックした時のイベントを処理する共通関数
    const handleMediaClick = (e) => {
        // クリックした要素がメディアの枠かどうかを確認する
        const targetContainer = e.target.closest('.card-media-container') || e.target.closest('.about-media-container');
        if (!targetContainer) return;

        if (m_IsEditMode) {
            // グローバル変数に今の要素を保存する
            m_CurrentMediaTarget = targetContainer;
            // ファイル選択画面を開く
            uploader.click();
        } else {
            // 通常モード時の処理：モーダル拡大表示を行う
            if (!m_MediaModal || !m_ModalBody) return;

            // クリックされた枠から動画か画像を取得する
            const targetMedia = targetContainer.querySelector('video') || targetContainer.querySelector('img:not(.video-thumbnail)');
            if (targetMedia) {
                // クローン（複製）を作成する
                const cloneMedia = targetMedia.cloneNode(true);
                // モーダルの中身を一度リセットする
                m_ModalBody.innerHTML = '';

                if (cloneMedia.tagName.toLowerCase() === 'video') {
                    // 動画の場合は表示位置をリセットし、コントロールを付ける
                    cloneMedia.style.position = 'static';
                    cloneMedia.style.display = 'block';
                    cloneMedia.controls = true;
                    cloneMedia.muted = false; // 音をミュート解除する

                    m_ModalBody.appendChild(cloneMedia);

                    // CSSのフェードイン直後に再生開始する
                    setTimeout(() => {
                        cloneMedia.play().catch(error => {
                            console.log("モーダル動画の再生エラー", error);
                        });
                    }, 50);
                } else {
                    // 画像の場合はそのまま追加する
                    m_ModalBody.appendChild(cloneMedia);
                }

                // モーダルをフェードイン表示させる
                m_MediaModal.classList.add('show');
            }
        }
    };

    // WORKS側のコンテナにクリックイベントを登録する
    m_WorksGridContainer.addEventListener('click', handleMediaClick);
    // ABOUT ME側のコンテナにもクリックイベントを登録する
    m_AboutContainer.addEventListener('click', handleMediaClick);

    // 公開・非公開ボタンのクリックイベントを登録する
    m_WorksGridContainer.addEventListener('click', (e) => {
        // 編集モードでなければ処理しない
        if (!m_IsEditMode) return;

        // クリックした要素がボタンかどうかを判定する
        const targetBtn = e.target.closest('.visibility-toggle-btn');
        if (targetBtn) {
            // 親へのイベント伝播を防ぐ（メディアクリックが誤動作しないようにする）
            e.stopPropagation();

            // 対象のカードを取得する
            const card = targetBtn.closest('.glass-card');
            if (card) {
                // private-card クラスを付与・解除する
                card.classList.toggle('private-card');

                // 現在の状態でボタンの文字を変更する
                const isPrivate = card.classList.contains('private-card');
                targetBtn.innerHTML = isPrivate ? '🙈 非公開' : '👁️ 公開';
            }
        }
    });


    // ==== カルーセルのボタンイベント ====
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', () => rotateCarousel(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => rotateCarousel(1));

    // 初回カルーセル初期化
    initCarousel();

    // ファイルが選択され、アップロードされる際の処理
    uploader.addEventListener('change', (e) => {
        // 選択されたファイルを取得する
        const file = e.target.files[0];
        // ファイルがない、またはターゲットがない場合は中断する
        if (!file || !m_CurrentMediaTarget) return;

        // DB格納用のランダムなユニークIDを作成する
        const mediaId = 'media_' + Date.now();

        // ファイルを安全に（ブラウザリロード後も壊れないよう）DBへ保存する
        saveMediaToDB(mediaId, file, () => {
            // 面倒なサーバーアップロードを省略し、ローカルだけで表示できるURLを作る
            const objectUrl = URL.createObjectURL(file);

            // コンテナの中身を空にする
            m_CurrentMediaTarget.innerHTML = '';
            // プレースホルダー用のクラス（灰色背景）を外す
            m_CurrentMediaTarget.classList.remove('card-image-placeholder');

            // ファイルの種類が動画かどうかを判定する
            if (file.type.startsWith('video/')) {
                // 見えない場所で動画を読み込む用の要素を作成する
                const tempVideo = document.createElement('video');
                // ソースを仮設定する
                tempVideo.src = objectUrl;
                // ミュートにする
                tempVideo.muted = true;

                // 動画データが読み込めたら少し先の時間を指定する
                tempVideo.addEventListener('loadeddata', () => {
                    // キャンバスに黒い画面が映らないように少し進める
                    tempVideo.currentTime = 0.5;
                });

                // シーク（進めた時間）が完了したら、その場面をキャンバスに書き出して画像化する
                tempVideo.addEventListener('seeked', () => {
                    // キャンバス要素を生成する
                    const canvas = document.createElement('canvas');
                    // 動画の幅を合わせる
                    canvas.width = tempVideo.videoWidth;
                    // 動画の高さを合わせる
                    canvas.height = tempVideo.videoHeight;
                    // コンテキストを取得する
                    const ctx = canvas.getContext('2d');
                    // 動画のワンシーンをキャンバスに書き込む
                    ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);

                    // キャンバスを軽量な画像（サムネイル）データに変換する
                    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);

                    // 【サムネイル画像タグの生成】
                    const imgEl = document.createElement('img');
                    // サムネイル画像を設定する
                    imgEl.src = thumbnailDataUrl;
                    // サムネイル用のクラスを付ける
                    imgEl.className = 'video-thumbnail';
                    // 幅を100%にする
                    imgEl.style.width = '100%';
                    // 高さを100%にする
                    imgEl.style.height = '100%';
                    // 枠にはめ込む
                    imgEl.style.objectFit = 'cover';
                    // 表示させる
                    imgEl.style.display = 'block';

                    // 【ホバー再生用動画タグの生成】
                    const videoEl = document.createElement('video');
                    // ブラウザ表示用URLを与える
                    videoEl.src = objectUrl;
                    // 復元のためにIDを付与する
                    videoEl.setAttribute('data-media-id', mediaId);

                    // --- 追加: 強制ミュートの属性併用設定 ---
                    // ループ再生にする（属性併用）
                    videoEl.loop = true;
                    videoEl.setAttribute('loop', '');
                    // 音を消す（ブラウザの自動再生ブロック回避のため属性を併用）
                    videoEl.muted = true;
                    videoEl.setAttribute('muted', '');
                    // モバイル端末等でのブロック回避設定を追加
                    videoEl.setAttribute('playsinline', '');

                    // 幅を100%にする
                    videoEl.style.width = '100%';
                    // 高さを100%にする
                    videoEl.style.height = '100%';
                    // 動画を枠にはめ込む
                    videoEl.style.objectFit = 'cover';
                    // サムネイルに重なる位置に設定する
                    videoEl.style.position = 'absolute';
                    // 基準位置を設定する
                    videoEl.style.top = '0';
                    // 基準位置を設定する
                    videoEl.style.left = '0';
                    // 普段は非表示にしておく
                    videoEl.style.display = 'none';

                    // HTMLにサムネイルと動画を追加する
                    m_CurrentMediaTarget.appendChild(imgEl);
                    m_CurrentMediaTarget.appendChild(videoEl);
                });

                // 画像の場合の処理を行う
            } else if (file.type.startsWith('image/')) {
                // 画像タグを作成する
                const imgEl = document.createElement('img');
                // ソースを設定する
                imgEl.src = objectUrl;
                // 復元のためにIDを付与する
                imgEl.setAttribute('data-media-id', mediaId);
                // HTMLに追加する
                m_CurrentMediaTarget.appendChild(imgEl);
            }

            // アップローダーの値をリセットして、同じファイルを再度選べるようにする
            uploader.value = '';
        });
    });

    // 動画にマウスが重なった時に再生する処理（コンテナからの委譲で監視する）
    m_WorksGridContainer.addEventListener('mouseover', (e) => {
        // ホバーした対象のカードを取得する
        const targetCard = e.target.closest('.glass-card');
        // もしカードが見つからなければ処理しない
        if (!targetCard) return;

        // 要素内（画像と動画の重なり等）の細かいマウス移動は無視してチラつきを防ぐ
        const related = e.relatedTarget;
        if (related && targetCard.contains(related)) return;

        // 動画とサムネイル画像をそれぞれ取得する
        const video = targetCard.querySelector('video[data-media-id]');
        const thumb = targetCard.querySelector('.video-thumbnail');

        // 両方とも存在すればホバー再生処理を行う
        if (video && thumb) {
            // サムネイル画像を隠す
            thumb.style.display = 'none';
            // 動画を表示する
            video.style.display = 'block';
            // 動画を再生する
            video.play().catch(error => {
                // エラーログを表示する
                console.log("動画の再生待機エラー", error);
            });
        }
    });

    // 動画からマウスが外れた時に停止して最初に戻す処理
    m_WorksGridContainer.addEventListener('mouseout', (e) => {
        // マウスが外れたカードを取得する
        const targetCard = e.target.closest('.glass-card');
        // カードでなければ処理しない
        if (!targetCard) return;

        // 要素内（画像と動画の重なり等）の細かいマウス移動は無視してチラつきを防ぐ
        const related = e.relatedTarget;
        if (related && targetCard.contains(related)) return;

        // 動画とサムネイル画像をそれぞれ取得する
        const video = targetCard.querySelector('video[data-media-id]');
        const thumb = targetCard.querySelector('.video-thumbnail');

        // 両方とも存在すれば停止処理を行う
        if (video && thumb) {
            // 動画を一時停止する
            video.pause();
            // 先頭（0秒）に巻き戻す
            video.currentTime = 0;
            // 動画を非表示にする
            video.style.display = 'none';
            // サムネイル画像を再表示する
            thumb.style.display = 'block';
        }
    });

    // モーダルを隠して破棄する処理
    const closeModal = () => {
        // フェードアウトのクラスを消す
        if (m_MediaModal) m_MediaModal.classList.remove('show');
        // CSS演出の終了を待って中身を削除（動画の音声停止などを含む）
        setTimeout(() => {
            if (m_ModalBody) m_ModalBody.innerHTML = '';
        }, 300);
    };

    // 閉じるボタンがクリックされた時
    if (m_ModalCloseBtn) {
        m_ModalCloseBtn.addEventListener('click', closeModal);
    }

    // モーダルの背景（黒い部分）がクリックされた時
    if (m_MediaModal) {
        m_MediaModal.addEventListener('click', (e) => {
            // 動画や画像ではない、背景や閉じるボタン単体をクリックした時だけ閉じる
            if (e.target === m_MediaModal || e.target === m_ModalCloseBtn) {
                closeModal();
            }
        });
    }
}

// ==========================================
// 星座（スキルツリー）に関する処理
// ==========================================
function initConstellation() {
    if (!m_ConstellationContainer || !m_ConstellationSvg) return;

    // 現在存在する全ての星ノードを取得
    m_StarNodes = Array.from(m_ConstellationContainer.querySelectorAll('.star-node'));

    // 画面リサイズ時も線を引き直す
    window.addEventListener('resize', drawConstellationLines);

    // 初回の線引きを実行
    drawConstellationLines();

    // 各星に対するドラッグ移動イベントの登録
    m_StarNodes.forEach(node => {
        // ドラッグ状態を管理するローカル変数
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        // ドラッグ開始の処理（マウス＆タッチ対応）
        const dragStart = (e) => {
            if (!m_IsEditMode) return;
            // 吹き出し等をクリックした時はドラッグ判定にしないよう除外
            if (e.target.classList.contains('editable-text')) return;

            isDragging = true;
            // タッチとマウスの両方の座標取得に対応
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            startX = clientX;
            startY = clientY;

            // 現在のleft/topの%値を取得
            initialLeft = parseFloat(node.style.left) || 0;
            initialTop = parseFloat(node.style.top) || 0;
        };

        // ドラッグ中の処理
        const dragAction = (e) => {
            if (!isDragging || !m_IsEditMode) return;
            e.preventDefault(); // スクロール等の余計な動作を防ぐ

            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            // 移動量を計算
            const dx = clientX - startX;
            const dy = clientY - startY;

            // コンテナの幅と高さを取得して、移動量を % に変換
            const rect = m_ConstellationContainer.getBoundingClientRect();
            const percentX = (dx / rect.width) * 100;
            const percentY = (dy / rect.height) * 100;

            // 新しい位置を計算し、0〜100の範囲内に制限（はみ出し防止）
            let newLeft = Math.max(0, Math.min(100, initialLeft + percentX));
            let newTop = Math.max(0, Math.min(100, initialTop + percentY));

            // 星のスタイルを更新
            node.style.left = `${newLeft}%`;
            node.style.top = `${newTop}%`;

            // 星が動いたので、線をリアルタイムで引き直す
            drawConstellationLines();
        };

        // ドラッグ終了の処理
        const dragEnd = () => {
            isDragging = false;
        };

        // イベントリスナーの登録
        node.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', dragAction);
        document.addEventListener('mouseup', dragEnd);

        node.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchmove', dragAction, { passive: false });
        document.addEventListener('touchend', dragEnd);
    });
}

// 星と星を繋ぐSVGの線を計算して描画する関数
function drawConstellationLines() {
    if (!m_ConstellationSvg || m_StarNodes.length === 0) return;

    // SVG領域を一旦クリア
    m_ConstellationSvg.innerHTML = '';

    // 星座の親コンテナの大きさ情報を取得
    const containerRect = m_ConstellationContainer.getBoundingClientRect();

    // 星座の中心点配列を作る
    const points = m_StarNodes.map(node => {
        const nodeRect = node.getBoundingClientRect();
        // コンテナの左上を基準(0,0)とした中心XとY
        const centerX = (nodeRect.left - containerRect.left) + (nodeRect.width / 2);
        const centerY = (nodeRect.top - containerRect.top) + (nodeRect.height / 2);
        return { x: centerX, y: centerY };
    });

    // 順番に線を結ぶ（IDの順など、配列の順番に沿って一筆書き）
    points.forEach((point, index) => {
        // 最後の星は次の星が無いので線を描かない
        if (index === points.length - 1) return;
        const nextPoint = points[index + 1];

        // SVGの直線（line）要素を生成
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        // 開始点のX座標
        line.setAttribute('x1', point.x);
        // 開始点のY座標
        line.setAttribute('y1', point.y);
        // 終了点のX座標
        line.setAttribute('x2', nextPoint.x);
        // 終了点のY座標
        line.setAttribute('y2', nextPoint.y);
        // 線の色と透明度
        line.setAttribute('stroke', 'rgba(255, 215, 0, 0.4)');
        // 線の太さ
        line.setAttribute('stroke-width', '1.5');
        // SVGに追加
        m_ConstellationSvg.appendChild(line);
    });
}

// --- 本番公開ファイル保存（エクスポート）用関数 ---
async function exportForPublishing() {
    try {
        // ディレクトリ選択プロンプトを表示
        alert('★重要★\n書き出し先のフォルダを選択します。\n必ず「PortFolio」の中にある、２つ目の「Game-PortForiyo」フォルダを選択してください！（index.htmlがある場所です）');
        const dirHandle = await window.showDirectoryPicker();

        // assetsフォルダを作成・取得
        const assetsDirHandle = await dirHandle.getDirectoryHandle('assets', { create: true });

        // 1. 各コンテナのHTMLを localStorage から最新状態で取得
        // （もし未保存の場合は現在表示中のものを取得する）
        const worksHTML = localStorage.getItem('portfolioWorksHTML') || m_WorksGridContainer.innerHTML;
        const aboutHTML = localStorage.getItem('portfolioAboutHTML') || m_AboutContainer.innerHTML;
        const contactHTML = m_ContactContainer ? (localStorage.getItem('portfolioContactHTML') || m_ContactContainer.innerHTML) : '';
        const skillsHTML = m_ConstellationContainer ? (localStorage.getItem('portfolioSkillsHTML') || m_ConstellationContainer.innerHTML) : '';

        // 一時的なDOMツリーを作ってHTMLを構築する
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `
            <div id="works-temp">${worksHTML}</div>
            <div id="about-temp">${aboutHTML}</div>
            <div id="contact-temp">${contactHTML}</div>
            <div id="skills-temp">${skillsHTML}</div>
        `;

        // 2. メディアファイル(data-media-id)をDBから抽出し、assetsに書き出しつつパスを書き換える
        const mediaElements = tempDiv.querySelectorAll('[data-media-id]');
        for (const el of Array.from(mediaElements)) {
            const mediaId = el.getAttribute('data-media-id');
            // 非同期でDBから読み込む Promise
            const file = await new Promise((resolve) => loadMediaFromDB(mediaId, resolve));
            if (file) {
                // ファイル名を生成
                const ext = file.name ? file.name.split('.').pop() : (file.type.startsWith('video/') ? 'mp4' : 'jpg');
                const filename = `${mediaId}.${ext}`;
                // 既に圧縮済みのファイルが存在する場合は上書きしない（巨大な元ファイルで上書きされるのを防ぐ）
                let fileExists = false;
                try {
                    await assetsDirHandle.getFileHandle(filename);
                    fileExists = true;
                } catch (e) { }

                if (!fileExists) {
                    // assetsフォルダに新規書き込む
                    const fileHandle = await assetsDirHandle.getFileHandle(filename, { create: true });
                    const writable = await fileHandle.createWritable();
                    await writable.write(file);
                    await writable.close();
                }

                // srcを新しいパスに書き換える (./assets/filename)
                el.src = `./assets/${filename}`;
            }
        }

        // 3. index.html を直接書き換える
        // 対象フォルダ内にある大元の index.html を取得する
        const indexHandle = await dirHandle.getFileHandle('index.html');
        const indexFile = await indexHandle.getFile();
        let indexText = await indexFile.text();

        // テキストの置換操作：各セクションの innerHTML 部分を入れ替える
        const parser = new DOMParser();
        const doc = parser.parseFromString(indexText, 'text/html');

        const docWorks = doc.getElementById('works-grid');
        if (docWorks) docWorks.innerHTML = tempDiv.querySelector('#works-temp').innerHTML;

        const docAbout = doc.getElementById('about-container');
        if (docAbout) docAbout.innerHTML = tempDiv.querySelector('#about-temp').innerHTML;

        const docContact = doc.getElementById('contact');
        if (docContact && contactHTML) {
            docContact.innerHTML = tempDiv.querySelector('#contact-temp').innerHTML;
        }

        const docSkills = doc.getElementById('constellation-container');
        if (docSkills && skillsHTML) docSkills.innerHTML = tempDiv.querySelector('#skills-temp').innerHTML;

        // <!DOCTYPE html> を付与してHTMLテキストに戻す (DOMParserでは<!DOCTYPE html>が省略されるため)
        const finalHTML = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;

        const writableIndex = await indexHandle.createWritable();
        await writableIndex.write(finalHTML);
        await writableIndex.close();

        alert('🎊 本番公開用のデータ出力が完了しました！\nこのフォルダをそのままGitHub等へPushすれば画像等を含めて全て反映されます！');

    } catch (err) {
        console.error('保存に失敗しました:', err);
        // キャンセル時はエラーを出さない
        if (err.name !== 'AbortError') {
            alert('保存エラーが発生しました。\nフォルダのアクセスが許可されているか、正しいフォルダが選択されているか確認してください。\nエラー詳細: ' + err.message);
        }
    }
}

// ページ読み込み完了時に初期化する
window.addEventListener('load', init);
