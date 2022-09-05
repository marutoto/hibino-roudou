(function () {
  const TIME_DISPLAY_ZERO = '00:00'
  const SHOTEI_ROUDOU_HOURS_PER_DAY = 7

  function retrieveDay(dayStr) {
    // dayStr: '12 日'
    var ret = dayStr.match(/\d*/g)
    return ret === null ? false : Number(ret[0])
  }

  function retrieveTimeAsMinutes(timeStr) {
    // timeStr: '124:58'
    var ret = timeStr.match(/(\d*):(\d*)/)
    if (ret === null) {
      return false
    }
    return Number(ret[1]) * 60 + Number(ret[2])
  }

  function getTimeDisplay(targetMins) {
    // TODO: マイナスの表示オプション

    if (targetMins <= 0) {
      return TIME_DISPLAY_ZERO
    }
    var hours = Math.floor(targetMins / 60)
    var minutes = targetMins % 60
    return `${ hours }:${ ('00' + minutes).slice(-2) }`
  }

  function output(
    shoteiRoudouHoursPerDay,
    kyuukaDays, // 休暇日数
    ret1, // 所定日数
    ret2, // 所定時間
    ret3, // 記入日数
    ret4, // 実労働時間
    ret5, // 残日数
    ret6, // あとこれだけ働く必要がある 月末まで
    ret7, // あとこれだけ働く必要がある 1日平均
    ret8, // 毎日7h働くと残業時間は
  ) {
    console.log(
`

※ 記入分(前日)までのデータで算出
============================

# 所定 (${ shoteiRoudouHoursPerDay }h/Day)
- 日数: ${ ret1 }日
- 時間: ${ ret2 }時間

----------------------------

# 計測
- 記入日数: ${ ret3 }日
- 実労働時間: ${ ret4 }

- 休暇日数: ${ kyuukaDays }日

----------------------------

# 結論（休暇考慮済み）

## あと何日？
- 残日数: ${ ret5 }日

## あと何時間？
${
  (ret6 === TIME_DISPLAY_ZERO && ret7 === TIME_DISPLAY_ZERO)
    ? (
`- 今月はもう働かなくてええんやで！
- やったね！`
    )
    : (
`- 月末までに ${ ret6 } 働くんやで
- 1日平均で ${ ret7 } 働くんやで`
    )
}

## 毎日7h働くと残業時間は
- ${ ret8 } やで

============================

`
    )
  }

  // --- main table
  var mainTable = document.getElementById('mainTable')
  var dayRows = mainTable.querySelectorAll('tr.days')

  var kyuukaDays = 0
  dayRows.forEach((elRow) => {
    // 休暇を取得
    // 休暇は実働に計上されないぽいので、こっちから減らしにいく必要がある
    //   「休暇」を含む title を7h稼働とする、でよさそう
    //   TODO: 「午前半休」「午後半休」「時間単位有休」は、実際取得する機会があったときに仕様がわかってから別途で対応する感じでいい
    const elStat = elRow.querySelector('.dval.vstatus')
    const statStr = elStat.getAttribute('title') // '通常出勤日' '〇〇休暇' '午前半休' '午後半休' '時間単位有休' ...
    if (statStr.match('休暇')) {
      kyuukaDays++
    }
  })
  var kyuukaTimesMin = retrieveTimeAsMinutes(`${ SHOTEI_ROUDOU_HOURS_PER_DAY * kyuukaDays }:00`)
  console.log('kyuukaTimesMin', kyuukaTimesMin)

  // --- bottom tables
  var bottomSummaryTables = document.getElementById('bottomSummaryTable').querySelectorAll('table')

  var table1 = bottomSummaryTables[1] // 「今月の基準日数・労働時間」
  var table2 = bottomSummaryTables[2] // 「実績（勤怠入力分まで）※有休除く」

  var table1Rows = table1.querySelectorAll('tr')
  var table2Rows = table2.querySelectorAll('tr')

  var _shoteiDays = table1Rows[0].querySelector('td.right .right').innerText // 所定出勤日数
  var _shoteiTimes = table1Rows[2].querySelector('td.right .right').innerText // 所定労働時間
  var _jitsuDays = table1Rows[1].querySelector('td.right .right').innerText // 実出勤日数
  var _jitsuTimes = table2Rows[1].querySelector('td.right .right').innerText // 総労働時間（平日、土曜、祝日、日曜含む）

  var shoteiDays = retrieveDay(_shoteiDays)
  var shoteiTimesMin = retrieveTimeAsMinutes(_shoteiTimes)
  var keisokuDays = shoteiDays - kyuukaDays // 休暇分マイナス
  var keisokuTimesMin = shoteiTimesMin - kyuukaTimesMin // 休暇分マイナス
  var jitsuDays = retrieveDay(_jitsuDays)
  var jitsuTimesMin = retrieveTimeAsMinutes(_jitsuTimes)

  var zanDays = keisokuDays - jitsuDays
  var zanTimesMin = keisokuTimesMin - jitsuTimesMin

  output(
    SHOTEI_ROUDOU_HOURS_PER_DAY,
    kyuukaDays, // 休暇日数
    shoteiDays, // 所定日数
    shoteiTimesMin / 60, // 所定時間
    jitsuDays, // 記入日数
    getTimeDisplay(jitsuTimesMin), // 実労働時間
    zanDays, // 残日数
    getTimeDisplay(zanTimesMin), // あとこれだけ働く必要がある 月末まで
    getTimeDisplay(Math.ceil(zanTimesMin / zanDays)), // あとこれだけ働く必要がある 1日平均
    getTimeDisplay((jitsuTimesMin + zanDays * SHOTEI_ROUDOU_HOURS_PER_DAY * 60) - keisokuTimesMin), // 毎日7h働くと残業時間は
  )
})()
