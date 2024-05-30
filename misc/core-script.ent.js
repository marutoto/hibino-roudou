(async function () {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  async function doInput(inputEl, val) {
    // たぶんjs側のonChangeか何かで入力制御してるっぽくて
    // ↓ これだと入力された扱いになってくれない
    // inputEl.value = val

    // ↓ onChangeを強制的に発火すればうまくいったのでこれで
    inputEl.value = val
    const event = new Event('change')
    inputEl.dispatchEvent(event)

    // 念の為少し待ちながらEvent発火する（待たないとちょっと止まったような挙動になった）
    await new Promise(resolve => setTimeout(resolve, 50))

    // ちなみに ↓ で、Sleepして順番にフォーカスしてた
    // await new Promise(resolve => setTimeout(resolve, 1000))
    // inputEl.focus()
    // await new Promise(resolve => setTimeout(resolve, 1000))
    // inputEl.blur()
  }

  // ---

  const table = document.querySelectorAll('.attendance-table-contents')[1]
  const rowNodeList = table.querySelectorAll('tr')

  for (var i = 0, len = rowNodeList.length; i < len; i++) {
    // console.log(rowNodeList[i])
    const rowEl = rowNodeList[i]

    // ---
    // 不要行をスキップ
    // ↓ これだと「未来の平日にattendance-table-row-が付いてない」からだめ
    // if (!rowEl.className.includes('attendance-table-row-')) { // 'attendance-table-row-edit' 'attendance-table-row-error' の2パターンを確認
    //   continue // 就業日じゃないから次の行へ
    // }
    const attendanceClassificationEl = rowEl.querySelector('.column-classification')
    if (attendanceClassificationEl.innerText !== '平日') {
      continue // 就業日じゃないから次の行へ
    }

    // ---
    // input取得
    const inputNodeList = rowEl.querySelectorAll('input[type=text]')
    // 0: 出勤
    // 1: 退勤
    // 2: 休憩入り
    // 3: 休憩戻り
    const inputStart = inputNodeList[0]
    const inputEnd = inputNodeList[1]
    const inputBreakStart = inputNodeList[2]
    const inputBreakEnd = inputNodeList[3]

    // for (var i = 0, len = inputNodeList.length; i < len; i++) {
    //   // console.log(inputNodeList[i])
    //   const inputEl = inputNodeList[i]
    // }

    // ---
    // 入力
    await doInput(inputBreakStart, '12:00')
    await doInput(inputBreakEnd, '13:00')

    // 「9時間勤務+前後に数分のバッファ」の候補時間からランダムに付与
    // 一旦バッファは前か後ろに0or10分で候補時間を定める
    //   ↓ 9時間勤務のベース時刻
    //   {s: '9:30', e: '18:30'},
    //   {s: '10:00', e: '19:00'},
    //   {s: '10:30', e: '19:30'},
    //   {s: '11:00', e: '20:00'},
    const candidates = [
      // TODO: いまのところ10:00以降しか勤務つけれんらしい
      // ---
      // {s: '9:30', e: '18:30'},
      // {s: '9:20', e: '18:30'},
      // {s: '9:30', e: '18:40'},
      // ---
      {s: '10:00', e: '19:00'},
      // {s: '9:50', e: '19:00'},
      {s: '10:00', e: '19:10'},
      // ---
      {s: '10:30', e: '19:30'},
      {s: '10:20', e: '19:30'},
      {s: '10:30', e: '19:40'},
      // ---
      {s: '11:00', e: '20:00'},
      {s: '10:50', e: '20:00'},
      {s: '11:00', e: '20:10'},
    ]

    const kiminikimeta = candidates[getRandomInt(candidates.length)]
    await doInput(inputStart, kiminikimeta.s)
    await doInput(inputEnd, kiminikimeta.e)
  }
})()