
document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("startScreen");
  const gameContainer = document.getElementById("game-container");
  const startButton = document.getElementById("startButton");
  const gameStatus = document.getElementById("game-status");
  const timeDisplay = document.getElementById("time");
  const scoreDisplay = document.getElementById("score");
  const holesContainer = document.getElementById("holes-container");

  let score = 0, time = 10, gameStarted = false, gameInterval;

  // スタートボタンをクリック //
  startButton.addEventListener("click", () => {
    startScreen.classList.add("hidden");  // 説明画面を非表示
    gameContainer.classList.remove("hidden"); // ゲーム画面を表示
    startGame();  // ここでゲームを開始する
  });

  function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    score = 0;
    time = 10; // 残り時間をリセット
    scoreDisplay.textContent = `得点: ${score}`;
    startButton.textContent = "STOP";

    let catIntervalTime = 1000;  // 最初は1秒ごとに出現

    // すべての穴のねこをリセット
    document.querySelectorAll(".hole img").forEach(img => {
      if (img.classList.contains("cat") || img.classList.contains("mouse")) {
          img.remove();
        }
      });

    function spawnCatLoop() {
      if (!gameStarted) return; // ゲームが終了したら止める

      randomCat();
      
      // ねこの出現間隔を短くする
      if (catIntervalTime > 100) {
          catIntervalTime -= 100;  // 100msずつ短縮
      }

      setTimeout(spawnCatLoop, catIntervalTime);
    }

    spawnCatLoop(); // ループ開始

    // 残り時間のカウントダウンを開始
    timeInterval = setInterval(() => {
      time--;
      document.getElementById("timeValue").textContent = time;
      
      if (time <= 0) {
        stopGame(); // 時間が 0 になったらゲームを止める
        }
    }, 1000);
  }

  function stopGame() {
      clearInterval(timeInterval); // カウントダウンを止める
      gameStarted = false; // これで `spawnCatLoop()` のループが止まる
      startButton.textContent = "START";
      gameStatus.textContent = `ゲーム終了！ 得点: ${score}`;
  }


  function randomCat() {
  const holes = document.querySelectorAll(".hole");

  function getRandomHole() {
      const availableHoles = [...holes].filter(hole => !hole.dataset.active);
      if (availableHoles.length === 0) return null;
      return availableHoles[Math.floor(Math.random() * availableHoles.length)];
  }

  function showCat(catElement) {
      const hole = getRandomHole();
      if (!hole) return;
      hole.dataset.active = true;
      hole.appendChild(catElement);

      const hideTimeout = setTimeout(() => {
          if (catElement.parentElement) {
              hole.removeChild(catElement);
          }
          delete hole.dataset.active;
      }, 950);

      // クリックされたら 5 秒間表示するように変更
      catElement.addEventListener("click", () => {
          clearTimeout(hideTimeout);
      });
  }

  let catType;
  const randomNum = Math.random();
  if (randomNum < 0.6) {
      // `cat01` ～ `cat05` をランダムに選ぶ
      const randomCatNumber = Math.floor(Math.random() * 5) + 1; // 1～5のランダム
      catType = `cat0${randomCatNumber}`;
  } else {
      catType = "mouse"; // ねずみ
  }

  const catElement = createCat(catType);
  catElement.style.display = "block";
  
  showCat(catElement);
  }

  // 音声ファイルを作成
  const catSound = new Audio("cat_voice.mp3");
  const mouseSound = new Audio("human02.mp3");

  // ミュートボタンを取得
  const muteButton = document.getElementById("muteButton");

  // ミュート状態を管理する変数
  let isMuted = false;

  // ミュートボタンのクリックイベント
  muteButton.addEventListener("click", function() {
      isMuted = !isMuted; // ミュート状態を切り替え
      catSound.muted = isMuted; 
      mouseSound.muted = isMuted;
      updateMuteButton();
  });

  // ミュートボタンの見た目を更新
  function updateMuteButton() {
      if (isMuted) {
          muteButton.textContent = "🔈 ミュート解除";
      } else {
          muteButton.textContent = "🔇 ミュート";
      }
  }

  // ねこ & ねずみのクリック処理（1つのイベントリスナーで管理）
  holesContainer.addEventListener("click", function(event) {
      const clickedElement = event.target;

      if (clickedElement.tagName.toLowerCase() === "img") {
          if (clickedElement.classList.contains("cat")) {
              if (!isMuted) { // ミュートされていないときだけ再生
                  catSound.currentTime = 0;
                  catSound.play();
              }
          } else if (clickedElement.classList.contains("mouse")) {
              if (!isMuted) { // ミュートされていないときだけ再生
                  mouseSound.currentTime = 0;
                  mouseSound.play();
              }
          }
          
          // クリック処理（猫 & ねずみ 共通）
          handleCatClick(clickedElement);
      }
  });



  // クリックイベントを親要素である holesContainer で管理する
  holesContainer.addEventListener("click", function(event) {
    // クリックされたターゲットがねこ画像かどうかを確認
    const clickedElement = event.target;
    if (clickedElement.tagName.toLowerCase() === "img" &&
        (clickedElement.classList.contains("cat") || clickedElement.classList.contains("mouse"))) {
        handleCatClick(clickedElement);
    }
  });

  function createCat(type) {
    const catElement = document.createElement("img");

    if (type.startsWith("cat")) {
        // `cat01` ～ `cat05` のランダム画像を適用
        catElement.src = `${type}.png`;
        catElement.classList.add("cat"); // すべての猫に共通のクラスを付与
    } else if (type === "mouse") {
        catElement.src = "mouse.png"; // ねずみの画像
        catElement.classList.add("mouse");
    }
    catElement.classList.add(type); // 個別の識別用クラス
    return catElement;
  }

  function handleCatClick(catElement) {
    if (catElement.classList.contains("cat")) {
      if (!catElement.src.includes("_hit.png")) {
          score += 1;  // ねこの場合は得点を加算

          // クリックされた猫の画像を "_hit.png" に変更
          const originalSrc = catElement.src;
          const hitImageSrc = originalSrc.replace(".png", "_hit.png");
          catElement.src = hitImageSrc;
      }
    } 
    // ねずみをクリックした場合
    else if (catElement.classList.contains("mouse")) {
        // すでに "mouse_hit.png" になっていたら何もしない
      if (!catElement.src.includes("mouse_hit.png")) {
        time -= 1;
        // **時間が0未満になったら0にする**
        if (time < 0) {
          time = 0;
        }
        catElement.src = "mouse_hit.png";
      }
    }

    scoreDisplay.textContent = `${score}匹`;
    // 変更した画像を短時間表示してから削除
    setTimeout(() => {
      if (catElement.parentElement) {
          catElement.parentElement.removeChild(catElement);
      }
  }, 800); // 1000ms後に非表示
  }

  function stopGame() {
    clearInterval(timeInterval);
    clearInterval(gameInterval);
    gameStarted = false;
  
    //ゲーム終了画面を表示
    const gameOverScreen = document.getElementById("endScreen");
    const finalScore = document.getElementById("finalScore");
  
    finalScore.querySelector(".big-score").textContent = `${score}匹！`;
    endScreen.classList.remove("hidden");
  }

   //リスタートボタン
  document.getElementById("restartButton").addEventListener("click", () => {
    location.reload(); // ページをリロードしてリセット
  });

});
