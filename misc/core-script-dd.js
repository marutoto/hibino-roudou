(function () {
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

  function output(
    ret1, // 所定日数
    ret2, // 所定時間
    ret3, // 記入日数
    ret4, // 残日数
    ret5, // 実労働時間
    ret6, // あとこれだけ働く必要がある 月末まで
    ret7, // あとこれだけ働く必要がある 1日平均
    ret8, // 毎日7h働くと残業時間は
  ) {
    console.log(
`
# 記入分までのデータで算出

## 所定
- 日数: ${ ret1 }日
- 時間: ${ ret2 }時間

## 記入分までの計測
- 記入日数: ${ ret3 }日
- 残日数: ${ ret4 }日

- 実労働時間: ${ ret5 }

---

# 結論

## あとこれだけ働く必要がある
- 月末までに ${ ret6 } 働くんやで
- 1日平均で ${ ret7 } 働くんやで

## 毎日7h働くと残業時間は
- ${ ret8 } やで

`
    )
  }

  // ---

  var rootEl = document.getElementById('bottomSummaryTable')
  var _tables = rootEl.querySelectorAll('table')

  var table1 = _tables[1] // 「今月の基準日数・労働時間」
  var table2 = _tables[2] // 「実績（勤怠入力分まで）※有休除く」

  var table1Rows = table1.querySelectorAll('tr')
  var table2Rows = table2.querySelectorAll('tr')

  var _shoteiDays = table1Rows[0].querySelector('td.right .right').innerText // 所定出勤日数
  var _shoteiTimes = table1Rows[2].querySelector('td.right .right').innerText // 所定労働時間
  var _jitsuDays = table1Rows[1].querySelector('td.right .right').innerText // 実出勤日数
  var _jitsuTimes = table2Rows[1].querySelector('td.right .right').innerText // 総労働時間（平日、土曜、祝日、日曜含む）

  var shoteiDays = retrieveDay(_shoteiDays)
  var shoteiTimesMin = retrieveTimeAsMinutes(_shoteiTimes)
  var jitsuDays = retrieveDay(_jitsuDays)
  var jitsuTimesMin = retrieveTimeAsMinutes(_jitsuTimes)

  console.log('shoteiDays', shoteiDays)
  console.log('shoteiTimesMin', shoteiTimesMin)
  console.log('jitsuDays', jitsuDays)
  console.log('jitsuTimesMin', jitsuTimesMin)

  // !!! ここから再開 !!!

  output(
    shoteiDays, // 所定日数
    shoteiTimesMin / 60, // 所定時間
    jitsuDays, // 記入日数
    shoteiDays - jitsuDays, // 残日数
    `${ Math.floor(jitsuTimesMin / 60) }:${ jitsuTimesMin % 60 }`, // 実労働時間
    'XX:XX', // あとこれだけ働く必要がある 月末まで
    'XX:XX', // あとこれだけ働く必要がある 1日平均
    'XX:XX', // 毎日7h働くと残業時間は
  )
})()
